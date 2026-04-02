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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0908]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Left side: Social Icons — Apple Vision Pro glassmorphism style */}
        <div className="flex items-center gap-2.5">
          {/* Telegram */}
          <a
            href={content.telegram.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[#2AABEE]/20 bg-[#2AABEE]/10 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-[#2AABEE]/40 hover:bg-[#2AABEE]/20 hover:shadow-[0_0_20px_rgba(42,171,238,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
            title="Telegram"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-60" />
            <svg viewBox="0 0 24 24" className="relative z-10 h-5 w-5 text-[#4DC4FF] drop-shadow-[0_0_6px_rgba(42,171,238,0.6)] transition-all duration-300 group-hover:text-[#7DD8FF] group-hover:drop-shadow-[0_0_10px_rgba(42,171,238,0.8)]" fill="currentColor">
              <path d="M19.777 5.145 4.54 10.902c-.623.248-.618.593-.113.748l3.815 1.19 1.48 4.55c.18.497.09.695.51.695.335 0 .483-.155.67-.338l2.804-2.722 5.82 4.26c1.07.59 1.84.28 2.1-.97l3.06-14.42c.38-1.52-.58-2.2-1.57-1.75z" />
            </svg>
          </a>
          {/* LINE */}
          <a
            href={content.line.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[#00E676]/20 bg-[#00E676]/10 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-[#00E676]/40 hover:bg-[#00E676]/20 hover:shadow-[0_0_20px_rgba(0,230,118,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]"
            title="LINE"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-60" />
            <svg viewBox="0 0 24 24" className="relative z-10 h-5 w-5 text-[#00FF88] drop-shadow-[0_0_6px_rgba(0,230,118,0.6)] transition-all duration-300 group-hover:text-[#66FFB3] group-hover:drop-shadow-[0_0_10px_rgba(0,230,118,0.8)]" fill="currentColor">
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
                  className="hidden sm:block rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-[#FFD700]/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_12px_rgba(255,215,0,0.15)]"
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
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {h.logoutLabel}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden sm:block rounded-xl px-3.5 py-1.5 text-zinc-400 transition hover:text-white"
              >
                {h.registerLabel}
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-[#FF3B00] to-[#FF8C00] px-4 py-1.5 text-white shadow-[0_0_16px_rgba(255,59,0,0.3)] transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,59,0,0.5)] hover:scale-105"
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
