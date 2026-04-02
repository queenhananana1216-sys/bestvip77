import { PortalHeader } from "@/components/portal/PortalHeader";
import { PostFeed } from "@/components/portal/PostFeed";
import { CategoryNav } from "@/components/portal/CategoryNav";
import { fetchPortalPayload } from "@/lib/portal/data";
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

  return (
    <div className="min-h-dvh pb-16">
      <PortalHeader
        content={content}
        initialUser={user ? { id: user.id, email: user.email, isAdmin: Boolean(adminRow) } : null}
      />

      <main className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-6 sm:max-w-4xl">
        {error ? (
          <div className="rounded-[11px] border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-[12px] leading-relaxed text-amber-950">
            資料載入提示：{error}（請確認 .env.local 與資料庫 migration 055·056·058 已套用）
          </div>
        ) : null}

        <CategoryNav />

        <section className="space-y-3">
          <PostFeed
            posts={posts}
          />
        </section>
      </main>
    </div>
  );
}
