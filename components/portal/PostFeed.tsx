"use client";

import Image from "next/image";
import Link from "next/link";
import type { PortalPostRow } from "@/lib/portal/types";

type Props = {
  posts: PortalPostRow[];
};

export function PostFeed({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="space-y-5">
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
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <MerchantListCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function MerchantListCard({ post }: { post: PortalPostRow }) {
  const gallery = post.gallery_image_urls.filter((u) => u.trim());
  const mainImage = post.profile_image_url || gallery[0];
  const sideImages = gallery.filter(img => img !== mainImage).slice(0, 2);

  return (
    <Link
      href={`/post/${post.id}`}
      className="cursor-pointer overflow-hidden rounded-[12px] bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-md block"
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-stone-100 ring-1 ring-black/5">
          {post.profile_image_url ? (
            <Image src={post.profile_image_url} alt="" fill className="object-cover" sizes="40px" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-stone-400">
              {(post.title || "店")[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-stone-900 line-clamp-1">{post.title || "（無標題）"}</h3>
            <span className="text-[11px] text-stone-400">剛剛</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {post.price_info ? (
              <span className="text-[12px] text-stone-600">{post.price_info}</span>
            ) : null}
            {post.is_pinned ? (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                置頂
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="col-span-2 relative aspect-[3/4] overflow-hidden rounded-lg bg-stone-100">
          {mainImage ? (
            <Image src={mainImage} alt="" fill className="object-cover" sizes="(max-width:640px) 66vw, 400px" unoptimized />
          ) : null}
        </div>
        <div className="col-span-1 flex flex-col gap-1.5">
          {sideImages.map((img, i) => (
            <div key={i} className="relative flex-1 overflow-hidden rounded-lg bg-stone-100">
              <Image src={img} alt="" fill className="object-cover" sizes="(max-width:640px) 33vw, 200px" unoptimized />
            </div>
          ))}
          {sideImages.length < 2 && (
            <div className={`relative flex-1 overflow-hidden rounded-lg bg-stone-50 ${sideImages.length === 0 ? 'hidden' : ''}`}></div>
          )}
        </div>
      </div>
    </Link>
  );
}
