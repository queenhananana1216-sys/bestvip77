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
        <p className="text-sm text-neutral-600">請確認 Supabase 設定。/ Supabase 설정을 확인해 주세요.</p>
        <Link href="/login" className="text-orange-600">
          登入 / 로그인
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
    .select("status, carrier_country, carrier_label, created_at, display_name_zh, display_name_ko, display_name_en, phone_e164, phone_verified_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (prof?.status === "approved") redirect("/");

  const status = prof?.status ?? "none";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <h1 className="text-xl font-bold text-neutral-900">審核中</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {status === "rejected"
            ? "申請已被拒絕，如需協助請聯絡管理員。/ 가입이 거절되었습니다. 필요 시 관리자에게 문의해 주세요."
            : status === "none"
              ? "會員資料尚未建立完成，請確認註冊流程是否已完成。/ 회원 정보가 아직 연결되지 않았습니다."
              : "手機驗證與註冊은 완료되었습니다. 管理員審核後即可使用服務。/ 관리자 승인 후 사이트를 이용할 수 있습니다."}
        </p>
        {prof && status === "pending" ? (
          <ul className="mt-4 space-y-1 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
            <li>中文姓名 / 중국어 이름: {prof.display_name_zh}</li>
            {prof.display_name_ko ? <li>韓文姓名 / 한국어 이름: {prof.display_name_ko}</li> : null}
            {prof.display_name_en ? <li>英文姓名 / English name: {prof.display_name_en}</li> : null}
            <li>
              地區 / 지역: {prof.carrier_country === "KR" ? "韓國 / 한국" : "中國 / 중국"}
            </li>
            {prof.carrier_label ? <li>通信商 / 통신사: {prof.carrier_label}</li> : null}
            <li>手機驗證 / 휴대폰 인증: {user.phone_confirmed_at ? "已完成 / 완료" : "未完成 / 미완료"}</li>
            {prof.phone_e164 ? <li>驗證號碼 / 인증 번호: {prof.phone_e164}</li> : user.phone ? <li>驗證號碼 / 인증 번호: {user.phone}</li> : null}
            {prof.phone_verified_at ? <li>驗證時間 / 인증 시각: {new Date(prof.phone_verified_at).toLocaleString("zh-TW")}</li> : null}
          </ul>
        ) : null}
        <p className="mt-4 text-xs text-neutral-500">登入帳號 / 로그인 계정: {user.email}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
