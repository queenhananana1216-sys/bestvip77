import { PortalHeader } from "@/components/portal/PortalHeader";
import {
  AdCtaSection,
  HeroSection,
  SocialLinksSection,
  TopBanner,
  UrlStripSection,
} from "@/components/portal/PortalSections";
import { PostFeed } from "@/components/portal/PostFeed";
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
    <div className="relative overflow-hidden border-y border-white/4 bg-linear-to-r from-[#FF3B00]/4 via-transparent to-[#FFD700]/4 py-2.5">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="inline-block text-[12px] font-semibold tracking-wider text-[#FFD700]/50">{text}</span>
        <span className="inline-block text-[12px] font-semibold tracking-wider text-[#FFD700]/50 ml-20">{text}</span>
      </div>
    </div>
  );
}

function LaunchHighlights() {
  const items = [
    { title: "快速註冊", body: "전화번호 인증 없이 바로 가입" },
    { title: "即時使用", body: "가입 후 추가 승인 없이 바로 이용" },
    { title: "站內更新", body: "공지와 접속 정보를 수시 갱신" },
    { title: "會員專區", body: "로그인 회원 중심으로 운영" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-white/5 bg-white/2 px-3 py-4 text-center backdrop-blur-md transition-all duration-300 hover:border-[#FFD700]/15 hover:bg-white/4"
        >
          <p className="text-[13px] font-bold text-zinc-100">{item.title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function VipBadge() {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#FFD700]/20 to-transparent" />
      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.4em] text-[#FFD700]/40">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#FFD700]/60"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        VIP EXCLUSIVE
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#FFD700]/60"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </span>
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-[#FFD700]/20 to-transparent" />
    </div>
  );
}

function FeedSectionHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count: number;
}) {
  const heading = title.trim() || "合作商家";
  const description =
    count > 0
      ? subtitle.trim() || "最新上架內容可在下方查看。"
      : "目前尚無刊登內容，最新商家資料正在整理中。 / 현재 등록된 업체 정보를 준비 중입니다.";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-[18px] font-bold text-zinc-100" style={{ fontFamily: "var(--font-noto-tc), var(--font-dm), sans-serif" }}>
          {heading}
        </h2>
        <p className="mt-1 text-[12px] text-zinc-500">{description}</p>
      </div>
      {count > 0 ? (
        <div className="rounded-full border border-[#FF3B00]/20 bg-[#FF3B00]/8 px-3 py-1 text-[11px] font-semibold text-[#FF6B00]">
          {count} listings
        </div>
      ) : null}
    </div>
  );
}

function FooterSection() {
  return (
    <footer className="mt-8 border-t border-white/4 pt-8 pb-4">
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
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/6 px-4 py-3 text-[12px] leading-relaxed text-amber-400">
            資料載入提示：{error}（請確認 .env.local 與資料庫 migration 055·056·058 已套用）
          </div>
        ) : null}

        <TopBanner content={content} />
        <HeroSection content={content} />

        <LaunchHighlights />

        <VipBadge />

        <section className="space-y-4">
          <FeedSectionHeader title={content.feed.title} subtitle={content.feed.subtitle} count={posts.length} />
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
