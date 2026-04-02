import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "sunset" | "ocean" | "slate" | "rose";
  className?: string;
  disabled?: boolean;
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  sunset:
    "border border-[#FF3B00]/30 bg-gradient-to-b from-[#FF3B00] to-[#CC2F00] text-white shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_8px_24px_-8px_rgba(255,59,0,0.4)] hover:from-[#FF5722] hover:to-[#E64A19] hover:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_12px_32px_-8px_rgba(255,59,0,0.5)]",
  ocean:
    "border border-white/10 bg-gradient-to-b from-white/10 to-white/5 text-zinc-200 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:from-white/15 hover:to-white/8 hover:text-white hover:border-[#FFD700]/15",
  slate:
    "border border-white/8 bg-gradient-to-b from-zinc-800 to-zinc-900 text-zinc-200 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:from-zinc-700 hover:to-zinc-800 hover:text-white",
  rose:
    "border border-rose-500/20 bg-gradient-to-b from-rose-600 to-rose-700 text-rose-50 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_24px_-8px_rgba(220,20,60,0.3)] hover:from-rose-500 hover:to-rose-600",
};

export function GlassLinkButton({ href, children, variant = "sunset", className = "", disabled }: Props) {
  const v = variants[variant];
  const base =
    "group relative inline-flex min-h-[44px] items-center justify-center overflow-hidden rounded-xl px-[18px] py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40";

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
