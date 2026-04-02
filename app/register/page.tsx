"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { isAdminEmailDomain, isReservedAdminEmail, isReservedAdminUsername } from "@/lib/admin/usernames";
import { createBrowserClient } from "@/lib/supabase/client";
import { type CarrierCountry, carriersForCountry } from "@/lib/register/carriers";
import { normalizePhoneNumber, phonePlaceholder, rememberPendingPhone } from "@/lib/register/phone";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [displayNameZh, setDisplayNameZh] = useState("");
  const [displayNameKo, setDisplayNameKo] = useState("");
  const [country, setCountry] = useState<CarrierCountry>("KR");
  const [carrier, setCarrier] = useState<string>(carriersForCountry("KR")[0].value);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const carrierOptions = useMemo(() => carriersForCountry(country), [country]);

  async function ensureProfileRow(
    userId: string,
    userEmail: string | undefined,
    cc: CarrierCountry,
    carrierValue: string,
    nextDisplayNameZh: string,
    nextDisplayNameKo: string,
    nextDisplayNameEn: string,
  ) {
    const sb = createBrowserClient();
    const { error } = await sb.from("bestvip77_member_profiles").insert({
      user_id: userId,
      email: userEmail ?? null,
      carrier_country: cc,
      carrier_label: carrierValue,
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
      const origin = window.location.origin;
      const valid = carrierOptions.some((c) => c.value === carrier);
      const carrierValue = valid ? carrier : (carrierOptions[0]?.value ?? "MVNO_KR");
      const normalizedPhone = normalizePhoneNumber(country, phone);
      const nextDisplayNameZh = displayNameZh.trim();
      const nextDisplayNameKo = displayNameKo.trim();
      const nextDisplayNameEn = "";
      const nextEmail = email.trim();

      if (!normalizedPhone) {
        setErr(
          country === "KR"
            ? "請正確輸入韓國手機號碼，例如 01012345678。/ 한국 휴대폰 번호를 다시 확인해 주세요."
            : "請正確輸入中國手機號碼，例如 13800138000。/ 중국 휴대폰 번호를 다시 확인해 주세요.",
        );
        return;
      }

      if (!nextDisplayNameZh) {
        setErr("請輸入中文姓名。/ 중국어 이름을 입력해 주세요.");
        return;
      }

      if (isReservedAdminUsername(nextEmail) || isReservedAdminEmail(nextEmail) || isAdminEmailDomain(nextEmail)) {
        setErr("此帳號識別字僅供管理員使用。/ 이 계정 식별자는 관리자 전용입니다.");
        return;
      }

      const { data, error } = await sb.auth.signUp({
        email: nextEmail,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/verify-phone`,
          data: {
            bestvip77: "true",
            carrier_country: country,
            carrier_label: carrierValue,
            display_name_zh: nextDisplayNameZh,
            display_name_ko: nextDisplayNameKo,
            display_name_en: nextDisplayNameEn,
          },
        },
      });
      if (error) {
        setErr(error.message);
        return;
      }

      rememberPendingPhone(normalizedPhone);

      const uid = data.user?.id;
      if (uid && data.session) {
        await ensureProfileRow(
          uid,
          data.user?.email ?? nextEmail,
          country,
          carrierValue,
          nextDisplayNameZh,
          nextDisplayNameKo,
          nextDisplayNameEn,
        );
      }

      if (data.session) {
        router.push("/verify-phone?auto=1");
        router.refresh();
        return;
      }

      setMsg("申請已送出，完成 Email 驗證與手機驗證後會進入審核頁面。/ 이메일 인증과 휴대폰 인증을 마치면 승인 대기 화면으로 이동합니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[480px] rounded-3xl bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20">
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
                    setCarrier(carriersForCountry("KR")[0].value);
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
                    setCarrier(carriersForCountry("CN")[0].value);
                  }}
                />
                中國 / 중국
              </label>
            </div>
          </div>

          {/* Carrier */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">Carrier / 통신사</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
            >
              {carrierOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
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
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
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
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
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
