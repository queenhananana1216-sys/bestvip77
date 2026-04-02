"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
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
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
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
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
      <h1 className="text-xl font-bold text-neutral-900">로그인</h1>
      <p className="mt-1 text-sm text-neutral-500">
        관리자 승인이 완료된 회원만 메인 페이지를 볼 수 있습니다.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
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
          <label className="text-xs font-medium text-neutral-600">비밀번호</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
        >
          {loading ? "…" : "로그인"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        還沒有帳號？{" "}
        <Link href="/register" className="font-semibold text-orange-600 hover:underline">
          회원가입
        </Link>
      </p>
      <p className="mt-2 text-center">
          <span className="text-sm text-neutral-400">승인 전에는 메인으로 이동할 수 없습니다</span>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-100 px-4 py-10">
      <Suspense fallback={<p className="text-sm text-neutral-500">載入中…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
