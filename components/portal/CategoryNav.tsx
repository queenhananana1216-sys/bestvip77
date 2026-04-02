"use client";

import Link from "next/link";

const CATEGORIES = [
  { id: "macau-night", label: "澳門夜遊", icon: "🔥" },
  { id: "macau-hj", label: "澳門HJ", icon: "💎" },
  { id: "macau-escort", label: "澳門外圍", icon: "👑" },
  { id: "mainland-night", label: "內地夜遊", icon: "🌙" },
  { id: "mainland-hj", label: "內地HJ", icon: "⭐" },
  { id: "high-end", label: "高級會所", icon: "🏆" },
];

export function CategoryNav() {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex w-max gap-4 px-2 sm:mx-auto sm:justify-center">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.id}`}
            className="group flex flex-col items-center gap-2.5"
          >
            <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl transition-all duration-300 group-hover:scale-110 group-hover:border-[#FFD700]/25 group-hover:bg-[#FFD700]/[0.08] group-hover:shadow-[0_8px_24px_-4px_rgba(255,215,0,0.2),0_0_0_1px_rgba(255,215,0,0.1)]">
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent" />
              <span className="relative z-10 text-2xl drop-shadow-[0_0_8px_rgba(220,20,60,0.4)] transition-transform duration-300 group-hover:scale-110">{cat.icon}</span>
            </div>
            <span className="text-[12px] font-semibold text-zinc-500 transition-colors duration-300 group-hover:text-[#FFD700]/80">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
