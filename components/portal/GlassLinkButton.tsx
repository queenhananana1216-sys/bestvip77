import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "sunset" | "ocean" | "slate" | "rose";
  className?: string;
  disabled?: boolean;
};

/** 매트 질감 + 얇은 보더 — 과한 네온 그라데이션 대신 */
const variants: Record<NonNullable<Props["variant"]>, string> = {
  sunset:
    "border border-orange-900/15 bg-gradient-to-b from-[#ea580c] to-[#c2410c] text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_8px_24px_-8px_rgba(194,65,12,0.45)] hover:from-[#f97316] hover:to-[#b45309]",
  ocean:
    "border border-slate-600/40 bg-gradient-to-b from-slate-700 to-slate-800 text-slate-50 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-10px_rgba(15,23,42,0.5)] hover:from-slate-600 hover:to-slate-700",
  slate:
    "border border-stone-800/80 bg-gradient-to-b from-stone-800 to-stone-900 text-stone-50 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_6px_20px_-8px_rgba(0,0,0,0.35)] hover:from-stone-700 hover:to-stone-800",
  rose: "border border-rose-900/20 bg-gradient-to-b from-rose-700 to-rose-800 text-rose-50 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset] hover:from-rose-600 hover:to-rose-700",
};

export function GlassLinkButton({ href, children, variant = "sunset", className = "", disabled }: Props) {
  const v = variants[variant];
  const base =
    "group relative inline-flex min-h-[44px] items-center justify-center overflow-hidden rounded-[11px] px-[18px] py-2.5 text-[13px] font-semibold tracking-wide transition duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40";

  if (!href || disabled) {
    return (
      <span className={`${base} cursor-not-allowed opacity-45 grayscale ${className}`} aria-disabled>
        <span className={`absolute inset-0 ${v}`} />
        <span className="relative z-[1]">{children}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} ${v} ${className}`}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      <span className="relative z-[1]">{children}</span>
    </Link>
  );
}
