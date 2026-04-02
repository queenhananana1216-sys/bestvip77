import { PortalHeader } from "@/components/portal/PortalHeader";
import {
  AdCtaSection,
  HeroSection,
  SocialLinksSection,
  TopBanner,
  UrlStripSection,
} from "@/components/portal/PortalSections";
import { PostFeed } from "@/components/portal/PostFeed";
import { fetchCommentsForPosts, fetchPortalPayload } from "@/lib/portal/data";
import type { PortalCommentRow } from "@/lib/portal/types";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sb = await tryCreateServerSupabaseAuthClient();
  const {
    data: { user },
  } = sb ? await sb.auth.getUser() : { data: { user: null } };
  const { data: adminRow } =
    sb && user
      ? await sb.from("bestvip77_admins").select("user_id").eq("user_id", user.id).maybeSingle()
      : { data: null };

  const { content, posts, error } = await fetchPortalPayload();
  const postIds = posts.map((p) => p.id);
  const allComments = await fetchCommentsForPosts(postIds);
  const commentsByPost: Record<string, PortalCommentRow[]> = {};
  for (const c of allComments) {
    if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
    commentsByPost[c.post_id].push(c);
  }

  return (
    <div className="min-h-dvh pb-16">
      <PortalHeader
        content={content}
        initialUser={user ? { id: user.id, email: user.email, isAdmin: Boolean(adminRow) } : null}
      />

      <main className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-6 sm:max-w-xl">
        {error ? (
          <div className="rounded-[11px] border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-[12px] leading-relaxed text-amber-950">
            資料載入提示：{error}（請確認 .env.local 與資料庫 migration 055·056·058 已套用）
          </div>
        ) : null}

        <TopBanner content={content} />
        <HeroSection content={content} />

        <section className="space-y-3">
          <PostFeed
            posts={posts}
            commentsByPost={commentsByPost}
            user={user ? { id: user.id, email: user.email } : null}
            feedTitle={content.feed.title}
            feedSubtitle={content.feed.subtitle}
          />
        </section>

        <SocialLinksSection content={content} />
        <UrlStripSection content={content} />
        <AdCtaSection content={content} />
      </main>
    </div>
  );
}
