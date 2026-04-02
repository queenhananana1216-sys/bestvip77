import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const DEMO = [
  {
    title: "金玉滿堂 KTV / 금옥만당 노래방",
    body_text:
      "包廂寬敞、音響頂級，適合朋友聚會或商務接待。提供中韓日歌曲庫，另有自助餐點與飲品供應。\n\n넓은 룸과 최고급 사운드 시스템을 갖춘 노래방입니다. 중·한·일 노래 데이터베이스를 지원하며, 뷔페와 음료도 제공합니다.",
    price_info: "包廂 ¥288起 / 룸 288위안~",
    is_pinned: true,
    profile_image_url: "https://picsum.photos/seed/bv77-ktv/400/400",
    gallery_image_urls: [
      "https://picsum.photos/seed/bv77-ktv-1/800/600",
      "https://picsum.photos/seed/bv77-ktv-2/800/600",
      "https://picsum.photos/seed/bv77-ktv-3/800/600",
    ],
    sort_order: 100,
  },
  {
    title: "天上人間 足浴養生 / 천상인간 발마사지",
    body_text:
      "結合中醫經絡理論，提供足浴、全身按摩、刮痧拔罐等服務。環境優雅，技師經驗豐富。\n\n중의학 경락 이론에 기반한 족욕·전신 마사지·부항 서비스를 제공합니다. 우아한 환경과 경험 풍부한 테라피스트가 함께합니다.",
    price_info: "足浴60分 ¥168 / 족욕 60분 168위안",
    is_pinned: false,
    profile_image_url: "https://picsum.photos/seed/bv77-spa/400/400",
    gallery_image_urls: [
      "https://picsum.photos/seed/bv77-spa-1/800/600",
      "https://picsum.photos/seed/bv77-spa-2/800/600",
    ],
    sort_order: 90,
  },
  {
    title: "麗景灣 美容美髮 / 여경만 미용실",
    body_text:
      "韓式半永久化妝、日式美甲、燙染護髮一站式服務。預約制，歡迎私信或電話諮詢。\n\n한식 반영구 메이크업, 일본식 네일아트, 펌·염색·헤어케어를 원스톱으로 제공합니다. 예약제로 운영하며 DM 또는 전화 문의 환영합니다.",
    price_info: "剪髮 ¥80 / 커트 80위안",
    is_pinned: false,
    profile_image_url: "https://picsum.photos/seed/bv77-salon/400/400",
    gallery_image_urls: [
      "https://picsum.photos/seed/bv77-salon-1/800/600",
      "https://picsum.photos/seed/bv77-salon-2/800/600",
      "https://picsum.photos/seed/bv77-salon-3/800/600",
    ],
    sort_order: 80,
  },
  {
    title: "龍門客棧 餐飲 / 용문객잔 중식당",
    body_text:
      "正宗川菜、粵菜、東北菜，兼顧韓國人口味微調。支援外送與包場服務，適合聚餐、宴會。\n\n정통 사천·광동·동북 요리를 한국인 입맛에 맞게 조정해 제공합니다. 배달·대관 서비스도 가능하며, 모임·연회에 적합합니다.",
    price_info: "人均 ¥60-120 / 인당 60~120위안",
    is_pinned: false,
    profile_image_url: "https://picsum.photos/seed/bv77-food/400/400",
    gallery_image_urls: [
      "https://picsum.photos/seed/bv77-food-1/800/600",
      "https://picsum.photos/seed/bv77-food-2/800/600",
    ],
    sort_order: 70,
  },
];

console.log("Inserting demo merchant cards...");
const { data, error } = await sb
  .from("bestvip77_posts")
  .upsert(DEMO, { onConflict: "title", ignoreDuplicates: true })
  .select("id,title");

if (error) {
  console.error("Insert error:", error.message);
  process.exit(1);
}
console.log(`Done — ${data?.length ?? 0} cards inserted/updated.`);
for (const row of data ?? []) {
  console.log(`  ${row.id}  ${row.title}`);
}
