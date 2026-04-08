import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPortalAdminEmail } from "@/lib/admin/portal-admin";

/** 비로그인 허용 페이지 */
const ANON_OK = ["/login", "/register", "/auth/callback"] as const;

function matches(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

/**
 * 세션 갱신 + 관리자/일반 회원 라우팅 처리
 * API 라우트(/api/*)는 각 라우트에서 자체 인증 처리하므로 미들웨어 제외
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // API 경로는 미들웨어 인증 체크 없이 바로 통과
  if (pathname.startsWith("/api/")) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (path: string) => {
    const dest = NextResponse.redirect(new URL(path, request.url));
    copyCookies(response, dest);
    return dest;
  };

  if (!user) {
    if (!matches(pathname, ANON_OK)) {
      return redirectTo("/login");
    }
    return response;
  }

  let isAdmin = isPortalAdminEmail(user);
  if (!isAdmin) {
    const { data: adminRow } = await supabase
      .from("bestvip77_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    isAdmin = Boolean(adminRow);
  }

  if (isAdmin) {
    if (pathname === "/login" || pathname === "/register" || pathname === "/verify-phone" || pathname === "/pending-approval") {
      return redirectTo("/admin");
    }
    return response;
  }

  if (pathname === "/login" || pathname === "/register" || pathname === "/verify-phone" || pathname === "/pending-approval") {
    return redirectTo("/");
  }

  return response;
}
