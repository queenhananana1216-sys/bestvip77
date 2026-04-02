"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { SmartSearchBar } from "./SmartSearchBar";
import type { PortalPostRow, PortalSiteContent } from "@/lib/portal/types";

type Props = {
  content: PortalSiteContent;
  initialUser: { id: string; email?: string | null; isAdmin?: boolean } | null;
  posts?: PortalPostRow[];
};

export function PortalHeader({ content, initialUser, posts }: Props) {
  const router = useRouter();
  const h = content.header;

  async function logout() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {/* Logo removed to emphasize the main Hero branding */}
        </div>

        <SmartSearchBar posts={posts} />

        <nav
          className="flex items-center gap-2 text-[13px] font-medium shrink-0"
          style={{ fontFamily: "var(--font-dm), var(--font-noto-tc), sans-serif" }}
        >
          {initialUser ? (
            <>
              {initialUser.isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden sm:block rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900"
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
                className="hidden sm:block rounded-xl px-3.5 py-1.5 text-zinc-500 transition hover:text-zinc-900"
              >
                {h.registerLabel}
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-[#FF512F] to-[#F09819] px-4 py-1.5 text-white shadow-sm transition hover:opacity-90"
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
