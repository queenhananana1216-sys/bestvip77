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
      <div className="flex w-max gap-5 px-2 sm:mx-auto sm:justify-center">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/?category=${cat.id}`}
            className="group flex flex-col items-center gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3D6] text-[#FF4B4B] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
              <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
            </div>
            <span className="text-[13px] font-medium text-stone-700 group-hover:text-stone-900">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
