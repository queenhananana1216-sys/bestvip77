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
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 px-6 py-10 text-center backdrop-blur-md">
          <p className="text-[13px] text-zinc-400">尚無商家/廣告刊登。</p>
          <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-zinc-600">
            新內容正在整理中，完成審核後會在這裡顯示。 / 새 게시물을 준비 중입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      className="group block cursor-pointer overflow-hidden rounded-2xl border border-white/6 bg-white/3 p-3 backdrop-blur-xl transition-all duration-300 hover:border-[#FFD700]/15 hover:bg-white/6 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,215,0,0.06)]"
      style={{
        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition-all duration-300 group-hover:ring-[#FFD700]/20 group-hover:shadow-[0_0_12px_rgba(255,215,0,0.15)]">
          {post.profile_image_url ? (
            <Image src={post.profile_image_url} alt="" fill className="object-cover" sizes="40px" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#FFD700]/40">
              {(post.title || "店")[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-zinc-100 line-clamp-1 transition-colors duration-300 group-hover:text-[#FCF6BA]">{post.title || "（無標題）"}</h3>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            {post.price_info ? (
              <span className="text-[12px] text-[#FF8C00]">{post.price_info}</span>
            ) : null}
            {post.is_pinned ? (
              <span className="rounded-full border border-[#FF3B00]/20 bg-[#FF3B00]/10 px-2 py-0.5 text-[10px] font-medium text-[#FF6B00]">
                置頂
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-1.5 overflow-hidden rounded-xl">
        <div className="relative col-span-2 aspect-3/4 overflow-hidden rounded-lg bg-white/5">
          {mainImage ? (
            <Image src={mainImage} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 66vw, 400px" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-700">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="col-span-1 flex flex-col gap-1.5">
          {sideImages.map((img, i) => (
            <div key={i} className="relative flex-1 overflow-hidden rounded-lg bg-white/5">
              <Image src={img} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 33vw, 200px" unoptimized />
            </div>
          ))}
          {sideImages.length < 2 && (
            <div className={`relative flex-1 overflow-hidden rounded-lg bg-white/3 ${sideImages.length === 0 ? "hidden" : ""}`}></div>
          )}
        </div>
      </div>
    </Link>
  );
}
