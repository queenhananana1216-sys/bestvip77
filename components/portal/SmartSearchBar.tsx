"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PortalPostRow } from "@/lib/portal/types";

export function SmartSearchBar({ posts = [] }: { posts?: PortalPostRow[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simple client-side filter for "smart search" feel
  // Matches English (Pinyin initials mock) or Chinese characters
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
      // In a real app, this might navigate to a search results page
      // router.push(`/?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-[280px] sm:max-w-md mx-2 sm:mx-4">
      <form onSubmit={handleSearch} className="relative flex items-center w-full h-10 rounded-full bg-stone-100/80 border border-stone-200 focus-within:bg-white focus-within:border-[#FF512F] focus-within:ring-2 focus-within:ring-[#FF512F]/20 transition-all shadow-inner">
        <div className="pl-3 pr-2 text-stone-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          className="w-full h-full bg-transparent text-[13px] text-stone-800 outline-none placeholder:text-stone-400"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="pr-3 text-stone-400 hover:text-stone-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="py-2">
              <li className="px-4 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                快速搜尋結果
              </li>
              {results.map(post => (
                <li key={post.id}>
                  <Link
                    href={`/post/${post.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-stone-100 shrink-0 ring-1 ring-black/5">
                      {post.profile_image_url ? (
                        <Image src={post.profile_image_url} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs font-bold">{post.title[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-stone-900 truncate">{post.title}</p>
                      <p className="text-[11px] text-orange-600 truncate font-medium">{post.price_info}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-[13px] text-stone-500">找不到符合「{query}」的結果</p>
              <p className="text-[11px] text-stone-400 mt-1">試著輸入其他拼音或關鍵字</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
