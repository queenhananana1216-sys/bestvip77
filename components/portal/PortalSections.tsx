import Image from "next/image";
import { GlassLinkButton } from "@/components/portal/GlassLinkButton";
import { TelegramCtaButton } from "@/components/portal/TelegramCtaButton";
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

export function TelegramSection({ content }: { content: PortalSiteContent }) {
  const t = content.telegram;
  const href = (t.ctaHref ?? "").trim();
  const label = (t.ctaLabel ?? "").trim() || (href ? "開啟 Telegram" : "請於後台填入連結");

  return (
    <section
      className="relative overflow-hidden rounded-[14px] border border-slate-700/30 bg-[#0c1220] p-6 text-slate-100"
      style={{ boxShadow: "0 12px 40px -16px rgba(8, 12, 22, 0.55)" }}
    >
      <div className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#1e3a5f]/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-48 rounded-full bg-orange-900/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100V0h100' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: "24px 24px",
      }} />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] shadow-inner">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-sky-300/95" fill="currentColor" aria-hidden>
              <path d="M19.777 5.145 4.54 10.902c-.623.248-.618.593-.113.748l3.815 1.19 1.48 4.55c.18.497.09.695.51.695.335 0 .483-.155.67-.338l2.804-2.722 5.82 4.26c1.07.59 1.84.28 2.1-.97l3.06-14.42c.38-1.52-.58-2.2-1.57-1.75z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500"
              style={{ fontFamily: "var(--font-dm), sans-serif" }}
            >
              Telegram
            </p>
            <h2 className="mt-1 text-[17px] font-semibold leading-snug tracking-[-0.02em] text-slate-50">
              {t.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{t.body}</p>
          </div>
        </div>

        <div className="shrink-0 sm:max-w-[min(100%,280px)]">
          <TelegramCtaButton href={t.ctaHref}>{label}</TelegramCtaButton>
        </div>
      </div>
    </section>
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
