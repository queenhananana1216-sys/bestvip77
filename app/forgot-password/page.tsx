"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setErr("이메일을 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const origin = window.location.origin;
      const next = encodeURIComponent("/auth/set-password");
      const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${origin}/auth/callback?next=${next}`,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setMsg("재설정 링크를 메일로 보냈습니다. 메일함을 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(220,38,38,0.1), transparent 52%), radial-gradient(ellipse 70% 50% at 100% 0%, rgba(234,179,8,0.12), transparent 46%), #f8f2e9",
      }}
    >
      <div
        className="bv-light-ui mx-auto w-full max-w-[400px] rounded-3xl border p-8 backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(255,248,240,0.96) 100%)",
          borderColor: "rgba(191, 149, 63, 0.22)",
          boxShadow:
            "0 16px 50px -22px rgba(104, 27, 27, 0.28), 0 1px 0 rgba(255,255,255,0.78) inset",
        }}
      >
        <h1 className="text-xl font-bold text-[#431407]">비밀번호 재설정</h1>
        <p className="mt-2 text-[13px] text-[#7c2d12]">가입한 이메일로 재설정 링크를 보냅니다.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label className="text-[13px] font-medium text-[#5b2311]">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bv-light-field mt-1.5 w-full appearance-none rounded-xl border px-4 py-3 text-[15px] font-semibold outline-none"
              style={{ background: "#fff7ed", borderColor: "#d6b995" }}
            />
          </div>
          {err ? <p className="text-[13px] text-red-600">{err}</p> : null}
          {msg ? <p className="text-[13px] text-green-800">{msg}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-[14px] font-medium text-white disabled:opacity-50"
            style={{ background: "linear-gradient(180deg, #7f1d1d 0%, #431407 100%)" }}
          >
            {loading ? "전송 중…" : "링크 보내기"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#7c2d12]">
          <Link href="/login" className="font-semibold text-[#7f1d1d] hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
