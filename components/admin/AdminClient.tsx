"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { AdminMembersPanel } from "@/components/admin/AdminMembersPanel";
import {
  defaultPortalContent,
  mergePortalContent,
  type PortalPostRow,
  type PortalSiteContent,
} from "@/lib/portal/types";

type Props = {
  initialContent: PortalSiteContent;
  initialPosts: PortalPostRow[];
};

export default function AdminClient({ initialContent, initialPosts }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"site" | "posts" | "members">("site");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initialContent, null, 2));
  const [posts, setPosts] = useState(initialPosts);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parsedPreview = useMemo(() => {
    try {
      return mergePortalContent(JSON.parse(jsonText) as unknown);
    } catch {
      return null;
    }
  }, [jsonText]);

  async function saveSiteJson() {
    setErr(null);
    setMsg(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setErr("JSON 格式錯誤 / JSON 형식 오류");
      return;
    }
    const content = mergePortalContent(parsed);
    setBusy(true);
    try {
      const sb = createBrowserClient();
      const { error } = await sb
        .from("bestvip77_site_settings")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      setJsonText(JSON.stringify(content, null, 2));
      setMsg("站點設定已儲存。/ 사이트 설정을 저장했습니다.");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "儲存失敗 / 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  function resetSiteJson() {
    setJsonText(JSON.stringify(defaultPortalContent, null, 2));
  }

  async function refreshPosts() {
    const sb = createBrowserClient();
    const { data, error } = await sb
      .from("bestvip77_posts")
      .select(
        "id,title,body_text,price_info,is_pinned,profile_image_url,gallery_image_urls,sort_order,created_at",
      )
      .order("is_pinned", { ascending: false })
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as PortalPostRow[]);
  }

  async function addPost() {
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { data, error } = await sb
        .from("bestvip77_posts")
        .insert({
          title: "新標題 / 새 카드",
          body_text: "",
          price_info: "",
          is_pinned: false,
          profile_image_url: "",
          gallery_image_urls: [],
          sort_order: 0,
        })
        .select(
          "id,title,body_text,price_info,is_pinned,profile_image_url,gallery_image_urls,sort_order,created_at",
        )
        .single();
      if (error) throw error;
      setPosts((p) => [data as PortalPostRow, ...p]);
      setMsg("已新增卡片。/ 게시물을 추가했습니다.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "新增失敗 / 추가 실패");
    } finally {
      setBusy(false);
    }
  }

  async function savePost(row: PortalPostRow) {
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { error } = await sb
        .from("bestvip77_posts")
        .update({
          title: row.title,
          body_text: row.body_text,
          price_info: row.price_info,
          is_pinned: row.is_pinned,
          profile_image_url: row.profile_image_url,
          gallery_image_urls: row.gallery_image_urls,
          sort_order: row.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (error) throw error;
      setMsg("已儲存。/ 저장했습니다.");
      await refreshPosts();
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "儲存失敗 / 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("確定刪除此卡片與留言嗎？ / 이 게시물과 댓글을 삭제할까요?")) return;
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { error } = await sb.from("bestvip77_posts").delete().eq("id", id);
      if (error) throw error;
      setPosts((p) => p.filter((x) => x.id !== id));
      setMsg("已刪除。/ 삭제했습니다.");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "刪除失敗 / 삭제 실패");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-zinc-100 pb-16 text-zinc-900">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold">bestvip77 管理後台</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("site")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "site" ? "bg-orange-500 text-white" : "bg-zinc-200"}`}
          >
            站點設定 / 사이트
          </button>
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "posts" ? "bg-orange-500 text-white" : "bg-zinc-200"}`}
          >
            廣告卡片 / 광고
          </button>
          <button
            type="button"
            onClick={() => setTab("members")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "members" ? "bg-orange-500 text-white" : "bg-zinc-200"}`}
          >
            會員管理 / CRM
          </button>
          <Link
            href="/"
            className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300"
          >
            公開站點 / 공개
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
          >
            登出 / 로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {msg ? <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null}
        {err ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}

        {tab === "members" ? (
          <AdminMembersPanel />
        ) : tab === "site" ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              首頁標題、Telegram、CTA、Banner、feed 區塊文案可在下方 JSON 直接修改。<strong>商家圖片、名稱、介紹</strong>請到右側「廣告卡片」編輯。
            </p>
            <p className="text-xs text-zinc-500">
              한국어 안내: <code className="rounded bg-zinc-100 px-1">urlStrip.items</code>는 비상용 백업 링크 줄입니다. 비우면 홈에 보이지 않습니다.
            </p>
            {parsedPreview ? (
              <p className="text-xs text-emerald-700">JSON 格式正常，可儲存。/ JSON 파싱 OK</p>
            ) : (
              <p className="text-xs text-red-600">JSON 格式錯誤，無法儲存。/ JSON 파싱 실패</p>
            )}
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
              className="h-[min(70vh,560px)] w-full rounded-xl border border-zinc-300 bg-white p-4 font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !parsedPreview}
                onClick={() => void saveSiteJson()}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                儲存 / 저장
              </button>
              <button
                type="button"
                onClick={resetSiteJson}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
              >
                重設為預設值 / 기본값
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-zinc-600">
                商家 / 廣告卡片編輯區。可修改標題、介紹、價格、主圖與多張圖片網址。
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void addPost()}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                新增卡片 / 새 카드
              </button>
            </div>
            <ul className="space-y-8">
              {posts.map((p) => (
                <PostEditor key={p.id} row={p} busy={busy} onSave={savePost} onDelete={deletePost} />
              ))}
            </ul>
            {posts.length === 0 ? <p className="text-sm text-zinc-500">目前沒有卡片，請按「新增卡片」。/ 카드가 없습니다.</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function PostEditor({
  row,
  busy,
  onSave,
  onDelete,
}: {
  row: PortalPostRow;
  busy: boolean;
  onSave: (r: PortalPostRow) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(row);
  useEffect(() => {
    setDraft(row);
  }, [row]);
  const galleryStr = draft.gallery_image_urls.join("\n");

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-zinc-500 sm:col-span-2">
          卡片標題 / 업체명·광고 제목
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-500 sm:col-span-2">
          介紹文案 / 업체 설명
          <textarea
            value={draft.body_text ?? ""}
            onChange={(e) => setDraft({ ...draft, body_text: e.target.value })}
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-500">
          價格 / 한 줄 정보
          <input
            value={draft.price_info}
            onChange={(e) => setDraft({ ...draft, price_info: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-500">
          主圖 URL / 프로필 이미지
          <input
            value={draft.profile_image_url}
            onChange={(e) => setDraft({ ...draft, profile_image_url: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 sm:pt-5">
          <input
            type="checkbox"
            checked={draft.is_pinned}
            onChange={(e) => setDraft({ ...draft, is_pinned: e.target.checked })}
          />
          置頂
        </label>
        <label className="block text-xs font-medium text-zinc-500">
          排序 / 정렬
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs font-medium text-zinc-500">
        圖片集 URL / 갤러리 이미지 URL
        <textarea
          value={galleryStr}
          onChange={(e) => {
            const parts = e.target.value
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean);
            setDraft({ ...draft, gallery_image_urls: parts });
          }}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 font-mono text-xs"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSave(draft)}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          儲存卡片 / 저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete(draft.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
        >
          刪除 / 삭제
        </button>
      </div>
    </li>
  );
}
