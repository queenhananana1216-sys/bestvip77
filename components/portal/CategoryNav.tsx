"use client";

import Link from "next/link";

const CATEGORIES = [
  { id: "macau-night", label: "澳門夜遊", icon: "📍" },
  { id: "macau-hj", label: "澳門HJ", icon: "📍" },
  { id: "macau-escort", label: "澳門外圍", icon: "📍" },
  { id: "mainland-night", label: "內地夜遊", icon: "📍" },
  { id: "mainland-hj", label: "內地HJ", icon: "📍" },
  { id: "high-end", label: "高級會所", icon: "📍" },
];

export function CategoryNav() {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-2">
      <div className="flex w-max gap-4 px-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.id}`}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-500 shadow-sm ring-1 ring-yellow-400/30 transition hover:bg-yellow-400/30">
              <span className="text-xl">{cat.icon}</span>
            </div>
            <span className="text-[12px] font-medium text-stone-700">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
