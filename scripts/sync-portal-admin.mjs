import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
/** 기본 포털 관리자(실제 이메일). 환경 변수로 덮어쓸 수 있음 */
const portalAdminEmail = (process.env.PORTAL_ADMIN_EMAIL || "kstop12@nate.com").trim().toLowerCase();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function isSyntheticPortalAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return email.trim().toLowerCase().endsWith("@bestvip77.admin.local");
}

async function listAllAuthUsers() {
  const allUsers = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    allUsers.push(...data.users);
    if (!data.nextPage || page >= data.lastPage) break;
    page = data.nextPage;
  }

  return allUsers;
}

async function deleteSyntheticAuthUsers() {
  const users = await listAllAuthUsers();
  for (const user of users) {
    const email = user.email ?? "";
    if (!isSyntheticPortalAdminEmail(email)) continue;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
    console.log("removed synthetic portal admin user:", email);
  }
}

/** `keepUserId`에 해당하는 행만 남기고 나머지 관리자 행 삭제(없으면 전부 삭제) */
async function pruneOtherAdminRows(keepUserId) {
  const { data: rows, error } = await supabase.from("bestvip77_admins").select("user_id");
  if (error) throw error;
  let removed = 0;
  for (const row of rows ?? []) {
    if (keepUserId && row.user_id === keepUserId) continue;
    const { error: delErr } = await supabase.from("bestvip77_admins").delete().eq("user_id", row.user_id);
    if (delErr) throw delErr;
    removed += 1;
  }
  if (removed > 0) console.log("removed other bestvip77_admins rows:", removed);
}

async function ensurePortalAdminUser() {
  const users = await listAllAuthUsers();
  const existing = users.find((u) => (u.email ?? "").toLowerCase() === portalAdminEmail);

  if (existing) {
    const { error } = await supabase.from("bestvip77_admins").upsert({ user_id: existing.id }, { onConflict: "user_id" });
    if (error) throw error;
    console.log(JSON.stringify({ ok: true, mode: "existing", email: portalAdminEmail, userId: existing.id }, null, 2));
    return;
  }

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(portalAdminEmail);

  if (!error && data?.user?.id) {
    const { error: upErr } = await supabase.from("bestvip77_admins").upsert({ user_id: data.user.id }, { onConflict: "user_id" });
    if (upErr) throw upErr;
    console.log(JSON.stringify({ ok: true, mode: "invite-created", email: portalAdminEmail, userId: data.user.id }, null, 2));
    return;
  }

  if (error) {
    const refreshed = await listAllAuthUsers();
    const fallback = refreshed.find((u) => (u.email ?? "").toLowerCase() === portalAdminEmail);
    if (fallback) {
      const { error: upErr } = await supabase.from("bestvip77_admins").upsert({ user_id: fallback.id }, { onConflict: "user_id" });
      if (upErr) throw upErr;
      console.log(
        JSON.stringify(
          { ok: true, mode: "linked-existing", email: portalAdminEmail, userId: fallback.id, inviteError: error.message },
          null,
          2,
        ),
      );
      return;
    }
    throw error;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "invite-email-sent",
        email: portalAdminEmail,
        hint: "메일에서 초대를 수락한 뒤 이 스크립트를 한 번 더 실행하면 bestvip77_admins 행이 연결됩니다.",
      },
      null,
      2,
    ),
  );
}

try {
  await deleteSyntheticAuthUsers();
  const usersAfterSynthetic = await listAllAuthUsers();
  const portalUserEarly = usersAfterSynthetic.find((u) => (u.email ?? "").toLowerCase() === portalAdminEmail);
  await pruneOtherAdminRows(portalUserEarly?.id);
  await ensurePortalAdminUser();
} catch (error) {
  console.error(error);
  process.exit(1);
}
