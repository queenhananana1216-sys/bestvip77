import { NextResponse } from "next/server";
import { AdminApiError, updateAdminMember } from "@/lib/admin/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  try {
    const body = (await request.json()) as {
      status?: "pending" | "approved" | "rejected";
      adminNote?: string;
      displayNameZh?: string;
      displayNameKo?: string | null;
      displayNameEn?: string | null;
    };
    const { userId } = await params;
    const row = await updateAdminMember(userId, body);

    return NextResponse.json({ row });
  } catch (error) {
    if (error instanceof AdminApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "회원 정보를 저장하지 못했습니다." }, { status: 500 });
  }
}
