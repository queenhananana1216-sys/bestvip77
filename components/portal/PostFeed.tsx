"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { PostComments } from "@/components/portal/PostComments";
import type { PortalCommentRow, PortalPostRow } from "@/lib/portal/types";

type Props = {
  posts: PortalPostRow[];
  commentsByPost: Record<string, PortalCommentRow[]>;
  user: { id: string; email?: string | null } | null;
  feedTitle: string;
  feedSubtitle: string;
};

function coverUrl(post: PortalPostRow): string | null {
  if (post.profile_image_url?.trim()) return post.profile_image_url;
  const first = post.gallery_image_urls.find((u) => u.trim());
  return first ?? null;
}

function FeedHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="border-b border-stone-200/80 pb-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-stone-900">{title}</h2>
      {subtitle ? <p className="mt-1.5 text-[12px] leading-relaxed text-stone-500">{subtitle}</p> : null}
    </header>
  );
}

export function PostFeed({ posts, commentsByPost, user, feedTitle, feedSubtitle }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = posts.find((p) => p.id === selectedId) ?? null;

  const close = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    if (!selectedId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [selectedId, close]);

  if (posts.length === 0) {
    return (
      <div className="space-y-5">
        <FeedHeading title={feedTitle} subtitle={feedSubtitle} />
        <div
          className="rounded-[14px] border border-dashed border-stone-300/80 bg-(--bv-surface) px-6 py-10 text-center"
          style={{ boxShadow: "var(--bv-shadow-sm)" }}
        >
          <p className="text-[13px] text-stone-600">尚無商家/廣告刊登。</p>
          <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-stone-500">
            管理後台 → 「廣告卡片」分頁 → 「새 카드 추가」
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FeedHeading title={feedTitle} subtitle={feedSubtitle} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {posts.map((post) => (
          <MerchantGridCard key={post.id} post={post} onClick={() => setSelectedId(post.id)} />
        ))}
      </div>

      {selected ? (
        <MerchantDetailModal
          post={selected}
          comments={commentsByPost[selected.id] ?? []}
          user={user}
          onClose={close}
        />
      ) : null}
    </div>
  );
}

function MerchantGridCard({ post, onClick }: { post: PortalPostRow; onClick: () => void }) {
  const cover = coverUrl(post);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-[14px] border border-stone-200/70 bg-(--bv-surface) text-left transition hover:border-stone-300/80 hover:shadow-md"
      style={{ boxShadow: "var(--bv-shadow-sm)" }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200">
        {cover ? (
          <Image
            src={cover}
            alt={post.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, 280px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-stone-400">
            {(post.title || "店")[0]}
          </div>
        )}

        {post.is_pinned ? (
          <span className="absolute left-2 top-2 rounded-md border border-orange-300/80 bg-orange-500/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            置頂
          </span>
        ) : null}

        {post.gallery_image_urls.filter((u) => u.trim()).length > 0 ? (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <path d="M3 16l5-5 4 4 3-3 6 6v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2Z" fill="currentColor" opacity="0.4" />
            </svg>
            {post.gallery_image_urls.filter((u) => u.trim()).length}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.01em] text-stone-900">
          {post.title || "（無標題）"}
        </h3>
        {post.price_info ? (
          <p className="mt-auto text-[12px] font-medium text-orange-800/90">{post.price_info}</p>
        ) : null}
      </div>
    </button>
  );
}

function MerchantDetailModal({
  post,
  comments,
  user,
  onClose,
}: {
  post: PortalPostRow;
  comments: PortalCommentRow[];
  user: { id: string; email?: string | null } | null;
  onClose: () => void;
}) {
  const galleryUrls = post.gallery_image_urls.filter((u) => u.trim());

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-stone-900/50 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[18px] border border-stone-200/80 bg-(--bv-surface) sm:max-w-lg sm:rounded-[18px]"
        style={{ boxShadow: "var(--bv-shadow)" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-(--bv-surface)/95 px-5 py-3 backdrop-blur-sm">
          <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-stone-900">商家詳情 / 업체 상세</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-start gap-4 p-5">
            <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/80">
              {post.profile_image_url ? (
                <Image src={post.profile_image_url} alt="" fill className="object-cover" sizes="56px" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[15px] font-medium text-stone-400">
                  {(post.title || "店")[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-stone-900">
                  {post.title || "（無標題）"}
                </h3>
                {post.is_pinned ? (
                  <span className="rounded-md border border-orange-200/80 bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-900">
                    置頂
                  </span>
                ) : null}
              </div>
              {post.price_info ? (
                <p className="mt-1.5 text-[13px] font-medium text-orange-800/90">{post.price_info}</p>
              ) : null}
            </div>
          </div>

          {(post.body_text ?? "").trim() ? (
            <div className="border-t border-stone-100 px-5 py-4">
              <p className="whitespace-pre-wrap text-[13px] leading-[1.7] text-stone-700">{post.body_text}</p>
            </div>
          ) : null}

          {galleryUrls.length > 0 ? (
            <div className="space-y-2.5 border-t border-stone-100 bg-stone-50/80 p-3">
              {galleryUrls.map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-[11px] bg-stone-200 ring-1 ring-stone-900/6"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 480px" unoptimized />
                </div>
              ))}
            </div>
          ) : null}

          <PostComments postId={post.id} initialList={comments} user={user} />
        </div>
      </div>
    </div>
  );
}
