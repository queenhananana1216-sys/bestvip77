"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import type { PortalSiteContent } from "@/lib/portal/types";

type Props = {
  content: PortalSiteContent;
  initialUser: { id: string; email?: string | null; isAdmin?: boolean } | null;
};

export function PortalHeader({ content, initialUser }: Props) {
  const router = useRouter();
  const h = content.header;

  async function logout() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/6 backdrop-blur-md"
      style={{
        background: "linear-gradient(180deg, rgba(20,18,17,0.97) 0%, rgba(20,18,17,0.92) 100%)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="mx-auto flex h-[52px] max-w-xl items-center justify-between px-4 sm:max-w-xl">
        <div className="flex items-center gap-3">
          {h.showSearchIcon ? (
            <Link
              href={h.searchHref?.trim() || "#"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-white/6 hover:text-stone-200"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm0-2a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
                  fill="currentColor"
                />
                <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          ) : null}
          <span
            className="text-[15px] font-semibold tracking-[-0.02em] text-stone-100"
            style={{ fontFamily: "var(--font-dm), var(--font-noto-tc), sans-serif" }}
          >
            {content.siteName}
          </span>
        </div>
        <nav
          className="flex items-center gap-1 text-[13px] font-medium"
          style={{ fontFamily: "var(--font-dm), var(--font-noto-tc), sans-serif" }}
        >
          {initialUser ? (
            <>
              {initialUser.isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-lg border border-orange-500/35 bg-orange-500/12 px-3 py-1.5 text-orange-100/95 transition hover:border-orange-400/45 hover:bg-orange-500/18"
                >
                  管理後台
                </Link>
              ) : null}
              <span
                className="hidden max-w-[160px] truncate px-2 text-[12px] font-normal text-stone-500 sm:inline"
                title={initialUser.email ?? ""}
              >
                {initialUser.email}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-stone-200 transition hover:border-white/12 hover:bg-white/7"
              >
                {h.logoutLabel}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg px-3 py-1.5 text-stone-400 transition hover:text-stone-100"
              >
                {h.registerLabel}
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-orange-500/35 bg-orange-500/10 px-3 py-1.5 text-orange-100/95 transition hover:border-orange-400/45 hover:bg-orange-500/15"
              >
                {h.loginLabel}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
