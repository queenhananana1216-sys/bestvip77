import { NextResponse } from "next/server";
import { AdminApiError, loadAdminMembers } from "@/lib/admin/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await loadAdminMembers();
    return NextResponse.json({ rows });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "회원 데이터를 불러오지 못했습니다." }, { status: 500 });
  }
}
