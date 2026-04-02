"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { PortalCommentRow } from "@/lib/portal/types";

type Props = {
  postId: string;
  initialList: PortalCommentRow[];
  user: { id: string; email?: string | null } | null;
};

export function PostComments({ postId, initialList, user }: Props) {
  const router = useRouter();
  const [list, setList] = useState(initialList);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [pwOpen, setPwOpen] = useState<null | { action: "edit" | "delete"; commentId: string }>(null);
  const [password, setPassword] = useState("");

  const mine = useMemo(() => new Set(list.filter((c) => c.user_id === user?.id).map((c) => c.id)), [list, user?.id]);

  async function verifyPassword(): Promise<boolean> {
    if (!user?.email) {
      setErr("需要電子郵件以驗證密碼。");
      return false;
    }
    const sb = createBrowserClient();
    const { error } = await sb.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (error) {
      setErr("密碼不正確。");
      return false;
    }
    return true;
  }

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { data, error } = await sb
        .from("bestvip77_comments")
        .insert({ post_id: postId, user_id: user.id, content: t })
        .select("id,post_id,user_id,content,created_at")
        .single();
      if (error) throw error;
      setList((prev) => [...prev, data as PortalCommentRow]);
      setText("");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "發送失敗");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editId || !pwOpen || pwOpen.action !== "edit") return;
    const t = editText.trim();
    if (!t) return;
    setBusy(true);
    setErr(null);
    try {
      const ok = await verifyPassword();
      if (!ok) return;
      const sb = createBrowserClient();
      const { error } = await sb.from("bestvip77_comments").update({ content: t }).eq("id", editId);
      if (error) throw error;
      setList((prev) => prev.map((c) => (c.id === editId ? { ...c, content: t } : c)));
      setEditId(null);
      setPwOpen(null);
      setPassword("");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "更新失敗");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!pwOpen || pwOpen.action !== "delete") return;
    setBusy(true);
    setErr(null);
    try {
      const ok = await verifyPassword();
      if (!ok) return;
      const sb = createBrowserClient();
      const { error } = await sb.from("bestvip77_comments").delete().eq("id", pwOpen.commentId);
      if (error) throw error;
      setList((prev) => prev.filter((c) => c.id !== pwOpen.commentId));
      setPwOpen(null);
      setPassword("");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "刪除失敗");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(c: PortalCommentRow) {
    setEditId(c.id);
    setEditText(c.content);
  }

  return (
    <div className="border-t border-stone-100 bg-stone-50/40 p-5">
      <h4 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-500">留言</h4>

      {user ? (
        <form onSubmit={(e) => void submitNew(e)} className="mt-3 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="登入後可留言…"
            className="w-full resize-none rounded-[11px] border border-stone-200/90 bg-white px-3 py-2.5 text-[13px] text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-300/80 focus:ring-2 focus:ring-orange-500/15"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="self-end rounded-[11px] border border-orange-900/10 bg-gradient-to-b from-[#ea580c] to-[#c2410c] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] disabled:opacity-45"
          >
            發佈
          </button>
        </form>
      ) : (
        <p className="mt-2 text-[12px] leading-relaxed text-stone-500">
          登入後可發表留言、修改與刪除自己的留言（需再次輸入密碼）。
        </p>
      )}

      {err ? <p className="mt-2 text-[12px] text-red-700">{err}</p> : null}

      <ul className="mt-4 space-y-2">
        {list.map((c) => (
          <li
            key={c.id}
            className="rounded-[11px] border border-stone-200/70 bg-white px-3.5 py-2.5 text-[13px] text-stone-800"
          >
            {editId === c.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-[9px] border border-stone-200 px-2 py-1.5 text-[13px]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-[9px] bg-orange-600 px-3 py-1 text-[11px] font-semibold text-white"
                    onClick={() => {
                      setPwOpen({ action: "edit", commentId: c.id });
                      setPassword("");
                      setErr(null);
                    }}
                  >
                    用密碼確認並儲存
                  </button>
                  <button
                    type="button"
                    className="rounded-[9px] border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] text-stone-700"
                    onClick={() => setEditId(null)}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between gap-2">
                <p className="whitespace-pre-wrap break-words">{c.content}</p>
                {mine.has(c.id) ? (
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="text-[11px] font-medium text-orange-800/90 hover:underline"
                      onClick={() => startEdit(c)}
                    >
                      編輯
                    </button>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-red-700 hover:underline"
                      onClick={() => {
                        setPwOpen({ action: "delete", commentId: c.id });
                        setPassword("");
                        setErr(null);
                      }}
                    >
                      刪除
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </li>
        ))}
      </ul>

      {pwOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/45 p-4 backdrop-blur-[2px]">
          <div
            className="w-full max-w-sm rounded-[14px] border border-stone-200/80 bg-[var(--bv-surface)] p-6"
            style={{ boxShadow: "var(--bv-shadow)" }}
          >
            <p className="text-[14px] font-semibold text-stone-900">
              {pwOpen.action === "edit" ? "輸入登入密碼以儲存修改" : "輸入登入密碼以刪除留言"}
            </p>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-3 w-full rounded-[11px] border border-stone-200 px-3 py-2.5 text-[13px]"
              placeholder="密碼"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-[11px] px-3 py-2 text-[13px] text-stone-600"
                onClick={() => {
                  setPwOpen(null);
                  setPassword("");
                }}
              >
                取消
              </button>
              <button
                type="button"
                disabled={busy || !password}
                className="rounded-[11px] bg-stone-900 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                onClick={() => void (pwOpen.action === "edit" ? saveEdit() : confirmDelete())}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
