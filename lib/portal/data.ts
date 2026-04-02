import { tryCreatePublicServerClient } from "@/lib/supabase/server";
import { mergePortalContent, type PortalCommentRow, type PortalPostRow, type PortalSiteContent } from "@/lib/portal/types";

export async function fetchPortalPayload(): Promise<{
  content: PortalSiteContent;
  posts: PortalPostRow[];
  error: string | null;
}> {
  try {
    const sb = tryCreatePublicServerClient();
    if (!sb) {
      return { content: mergePortalContent(null), posts: [], error: "NEXT_PUBLIC_SUPABASE_* 환경 변수 없음" };
    }

    const [settingsRes, postsRes] = await Promise.all([
      sb.from("bestvip77_site_settings").select("content").eq("id", 1).maybeSingle(),
      sb
        .from("bestvip77_posts")
        .select(
          "id,title,body_text,price_info,is_pinned,profile_image_url,gallery_image_urls,sort_order,created_at",
        )
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    if (settingsRes.error) {
      return { content: mergePortalContent(null), posts: [], error: settingsRes.error.message };
    }
    if (postsRes.error) {
      return {
        content: mergePortalContent(settingsRes.data?.content),
        posts: [],
        error: postsRes.error.message,
      };
    }

    return {
      content: mergePortalContent(settingsRes.data?.content),
      posts: (postsRes.data ?? []) as PortalPostRow[],
      error: null,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "load failed";
    return { content: mergePortalContent(null), posts: [], error: msg };
  }
}

export async function fetchCommentsForPosts(postIds: string[]): Promise<PortalCommentRow[]> {
  if (postIds.length === 0) return [];
  try {
    const sb = tryCreatePublicServerClient();
    if (!sb) return [];
    const { data, error } = await sb
      .from("bestvip77_comments")
      .select("id,post_id,user_id,content,created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as PortalCommentRow[];
  } catch {
    return [];
  }
}
