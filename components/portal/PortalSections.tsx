import Image from "next/image";
import { GlassLinkButton } from "@/components/portal/GlassLinkButton";
import type { PortalSiteContent, UrlStripTone } from "@/lib/portal/types";

function tonePill(t: UrlStripTone): string {
  switch (t) {
    case "green":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "blue":
      return "border-sky-500/20 bg-sky-500/10 text-sky-400";
    case "orange":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "red":
      return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    default:
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";
  }
}

export function TopBanner({ content }: { content: PortalSiteContent }) {
  const b = content.topBanner;
  if (!b.imageUrl?.trim()) return null;
  const inner = (
    <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10 shadow-[0_8px_40px_-12px_rgba(255,59,0,0.2)]">
      <Image
        src={b.imageUrl}
        alt={b.alt || "banner"}
        fill
        className="object-cover"
        sizes="100vw"
        unoptimized
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
  if (b.linkUrl?.trim()) {
    return (
      <a href={b.linkUrl} className="block transition-transform duration-300 hover:scale-[1.01]" target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
}

export function HeroSection({ content }: { content: PortalSiteContent }) {
  const { hero } = content;
  return (
    <section className="relative flex flex-col items-center justify-center py-10">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[300px] w-[300px] rounded-full bg-[#FF3B00]/[0.07] blur-[100px]" />
      </div>
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[200px] w-[200px] rounded-full bg-[#FFD700]/[0.05] blur-[80px]" />

      <div className="group relative w-full max-w-[400px] sm:max-w-[500px] flex flex-col items-center">
        {/* Holographic Glass Card */}
        <div
          className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/[0.08] px-8 py-14 transition-all duration-500 hover:scale-[1.02] hover:border-white/[0.15]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,59,0,0.03) 50%, rgba(255,215,0,0.04) 100%)",
            backdropFilter: "blur(40px)",
            boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(255,59,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.1)",
          }}
        >
          {/* Holographic shimmer overlay */}
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.03]" />
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#FFD700]/[0.08] blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[#FF3B00]/[0.08] blur-[60px]" />

          <p className="relative mb-5 text-[11px] font-bold uppercase tracking-[0.5em] text-[#FFD700]/50">
            {hero.eyebrow}
          </p>
          <h1
            className="relative text-[clamp(2.5rem,8vw,4rem)] font-black leading-none tracking-tighter animate-gold-shimmer"
            style={{
              fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif",
              background: "linear-gradient(135deg, #BF953F 0%, #FCF6BA 20%, #FBF5B7 40%, #AA771C 60%, #FCF6BA 80%, #BF953F 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 8px rgba(191,149,63,0.4)) drop-shadow(0 0 30px rgba(255,215,0,0.15))",
            }}
          >
            {hero.mainBrand}
          </h1>
          {hero.versionBubbles.length > 0 ? (
            <div className="relative mt-7 flex flex-wrap justify-center gap-2.5">
              {hero.versionBubbles.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-[#FFD700]/20 bg-[#FFD700]/[0.06] px-4 py-1.5 text-[11px] font-bold tracking-widest text-[#FCF6BA]/80 backdrop-blur-md transition-all duration-300 hover:border-[#FFD700]/40 hover:bg-[#FFD700]/[0.12] hover:text-[#FCF6BA] hover:shadow-[0_0_16px_rgba(255,215,0,0.15)]"
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
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
      <h2
        className="text-center text-[15px] font-semibold tracking-[-0.02em] text-zinc-200 sm:text-base"
        style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
      >
        {urlStrip.heading}
      </h2>
      <ul className="mt-5 flex flex-col divide-y divide-white/[0.04]">
        {urlStrip.items.map((item, i) => (
          <li
            key={`${item.label}-${i}`}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <span className="font-semibold text-zinc-200">{item.label}</span>
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
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
      <h3 className="mb-6 text-center text-[13px] font-bold uppercase tracking-[0.3em] text-[#FFD700]/40">
        官方聯繫方式
      </h3>
      <div className="flex justify-center gap-10">
        <SocialIcon
          href={tg.ctaHref}
          name="Telegram"
          colorFrom="#2AABEE"
          colorTo="#1E96CC"
          glowColor="rgba(42,171,238,0.35)"
          neonColor="#4DC4FF"
          icon={
            <svg viewBox="0 0 24 24" className="h-9 w-9 ml-[-2px]" fill="currentColor">
              <path d="M19.777 5.145 4.54 10.902c-.623.248-.618.593-.113.748l3.815 1.19 1.48 4.55c.18.497.09.695.51.695.335 0 .483-.155.67-.338l2.804-2.722 5.82 4.26c1.07.59 1.84.28 2.1-.97l3.06-14.42c.38-1.52-.58-2.2-1.57-1.75z" />
            </svg>
          }
        />
        <SocialIcon
          href={ln.ctaHref}
          name="LINE"
          colorFrom="#00C300"
          colorTo="#00A500"
          glowColor="rgba(0,195,0,0.35)"
          neonColor="#00FF88"
          icon={
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .348-.281.63-.63.63H18.06v1.085h1.306c.349 0 .63.283.63.63 0 .349-.281.631-.63.631h-1.937a.63.63 0 0 1-.63-.631V8.603a.63.63 0 0 1 .63-.63h1.937c.349 0 .63.282.63.63 0 .349-.281.631-.63.631H18.06v1.629h1.306zm-3.26 3.352a.63.63 0 0 1-.631.631.635.635 0 0 1-.521-.27l-1.805-2.466v2.105a.63.63 0 0 1-.63.631.63.63 0 0 1-.631-.631V8.603a.63.63 0 0 1 .631-.63c.2 0 .387.095.521.27l1.805 2.462V8.603a.63.63 0 0 1 .63-.63c.348 0 .631.282.631.63v4.612zm-5.481 0a.63.63 0 0 1-.63.631.631.631 0 0 1-.631-.631V8.603a.63.63 0 0 1 .63-.63c.349 0 .631.282.631.63v4.612zm-2.153.631H6.534a.63.63 0 0 1-.63-.631V8.603a.63.63 0 0 1 .63-.63c.349 0 .63.282.63.63v3.981h1.307c.349 0 .63.283.63.631 0 .349-.281.631-.63.631M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.084.922.258 1.058.592.12.301.079.773.038 1.078l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          }
        />
      </div>
    </section>
  );
}

function SocialIcon({
  href,
  name,
  colorFrom,
  colorTo,
  glowColor,
  neonColor,
  icon,
}: {
  href: string;
  name: string;
  colorFrom: string;
  colorTo: string;
  glowColor: string;
  neonColor: string;
  icon: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-3">
      <div
        className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-white/10 transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-110 group-hover:border-white/20"
        style={{
          background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`,
          boxShadow: `0 16px 32px -8px ${glowColor}, inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.15)`,
          color: neonColor,
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-b from-white/15 to-transparent" />
        <div className="relative z-10 drop-shadow-[0_0_8px_currentColor]">{icon}</div>
      </div>
      <span
        className="text-[13px] font-bold tracking-wide text-zinc-500 transition-all duration-300 group-hover:text-zinc-200"
        style={{ textShadow: "none" }}
      >
        {name}
      </span>
    </a>
  );
}

export function AdCtaSection({ content }: { content: PortalSiteContent }) {
  const a = content.adCta;
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-[#FF3B00]/90 to-[#FF8C00]/90 px-6 py-10 shadow-[0_20px_60px_-12px_rgba(255,59,0,0.4)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#FFD700] opacity-[0.08] blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white opacity-[0.06] blur-[50px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      <div className="relative mx-auto max-w-md text-center text-white">
        <h2
          className="text-[22px] font-bold tracking-tight sm:text-[24px]"
          style={{
            fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {a.title}
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/85 font-medium">{a.body}</p>
        <div className="mt-8 flex justify-center">
          <a
            href={a.buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-white/20 bg-white/95 px-6 py-3.5 text-[15px] font-bold text-[#FF3B00] shadow-[0_8px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_12px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(255,255,255,0.3)]"
          >
            {a.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
