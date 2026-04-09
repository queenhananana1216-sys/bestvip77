"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const sb = createBrowserClient();
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        if (!data.session) {
          setErr("세션이 없습니다. 메일의 재설정 링크를 다시 열어 주세요.");
          return;
        }
        setReady(true);
      } catch {
        if (!cancelled) setErr("세션을 불러오지 못했습니다.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr("비밀번호는 8자 이상으로 해 주세요.");
      return;
    }
    if (password !== password2) {
      setErr("비밀번호가 서로 같지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const sb = createBrowserClient();
      const { error } = await sb.auth.updateUser({ password });
      if (error) {
        setErr(error.message);
        return;
      }
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        const { data: adminRow } = await sb.from("bestvip77_admins").select("user_id").eq("user_id", user.id).maybeSingle();
        router.replace(adminRow ? "/admin" : "/");
      } else {
        router.replace("/login");
      }
      router.refresh();
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
        }}
      >
        <h1 className="text-xl font-bold text-[#431407]">새 비밀번호 설정</h1>
        <p className="mt-2 text-[13px] text-[#7c2d12]">메일 링크로 들어온 뒤 여기서 비밀번호를 저장합니다.</p>

        {!ready && !err ? <p className="mt-6 text-sm text-zinc-600">확인 중…</p> : null}

        {ready ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
            <div>
              <label className="text-[13px] font-medium text-[#5b2311]">새 비밀번호</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bv-light-field mt-1.5 w-full rounded-xl border px-4 py-3 text-[15px] font-semibold outline-none"
                style={{ background: "#fff7ed", borderColor: "#d6b995" }}
              />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#5b2311]">새 비밀번호 확인</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="bv-light-field mt-1.5 w-full rounded-xl border px-4 py-3 text-[15px] font-semibold outline-none"
                style={{ background: "#fff7ed", borderColor: "#d6b995" }}
              />
            </div>
            {err ? <p className="text-[13px] text-red-600">{err}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-[14px] font-medium text-white disabled:opacity-50"
              style={{ background: "linear-gradient(180deg, #7f1d1d 0%, #431407 100%)" }}
            >
              {loading ? "저장 중…" : "저장하고 관리자로 이동"}
            </button>
          </form>
        ) : null}

        {err && !ready ? <p className="mt-6 text-[13px] text-red-600">{err}</p> : null}

        <p className="mt-6 text-center text-[13px] text-[#7c2d12]">
          <Link href="/login" className="font-semibold text-[#7f1d1d] hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
