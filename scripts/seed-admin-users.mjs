import { createClient } from "@supabase/supabase-js";

const usernameMap = {
  admin123: "admin123@bestvip77.admin.local",
  admin456: "admin456@bestvip77.admin.local",
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const passwordMap = {
  admin123: process.env.ADMIN123_PASSWORD?.trim(),
  admin456: process.env.ADMIN456_PASSWORD?.trim(),
};

if (!supabaseUrl || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

for (const [username, password] of Object.entries(passwordMap)) {
  if (!password) {
    console.error(`${username.toUpperCase()} password missing`);
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function ensureAdmin(username, email, password) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    throw listError;
  }

  const existing = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

  let userId = existing?.id;
  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        bestvip77: "true",
        admin_username: username,
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
        admin_username: username,
      },
    });
    if (updateError) {
      throw updateError;
    }
  }

  const { error: adminInsertError } = await supabase.from("bestvip77_admins").upsert({ user_id: userId }, { onConflict: "user_id" });
  if (adminInsertError) {
    throw adminInsertError;
  }

  return { username, email, userId };
}

const results = [];

for (const [username, email] of Object.entries(usernameMap)) {
  const result = await ensureAdmin(username, email, passwordMap[username]);
  results.push(result);
}

console.log(JSON.stringify(results, null, 2));
