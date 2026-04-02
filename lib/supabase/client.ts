import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function tryCreateBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createSupabaseBrowserClient(url, key);
}

export function createBrowserClient() {
  const c = tryCreateBrowserClient();
  if (!c) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 필요");
  return c;
}
