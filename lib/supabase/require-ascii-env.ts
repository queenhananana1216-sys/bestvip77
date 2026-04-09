/**
 * Fetch 헤더(apikey, Authorization 등)는 ByteString(코드포인트 ≤255)만 허용.
 * .env에 한글·스마트 따옴표·전각 문자가 섞이면 auth-js fetch에서 TypeError가 난다.
 */
export function requireSupabaseHeaderSafeEnv(label: string, value: string): string {
  const trimmed = value.replace(/^\uFEFF/, "").trim();
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed.charCodeAt(i);
    if (c > 255) {
      throw new Error(
        `${label}: URL/키 값에 허용되지 않는 문자(한글 등)가 index ${i}에 있습니다. Supabase 대시보드에서 다시 복사해 .env.local을 교체하세요.`,
      );
    }
  }
  return trimmed;
}
