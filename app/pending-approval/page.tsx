import { redirect } from "next/navigation";
import { isPortalAdminEmail } from "@/lib/admin/portal-admin";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const sb = await tryCreateServerSupabaseAuthClient();
  if (!sb) redirect("/login");

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  if (isPortalAdminEmail(user)) redirect("/admin");

  const { data: adminRow } = await sb
    .from("bestvip77_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminRow) redirect("/admin");

  if (user.phone_confirmed_at) redirect("/");
  redirect("/verify-phone");
}
