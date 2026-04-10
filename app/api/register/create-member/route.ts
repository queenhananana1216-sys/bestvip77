import { NextResponse } from "next/server";
import { validateMemberLoginId } from "@/lib/admin/usernames";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

type Payload = {
  loginId?: string;
  password?: string;
  country?: "KR" | "CN";
  displayNameZh?: string;
  displayNameKo?: string;
};

export async function POST(request: Request) {
  let createdUserId: string | null = null;
  try {
    const body = (await request.json()) as Payload;
    const validated = validateMemberLoginId(body.loginId ?? "");
    if (!validated.ok) {
      return NextResponse.json({ error: "invalid_login_id", message: validated.error }, { status: 400 });
    }

    const password = (body.password ?? "").trim();
    if (password.length < 6) {
      return NextResponse.json({ error: "weak_password", message: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
    }

    const displayNameZh = (body.displayNameZh ?? "").trim();
    if (!displayNameZh) {
      return NextResponse.json({ error: "missing_nickname", message: "닉네임을 입력해 주세요." }, { status: 400 });
    }

    const displayNameKo = (body.displayNameKo ?? "").trim();
    const country = body.country === "CN" ? "CN" : "KR";
    const serviceClient = createServiceRoleClient();

    // bestvip77_member_profiles에서 이메일 중복 체크 (빠른 경로)
    const { data: existingProfile } = await serviceClient
      .from("bestvip77_member_profiles")
      .select("user_id")
      .eq("email", validated.email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ error: "duplicate_login_id", message: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }

    // auth.users 중복 체크 (프로필 없이 auth만 남은 고아 계정 방어)
    const { data: userList, error: listError } = await serviceClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const existingAuthUser = userList?.users?.find((u) => u.email === validated.email);
    if (existingAuthUser) {
      return NextResponse.json({ error: "duplicate_login_id", message: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }

    const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
      email: validated.email,
      password,
      email_confirm: true,
      user_metadata: {
        bestvip77: "true",
        login_id: validated.loginId,
        carrier_country: country,
        carrier_label: null,
        display_name_zh: displayNameZh,
        display_name_ko: displayNameKo,
        display_name_en: "",
      },
    });

    if (createError) {
      const lower = createError.message.toLowerCase();
      if (lower.includes("already") || lower.includes("exists") || lower.includes("duplicate")) {
        return NextResponse.json({ error: "duplicate_login_id", message: "이미 사용 중인 아이디입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    const userId = created.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "user_create_failed" }, { status: 500 });
    }

    createdUserId = userId;

    const { error: profileError } = await serviceClient.from("bestvip77_member_profiles").upsert(
      {
        user_id: userId,
        email: validated.email,
        carrier_country: country,
        carrier_label: null,
        display_name_zh: displayNameZh,
        display_name_ko: displayNameKo || null,
        display_name_en: "",
        status: "approved",
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (profileError) {
      await serviceClient.auth.admin.deleteUser(userId);
      createdUserId = null;
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    createdUserId = null;
    return NextResponse.json({
      ok: true,
      loginId: validated.loginId,
      authEmail: validated.email,
    });
  } catch (err) {
    if (createdUserId) {
      try {
        const serviceClient = createServiceRoleClient();
        await serviceClient.auth.admin.deleteUser(createdUserId);
      } catch {
        // rollback best-effort
      }
    }
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "bad_request", message }, { status: 400 });
  }
}
