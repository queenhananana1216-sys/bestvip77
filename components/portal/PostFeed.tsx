import Image from "next/image";
import { PostComments } from "@/components/portal/PostComments";
import type { PortalCommentRow, PortalPostRow } from "@/lib/portal/types";

type Props = {
  posts: PortalPostRow[];
  commentsByPost: Record<string, PortalCommentRow[]>;
  user: { id: string; email?: string | null } | null;
  feedTitle: string;
  feedSubtitle: string;
};

function FeedHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="border-b border-stone-200/80 pb-4">
      <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-stone-900">{title}</h2>
      {subtitle ? <p className="mt-1.5 text-[12px] leading-relaxed text-stone-500">{subtitle}</p> : null}
    </header>
  );
}

export function PostFeed({ posts, commentsByPost, user, feedTitle, feedSubtitle }: Props) {
  if (posts.length === 0) {
    return (
      <div className="space-y-5">
        <FeedHeading title={feedTitle} subtitle={feedSubtitle} />
        <div
          className="rounded-[14px] border border-dashed border-stone-300/80 bg-[var(--bv-surface)] px-6 py-10 text-center"
          style={{ boxShadow: "var(--bv-shadow-sm)" }}
        >
          <p className="text-[13px] text-stone-600">尚無商家/廣告刊登。</p>
          <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-stone-500">
            管理後台 → 「광고 카드」分頁 → 「새 카드」：圖片網址、店名（標題）、介紹文案。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <FeedHeading title={feedTitle} subtitle={feedSubtitle} />
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-[14px] border border-stone-200/70 bg-[var(--bv-surface)]"
          style={{ boxShadow: "var(--bv-shadow)" }}
        >
          <div className="flex items-start gap-4 border-b border-stone-100 p-5">
            <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200/80">
              {post.profile_image_url ? (
                <Image
                  src={post.profile_image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="52px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[13px] font-medium text-stone-400">
                  店
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-stone-900">
                  {post.title || "（無標題）"}
                </h3>
                {post.is_pinned ? (
                  <span className="rounded-md border border-orange-200/80 bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-900">
                    置頂
                  </span>
                ) : null}
              </div>
              {post.price_info ? (
                <p className="mt-1 text-[13px] font-medium text-orange-800/90">{post.price_info}</p>
              ) : null}
              {(post.body_text ?? "").trim() ? (
                <p className="mt-3 whitespace-pre-wrap text-[13px] leading-[1.65] text-stone-600">{post.body_text}</p>
              ) : null}
            </div>
          </div>

          <Gallery urls={post.gallery_image_urls} />

          <PostComments
            postId={post.id}
            initialList={commentsByPost[post.id] ?? []}
            user={user}
          />
        </article>
      ))}
    </div>
  );
}

function Gallery({ urls }: { urls: string[] }) {
  const list = urls.map((u) => u.trim()).filter(Boolean);
  if (list.length === 0) return null;

  return (
    <div className="space-y-2.5 bg-stone-50/80 p-3">
      {list.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[11px] bg-stone-200 ring-1 ring-stone-900/[0.06]"
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw, 36rem"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
