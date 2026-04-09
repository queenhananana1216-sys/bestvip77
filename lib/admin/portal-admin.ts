import type { SupabaseClient, User } from "@supabase/supabase-js";

/** 포털 관리자 — `bestvip77_admins` 행만 인정 (실제 이메일 계정) */
export async function isPortalAdmin(supabase: SupabaseClient, user: Pick<User, "id">): Promise<boolean> {
  const { data, error } = await supabase.from("bestvip77_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) return false;
  return Boolean(data);
}
