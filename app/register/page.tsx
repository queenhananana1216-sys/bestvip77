"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { type CarrierCountry, carriersForCountry } from "@/lib/register/carriers";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  ) {
    const sb = createBrowserClient();
    const { error } = await sb.from("bestvip77_member_profiles").insert({
      user_id: userId,
      email: userEmail ?? null,
      carrier_country: cc,
      carrier_label: carrierValue,
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

      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            bestvip77: "true",
            carrier_country: country,
            carrier_label: carrierValue,
          },
        },
      });
      if (error) {
        setErr(error.message);
        return;
      }

      const uid = data.user?.id;
      if (uid) {
        await ensureProfileRow(uid, data.user?.email ?? email.trim(), country, carrierValue);
      }

      setMsg(
        "가입 신청이 접수되었습니다. 관리자 승인 후 사이트를 이용할 수 있습니다. (이메일 인증을 켠 경우 메일을 확인하세요.)",
      );
      router.refresh();
      if (data.session) {
        router.push("/pending-approval");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold text-neutral-900">회원가입</h1>
        <p className="mt-1 text-sm text-neutral-500">bestvip77 — 승인 후 이용 가능</p>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600">국가 / 지역</label>
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
                한국
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
                中国
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-600">통신사</label>
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
            <label className="text-xs font-medium text-neutral-600">Email</label>
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
            <label className="text-xs font-medium text-neutral-600">비밀번호 (6자 이상)</label>
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
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
          >
            {loading ? "처리 중…" : "가입 신청"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-neutral-500">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            로그인
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/login" className="text-sm text-neutral-400 hover:text-neutral-600">
            첫 화면은 로그인 후 이용합니다
          </Link>
        </p>
      </div>
    </div>
  );
}
