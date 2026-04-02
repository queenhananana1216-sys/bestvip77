import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const sb = await tryCreateServerSupabaseAuthClient();
  if (!sb) {
    return new Response(null, { status: 204 });
  }

  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return new Response(null, { status: 204 });
  }

  await sb.rpc("bestvip77_touch_member_last_seen");
  return new Response(null, { status: 204 });
}
