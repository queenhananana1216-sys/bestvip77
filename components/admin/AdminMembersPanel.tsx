"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export type MemberRow = {
  user_id: string;
  email: string | null;
  carrier_country: string;
  carrier_label: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string;
};

export function AdminMembersPanel() {
  const router = useRouter();
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sb = createBrowserClient();
    const { data, error } = await sb
      .from("bestvip77_member_profiles")
      .select("user_id,email,carrier_country,carrier_label,status,reviewed_at,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setErr(error.message);
      return;
    }
    const list = (data ?? []) as MemberRow[];
    list.sort((a, b) => {
      const o = (s: string) => (s === "pending" ? 0 : s === "approved" ? 1 : 2);
      if (o(a.status) !== o(b.status)) return o(a.status) - o(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setRows(list);
    setErr(null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(userId: string, status: "approved" | "rejected") {
    setBusyId(userId);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { error } = await sb
        .from("bestvip77_member_profiles")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (error) throw error;
      await load();
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "처리 실패");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-600">
          승인 전 회원은 홈·피드를 볼 수 없습니다. 거절 시 <code className="rounded bg-zinc-100 px-1">pending-approval</code>{" "}
          안내가 표시됩니다.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
        >
          새로고침
        </button>
      </div>
      {err ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-600">
            <tr>
              <th className="px-3 py-2">이메일</th>
              <th className="px-3 py-2">지역</th>
              <th className="px-3 py-2">통신사</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">가입일</th>
              <th className="px-3 py-2">동작</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-b border-zinc-100">
                <td className="px-3 py-2 font-mono text-xs">{r.email ?? r.user_id.slice(0, 8)}</td>
                <td className="px-3 py-2">{r.carrier_country === "KR" ? "한국" : "중국"}</td>
                <td className="px-3 py-2 text-xs">{r.carrier_label ?? "—"}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.status === "pending"
                        ? "text-amber-700"
                        : r.status === "approved"
                          ? "text-emerald-700"
                          : "text-red-700"
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {new Date(r.created_at).toLocaleString("ko-KR")}
                </td>
                <td className="px-3 py-2">
                  {r.status === "pending" ? (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={busyId === r.user_id}
                        onClick={() => void setStatus(r.user_id, "approved")}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.user_id}
                        onClick={() => void setStatus(r.user_id, "rejected")}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 disabled:opacity-50"
                      >
                        거절
                      </button>
                    </div>
                  ) : r.status === "approved" ? (
                    <button
                      type="button"
                      disabled={busyId === r.user_id}
                      onClick={() => void setStatus(r.user_id, "rejected")}
                      className="text-xs text-red-600 underline disabled:opacity-50"
                    >
                      승인 취소(거절)
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyId === r.user_id}
                      onClick={() => void setStatus(r.user_id, "approved")}
                      className="text-xs text-emerald-600 underline disabled:opacity-50"
                    >
                      다시 승인
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-zinc-500">아직 가입 신청이 없습니다.</p>
        ) : null}
      </div>
    </div>
  );
}
