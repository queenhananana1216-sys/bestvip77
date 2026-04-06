import { NextResponse } from "next/server";
import { toMemberAuthEmail, validateMemberLoginId } from "@/lib/admin/usernames";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

type Payload = {
  loginId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const validated = validateMemberLoginId(body.loginId ?? "");
    if (!validated.ok) {
      return NextResponse.json({ error: "invalid_login_id", message: validated.error }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();
    const authEmail = toMemberAuthEmail(validated.loginId);

    const [{ data: authUser, error: authError }, { data: profileRow, error: profileError }] = await Promise.all([
      serviceClient.schema("auth").from("users").select("id").eq("email", authEmail).maybeSingle(),
      serviceClient.from("bestvip77_member_profiles").select("user_id").eq("email", authEmail).maybeSingle(),
    ]);

    if (authError || profileError) {
      return NextResponse.json({ error: authError?.message ?? profileError?.message ?? "unknown_error" }, { status: 500 });
    }

    const available = !authUser && !profileRow;
    return NextResponse.json({ available, loginId: validated.loginId });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
