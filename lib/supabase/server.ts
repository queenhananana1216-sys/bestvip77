import { createClient } from "@supabase/supabase-js";

const TIMEOUT_MS = 12_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

/** 공개 RLS 읽기 전용 (세션 없음). 환경 변수 없으면 null (빌드·로컬 미설정 대응). */
export function tryCreatePublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: fetchWithTimeout },
  });
}

export function createPublicServerClient() {
  const c = tryCreatePublicServerClient();
  if (!c) throw new Error("Supabase URL/anon key 없음 (.env.local)");
  return c;
}
