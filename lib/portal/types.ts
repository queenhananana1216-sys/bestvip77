export type UrlStripTone = "green" | "blue" | "orange" | "red" | "gray";

export interface PortalUrlItem {
  label: string;
  status: string;
  tone: UrlStripTone;
  href: string;
}

export interface PortalSiteContent {
  siteName: string;
  header: {
    registerLabel: string;
    loginLabel: string;
    logoutLabel: string;
    showSearchIcon: boolean;
    searchHref?: string;
  };
  topBanner: {
    imageUrl: string;
    linkUrl: string;
    alt: string;
  };
  hero: {
    eyebrow: string;
    mainBrand: string;
    versionBubbles: string[];
  };
  urlStrip: {
    heading: string;
    items: PortalUrlItem[];
  };
  telegram: {
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };
  line: {
    title: string;
    body: string;
    ctaLabel: string;
    ctaHref: string;
  };
  adCta: {
    title: string;
    body: string;
    buttonLabel: string;
    buttonHref: string;
  };
  /** 피드(업체 카드) 구역 제목 — 관리자 JSON에서 수정 */
  feed: {
    title: string;
    subtitle: string;
  };
}

export const defaultPortalContent: PortalSiteContent = {
  siteName: "bestvip77",
  header: {
    registerLabel: "註冊",
    loginLabel: "登入",
    logoutLabel: "登出",
    showSearchIcon: true,
    searchHref: "",
  },
  topBanner: { imageUrl: "", linkUrl: "", alt: "" },
  hero: {
    eyebrow: "最新網址發布",
    mainBrand: "bestvip77",
    versionBubbles: [],
  },
  /** 비어 있으면 화면에 안 나옴. 필요 시만 JSON에서 urlStrip.items 추가 (백업 도메인·비상 링크용) */
  urlStrip: {
    heading: "快捷入口",
    items: [],
  },
  telegram: {
    title: "官方 Telegram",
    body: "取得最新網址與公告。",
    ctaLabel: "加入頻道",
    ctaHref: "https://t.me",
  },
  line: {
    title: "官方 LINE",
    body: "加好友隨時聯繫客服。",
    ctaLabel: "加入好友",
    ctaHref: "",
  },
  adCta: {
    title: "廣告發布",
    body: "需要刊登廣告？點擊下方由專人協助。",
    buttonLabel: "立即聯繫",
    buttonHref: "https://example.com",
  },
  feed: {
    title: "合作商家",
    subtitle: "圖片與介紹可在管理後台「광고 카드」分頁編輯。",
  },
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** DB JSON과 기본값 병합 (누락 키 방지) */
export function mergePortalContent(raw: unknown): PortalSiteContent {
  const base = structuredClone(defaultPortalContent);
  if (!isPlainObject(raw)) return base;

  const o = raw as Record<string, unknown>;
  if (typeof o.siteName === "string") base.siteName = o.siteName;

  if (isPlainObject(o.header)) {
    const h = o.header;
    if (typeof h.registerLabel === "string") base.header.registerLabel = h.registerLabel;
    if (typeof h.loginLabel === "string") base.header.loginLabel = h.loginLabel;
    if (typeof h.logoutLabel === "string") base.header.logoutLabel = h.logoutLabel;
    if (typeof h.showSearchIcon === "boolean") base.header.showSearchIcon = h.showSearchIcon;
    if (typeof h.searchHref === "string") base.header.searchHref = h.searchHref;
  }

  if (isPlainObject(o.topBanner)) {
    const t = o.topBanner;
    if (typeof t.imageUrl === "string") base.topBanner.imageUrl = t.imageUrl;
    if (typeof t.linkUrl === "string") base.topBanner.linkUrl = t.linkUrl;
    if (typeof t.alt === "string") base.topBanner.alt = t.alt;
  }

  if (isPlainObject(o.hero)) {
    const h = o.hero;
    if (typeof h.eyebrow === "string") base.hero.eyebrow = h.eyebrow;
    if (typeof h.mainBrand === "string") base.hero.mainBrand = h.mainBrand;
    if (Array.isArray(h.versionBubbles) && h.versionBubbles.every((x) => typeof x === "string")) {
      base.hero.versionBubbles = h.versionBubbles as string[];
    }
  }

  if (isPlainObject(o.urlStrip)) {
    const u = o.urlStrip;
    if (typeof u.heading === "string") base.urlStrip.heading = u.heading;
    if (Array.isArray(u.items)) {
      const items: PortalUrlItem[] = [];
      for (const it of u.items) {
        if (!isPlainObject(it)) continue;
        const tone = it.tone;
        const validTone: UrlStripTone =
          tone === "green" || tone === "blue" || tone === "orange" || tone === "red" || tone === "gray"
            ? tone
            : "gray";
        items.push({
          label: typeof it.label === "string" ? it.label : "",
          status: typeof it.status === "string" ? it.status : "",
          tone: validTone,
          href: typeof it.href === "string" ? it.href : "",
        });
      }
      base.urlStrip.items = items;
    }
  }

  if (isPlainObject(o.feed)) {
    const f = o.feed;
    if (typeof f.title === "string") base.feed.title = f.title;
    if (typeof f.subtitle === "string") base.feed.subtitle = f.subtitle;
  }

  if (isPlainObject(o.telegram)) {
    const t = o.telegram;
    if (typeof t.title === "string") base.telegram.title = t.title;
    if (typeof t.body === "string") base.telegram.body = t.body;
    if (typeof t.ctaLabel === "string") base.telegram.ctaLabel = t.ctaLabel;
    if (typeof t.ctaHref === "string") base.telegram.ctaHref = t.ctaHref;
  }

  if (isPlainObject(o.line)) {
    const l = o.line;
    if (typeof l.title === "string") base.line.title = l.title;
    if (typeof l.body === "string") base.line.body = l.body;
    if (typeof l.ctaLabel === "string") base.line.ctaLabel = l.ctaLabel;
    if (typeof l.ctaHref === "string") base.line.ctaHref = l.ctaHref;
  }

  if (isPlainObject(o.adCta)) {
    const a = o.adCta;
    if (typeof a.title === "string") base.adCta.title = a.title;
    if (typeof a.body === "string") base.adCta.body = a.body;
    if (typeof a.buttonLabel === "string") base.adCta.buttonLabel = a.buttonLabel;
    if (typeof a.buttonHref === "string") base.adCta.buttonHref = a.buttonHref;
  }

  return base;
}

export interface PortalPostRow {
  id: string;
  title: string;
  body_text: string;
  price_info: string;
  is_pinned: boolean;
  profile_image_url: string;
  gallery_image_urls: string[];
  video_url?: string;
  sort_order: number;
  created_at: string;
}

export interface PortalCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}
