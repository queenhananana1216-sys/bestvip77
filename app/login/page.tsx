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
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
      <h1 className="text-xl font-bold text-neutral-900">會員登入</h1>
      <p className="mt-1 text-sm text-neutral-600">管理員審核通過後才可使用首頁與服務內容。</p>
      <p className="mt-1 text-xs text-neutral-400">관리자 승인 후에만 메인 페이지와 서비스 내용을 볼 수 있습니다.</p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-600">登入帳號 / 이메일 또는 관리자 아이디</label>
          <input
            type="text"
            required
            autoComplete="username"
            placeholder="user@example.com / admin123"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/50"
          />
          {isReservedAdminUsername(email) ? (
            <p className="mt-1 text-xs text-neutral-500">已切換為管理員 ID 登入模式。/ 관리자 아이디 로그인 모드입니다.</p>
          ) : (
            <p className="mt-1 text-xs text-neutral-500">一般會員請輸入 Email；管理員 ID 只允許 admin123、admin456。/ 일반 회원은 이메일만 사용합니다.</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">密碼 / 비밀번호</label>
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
          className="w-full rounded-xl bg-linear-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow disabled:opacity-60"
        >
          {loading ? "…" : "登入 / 로그인"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        還沒有帳號？ / 아직 계정이 없나요?{" "}
        <Link href="/register" className="font-semibold text-orange-600 hover:underline">
          立即註冊 / 회원가입
        </Link>
      </p>
      <p className="mt-2 text-center">
          <span className="text-sm text-neutral-400">審核前無法進入首頁。/ 승인 전에는 메인으로 이동할 수 없습니다.</span>
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
