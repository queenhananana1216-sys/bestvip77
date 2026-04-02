import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export default async function PendingApprovalPage() {
  const sb = await tryCreateServerSupabaseAuthClient();
  if (!sb) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-neutral-600">Supabase 설정을 확인해 주세요.</p>
        <Link href="/login" className="text-orange-600">
          로그인
        </Link>
      </div>
    );
  }

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminRow } = await sb
    .from("bestvip77_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminRow) redirect("/admin");

  const { data: prof } = await sb
    .from("bestvip77_member_profiles")
    .select("status, carrier_country, carrier_label, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (prof?.status === "approved") redirect("/");

  const status = prof?.status ?? "none";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold text-neutral-900">회원 승인 대기</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {status === "rejected"
            ? "가입이 거절되었습니다. 필요 시 관리자에게 문의해 주세요."
            : status === "none"
              ? "회원 정보가 아직 연결되지 않았습니다. 가입을 완료했는지 확인하거나 관리자에게 문의해 주세요."
              : "관리자 승인 후 사이트를 이용할 수 있습니다. 잠시만 기다려 주세요."}
        </p>
        {prof && status === "pending" ? (
          <ul className="mt-4 space-y-1 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
            <li>
              지역: {prof.carrier_country === "KR" ? "한국" : "중국"}
            </li>
            {prof.carrier_label ? <li>통신사 코드: {prof.carrier_label}</li> : null}
            <li>휴대폰 인증: {user.phone_confirmed_at ? "완료" : "미완료"}</li>
            {user.phone ? <li>인증 번호: {user.phone}</li> : null}
          </ul>
        ) : null}
        <p className="mt-4 text-xs text-neutral-500">로그인 계정: {user.email}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
