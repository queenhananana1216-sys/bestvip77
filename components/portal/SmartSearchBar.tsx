"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PortalPostRow } from "@/lib/portal/types";

export function SmartSearchBar({ posts = [] }: { posts?: PortalPostRow[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = query.trim() === ""
    ? []
    : posts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        (p.body_text && p.body_text.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-[280px] sm:max-w-md mx-2 sm:mx-4">
      <form
        onSubmit={handleSearch}
        className="group relative flex items-center w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl transition-all duration-300 focus-within:border-[#FFD700]/30 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_20px_rgba(255,215,0,0.12),0_0_40px_rgba(255,59,0,0.06),inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="pl-3.5 pr-2 text-zinc-500 transition-colors duration-300 group-focus-within:text-[#FFD700]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="輸入拼音/首字母快速搜尋..."
          className="w-full h-full bg-transparent text-[13px] text-zinc-200 outline-none placeholder:text-zinc-600"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="pr-3 text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl border border-white/[0.08] bg-[#1a1816]/95 backdrop-blur-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,215,0,0.05)] overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="py-2">
              <li className="px-4 py-1.5 text-[11px] font-semibold text-[#FFD700]/60 uppercase tracking-wider">
                快速搜尋結果
              </li>
              {results.map(post => (
                <li key={post.id}>
                  <Link
                    href={`/post/${post.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 transition-all duration-200 hover:bg-[#FFD700]/[0.06]"
                  >
                    <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-white/5 shrink-0 ring-1 ring-white/10">
                      {post.profile_image_url ? (
                        <Image src={post.profile_image_url} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FFD700]/60 text-xs font-bold">{post.title[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-zinc-200 truncate">{post.title}</p>
                      <p className="text-[11px] text-[#FF6B00] truncate font-medium">{post.price_info}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-zinc-400">找不到符合「{query}」的結果</p>
              <p className="text-[11px] text-zinc-600 mt-1">試著輸入其他拼音或關鍵字</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
