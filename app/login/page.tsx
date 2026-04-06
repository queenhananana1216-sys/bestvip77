"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  isAdminEmailDomain,
  isReservedAdminUsername,
  normalizeLoginIdentifierInput,
  validateLoginIdentifier,
} from "@/lib/admin/usernames";
import { createBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next")?.startsWith("/") ? sp.get("next")! : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isAdminLogin = isReservedAdminUsername(email) || isAdminEmailDomain(email);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const identifier = validateLoginIdentifier(email);
      if (!identifier.ok) {
        setErr(identifier.error);
        return;
      }

      const { error } = await sb.auth.signInWithPassword({ email: identifier.email, password });
      if (error) {
        setErr(error.message);
        return;
      }
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
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
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#a16207]">bestvip77</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#431407]">Welcome Back</h1>
        <p className="mt-2 text-[13px] text-[#7c2d12]">登入以繼續使用服務 / 서비스를 이용하려면 로그인하세요</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#5b2311]">Email / ID</label>
          <input
            type="text"
            required
            autoComplete="username"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onPaste={(e) => {
              const t = e.clipboardData.getData("text/plain");
              if (!t) return;
              e.preventDefault();
              setEmail(normalizeLoginIdentifierInput(t));
            }}
            spellCheck={false}
            autoCapitalize="off"
            className="bv-light-field w-full appearance-none rounded-xl border px-4 py-3 text-[15px] font-semibold outline-none transition-all placeholder:text-[#b08968] focus:border-[#b45309] focus:bg-white focus:ring-4 focus:ring-[#f59e0b]/10"
            style={{
              background: "#fff7ed",
              borderColor: "#d6b995",
              boxShadow: "0 1px 0 rgba(255,255,255,0.85) inset",
            }}
          />
          {isAdminLogin ? (
            <p className="mt-1 text-[11px] text-[#9a3412]">管理員登入模式 / admin123, admin456 또는 관리자 이메일 사용 가능</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#5b2311]">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bv-light-field w-full appearance-none rounded-xl border px-4 py-3 text-[15px] font-semibold outline-none transition-all placeholder:text-[#b08968] focus:border-[#b45309] focus:bg-white focus:ring-4 focus:ring-[#f59e0b]/10"
            style={{
              background: "#fff7ed",
              borderColor: "#d6b995",
              boxShadow: "0 1px 0 rgba(255,255,255,0.85) inset",
            }}
          />
        </div>

        {err ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {err}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl py-3.5 text-[14px] font-medium text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
          style={{
            background: "linear-gradient(180deg, #7f1d1d 0%, #431407 100%)",
            boxShadow: "0 10px 28px -14px rgba(127,29,29,0.55), 0 1px 0 rgba(255,255,255,0.12) inset",
          }}
        >
          {loading ? "登入中..." : "登入 / 로그인"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[13px] text-[#7c2d12]">
          還沒有帳號？ / 계정이 없으신가요?{" "}
          <Link href="/register" className="font-semibold text-[#7f1d1d] hover:underline">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(220,38,38,0.1), transparent 52%), radial-gradient(ellipse 70% 50% at 100% 0%, rgba(234,179,8,0.12), transparent 46%), #f8f2e9",
      }}
    >
      <Suspense fallback={<p className="text-sm text-zinc-500">載入中…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
