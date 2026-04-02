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
    <section
      className="relative overflow-hidden rounded-[14px] p-[1px]"
      style={{
        background: "linear-gradient(135deg, rgba(194,65,12,0.45) 0%, rgba(28,25,23,0.15) 45%, rgba(194,65,12,0.25) 100%)",
        boxShadow: "var(--bv-shadow-sm)",
      }}
    >
      <div className="relative overflow-hidden rounded-[13px] bg-[#161311] px-6 py-8 text-stone-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 20% 0%, rgba(194,65,12,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(120,113,108,0.12), transparent 50%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.035%22/%3E%3C/svg%3E')]" />

        <p
          className="relative text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-200/75"
          style={{ fontFamily: "var(--font-dm), sans-serif" }}
        >
          {hero.eyebrow}
        </p>
        <div className="relative mt-5 flex flex-col items-center gap-4">
          <h1
            className="text-center text-[clamp(1.75rem,6vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-stone-50"
            style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
          >
            {hero.mainBrand}
          </h1>
          {hero.versionBubbles.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {hero.versionBubbles.map((v) => (
                <span
                  key={v}
                  className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium tracking-wide text-stone-300"
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
      className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-white/8 p-[1px] transition duration-300"
      style={{
        background: `linear-gradient(145deg, ${accentFrom}30 0%, rgba(20,18,17,0.25) 50%, ${accentTo}20 100%)`,
      }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[13px] bg-[#111110] p-5"
        style={{ boxShadow: `0 20px 50px -20px ${glowColor}` }}
      >
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90"
          style={{ background: `radial-gradient(circle, ${accentFrom}40, transparent 70%)` }}
        />
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-30 blur-2xl"
          style={{ background: `radial-gradient(circle, ${accentFrom}30, transparent 70%)` }}
        />

        <div className="relative">
          <div
            className="mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-white/10 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-4deg]"
            style={{
              background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
              boxShadow: `0 8px 24px -4px ${accentFrom}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            {icon}
          </div>

          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500"
            style={{ fontFamily: "var(--font-dm), sans-serif" }}
          >
            {platform}
          </p>
          <h3 className="mt-1.5 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-stone-50">{title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-stone-400">{body}</p>
        </div>

        <div className="relative mt-4 pt-1">
          <span
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition duration-300 group-hover:gap-3"
            style={{
              background: `linear-gradient(135deg, ${accentFrom} 0%, ${accentTo} 100%)`,
              boxShadow: `0 4px 16px -4px ${accentFrom}40`,
            }}
          >
            {label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
              <path d="M7 17l9.2-9.2M17 17V8H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {card}
    </a>
  );
}

export function AdCtaSection({ content }: { content: PortalSiteContent }) {
  const a = content.adCta;
  return (
    <section
      className="relative overflow-hidden rounded-[14px] border border-stone-300/60 bg-[var(--bv-surface-2)] px-6 py-8"
      style={{ boxShadow: "var(--bv-shadow-sm)" }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, rgba(194,65,12,0.9) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-md text-center">
        <h2
          className="text-[20px] font-semibold tracking-[-0.03em] text-stone-900 sm:text-[22px]"
          style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
        >
          {a.title}
        </h2>
        <p className="mt-3 text-[13px] leading-relaxed text-stone-600">{a.body}</p>
        <div className="mt-7 flex justify-center">
          <GlassLinkButton href={a.buttonHref} variant="slate" className="min-w-[200px]">
            {a.buttonLabel}
          </GlassLinkButton>
        </div>
      </div>
    </section>
  );
}
