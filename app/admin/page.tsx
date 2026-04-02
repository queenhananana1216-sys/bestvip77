import AdminClient from "@/components/admin/AdminClient";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";
import { mergePortalContent, type PortalPostRow } from "@/lib/portal/types";

export default async function AdminPage() {
  const sb = await tryCreateServerSupabaseAuthClient();
  if (!sb) {
    return (
      <p className="p-6 text-sm text-red-700">
        Supabase 환경 변수가 없습니다. .env.local 을 설정한 뒤 다시 오세요.
      </p>
    );
  }

  const [{ data: settings }, { data: posts }] = await Promise.all([
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

  return (
    <AdminClient
      initialContent={mergePortalContent(settings?.content)}
      initialPosts={(posts ?? []) as PortalPostRow[]}
    />
  );
}
