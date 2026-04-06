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
        {/* Merchant Header */}
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
              <div className="mt-0.5 flex items-center gap-2">
                {post.price_info && (
                  <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-600">
                    {post.price_info}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {post.body_text && (
          <div className="px-4 pb-4">
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-stone-700">{post.body_text}</p>
          </div>
        )}

        {/* Media Content */}
        <div className="space-y-1">
          {post.video_url && (
            <div className="w-full bg-black">
              <VideoEmbed url={post.video_url} />
            </div>
          )}
          
          {galleryUrls.map((src, i) => (
            <div key={i} className="relative aspect-3/4 w-full bg-stone-100">
              <Image src={src} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 600px" unoptimized />
            </div>
          ))}
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
