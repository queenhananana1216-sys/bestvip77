import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { isSuspiciousPhonePattern, normalizePhoneNumber, normalizePhoneNumberAny } from "@/lib/register/phone";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

const OTP_COOLDOWN_SEC = 60;
const OTP_PER_PHONE_PER_HOUR = 6;
const OTP_PER_IP_PER_10_MIN = 20;

type Payload = {
  country?: "KR" | "CN";
  phone?: string;
};

function hashIp(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function readClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

// bestvip77_phone_otp_requests 테이블이 없으면 자동 생성
async function ensureOtpTable(serviceClient: ReturnType<typeof createServiceRoleClient>) {
  const createSql = `
    CREATE TABLE IF NOT EXISTS public.bestvip77_phone_otp_requests (
      id          BIGSERIAL PRIMARY KEY,
      phone_e164  TEXT        NOT NULL,
      ip_hash     TEXT        NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS bestvip77_phone_otp_requests_phone_idx
      ON public.bestvip77_phone_otp_requests (phone_e164, created_at DESC);
    CREATE INDEX IF NOT EXISTS bestvip77_phone_otp_requests_ip_idx
      ON public.bestvip77_phone_otp_requests (ip_hash, created_at DESC);
    ALTER TABLE public.bestvip77_phone_otp_requests ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "otp_requests_service_only" ON public.bestvip77_phone_otp_requests;
    CREATE POLICY "otp_requests_service_only"
      ON public.bestvip77_phone_otp_requests
      FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  `;

  try {
    await serviceClient.rpc("exec_ddl", { ddl: createSql });
  } catch {
    // exec_ddl 함수 없으면 무시 — 테이블 없는 경우 폴백 처리
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;
    const normalizedPhone =
      typeof body.country === "string"
        ? normalizePhoneNumber(body.country === "CN" ? "CN" : "KR", body.phone ?? "")
        : normalizePhoneNumberAny(body.phone ?? "");

    if (!normalizedPhone) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    if (isSuspiciousPhonePattern(normalizedPhone)) {
      return NextResponse.json({ error: "suspicious_phone_pattern" }, { status: 400 });
    }

    const authClient = await tryCreateServerSupabaseAuthClient();
    const {
      data: { user },
    } = authClient ? await authClient.auth.getUser() : { data: { user: null } };

    const serviceClient = createServiceRoleClient();

    // 중복 번호 확인
    const { data: profile, error: duplicateError } = await serviceClient
      .from("bestvip77_member_profiles")
      .select("user_id")
      .eq("phone_e164", normalizedPhone)
      .maybeSingle();

    if (duplicateError) {
      return NextResponse.json({ error: duplicateError.message }, { status: 500 });
    }
    if (profile && profile.user_id !== user?.id) {
      return NextResponse.json({ error: "duplicate_phone" }, { status: 409 });
    }

    const now = Date.now();
    const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
    const tenMinAgo = new Date(now - 10 * 60 * 1000).toISOString();
    const clientIpHash = hashIp(readClientIp(request));

    // Rate limit 테이블 조회 — 테이블 없으면 폴백으로 통과
    const { count: phoneCount, error: phoneCountError } = await serviceClient
      .from("bestvip77_phone_otp_requests")
      .select("id", { count: "exact", head: true })
      .eq("phone_e164", normalizedPhone)
      .gte("created_at", oneHourAgo);

    if (phoneCountError) {
      // 테이블 미존재 오류면 자동 생성 시도 후 통과
      if (
        phoneCountError.message.includes("does not exist") ||
        phoneCountError.message.includes("schema cache") ||
        phoneCountError.message.includes("Could not find")
      ) {
        await ensureOtpTable(serviceClient);
        // 테이블 생성 후 바로 insert 시도하고 통과
        try {
          await serviceClient.from("bestvip77_phone_otp_requests").insert({
            phone_e164: normalizedPhone,
            ip_hash: clientIpHash,
          });
        } catch {
          // 테이블 생성 직후 insert 실패는 무시
        }
        return NextResponse.json({ ok: true, phone: normalizedPhone });
      }
      return NextResponse.json({ error: phoneCountError.message }, { status: 500 });
    }

    if ((phoneCount ?? 0) >= OTP_PER_PHONE_PER_HOUR) {
      return NextResponse.json(
        { error: "otp_rate_limited_phone", retryAfterSec: OTP_COOLDOWN_SEC },
        { status: 429 },
      );
    }

    const { count: ipCount, error: ipCountError } = await serviceClient
      .from("bestvip77_phone_otp_requests")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", clientIpHash)
      .gte("created_at", tenMinAgo);

    if (ipCountError) {
      if (
        ipCountError.message.includes("does not exist") ||
        ipCountError.message.includes("schema cache") ||
        ipCountError.message.includes("Could not find")
      ) {
        return NextResponse.json({ ok: true, phone: normalizedPhone });
      }
      return NextResponse.json({ error: ipCountError.message }, { status: 500 });
    }

    if ((ipCount ?? 0) >= OTP_PER_IP_PER_10_MIN) {
      return NextResponse.json(
        { error: "otp_rate_limited_ip", retryAfterSec: OTP_COOLDOWN_SEC },
        { status: 429 },
      );
    }

    const { data: latestRows, error: latestError } = await serviceClient
      .from("bestvip77_phone_otp_requests")
      .select("created_at")
      .eq("phone_e164", normalizedPhone)
      .order("created_at", { ascending: false })
      .limit(1);

    if (latestError) {
      if (
        latestError.message.includes("does not exist") ||
        latestError.message.includes("schema cache") ||
        latestError.message.includes("Could not find")
      ) {
        return NextResponse.json({ ok: true, phone: normalizedPhone });
      }
      return NextResponse.json({ error: latestError.message }, { status: 500 });
    }

    const lastCreatedAt = latestRows?.[0]?.created_at ? new Date(latestRows[0].created_at).getTime() : null;
    if (lastCreatedAt) {
      const elapsedSec = Math.floor((now - lastCreatedAt) / 1000);
      if (elapsedSec < OTP_COOLDOWN_SEC) {
        return NextResponse.json(
          { error: "otp_cooldown", retryAfterSec: OTP_COOLDOWN_SEC - elapsedSec },
          { status: 429 },
        );
      }
    }

    const { error: insertError } = await serviceClient.from("bestvip77_phone_otp_requests").insert({
      phone_e164: normalizedPhone,
      ip_hash: clientIpHash,
    });
    if (insertError) {
      // insert 실패해도 OTP 요청 자체는 통과 (테이블 문제로 인한 차단 방지)
      if (
        insertError.message.includes("does not exist") ||
        insertError.message.includes("schema cache") ||
        insertError.message.includes("Could not find")
      ) {
        return NextResponse.json({ ok: true, phone: normalizedPhone });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, phone: normalizedPhone });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
