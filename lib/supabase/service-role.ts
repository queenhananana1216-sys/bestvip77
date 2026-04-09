import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requireSupabaseHeaderSafeEnv } from "@/lib/supabase/require-ascii-env";

export function createServiceRoleClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl?.trim() || !rawKey?.trim()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  }
  const url = requireSupabaseHeaderSafeEnv("NEXT_PUBLIC_SUPABASE_URL", rawUrl);
  const serviceRoleKey = requireSupabaseHeaderSafeEnv("SUPABASE_SERVICE_ROLE_KEY", rawKey);

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
