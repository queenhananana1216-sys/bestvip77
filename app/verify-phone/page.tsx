"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { type CarrierCountry } from "@/lib/register/carriers";
import {
  clearPendingPhone,
  explainPhoneAuthError,
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
  return country === "KR" ? "휴대폰 번호를 정확히 입력해 주세요. 예: 01012345678" : "휴대폰 번호를 정확히 입력해 주세요. 예: 13800138000";
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
        const sb = createBrowserClient();
        const { error } = await sb.auth.updateUser({ phone: normalizedPhone });
        if (error) {
          setErr(explainPhoneAuthError(error.message));
          return false;
        }

        rememberPendingPhone(normalizedPhone);
        setPhone(normalizedPhone);
        setSent(true);
        setMsg("인증번호를 발송했습니다. 문자로 받은 6자리를 입력해 주세요.");
        return true;
      } finally {
        setSending(false);
      }
    },
    [country, phone],
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
        router.replace("/pending-approval");
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
        setMsg("인증번호를 발송했습니다. 문자로 받은 6자리를 입력해 주세요.");
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, [router]);

  async function onVerify() {
    const normalizedPhone = normalizePhoneNumber(country, phone);

    setErr(null);
    setMsg(null);

    if (!normalizedPhone) {
      setErr(invalidPhoneMessage(country));
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

      clearPendingPhone();
      router.push("/pending-approval");
      router.refresh();
    } finally {
      setVerifying(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
        <p className="text-sm text-neutral-500">휴대폰 인증 화면을 불러오는 중…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold text-neutral-900">휴대폰 인증</h1>
        <p className="mt-1 text-sm text-neutral-500">가입 신청을 마무리하려면 실제 수신 가능한 번호로 SMS 인증을 완료해 주세요.</p>

        <div className="mt-4 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          <p>가입 지역: {country === "KR" ? "한국" : "중국"}</p>
          <p className="mt-1">문자 수신이 가능한 본인 휴대폰 번호를 입력해 주세요. 같은 번호로는 중복 가입할 수 없습니다.</p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600">휴대폰 번호</label>
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
            {sending ? "전송 중…" : sent ? "인증번호 다시 받기" : "인증번호 받기"}
          </button>

          <div>
            <label className="text-xs font-medium text-neutral-600">인증번호 6자리</label>
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
            {verifying ? "확인 중…" : "휴대폰 인증 완료"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
          <span>인증을 마치기 전에는 메인 페이지로 이동할 수 없습니다.</span>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
