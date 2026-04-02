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
        {/* Left side: Social Icons (Telegram, LINE) */}
        <div className="flex items-center gap-3">
          <a
            href={content.telegram.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2AABEE] to-[#229ED9] text-white shadow-sm transition-transform hover:scale-110 hover:shadow-md"
            title="Telegram"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 ml-[-1px]" fill="currentColor">
              <path d="M19.777 5.145 4.54 10.902c-.623.248-.618.593-.113.748l3.815 1.19 1.48 4.55c.18.497.09.695.51.695.335 0 .483-.155.67-.338l2.804-2.722 5.82 4.26c1.07.59 1.84.28 2.1-.97l3.06-14.42c.38-1.52-.58-2.2-1.57-1.75z" />
            </svg>
          </a>
          <a
            href={content.line.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00C300] to-[#00A500] text-white shadow-sm transition-transform hover:scale-110 hover:shadow-md"
            title="LINE"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .348-.281.63-.63.63H18.06v1.085h1.306c.349 0 .63.283.63.63 0 .349-.281.631-.63.631h-1.937a.63.63 0 0 1-.63-.631V8.603a.63.63 0 0 1 .63-.63h1.937c.349 0 .63.282.63.63 0 .349-.281.631-.63.631H18.06v1.629h1.306zm-3.26 3.352a.63.63 0 0 1-.631.631.635.635 0 0 1-.521-.27l-1.805-2.466v2.105a.63.63 0 0 1-.63.631.63.63 0 0 1-.631-.631V8.603a.63.63 0 0 1 .631-.63c.2 0 .387.095.521.27l1.805 2.462V8.603a.63.63 0 0 1 .63-.63c.348 0 .631.282.631.63v4.612zm-5.481 0a.63.63 0 0 1-.63.631.631.631 0 0 1-.631-.631V8.603a.63.63 0 0 1 .63-.63c.349 0 .631.282.631.63v4.612zm-2.153.631H6.534a.63.63 0 0 1-.63-.631V8.603a.63.63 0 0 1 .63-.63c.349 0 .63.282.63.63v3.981h1.307c.349 0 .63.283.63.631 0 .349-.281.631-.63.631M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.084.922.258 1.058.592.12.301.079.773.038 1.078l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </a>
        </div>

        {/* Center: Smart Search Bar */}
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
