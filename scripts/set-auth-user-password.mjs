/**
 * Supabase Dashboard에 “비밀번호 직접 입력”이 없을 때용.
 * Service Role로 auth.users 비밀번호를 갱신합니다.
 *
 * PowerShell 예 (프로젝트 루트, .env.local이 이미 로드되게 두거나 직접 export):
 *   $env:SET_USER_EMAIL="llangkka00@gmail.com"
 *   $env:SET_USER_PASSWORD="<새로-정할-비밀번호>"
 *   npm run admin:set-password
 *
 * 비밀번호는 Git/채팅에 넣지 말고 로컬에서만 설정할 것.
 */
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.env.SET_USER_EMAIL?.trim().toLowerCase();
const password = process.env.SET_USER_PASSWORD?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

if (!email || !password) {
  console.error("SET_USER_EMAIL, SET_USER_PASSWORD 필요 (환경 변수)");
  process.exit(1);
}

if (password.length < 8) {
  console.error("비밀번호는 Supabase 기본 정책상 짧으면 거절될 수 있습니다. 8자 이상 권장.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => (u.email ?? "").toLowerCase() === targetEmail);
    if (found) return found;
    if (!data.nextPage || page >= data.lastPage) return null;
    page = data.nextPage;
  }
}

const user = await findUserByEmail(email);

if (!user) {
  console.error("해당 이메일의 auth 사용자가 없습니다:", email);
  process.exit(1);
}

const { error: upErr } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
});

if (upErr) {
  console.error(upErr);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, userId: user.id, email }, null, 2));
