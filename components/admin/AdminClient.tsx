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
      setErr("JSON 格式錯誤");
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
      setMsg("사이트 설정을 저장했습니다.");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "저장 실패");
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
          title: "新標題",
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
      setMsg("게시물을 추가했습니다.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "추가 실패");
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
      setMsg("저장했습니다.");
      await refreshPosts();
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("이 게시물과 댓글을 삭제할까요?")) return;
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { error } = await sb.from("bestvip77_posts").delete().eq("id", id);
      if (error) throw error;
      setPosts((p) => p.filter((x) => x.id !== id));
      setMsg("삭제했습니다.");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "삭제 실패");
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
        <h1 className="text-lg font-bold">bestvip77 관리자</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("site")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "site" ? "bg-orange-500 text-white" : "bg-zinc-200"}`}
          >
            사이트·링크·문구 (JSON)
          </button>
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "posts" ? "bg-orange-500 text-white" : "bg-zinc-200"}`}
          >
            광고 카드
          </button>
          <button
            type="button"
            onClick={() => setTab("members")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "members" ? "bg-orange-500 text-white" : "bg-zinc-200"}`}
          >
            회원 승인
          </button>
          <Link
            href="/"
            className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium hover:bg-zinc-300"
          >
            공개 사이트
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {msg ? <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null}
        {err ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}

        {tab === "members" ? (
          <AdminMembersPanel />
        ) : tab === "site" ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600">
              헤더·히어로·Telegram·광고 CTA·배너·피드 구역 제목(<code className="rounded bg-zinc-100 px-1">feed</code>) 등은 아래
              JSON에서 수정합니다. <strong>업체 사진·이름·소개</strong>는 이 탭이 아니라 오른쪽 「광고 카드」에서
              편집하세요.
            </p>
            <p className="text-xs text-zinc-500">
              <code className="rounded bg-zinc-100 px-1">urlStrip.items</code>는 비상용 <strong>백업 링크 줄</strong>입니다.
              비우면 홈에 안 나옵니다. A/B/C 같은 샘플은 업체 구분이 아니었습니다.
            </p>
            {parsedPreview ? (
              <p className="text-xs text-emerald-700">JSON 파싱 OK (병합 미리보기 반영)</p>
            ) : (
              <p className="text-xs text-red-600">JSON 파싱 실패 — 저장할 수 없습니다.</p>
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
                저장
              </button>
              <button
                type="button"
                onClick={resetSiteJson}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm"
              >
                기본값으로 덮어쓰기 (주의)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-zinc-600">
                업체/광고 카드 — 제목(상호)·소개 본문·가격·프로필·갤러리 URL(여러 장은 줄마다 하나, 위→아래 순서로 노출)
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void addPost()}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                새 카드
              </button>
            </div>
            <ul className="space-y-8">
              {posts.map((p) => (
                <PostEditor key={p.id} row={p} busy={busy} onSave={savePost} onDelete={deletePost} />
              ))}
            </ul>
            {posts.length === 0 ? <p className="text-sm text-zinc-500">카드가 없습니다. 「새 카드」를 누르세요.</p> : null}
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
          제목 (업체명·광고 제목)
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-500 sm:col-span-2">
          소개 본문 (업체 설명·안내 문구)
          <textarea
            value={draft.body_text ?? ""}
            onChange={(e) => setDraft({ ...draft, body_text: e.target.value })}
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-500">
          가격/한 줄 부가 정보
          <input
            value={draft.price_info}
            onChange={(e) => setDraft({ ...draft, price_info: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-zinc-500">
          프로필 이미지 URL
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
          정렬 (숫자 클수록 위)
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs font-medium text-zinc-500">
        갤러리 이미지 URL (줄당 1장, 위에서 아래 순으로 쭉 나열)
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
          이 카드 저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete(draft.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </li>
  );
}
