import { redirect } from "next/navigation";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const sb = await tryCreateServerSupabaseAuthClient();
  if (!sb) redirect("/login");

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  if (user.phone_confirmed_at) redirect("/");
  redirect("/verify-phone");
}
