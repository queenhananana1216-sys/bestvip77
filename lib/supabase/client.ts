import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { requireSupabaseHeaderSafeEnv } from "@/lib/supabase/require-ascii-env";

export function tryCreateBrowserClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl?.trim() || !rawKey?.trim()) return null;
  const url = requireSupabaseHeaderSafeEnv("NEXT_PUBLIC_SUPABASE_URL", rawUrl);
  const key = requireSupabaseHeaderSafeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", rawKey);
  return createSupabaseBrowserClient(url, key);
}

export function createBrowserClient() {
  const c = tryCreateBrowserClient();
  if (!c) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 필요");
  return c;
}
