import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
/** 기본: 포털 관리자로 쓰는 Gmail. 바꾸려면 PASSWORD_RESET_EMAIL 설정 */
const email = (process.env.PASSWORD_RESET_EMAIL || "llangkka00@gmail.com").trim().toLowerCase();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://bestvip77.com").replace(/\/$/, "");

if (!supabaseUrl || !anonKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 필요");
  process.exit(1);
}

if (!email) {
  console.error("PASSWORD_RESET_EMAIL 이 비어 있습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const nextPath = encodeURIComponent("/auth/set-password");
const redirectTo = `${siteUrl}/auth/callback?next=${nextPath}`;

const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo,
});

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      email,
      redirectTo,
      hint: "메일함(스팸함 포함)을 확인해 주세요. Supabase Auth 이메일·Redirect URL 설정이 맞아야 합니다.",
    },
    null,
    2,
  ),
);
