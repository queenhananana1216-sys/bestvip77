import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** 비로그인 허용 */
const ANON_OK = ["/login", "/register", "/auth/callback"] as const;
const PHONE_VERIFY_OK = ["/verify-phone", "/auth/callback"] as const;

function matches(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

/**
 * 세션 갱신 + 휴대폰 OTP 인증 완료 회원만 포털 접근 (관리자는 예외)
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
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

  const pathname = request.nextUrl.pathname;

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

  const { data: adminRow } = await supabase
    .from("bestvip77_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminRow) {
    if (pathname === "/login" || pathname === "/register" || pathname === "/verify-phone" || pathname === "/pending-approval") {
      return redirectTo("/admin");
    }
    return response;
  }

  const phoneVerified = Boolean(user.phone_confirmed_at);

  if (!phoneVerified) {
    if (pathname === "/register" || matches(pathname, PHONE_VERIFY_OK)) {
      return response;
    }
    return redirectTo("/verify-phone");
  }

  if (pathname === "/login" || pathname === "/register" || pathname === "/verify-phone" || pathname === "/pending-approval") {
    return redirectTo("/");
  }

  return response;
}

