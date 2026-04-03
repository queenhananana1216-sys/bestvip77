"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { type CarrierCountry } from "@/lib/register/carriers";
import {
  clearPendingPhone,
  explainPhoneAuthError,
  isDuplicatePhoneError,
  normalizePhoneNumber,
  phonePlaceholder,
  readPendingPhone,
  rememberPendingPhone,
} from "@/lib/register/phone";
import { createBrowserClient } from "@/lib/supabase/client";

function normalizeCountry(value: unknown): CarrierCountry {
  return value === "CN" ? "CN" : "KR";
}

function invalidPhoneMessage(country: CarrierCountry) {
  return country === "KR"
    ? "請正確輸入韓國手機號碼，例如 01012345678。/ 한국 휴대폰 번호를 다시 확인해 주세요."
    : "請正確輸入中國手機號碼，例如 13800138000。/ 중국 휴대폰 번호를 다시 확인해 주세요.";
}

export default function VerifyPhonePage() {
  const router = useRouter();
  const [country, setCountry] = useState<CarrierCountry>("KR");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const requestOtpGuard = useCallback(async (nextCountry: CarrierCountry, nextPhone: string) => {
    const res = await fetch("/api/register/phone-otp-guard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ country: nextCountry, phone: nextPhone }),
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
      return "此手機號碼已被使用，請改用其他號碼。/ 이미 가입에 사용된 휴대폰 번호입니다.";
    }
    if (errorCode === "suspicious_phone_pattern") {
      return "테스트용으로 보이는 번호 패턴은 사용할 수 없습니다. 실제 수신 가능한 번호를 입력해 주세요.";
    }
    if (errorCode === "otp_cooldown") {
      const wait = Math.max(1, retryAfterSec ?? 60);
      return `請在 ${wait} 秒後再重試。/ ${wait}초 후 다시 시도해 주세요.`;
    }
    if (errorCode === "otp_rate_limited_phone" || errorCode === "otp_rate_limited_ip") {
      return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    }
    return "驗證碼 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  const requestOtp = useCallback(
    async (rawPhone?: string, rawCountry?: CarrierCountry) => {
      const nextCountry = rawCountry ?? country;
      const nextPhone = rawPhone ?? phone;
      const normalizedPhone = normalizePhoneNumber(nextCountry, nextPhone);

      setErr(null);
      setMsg(null);

      if (!normalizedPhone) {
        setErr(invalidPhoneMessage(nextCountry));
        return false;
      }

      setSending(true);
      try {
        const guard = await requestOtpGuard(nextCountry, nextPhone);
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
        setMsg("驗證碼已送出，請輸入簡訊中的 6 位數。/ 문자로 받은 6자리를 입력해 주세요.");
        return true;
      } finally {
        setSending(false);
      }
    },
    [country, phone, requestOtpGuard],
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

      if (user.phone_confirmed_at) {
        clearPendingPhone();
        router.replace("/");
        router.refresh();
        return;
      }

      const nextCountry = normalizeCountry(user.user_metadata?.carrier_country);
      const rememberedPhone = readPendingPhone();
      const autoRequested =
        typeof window !== "undefined" && new URLSearchParams(window.location.search).get("auto") === "1";

      setCountry(nextCountry);
      setPhone(rememberedPhone);
      setReady(true);

      if (autoRequested && rememberedPhone) {
        const normalizedPhone = normalizePhoneNumber(nextCountry, rememberedPhone);
        router.replace("/verify-phone");
        if (!normalizedPhone) return;

        const guard = await requestOtpGuard(nextCountry, rememberedPhone);
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
        setMsg("驗證碼已送出，請輸入簡訊中的 6 位數。/ 문자로 받은 6자리를 입력해 주세요.");
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, [requestOtpGuard, router]);

  async function onVerify() {
    const normalizedPhone = normalizePhoneNumber(country, phone);

    setErr(null);
    setMsg(null);

    if (!normalizedPhone) {
      setErr(invalidPhoneMessage(country));
      return;
    }

    if (!token.trim()) {
      setErr("請輸入簡訊中的 6 位數驗證碼。/ 문자로 받은 인증번호 6자리를 입력해 주세요.");
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
          setErr("此手機號碼已被使用，請改用其他號碼。/ 이미 가입에 사용된 휴대폰 번호입니다.");
          return;
        }
        setErr("手機資料同步失敗，請稍後再試。/ 휴대폰 정보 동기화에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
      <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
        <p className="text-sm text-neutral-500">載入手機驗證畫面中… / 휴대폰 인증 화면을 불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold text-neutral-900">手機驗證</h1>
        <p className="mt-1 text-sm text-neutral-600">請用可實際收取簡訊的號碼完成驗證，完成後可直接使用網站。</p>
        <p className="mt-1 text-xs text-neutral-400">실제로 수신 가능한 번호로 SMS 인증을 완료하면 바로 사이트를 이용할 수 있습니다.</p>

        <div className="mt-4 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          <p>申請地區 / 가입 지역: {country === "KR" ? "韓國 / 한국" : "中國 / 중국"}</p>
          <p className="mt-1">同一手機號碼不可重複註冊，請直接填可收簡訊的真實號碼。/ 같은 번호로는 중복 가입할 수 없습니다.</p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600">手機號碼 / 휴대폰 번호</label>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              placeholder={phonePlaceholder(country)}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>

          <button
            type="button"
            disabled={sending}
            onClick={() => void requestOtp()}
            className="w-full rounded-xl border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-700 disabled:opacity-60"
          >
            {sending ? "發送中…" : sent ? "重新發送驗證碼 / 다시 받기" : "取得驗證碼 / 인증번호 받기"}
          </button>

          <div>
            <label className="text-xs font-medium text-neutral-600">驗證碼 6 碼 / 인증번호 6자리</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>

          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}

          <button
            type="button"
            disabled={verifying}
            onClick={() => void onVerify()}
            className="w-full rounded-xl bg-linear-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
          >
            {verifying ? "確認中…" : "完成驗證 / 휴대폰 인증 완료"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span>完成驗證前無法進入首頁。/ 인증을 마치기 전에는 메인 페이지로 이동할 수 없습니다.</span>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
