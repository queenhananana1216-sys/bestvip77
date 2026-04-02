import { PortalHeader } from "@/components/portal/PortalHeader";
import {
  AdCtaSection,
  HeroSection,
  SocialLinksSection,
  TopBanner,
  UrlStripSection,
} from "@/components/portal/PortalSections";
import { PostFeed } from "@/components/portal/PostFeed";
import { CategoryNav } from "@/components/portal/CategoryNav";
import { fetchPortalPayload } from "@/lib/portal/data";
import { tryCreateServerSupabaseAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

function MarqueeBanner() {
  const items = [
    "🔥 VIP專屬服務",
    "💎 頂級會員通道",
    "👑 全澳最高規格",
    "⭐ 24H在線客服",
    "🏆 信譽保證 安全第一",
    "🔥 新用戶專享優惠",
    "💎 高端私人訂製",
    "👑 澳門·內地全覆蓋",
  ];
  const text = items.join("     ");
  return (
    <div className="relative overflow-hidden border-y border-white/[0.04] bg-gradient-to-r from-[#FF3B00]/[0.04] via-transparent to-[#FFD700]/[0.04] py-2.5">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="inline-block text-[12px] font-semibold tracking-wider text-[#FFD700]/50">{text}</span>
        <span className="inline-block text-[12px] font-semibold tracking-wider text-[#FFD700]/50 ml-20">{text}</span>
      </div>
    </div>
  );
}

function StatsBar() {
  const stats = [
    { value: "10,000+", label: "活躍會員" },
    { value: "500+", label: "合作商家" },
    { value: "99.8%", label: "好評率" },
    { value: "24/7", label: "在線服務" },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.02] py-4 backdrop-blur-md transition-all duration-300 hover:border-[#FFD700]/15 hover:bg-white/[0.04]">
          <span className="text-[18px] sm:text-[22px] font-black text-gold-gradient">{s.value}</span>
          <span className="text-[11px] font-medium text-zinc-500">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function VipBadge() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4em] text-[#FFD700]/40">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#FFD700]/60"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        VIP EXCLUSIVE
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#FFD700]/60"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
    </div>
  );
}

function FeedSectionHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-[18px] font-bold text-zinc-100" style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}>
          合作商家
        </h2>
        <p className="mt-1 text-[12px] text-zinc-500">精選優質商家，VIP尊享推薦</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-[#FF3B00]/20 bg-[#FF3B00]/[0.08] px-3 py-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF3B00] opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF3B00]"></span>
        </span>
        <span className="text-[11px] font-semibold text-[#FF6B00]">LIVE</span>
      </div>
    </div>
  );
}

function FooterSection() {
  return (
    <footer className="mt-8 border-t border-white/[0.04] pt-8 pb-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="text-[20px] font-black text-gold-gradient"
            style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}
          >
            bestvip77
          </span>
        </div>
        <p className="max-w-sm text-center text-[11px] leading-relaxed text-zinc-600">
          本站僅提供資訊展示服務。所有內容由合作商家提供，請自行判斷。
        </p>
        <div className="flex items-center gap-4 text-[11px] text-zinc-700">
          <span>© 2026 bestvip77</span>
          <span className="text-zinc-800">·</span>
          <span>All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}

export default async function HomePage() {
  const sb = await tryCreateServerSupabaseAuthClient();
  const {
    data: { user },
  } = sb ? await sb.auth.getUser() : { data: { user: null } };
  const { data: adminRow } =
    sb && user
      ? await sb.from("bestvip77_admins").select("user_id").eq("user_id", user.id).maybeSingle()
      : { data: null };

  const { content, posts, error } = await fetchPortalPayload();

  return (
    <div className="min-h-dvh pb-16">
      <PortalHeader
        content={content}
        initialUser={user ? { id: user.id, email: user.email, isAdmin: Boolean(adminRow) } : null}
        posts={posts}
      />

      <MarqueeBanner />

      <main className="mx-auto max-w-lg space-y-7 px-4 pb-8 pt-6 sm:max-w-4xl">
        {error ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-[12px] leading-relaxed text-amber-400">
            資料載入提示：{error}（請確認 .env.local 與資料庫 migration 055·056·058 已套用）
          </div>
        ) : null}

        <TopBanner content={content} />
        <HeroSection content={content} />

        <StatsBar />

        <VipBadge />

        <CategoryNav />

        <section className="space-y-4">
          <FeedSectionHeader />
          <PostFeed posts={posts} />
        </section>

        <VipBadge />

        <SocialLinksSection content={content} />
        <UrlStripSection content={content} />
        <AdCtaSection content={content} />

        <FooterSection />
      </main>
    </div>
  );
}
