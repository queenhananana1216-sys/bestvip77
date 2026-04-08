"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { normalizeLoginIdentifierInput, validateMemberLoginId } from "@/lib/admin/usernames";
import { createBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const validatedLoginId = validateMemberLoginId(normalizeLoginIdentifierInput(loginId));
      const nextNickname = nickname.trim();

      if (!validatedLoginId.ok) {
        setErr(validatedLoginId.error);
        return;
      }

      if (!nextNickname) {
        setErr("닉네임을 입력해 주세요.");
        return;
      }

      const createRes = await fetch("/api/register/create-member", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          loginId: validatedLoginId.loginId,
          password,
          country: "KR",
          displayNameZh: nextNickname,
          displayNameKo: nextNickname,
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

      router.push("/");
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
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-zinc-700">아이디 / 帳號ID</label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="아이디를 입력해 주세요 / 請輸入ID"
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
            <label className="text-[13px] font-medium text-zinc-700">닉네임 / 暱稱</label>
            <input
              type="text"
              autoComplete="nickname"
              required
              placeholder="닉네임을 입력해 주세요 / 請輸入暱稱"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
