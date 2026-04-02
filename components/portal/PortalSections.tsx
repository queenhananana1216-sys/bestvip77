import Image from "next/image";
import { GlassLinkButton } from "@/components/portal/GlassLinkButton";
import type { PortalSiteContent, UrlStripTone } from "@/lib/portal/types";

function tonePill(t: UrlStripTone): string {
  switch (t) {
    case "green":
      return "border-emerald-200/80 bg-emerald-50/90 text-emerald-900";
    case "blue":
      return "border-sky-200/80 bg-sky-50/90 text-sky-900";
    case "orange":
      return "border-amber-200/80 bg-amber-50/90 text-amber-950";
    case "red":
      return "border-rose-200/80 bg-rose-50/90 text-rose-900";
    default:
      return "border-stone-200/90 bg-stone-50 text-stone-700";
  }
}

export function TopBanner({ content }: { content: PortalSiteContent }) {
  const b = content.topBanner;
  if (!b.imageUrl?.trim()) return null;
  const inner = (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[13px] bg-stone-900 ring-1 ring-stone-900/10">
      <Image
        src={b.imageUrl}
        alt={b.alt || "banner"}
        fill
        className="object-cover"
        sizes="100vw"
        unoptimized
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10" />
    </div>
  );
  if (b.linkUrl?.trim()) {
    return (
      <a href={b.linkUrl} className="block" target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}

export function HeroSection({ content }: { content: PortalSiteContent }) {
  const { hero } = content;
  return (
    <section className="relative flex flex-col items-center justify-center py-8">
      <div className="group relative w-full max-w-[400px] cursor-default sm:max-w-[500px]">
        {/* Subtle glow effect */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-[#FF512F] to-[#F09819] opacity-50 blur-2xl transition duration-500 group-hover:opacity-80" />
        
        {/* Button-like Branding Pill */}
        <div className="relative flex w-full flex-col items-center justify-center rounded-[2.5rem] border border-[#FFD700]/30 bg-gradient-to-br from-[#D32F2F] via-[#B71C1C] to-[#880E4F] px-8 py-12 shadow-[0_0_40px_rgba(211,47,47,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,215,0,0.3)]">
          <p
            className="mb-3 text-[12px] font-bold uppercase tracking-[0.3em] text-[#FFD700]/90 drop-shadow-md"
            style={{ fontFamily: "var(--font-dm), sans-serif" }}
          >
            {hero.eyebrow}
          </p>
          
          <h1
            className="text-[clamp(2.5rem,8vw,3.5rem)] font-black leading-none tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
          >
            {hero.mainBrand}
          </h1>
          
          {hero.versionBubbles.length > 0 ? (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {hero.versionBubbles.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-[#FFD700]/40 bg-gradient-to-r from-[#FFD700]/20 to-[#FF8C00]/20 px-4 py-1.5 text-[12px] font-bold tracking-wide text-[#FFF8E1] backdrop-blur-md shadow-inner"
                >
                  {v}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function UrlStripSection({ content }: { content: PortalSiteContent }) {
  const { urlStrip } = content;
  if (!urlStrip.items.length) return null;

  return (
    <section
      className="rounded-[14px] border border-stone-200/80 bg-[var(--bv-surface)] p-5"
      style={{ boxShadow: "var(--bv-shadow-sm)" }}
    >
      <h2
        className="text-center text-[15px] font-semibold tracking-[-0.02em] text-stone-800 sm:text-base"
        style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
      >
        {urlStrip.heading}
      </h2>
      <ul className="mt-5 flex flex-col divide-y divide-stone-100">
        {urlStrip.items.map((item, i) => (
          <li
            key={`${item.label}-${i}`}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <span className="font-semibold text-stone-800">{item.label}</span>
              <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${tonePill(item.tone)}`}>
                {item.status}
              </span>
            </div>
            <GlassLinkButton href={item.href} variant="ocean" className="w-full shrink-0 sm:w-auto">
              前往
            </GlassLinkButton>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SocialLinksSection({ content }: { content: PortalSiteContent }) {
  const tg = content.telegram;
  const ln = content.line;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <SocialCard
        platform="telegram"
        title={tg.title}
        body={tg.body}
        ctaLabel={tg.ctaLabel}
        ctaHref={tg.ctaHref}
        accentFrom="#0088cc"
        accentTo="#005f8f"
        glowColor="rgba(0,136,204,0.2)"
        icon={
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
            <path d="M19.777 5.145 4.54 10.902c-.623.248-.618.593-.113.748l3.815 1.19 1.48 4.55c.18.497.09.695.51.695.335 0 .483-.155.67-.338l2.804-2.722 5.82 4.26c1.07.59 1.84.28 2.1-.97l3.06-14.42c.38-1.52-.58-2.2-1.57-1.75z" />
          </svg>
        }
      />
      <SocialCard
        platform="line"
        title={ln.title}
        body={ln.body}
        ctaLabel={ln.ctaLabel}
        ctaHref={ln.ctaHref}
        accentFrom="#06c755"
        accentTo="#04943f"
        glowColor="rgba(6,199,85,0.18)"
        icon={
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .348-.281.63-.63.63H18.06v1.085h1.306c.349 0 .63.283.63.63 0 .349-.281.631-.63.631h-1.937a.63.63 0 0 1-.63-.631V8.603a.63.63 0 0 1 .63-.63h1.937c.349 0 .63.282.63.63 0 .349-.281.631-.63.631H18.06v1.629h1.306zm-3.26 3.352a.63.63 0 0 1-.631.631.635.635 0 0 1-.521-.27l-1.805-2.466v2.105a.63.63 0 0 1-.63.631.63.63 0 0 1-.631-.631V8.603a.63.63 0 0 1 .631-.63c.2 0 .387.095.521.27l1.805 2.462V8.603a.63.63 0 0 1 .63-.63c.348 0 .631.282.631.63v4.612zm-5.481 0a.63.63 0 0 1-.63.631.631.631 0 0 1-.631-.631V8.603a.63.63 0 0 1 .63-.63c.349 0 .631.282.631.63v4.612zm-2.153.631H6.534a.63.63 0 0 1-.63-.631V8.603a.63.63 0 0 1 .63-.63c.349 0 .63.282.63.63v3.981h1.307c.349 0 .63.283.63.631 0 .349-.281.631-.63.631M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.084.922.258 1.058.592.12.301.079.773.038 1.078l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        }
      />
    </section>
  );
}

function SocialCard({
  platform,
  title,
  body,
  ctaLabel,
  ctaHref,
  accentFrom,
  accentTo,
  glowColor,
  icon,
}: {
  platform: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  icon: React.ReactNode;
}) {
  const href = ctaHref.trim();
  const label = ctaLabel.trim() || title;
  const disabled = !href;

  const card = (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] p-[2px] transition duration-500 hover:scale-[1.03]"
      style={{
        background: `linear-gradient(145deg, ${accentFrom} 0%, ${accentTo} 50%, #FFD700 100%)`,
        boxShadow: `0 15px 35px -10px ${glowColor}`,
      }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[18px] bg-gradient-to-b from-white to-stone-50 p-6"
      >
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
          style={{ background: `radial-gradient(circle, ${accentFrom}, transparent 70%)` }}
        />

        <div className="relative flex items-center gap-4 mb-4">
          <div
            className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
              boxShadow: `0 8px 24px -4px ${accentFrom}60, inset 0 2px 4px rgba(255,255,255,0.3)`,
            }}
          >
            {icon}
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400"
              style={{ fontFamily: "var(--font-dm), sans-serif" }}
            >
              {platform}
            </p>
            <h3 className="text-[18px] font-bold leading-snug tracking-tight text-stone-900 drop-shadow-sm">{title}</h3>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-stone-600 font-medium">{body}</p>

        <div className="relative mt-auto pt-5">
          <span
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-bold text-white transition-all duration-300 group-hover:gap-3 group-hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
              boxShadow: `0 6px 20px -4px ${accentFrom}50`,
            }}
          >
            {label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              <path d="M7 17l9.2-9.2M17 17V8H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return <div className="opacity-50">{card}</div>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
      {card}
    </a>
  );
}

export function AdCtaSection({ content }: { content: PortalSiteContent }) {
  const a = content.adCta;
  return (
    <section
      className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FF512F] to-[#F09819] px-6 py-10 shadow-xl"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white opacity-10 blur-3xl"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white opacity-10 blur-2xl"
      />
      <div className="relative mx-auto max-w-md text-center text-white">
        <h2
          className="text-[22px] font-bold tracking-tight sm:text-[24px] drop-shadow-md"
          style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
        >
          {a.title}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/90 font-medium">{a.body}</p>
        <div className="mt-8 flex justify-center">
          <a
            href={a.buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-6 py-3.5 text-[15px] font-bold text-[#FF512F] shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
          >
            {a.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
