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

    const { count: phoneCount, error: phoneCountError } = await serviceClient
      .from("bestvip77_phone_otp_requests")
      .select("id", { count: "exact", head: true })
      .eq("phone_e164", normalizedPhone)
      .gte("created_at", oneHourAgo);

    if (phoneCountError) {
      return NextResponse.json({ error: phoneCountError.message }, { status: 500 });
    }

    if ((phoneCount ?? 0) >= OTP_PER_PHONE_PER_HOUR) {
      return NextResponse.json(
        { error: "otp_rate_limited_phone", retryAfterSec: OTP_COOLDOWN_SEC },
        { status: 429 },
      );
    }

    const clientIpHash = hashIp(readClientIp(request));
    const { count: ipCount, error: ipCountError } = await serviceClient
      .from("bestvip77_phone_otp_requests")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", clientIpHash)
      .gte("created_at", tenMinAgo);

    if (ipCountError) {
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
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, phone: normalizedPhone });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
