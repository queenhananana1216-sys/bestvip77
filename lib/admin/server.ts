import "server-only";

import type { User } from "@supabase/supabase-js";
import type { AdminMemberRecord, AdminMemberStatus } from "@/lib/admin/types";
import { createServerSupabaseAuthClient } from "@/lib/supabase/server-auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const MEMBER_PROFILE_SELECT = [
  "user_id",
  "email",
  "carrier_country",
  "carrier_label",
  "status",
  "reviewed_at",
  "created_at",
  "updated_at",
  "display_name_zh",
  "display_name_ko",
  "display_name_en",
  "phone_e164",
  "phone_verified_at",
  "last_seen_at",
  "admin_note",
  "search_text",
  "search_chosung",
].join(",");

type MemberProfileRow = {
  user_id: string;
  email: string | null;
  carrier_country: string;
  carrier_label: string | null;
  status: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string | null;
  display_name_zh: string | null;
  display_name_ko: string | null;
  display_name_en: string | null;
  phone_e164: string | null;
  phone_verified_at: string | null;
  last_seen_at: string | null;
  admin_note: string | null;
  search_text: string | null;
  search_chosung: string | null;
};

type UpdateAdminMemberInput = {
  status?: AdminMemberStatus;
  adminNote?: string;
  displayNameZh?: string;
  displayNameKo?: string | null;
  displayNameEn?: string | null;
};

export class AdminApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

function normalizeNullableText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeStatus(value: unknown): AdminMemberStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

function mergeMemberWithAuth(profile: MemberProfileRow, authUser?: User): AdminMemberRecord {
  return {
    ...profile,
    status: normalizeStatus(profile.status),
    email: profile.email ?? authUser?.email ?? null,
    phone_e164: profile.phone_e164 ?? authUser?.phone ?? null,
    phone_verified_at:
      profile.phone_verified_at ??
      (typeof authUser?.phone_confirmed_at === "string" ? authUser.phone_confirmed_at : null),
    auth_phone: authUser?.phone ?? null,
    auth_phone_confirmed_at: typeof authUser?.phone_confirmed_at === "string" ? authUser.phone_confirmed_at : null,
    last_sign_in_at: typeof authUser?.last_sign_in_at === "string" ? authUser.last_sign_in_at : null,
    email_confirmed_at: typeof authUser?.email_confirmed_at === "string" ? authUser.email_confirmed_at : null,
  };
}

async function requireAdminAccess() {
  const authClient = await createServerSupabaseAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    throw new AdminApiError(401, "로그인이 필요합니다.");
  }

  const { data: adminRow, error } = await authClient
    .from("bestvip77_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new AdminApiError(500, error.message);
  }

  if (!adminRow) {
    throw new AdminApiError(403, "관리자 권한이 없습니다.");
  }

  return { authClient, user };
}

async function listAllAuthUsers(serviceClient: ReturnType<typeof createServiceRoleClient>) {
  const allUsers: User[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new AdminApiError(500, error.message);
    }

    allUsers.push(...data.users);

    if (!data.nextPage || page >= data.lastPage) {
      break;
    }

    page = data.nextPage;
  }

  return allUsers;
}

export async function loadAdminMembers() {
  await requireAdminAccess();
  const serviceClient = createServiceRoleClient();

  const [{ data: profiles, error }, authUsers] = await Promise.all([
    serviceClient
      .from("bestvip77_member_profiles")
      .select(MEMBER_PROFILE_SELECT)
      .order("created_at", { ascending: false }),
    listAllAuthUsers(serviceClient),
  ]);

  if (error) {
    throw new AdminApiError(500, error.message);
  }

  const authMap = new Map(authUsers.map((user) => [user.id, user]));
  const profileRows = ((profiles ?? []) as unknown) as MemberProfileRow[];

  return profileRows.map((profile) =>
    mergeMemberWithAuth(profile, authMap.get(profile.user_id)),
  );
}

export async function updateAdminMember(userId: string, input: UpdateAdminMemberInput) {
  await requireAdminAccess();
  const serviceClient = createServiceRoleClient();

  const updates: Record<string, string | null> = {};

  if (typeof input.status !== "undefined") {
    updates.status = normalizeStatus(input.status);
    updates.reviewed_at = new Date().toISOString();
  }

  if (typeof input.adminNote !== "undefined") {
    updates.admin_note = input.adminNote.trim();
  }

  if (typeof input.displayNameZh !== "undefined") {
    const nextZh = input.displayNameZh.trim();
    if (!nextZh) {
      throw new AdminApiError(400, "中文姓名은 비울 수 없습니다.");
    }
    updates.display_name_zh = nextZh;
  }

  if (typeof input.displayNameKo !== "undefined") {
    updates.display_name_ko = normalizeNullableText(input.displayNameKo);
  }

  if (typeof input.displayNameEn !== "undefined") {
    updates.display_name_en = normalizeNullableText(input.displayNameEn);
  }

  if (Object.keys(updates).length === 0) {
    throw new AdminApiError(400, "수정할 값이 없습니다.");
  }

  const { data: profile, error } = await serviceClient
    .from("bestvip77_member_profiles")
    .update(updates)
    .eq("user_id", userId)
    .select(MEMBER_PROFILE_SELECT)
    .maybeSingle();

  if (error) {
    throw new AdminApiError(500, error.message);
  }

  if (!profile) {
    throw new AdminApiError(404, "회원 정보를 찾을 수 없습니다.");
  }

  const { data: authUserData, error: authError } = await serviceClient.auth.admin.getUserById(userId);
  if (authError) {
    throw new AdminApiError(500, authError.message);
  }

  return mergeMemberWithAuth((profile as unknown) as MemberProfileRow, authUserData.user);
}
