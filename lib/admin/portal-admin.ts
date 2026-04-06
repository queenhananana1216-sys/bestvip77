import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmailDomain } from "@/lib/admin/usernames";

/** 시드 관리자 계정(@bestvip77.admin.local) — DB 행·RLS와 무관하게 세션 이메일만으로 식별 */
export function isPortalAdminEmail(user: Pick<User, "email">): boolean {
  return typeof user.email === "string" && isAdminEmailDomain(user.email);
}

/** 예약 관리자 이메일이거나 bestvip77_admins에 등록된 사용자 */
export async function isPortalAdmin(supabase: SupabaseClient, user: Pick<User, "id" | "email">): Promise<boolean> {
  if (isPortalAdminEmail(user)) return true;
  const { data, error } = await supabase.from("bestvip77_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) return false;
  return Boolean(data);
}
