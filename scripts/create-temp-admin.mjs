import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = (process.env.TEMP_ADMIN_EMAIL?.trim() || "bvadmin@bestvip77.admin.local").toLowerCase();
const password = process.env.TEMP_ADMIN_PASSWORD?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

if (!password) {
  console.error("TEMP_ADMIN_PASSWORD missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const loginId = email;
const localPart = email.split("@")[0] || "bvadmin";

async function ensureTempAdmin() {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    throw listError;
  }

  const existing = listed.users.find((user) => user.email?.toLowerCase() === email);
  let userId = existing?.id;

  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        bestvip77: "true",
        admin_username: localPart,
        temp_admin: "true",
      },
    });
    if (createError) {
      throw createError;
    }
    userId = created.user.id;
  } else {
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existing?.user_metadata ?? {}),
        bestvip77: "true",
        admin_username: localPart,
        temp_admin: "true",
      },
    });
    if (updateError) {
      throw updateError;
    }
  }

  const { error: adminInsertError } = await supabase
    .from("bestvip77_admins")
    .upsert({ user_id: userId }, { onConflict: "user_id" });

  if (adminInsertError) {
    throw adminInsertError;
  }

  return { loginId, email, userId };
}

try {
  const result = await ensureTempAdmin();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
}
