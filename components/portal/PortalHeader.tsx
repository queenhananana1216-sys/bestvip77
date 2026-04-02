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
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {h.showSearchIcon ? (
            <Link
              href={h.searchHref?.trim() || "#"}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
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
            className="text-[16px] font-bold tracking-tight text-zinc-900"
            style={{ fontFamily: "var(--font-dm), var(--font-noto-tc), sans-serif" }}
          >
            {content.siteName}
          </span>
        </div>
        <nav
          className="flex items-center gap-2 text-[13px] font-medium"
          style={{ fontFamily: "var(--font-dm), var(--font-noto-tc), sans-serif" }}
        >
          {initialUser ? (
            <>
              {initialUser.isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  管理後台
                </Link>
              ) : null}
              <span
                className="hidden max-w-[160px] truncate px-2 text-[12px] font-normal text-zinc-500 sm:inline"
                title={initialUser.email ?? ""}
              >
                {initialUser.email}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900"
              >
                {h.logoutLabel}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-xl px-3.5 py-1.5 text-zinc-500 transition hover:text-zinc-900"
              >
                {h.registerLabel}
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-zinc-900 px-4 py-1.5 text-white shadow-sm transition hover:bg-zinc-800"
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
