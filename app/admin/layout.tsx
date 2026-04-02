import { redirect } from "next/navigation";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = await tryCreateServerSupabaseAuthClient();
  if (!sb) redirect("/?notice=supabase-env");

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: adminRow } = await sb
    .from("bestvip77_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/?forbidden=admin");

  return <>{children}</>;
}
