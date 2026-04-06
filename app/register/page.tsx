"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { normalizeLoginIdentifierInput, validateMemberLoginId } from "@/lib/admin/usernames";
import { createBrowserClient } from "@/lib/supabase/client";
import { type CarrierCountry } from "@/lib/register/carriers";
import { normalizePhoneNumber, phonePlaceholder, rememberPendingPhone } from "@/lib/register/phone";

export default function RegisterPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [displayNameZh, setDisplayNameZh] = useState("");
  const [displayNameKo, setDisplayNameKo] = useState("");
  const [country, setCountry] = useState<CarrierCountry>("KR");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function isPhoneAvailable(nextCountry: CarrierCountry, nextPhone: string) {
    const res = await fetch("/api/register/phone-availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ country: nextCountry, phone: nextPhone }),
    });
    if (!res.ok) return true;
    const data = (await res.json()) as { available?: boolean };
    return data.available !== false;
  }

  async function isLoginIdAvailable(nextLoginId: string) {
    const res = await fetch("/api/register/id-availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ loginId: nextLoginId }),
    });
    if (!res.ok) {
      return { available: false, message: "아이디 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    }
    const data = (await res.json()) as { available?: boolean };
    return { available: data.available === true, message: "이미 사용 중인 아이디입니다." };
  }

  async function ensureProfileRow(
    userId: string,
    userEmail: string | undefined,
    cc: CarrierCountry,
    nextDisplayNameZh: string,
    nextDisplayNameKo: string,
    nextDisplayNameEn: string,
  ) {
    const sb = createBrowserClient();
    const { error } = await sb.from("bestvip77_member_profiles").insert({
      user_id: userId,
      email: userEmail ?? null,
      carrier_country: cc,
      carrier_label: null,
      display_name_zh: nextDisplayNameZh,
      display_name_ko: nextDisplayNameKo || null,
      display_name_en: nextDisplayNameEn || null,
      status: "pending",
    });
    if (error && error.code !== "23505") {
      console.warn("[bestvip77] member_profiles insert:", error.message);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const normalizedPhone = normalizePhoneNumber(country, phone);
      const nextDisplayNameZh = displayNameZh.trim();
      const nextDisplayNameKo = displayNameKo.trim();
      const nextDisplayNameEn = "";
      const validatedLoginId = validateMemberLoginId(normalizeLoginIdentifierInput(loginId));

      if (!validatedLoginId.ok) {
        setErr(validatedLoginId.error);
        return;
      }

      if (!normalizedPhone) {
        setErr(
          country === "KR"
            ? "請正確輸入韓國手機號碼，例如 01012345678。/ 한국 휴대폰 번호를 다시 확인해 주세요."
            : "請正確輸入中國手機號碼，例如 13800138000。/ 중국 휴대폰 번호를 다시 확인해 주세요.",
        );
        return;
      }

      const available = await isPhoneAvailable(country, phone);
      if (!available) {
        setErr("此手機號碼已被使用，請改用其他號碼。/ 이미 가입에 사용된 휴대폰 번호입니다.");
        return;
      }

      if (!nextDisplayNameZh) {
        setErr("請輸入中文姓名。/ 중국어 이름을 입력해 주세요.");
        return;
      }

      const idAvailability = await isLoginIdAvailable(validatedLoginId.loginId);
      if (!idAvailability.available) {
        setErr(idAvailability.message);
        return;
      }

      const createRes = await fetch("/api/register/create-member", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          loginId: validatedLoginId.loginId,
          password,
          country,
          displayNameZh: nextDisplayNameZh,
          displayNameKo: nextDisplayNameKo,
        }),
      });
      const createPayload = (await createRes.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };
      if (!createRes.ok || !createPayload.ok) {
        setErr(createPayload.message ?? "회원가입 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      const { data, error } = await sb.auth.signInWithPassword({
        email: validatedLoginId.email,
        password,
      });
      if (error || !data.user || !data.session) {
        setErr(error?.message ?? "가입 직후 로그인에 실패했습니다. 로그인 화면에서 다시 시도해 주세요.");
        return;
      }

      rememberPendingPhone(normalizedPhone);

      const uid = data.user.id;
      if (uid) {
        await ensureProfileRow(
          uid,
          data.user.email ?? validatedLoginId.email,
          country,
          nextDisplayNameZh,
          nextDisplayNameKo,
          nextDisplayNameEn,
        );
      }

      router.push("/verify-phone?auto=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bv-light-ui flex min-h-dvh flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[480px] rounded-3xl border border-white/20 bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create an Account</h1>
          <p className="mt-2 text-[13px] text-zinc-500">註冊會員以開始使用 / 회원가입을 진행해주세요</p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          {/* Country Selection */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-zinc-700">Country / Region</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] transition-all ${country === "KR" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100"}`}>
                <input
                  type="radio"
                  name="country"
                  className="hidden"
                  checked={country === "KR"}
                  onChange={() => {
                    setCountry("KR");
                  }}
                />
                韓國 / 한국
              </label>
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] transition-all ${country === "CN" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100"}`}>
                <input
                  type="radio"
                  name="country"
                  className="hidden"
                  checked={country === "CN"}
                  onChange={() => {
                    setCountry("CN");
                  }}
                />
                中國 / 중국
              </label>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">中文姓名</label>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="必填"
                value={displayNameZh}
                onChange={(e) => setDisplayNameZh(e.target.value)}
                className="bv-light-field w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-700">한국어 이름</label>
              <input
                type="text"
                autoComplete="nickname"
                placeholder="선택사항"
                value={displayNameKo}
                onChange={(e) => setDisplayNameKo(e.target.value)}
                className="bv-light-field w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">ID / 아이디</label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="영문 소문자/숫자, 4~30자"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              onPaste={(e) => {
                const t = e.clipboardData.getData("text/plain");
                if (!t) return;
                e.preventDefault();
                setLoginId(normalizeLoginIdentifierInput(t));
              }}
              spellCheck={false}
              autoCapitalize="off"
              className="bv-light-field w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">Phone</label>
            <input
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder={phonePlaceholder(country)}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bv-light-field w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bv-light-field w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] text-zinc-900 outline-none transition-all placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
            />
          </div>

          {err ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {err}
            </div>
          ) : null}
          {msg ? (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
              {msg}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-zinc-900 py-3.5 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "處理中..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[13px] text-zinc-500">
            已有帳號？ / 이미 계정이 있나요?{" "}
            <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
