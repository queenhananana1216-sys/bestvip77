import { NextResponse } from "next/server";
import { normalizePhoneNumber, normalizePhoneNumberAny } from "@/lib/register/phone";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

type Payload = {
  country?: "KR" | "CN";
  phone?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const normalizedPhone =
      typeof body.country === "string"
        ? normalizePhoneNumber(body.country === "CN" ? "CN" : "KR", body.phone ?? "")
        : normalizePhoneNumberAny(body.phone ?? "");

    if (!normalizedPhone) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }

    const authClient = await tryCreateServerSupabaseAuthClient();
    const {
      data: { user },
    } = authClient ? await authClient.auth.getUser() : { data: { user: null } };

    const serviceClient = createServiceRoleClient();
    const { data: profile, error } = await serviceClient
      .from("bestvip77_member_profiles")
      .select("user_id")
      .eq("phone_e164", normalizedPhone)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const isTaken = Boolean(profile && profile.user_id !== user?.id);
    return NextResponse.json({ phone: normalizedPhone, available: !isTaken });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
