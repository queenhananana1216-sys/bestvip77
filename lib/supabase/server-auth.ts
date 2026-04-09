import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseHeaderSafeEnv } from "@/lib/supabase/require-ascii-env";

export async function tryCreateServerSupabaseAuthClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!rawUrl?.trim() || !rawKey?.trim()) return null;
  const url = requireSupabaseHeaderSafeEnv("NEXT_PUBLIC_SUPABASE_URL", rawUrl);
  const key = requireSupabaseHeaderSafeEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", rawKey);

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Server Component는 set 불가할 수 있음 */
        }
      },
    },
  });
}

export async function createServerSupabaseAuthClient() {
  const c = await tryCreateServerSupabaseAuthClient();
  if (!c) throw new Error("Supabase URL/anon key 없음");
  return c;
}
