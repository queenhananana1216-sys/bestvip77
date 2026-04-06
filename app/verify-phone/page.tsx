"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { isPortalAdmin } from "@/lib/admin/portal-admin";
import {
  clearPendingPhone,
  explainPhoneAuthError,
  isDuplicatePhoneError,
  normalizePhoneNumberAny,
  readPendingPhone,
  rememberPendingPhone,
} from "@/lib/register/phone";
import { createBrowserClient } from "@/lib/supabase/client";

function invalidPhoneMessage() {
  return "휴대폰 번호를 확인해 주세요. (예: 01012345678)";
}

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const requestOtpGuard = useCallback(async (nextPhone: string) => {
    const res = await fetch("/api/register/phone-otp-guard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: nextPhone }),
    });
    const payload = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      retryAfterSec?: number;
    };
    return { ok: res.ok, payload };
  }, []);

  function explainOtpGuardError(errorCode?: string, retryAfterSec?: number) {
    if (errorCode === "duplicate_phone") {
      return "이미 가입에 사용된 휴대폰 번호입니다. 다른 번호를 입력해 주세요.";
    }
    if (errorCode === "suspicious_phone_pattern") {
      return "실제로 문자를 받을 수 있는 번호를 입력해 주세요.";
    }
    if (errorCode === "otp_cooldown") {
      const wait = Math.max(1, retryAfterSec ?? 60);
      return `${wait}초 후에 다시 시도해 주세요.`;
    }
    if (errorCode === "otp_rate_limited_phone" || errorCode === "otp_rate_limited_ip") {
      return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    }
    return "인증번호 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  const requestOtp = useCallback(
    async (rawPhone?: string) => {
      const nextPhone = rawPhone ?? phone;
      const normalizedPhone = normalizePhoneNumberAny(nextPhone);

      setErr(null);
      setMsg(null);

      if (!normalizedPhone) {
        setErr(invalidPhoneMessage());
        return false;
      }

      setSending(true);
      try {
        const guard = await requestOtpGuard(nextPhone);
        if (!guard.ok) {
          setErr(explainOtpGuardError(guard.payload.error, guard.payload.retryAfterSec));
          return false;
        }

        const sb = createBrowserClient();
        const { error } = await sb.auth.updateUser({ phone: normalizedPhone });
        if (error) {
          setErr(explainPhoneAuthError(error.message));
          return false;
        }

        rememberPendingPhone(normalizedPhone);
        setPhone(normalizedPhone);
        setSent(true);
        setMsg("인증번호가 발송되었습니다. 문자로 받은 6자리를 입력해 주세요.");
        return true;
      } finally {
        setSending(false);
      }
    },
    [phone, requestOtpGuard],
  );

  useEffect(() => {
    let active = true;

    async function init() {
      const sb = createBrowserClient();
      const {
        data: { user },
        error,
      } = await sb.auth.getUser();

      if (!active) return;

      if (error || !user) {
        router.replace("/login");
        return;
      }

      const isAdmin = await isPortalAdmin(sb, user);
      if (isAdmin) {
        router.replace("/admin");
        router.refresh();
        return;
      }

      if (user.phone_confirmed_at) {
        clearPendingPhone();
        router.replace("/");
        router.refresh();
        return;
      }

      const rememberedPhone = readPendingPhone();
      const autoRequested =
        typeof window !== "undefined" && new URLSearchParams(window.location.search).get("auto") === "1";

      setPhone(rememberedPhone);
      setReady(true);

      if (autoRequested && rememberedPhone) {
        const normalizedPhone = normalizePhoneNumberAny(rememberedPhone);
        router.replace("/verify-phone");
        if (!normalizedPhone) return;

        const guard = await requestOtpGuard(rememberedPhone);
        if (!active) return;
        if (!guard.ok) {
          setErr(explainOtpGuardError(guard.payload.error, guard.payload.retryAfterSec));
          return;
        }

        setSending(true);
        const { error: otpError } = await sb.auth.updateUser({ phone: normalizedPhone });
        if (!active) return;
        setSending(false);

        if (otpError) {
          setErr(explainPhoneAuthError(otpError.message));
          return;
        }

        rememberPendingPhone(normalizedPhone);
        setPhone(normalizedPhone);
        setSent(true);
        setMsg("인증번호가 발송되었습니다. 문자로 받은 6자리를 입력해 주세요.");
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, [requestOtpGuard, router]);

  async function onVerify() {
    const normalizedPhone = normalizePhoneNumberAny(phone);

    setErr(null);
    setMsg(null);

    if (!normalizedPhone) {
      setErr(invalidPhoneMessage());
      return;
    }

    if (!token.trim()) {
      setErr("문자로 받은 인증번호 6자리를 입력해 주세요.");
      return;
    }

    setVerifying(true);
    try {
      const sb = createBrowserClient();
      const { error } = await sb.auth.verifyOtp({
        phone: normalizedPhone,
        token: token.trim(),
        type: "phone_change",
      });

      if (error) {
        setErr(explainPhoneAuthError(error.message));
        return;
      }

      const { error: syncError } = await sb.rpc("bestvip77_sync_own_phone", {
        p_phone_e164: normalizedPhone,
      });
      if (syncError) {
        if (isDuplicatePhoneError(syncError.message)) {
          setErr("이미 가입에 사용된 휴대폰 번호입니다. 다른 번호를 입력해 주세요.");
          return;
        }
        setErr("휴대폰 정보 동기화에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      clearPendingPhone();
      router.push("/");
      router.refresh();
    } finally {
      setVerifying(false);
    }
  }

  if (!ready) {
    return (
      <div className="bv-light-ui flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
        <p className="text-sm text-neutral-600">휴대폰 인증 화면을 불러오는 중…</p>
      </div>
    );
  }

  const inputClassName =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[15px] text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100";

  return (
    <div className="bv-light-ui flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">휴대폰 인증</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          SMS로 받은 인증번호로 본인 확인을 마치면 사이트를 이용할 수 있습니다. 실제로 문자를 받을 수 있는 번호를 입력해 주세요.
        </p>

        <div className="mt-5 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <p className="text-xs leading-relaxed text-neutral-600">
            동일 번호로 중복 가입할 수 없으며, 타인 번호나 허위 번호는 사용할 수 없습니다.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-0">
            <label className="text-[13px] font-medium text-neutral-700">휴대폰 번호</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              placeholder="01012345678"
              onChange={(e) => setPhone(e.target.value)}
              className={`bv-light-field ${inputClassName}`}
            />
          </div>

          <button
            type="button"
            disabled={sending}
            onClick={() => void requestOtp()}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 py-3 text-sm font-semibold text-orange-800 transition-colors hover:bg-orange-100 disabled:opacity-60"
          >
            {sending ? "발송 중…" : sent ? "인증번호 다시 받기" : "인증번호 받기"}
          </button>

          <div className="space-y-0">
            <label className="text-[13px] font-medium text-neutral-700">인증번호 (6자리)</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={token}
              placeholder="123456"
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={`bv-light-field ${inputClassName}`}
            />
          </div>

          {err ? <p className="text-sm leading-snug text-red-600">{err}</p> : null}
          {msg ? <p className="text-sm leading-snug text-emerald-700">{msg}</p> : null}

          <button
            type="button"
            disabled={verifying}
            onClick={() => void onVerify()}
            className="w-full rounded-xl bg-linear-to-r from-orange-500 to-amber-500 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:opacity-60"
          >
            {verifying ? "확인 중…" : "인증 완료"}
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutral-600">인증을 완료하기 전까지는 메인 화면으로 이동할 수 없습니다.</p>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
