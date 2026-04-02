import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostComments } from "@/components/portal/PostComments";
import { fetchCommentsForPosts, fetchPortalPayload } from "@/lib/portal/data";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";
import { VideoEmbed } from "@/components/portal/VideoEmbed";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const sb = await tryCreateServerSupabaseAuthClient();
  const {
    data: { user },
  } = sb ? await sb.auth.getUser() : { data: { user: null } };

  const { posts } = await fetchPortalPayload();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  const comments = await fetchCommentsForPosts([post.id]);
  const galleryUrls = post.gallery_image_urls.filter((u) => u.trim());

  return (
    <div className="min-h-dvh bg-stone-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-stone-200/80 bg-white/95 px-4 backdrop-blur-md">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-[16px] font-semibold text-stone-900">商家詳情</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="mx-auto max-w-lg bg-white shadow-sm sm:max-w-xl">
        {/* User Info Section */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-stone-100 ring-1 ring-black/5">
              {post.profile_image_url ? (
                <Image src={post.profile_image_url} alt="" fill className="object-cover" sizes="48px" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-stone-400">
                  {(post.title || "店")[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-stone-900">{post.title || "（無標題）"}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] text-stone-500">24歲</span>
                {post.price_info && (
                  <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-600">
                    {post.price_info}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="rounded-full bg-stone-900 px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-stone-800">
            關注
          </button>
        </div>

        {/* Description */}
        {post.body_text && (
          <div className="px-4 pb-4">
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-stone-700">{post.body_text}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-orange-50/50 p-3 ring-1 ring-orange-100">
            <p className="text-[13px] font-medium text-orange-800">聯繫方式: 62173118</p>
          </div>
        </div>

        {/* Media Content */}
        <div className="space-y-1">
          {post.video_url && (
            <div className="w-full bg-black">
              <VideoEmbed url={post.video_url} />
            </div>
          )}
          
          {galleryUrls.map((src, i) => (
            <div key={i} className="relative aspect-[3/4] w-full bg-stone-100">
              <Image src={src} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 600px" unoptimized />
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-b border-t border-stone-100 p-4">
          <div className="flex gap-6">
            <button className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span className="text-[13px]">讚</span>
            </button>
            <button className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="text-[13px]">{comments.length}</span>
            </button>
          </div>
          <button className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="text-[13px]">分享</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h3 className="mb-4 text-[14px] font-semibold text-stone-900">評論 ({comments.length})</h3>
          <PostComments postId={post.id} initialList={comments} user={user} />
        </div>
      </main>
    </div>
  );
}
