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
  const [displayNameEn, setDisplayNameEn] = useState("");
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
      const nextDisplayNameEn = displayNameEn.trim();
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
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold text-neutral-900">會員註冊</h1>
        <p className="mt-1 text-sm text-neutral-600">bestvip77 以中文為主，支援韓文與英文姓名欄位。</p>
        <p className="mt-1 text-xs text-neutral-400">중국어 중심 서비스이며, 한국어·영문 이름도 함께 입력할 수 있습니다.</p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600">國家 / 地區 · 국가 / 지역</label>
            <div className="mt-2 flex gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="country"
                  checked={country === "KR"}
                  onChange={() => {
                    setCountry("KR");
                    setCarrier(carriersForCountry("KR")[0].value);
                  }}
                />
                韓國 / 한국
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="country"
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

          <div>
            <label className="text-xs font-medium text-neutral-600">通信商 / 통신사</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            >
              {carrierOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">中文姓名 / 중국어 이름</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={displayNameZh}
              onChange={(e) => setDisplayNameZh(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">韓文姓名 / 한국어 이름 (선택)</label>
            <input
              type="text"
              autoComplete="nickname"
              value={displayNameKo}
              onChange={(e) => setDisplayNameKo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">英文姓名 / English name (optional)</label>
            <input
              type="text"
              autoComplete="nickname"
              value={displayNameEn}
              onChange={(e) => setDisplayNameEn(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">電子郵件 / 이메일</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">手機號碼 / 휴대폰 번호</label>
            <input
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder={phonePlaceholder(country)}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
            <p className="mt-1 text-xs text-neutral-500">請填可接收簡訊的真實號碼，同一號碼不可重複註冊。/ 실제 SMS를 받을 수 있는 번호만 가능하며 같은 번호로 중복 가입할 수 없습니다.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-600">密碼 / 비밀번호 (6자 이상)</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-linear-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
          >
            {loading ? "提交中…" : "提交申請 / 가입 신청"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          已有帳號？ / 이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            立即登入 / 로그인
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-600">
            請先登入再進入首頁 / 첫 화면은 로그인 후 이용합니다
          </Link>
        </p>
      </div>
    </div>
  );
}
