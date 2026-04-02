"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { isReservedAdminUsername, validateLoginIdentifier } from "@/lib/admin/usernames";
import { createBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next")?.startsWith("/") ? sp.get("next")! : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="mx-auto max-w-[400px] w-full rounded-3xl bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-white/20">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome Back</h1>
        <p className="mt-2 text-[13px] text-zinc-500">登入以繼續使用服務 / 서비스를 이용하려면 로그인하세요</p>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-700">Email / ID</label>
          <input
            type="text"
            required
            autoComplete="username"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-[14px] outline-none transition-all placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:ring-4 focus:ring-zinc-100"
          />
          {isReservedAdminUsername(email) ? (
            <p className="text-[11px] text-zinc-500 mt-1">管理員登入模式 / 관리자 로그인 모드</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-zinc-700">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
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

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-zinc-900 py-3.5 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? "登入中..." : "登入 / 로그인"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[13px] text-zinc-500">
          還沒有帳號？ / 계정이 없으신가요?{" "}
          <Link href="/register" className="font-semibold text-zinc-900 hover:underline">
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#FAFAFA] px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-zinc-500">載入中…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
