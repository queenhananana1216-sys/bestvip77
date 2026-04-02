"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { AdminMembersPanel } from "@/components/admin/AdminMembersPanel";
import {
  defaultPortalContent,
  mergePortalContent,
  type PortalPostRow,
  type PortalSiteContent,
} from "@/lib/portal/types";

type Props = {
  initialContent: PortalSiteContent;
  initialPosts: PortalPostRow[];
};

export default function AdminClient({ initialContent, initialPosts }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"site" | "posts" | "members">("site");
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initialContent, null, 2));
  const [posts, setPosts] = useState(initialPosts);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parsedPreview = useMemo(() => {
    try {
      return mergePortalContent(JSON.parse(jsonText) as unknown);
    } catch {
      return null;
    }
  }, [jsonText]);

  const activeTab = useMemo(
    () =>
      ({
        site: {
          eyebrow: "Content orchestration",
          title: "站點設定 / 사이트 설정",
          body: "首頁文案、Telegram、Banner、CTA、備援連結都在這裡集中維護。不是工程感後台，而是營運用編輯桌面。",
        },
        posts: {
          eyebrow: "Merchant deck",
          title: "廣告卡片 / 광고 카드",
          body: "商家卡片延續前台的溫暖石色系，這裡只保留必要欄位，避免像表單系統一樣生硬。",
        },
        members: {
          eyebrow: "Member control",
          title: "會員管理 / CRM",
          body: "中文優先、韓文輔助的會員管理區，可看審核狀態、活動紀錄與搜尋結果，保持前台同一套氣質。",
        },
      })[tab],
    [tab],
  );

  async function saveSiteJson() {
    setErr(null);
    setMsg(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setErr("JSON 格式錯誤 / JSON 형식 오류");
      return;
    }
    const content = mergePortalContent(parsed);
    setBusy(true);
    try {
      const sb = createBrowserClient();
      const { error } = await sb
        .from("bestvip77_site_settings")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
      setJsonText(JSON.stringify(content, null, 2));
      setMsg("站點設定已儲存。/ 사이트 설정을 저장했습니다.");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "儲存失敗 / 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  function resetSiteJson() {
    setJsonText(JSON.stringify(defaultPortalContent, null, 2));
  }

  async function refreshPosts() {
    const sb = createBrowserClient();
    const { data, error } = await sb
      .from("bestvip77_posts")
      .select(
        "id,title,body_text,price_info,is_pinned,profile_image_url,gallery_image_urls,video_url,sort_order,created_at",
      )
      .order("is_pinned", { ascending: false })
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as PortalPostRow[]);
  }

  async function addPost() {
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { data, error } = await sb
        .from("bestvip77_posts")
        .insert({
          title: "新標題 / 새 카드",
          body_text: "",
          price_info: "",
          is_pinned: false,
          profile_image_url: "",
          gallery_image_urls: [],
          video_url: "",
          sort_order: 0,
        })
        .select(
          "id,title,body_text,price_info,is_pinned,profile_image_url,gallery_image_urls,video_url,sort_order,created_at",
        )
        .single();
      if (error) throw error;
      setPosts((p) => [data as PortalPostRow, ...p]);
      setMsg("已新增卡片。/ 게시물을 추가했습니다.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "新增失敗 / 추가 실패");
    } finally {
      setBusy(false);
    }
  }

  async function seedDemoPosts() {
    if (!confirm("插入4筆示範商家資料？現有卡片不受影響。\n데모 업체 4개를 추가합니다. 기존 카드는 영향 없습니다.")) return;
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const demos = [
        {
          title: "金玉滿堂 KTV / 금옥만당 노래방",
          body_text: "包廂寬敞、音響頂級，適合朋友聚會或商務接待。提供中韓日歌曲庫。\n\n넓은 룸과 최고급 사운드 시스템. 중·한·일 노래 데이터베이스 지원.",
          price_info: "包廂 ¥288起 / 룸 288위안~",
          is_pinned: true,
          profile_image_url: "https://picsum.photos/seed/bv77-ktv/400/400",
          gallery_image_urls: ["https://picsum.photos/seed/bv77-ktv-1/800/600", "https://picsum.photos/seed/bv77-ktv-2/800/600", "https://picsum.photos/seed/bv77-ktv-3/800/600"],
          video_url: "",
          sort_order: 100,
        },
        {
          title: "天上人間 足浴養生 / 천상인간 발마사지",
          body_text: "結合中醫經絡理論，提供足浴、全身按摩、刮痧拔罐等服務。\n\n중의학 경락 기반 족욕·전신 마사지·부항 서비스.",
          price_info: "足浴60分 ¥168 / 족욕 60분 168위안",
          is_pinned: false,
          profile_image_url: "https://picsum.photos/seed/bv77-spa/400/400",
          gallery_image_urls: ["https://picsum.photos/seed/bv77-spa-1/800/600", "https://picsum.photos/seed/bv77-spa-2/800/600"],
          video_url: "",
          sort_order: 90,
        },
        {
          title: "麗景灣 美容美髮 / 여경만 미용실",
          body_text: "韓式半永久化妝、日式美甲、燙染護髮一站式服務。\n\n한식 반영구·일본식 네일·펌·염색 원스톱 서비스.",
          price_info: "剪髮 ¥80 / 커트 80위안",
          is_pinned: false,
          profile_image_url: "https://picsum.photos/seed/bv77-salon/400/400",
          gallery_image_urls: ["https://picsum.photos/seed/bv77-salon-1/800/600", "https://picsum.photos/seed/bv77-salon-2/800/600", "https://picsum.photos/seed/bv77-salon-3/800/600"],
          video_url: "",
          sort_order: 80,
        },
        {
          title: "龍門客棧 餐飲 / 용문객잔 중식당",
          body_text: "正宗川菜、粵菜、東北菜，兼顧韓國人口味。支援外送與包場。\n\n정통 사천·광동·동북 요리. 배달·대관 가능.",
          price_info: "人均 ¥60-120 / 인당 60~120위안",
          is_pinned: false,
          profile_image_url: "https://picsum.photos/seed/bv77-food/400/400",
          gallery_image_urls: ["https://picsum.photos/seed/bv77-food-1/800/600", "https://picsum.photos/seed/bv77-food-2/800/600"],
          video_url: "",
          sort_order: 70,
        },
      ];
      const { data, error } = await sb
        .from("bestvip77_posts")
        .insert(demos)
        .select("id,title,body_text,price_info,is_pinned,profile_image_url,gallery_image_urls,video_url,sort_order,created_at");
      if (error) throw error;
      setPosts((p) => [...(data as PortalPostRow[]), ...p]);
      setMsg(`已插入 ${data?.length ?? 0} 筆示範資料。/ 데모 ${data?.length ?? 0}개를 추가했습니다.`);
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "插入示範資料失敗 / 데모 삽입 실패");
    } finally {
      setBusy(false);
    }
  }

  async function savePost(row: PortalPostRow) {
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { error } = await sb
        .from("bestvip77_posts")
        .update({
          title: row.title,
          body_text: row.body_text,
          price_info: row.price_info,
          is_pinned: row.is_pinned,
          profile_image_url: row.profile_image_url,
          gallery_image_urls: row.gallery_image_urls,
          video_url: row.video_url,
          sort_order: row.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (error) throw error;
      setMsg("已儲存。/ 저장했습니다.");
      await refreshPosts();
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "儲存失敗 / 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("確定刪除此卡片與留言嗎？ / 이 게시물과 댓글을 삭제할까요?")) return;
    setBusy(true);
    setErr(null);
    try {
      const sb = createBrowserClient();
      const { error } = await sb.from("bestvip77_posts").delete().eq("id", id);
      if (error) throw error;
      setPosts((p) => p.filter((x) => x.id !== id));
      setMsg("已刪除。/ 삭제했습니다.");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "刪除失敗 / 삭제 실패");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const sb = createBrowserClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh pb-16 text-stone-900">
      <header
        className="sticky top-0 z-20 border-b border-white/6 backdrop-blur-md"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,17,0.97) 0%, rgba(20,18,17,0.92) 100%)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-200/75"
                style={{ fontFamily: "var(--font-dm), sans-serif" }}
              >
                bestvip77
              </p>
              <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.03em] text-stone-50">管理後台</h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-stone-400">
                與前台同一套暖石紙感與深色標頭，讓營運編輯區看起來像品牌的一部分，而不是分離的工具頁。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-sm font-medium text-stone-200 transition hover:border-white/14 hover:bg-white/7"
              >
                公開站點 / 공개
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-50 transition hover:border-orange-400/35 hover:bg-orange-500/15"
              >
                登出 / 로그아웃
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 rounded-[14px] border border-white/8 bg-white/4 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <AdminTabButton active={tab === "site"} onClick={() => setTab("site")}>
              站點設定 / 사이트
            </AdminTabButton>
            <AdminTabButton active={tab === "posts"} onClick={() => setTab("posts")}>
              廣告卡片 / 광고
            </AdminTabButton>
            <AdminTabButton active={tab === "members"} onClick={() => setTab("members")}>
              會員管理 / CRM
            </AdminTabButton>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <section
          className="rounded-[14px] border border-stone-200/80 bg-(--bv-surface) px-5 py-5"
          style={{ boxShadow: "var(--bv-shadow-sm)" }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.24em] text-orange-700/80"
            style={{ fontFamily: "var(--font-dm), sans-serif" }}
          >
            {activeTab.eyebrow}
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-stone-900">{activeTab.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-stone-600">{activeTab.body}</p>
            </div>
            <div className="rounded-[12px] border border-stone-200/90 bg-(--bv-surface-2) px-4 py-3 text-[12px] leading-relaxed text-stone-500">
              <p>中文主導，韓文補充。</p>
              <p className="mt-1">퍼블릭 사이트와 같은 톤으로 운영 화면을 정리했습니다.</p>
            </div>
          </div>
        </section>

        {msg ? (
          <p
            className="mt-4 rounded-[12px] border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900"
            style={{ boxShadow: "var(--bv-shadow-sm)" }}
          >
            {msg}
          </p>
        ) : null}
        {err ? (
          <p
            className="mt-4 rounded-[12px] border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-900"
            style={{ boxShadow: "var(--bv-shadow-sm)" }}
          >
            {err}
          </p>
        ) : null}

        <div className="mt-5">
          {tab === "members" ? (
            <AdminMembersPanel />
          ) : tab === "site" ? (
            <section
              className="space-y-4 rounded-[14px] border border-stone-200/80 bg-(--bv-surface) p-5"
              style={{ boxShadow: "var(--bv-shadow-sm)" }}
            >
              <p className="text-sm leading-relaxed text-stone-600">
                首頁標題、Telegram、CTA、Banner、feed 區塊文案可在下方 JSON 直接修改。<strong>商家圖片、名稱、介紹</strong>
                請到「廣告卡片」編輯。
              </p>
              <p className="text-xs leading-relaxed text-stone-500">
                한국어 안내: <code className="rounded bg-stone-100 px-1">urlStrip.items</code>는 비상용 백업 링크 줄입니다.
                비우면 홈에 보이지 않습니다.
              </p>
              {parsedPreview ? (
                <p className="text-xs text-emerald-700">JSON 格式正常，可儲存。/ JSON 파싱 OK</p>
              ) : (
                <p className="text-xs text-red-600">JSON 格式錯誤，無法儲存。/ JSON 파싱 실패</p>
              )}
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                spellCheck={false}
                className="h-[min(70vh,560px)] w-full rounded-[13px] border border-stone-200/80 bg-(--bv-surface-2) p-4 font-mono text-sm text-stone-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !parsedPreview}
                  onClick={() => void saveSiteJson()}
                  className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  儲存 / 저장
                </button>
                <button
                  type="button"
                  onClick={resetSiteJson}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
                >
                  重設為預設值 / 기본값
                </button>
              </div>
            </section>
          ) : (
            <section
              className="space-y-6 rounded-[14px] border border-stone-200/80 bg-(--bv-surface) p-5"
              style={{ boxShadow: "var(--bv-shadow-sm)" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
                  商家 / 廣告卡片編輯區。可修改標題、介紹、價格、主圖與多張圖片網址，卡片視覺會延續前台的暖石色與柔和邊界。
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void addPost()}
                    className="rounded-xl bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
                  >
                    新增卡片 / 새 카드
                  </button>
                  {posts.length === 0 ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void seedDemoPosts()}
                      className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-900 transition hover:bg-orange-100 disabled:opacity-50"
                    >
                      插入示範 / 데모 삽입
                    </button>
                  ) : null}
                </div>
              </div>
              <ul className="space-y-8">
                {posts.map((p) => (
                  <PostEditor key={p.id} row={p} busy={busy} onSave={savePost} onDelete={deletePost} />
                ))}
              </ul>
              {posts.length === 0 ? <p className="text-sm text-stone-500">目前沒有卡片，請按「新增卡片」。/ 카드가 없습니다.</p> : null}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-(--bv-surface) text-stone-900 shadow-[0_10px_22px_-18px_rgba(0,0,0,0.55)]"
          : "text-stone-300 hover:bg-white/5 hover:text-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

function PostEditor({
  row,
  busy,
  onSave,
  onDelete,
}: {
  row: PortalPostRow;
  busy: boolean;
  onSave: (r: PortalPostRow) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(row);
  useEffect(() => {
    setDraft(row);
  }, [row]);
  const galleryStr = draft.gallery_image_urls.join("\n");

  return (
    <li
      className="rounded-[14px] border border-stone-200/80 bg-(--bv-surface) p-5"
      style={{ boxShadow: "var(--bv-shadow-sm)" }}
    >
      <div className="mb-4 rounded-[12px] border border-sky-200/60 bg-sky-50/50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700/80">欄位對照 / 필드 매핑 안내</p>
        <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-sky-900/80">
          <li><strong>卡片標題</strong> → 商家列表上的名稱（粗體） / 업체 리스트 이름</li>
          <li><strong>主圖 URL</strong> → 商家列表的封面照片 / 리스트 대표 이미지</li>
          <li><strong>價格</strong> → 封面下方的價格標籤 / 카드 아래 가격 텍스트</li>
          <li><strong>介紹文案</strong> → 點擊商家後顯示的詳細說明 / 클릭 시 상세 설명</li>
          <li><strong>圖片集 URL</strong> → 點擊商家後顯示的照片集（2~3張） / 상세 갤러리</li>
          <li><strong>影片 URL</strong> → 點擊商家後播放的短影片（YouTube Shorts / MP4） / 상세 영상</li>
          <li><strong>置頂</strong> → 封面左上角「置頂」標籤 / 상단 고정 배지</li>
          <li><strong>排序</strong> → 數字越大排越前面 / 숫자가 클수록 앞에 표시</li>
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-stone-500 sm:col-span-2">
          <span className="flex items-center gap-2">
            卡片標題 / 업체명·광고 제목
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">→ 리스트 이름</span>
          </span>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="예: 金玉滿堂 KTV / 금옥만당 노래방"
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-stone-500 sm:col-span-2">
          <span className="flex items-center gap-2">
            介紹文案 / 업체 설명
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">→ 클릭 시 상세</span>
          </span>
          <textarea
            value={draft.body_text ?? ""}
            onChange={(e) => setDraft({ ...draft, body_text: e.target.value })}
            rows={4}
            placeholder="中文介紹 + 한국어 설명을 함께 넣으세요"
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-stone-500">
          <span className="flex items-center gap-2">
            價格 / 한 줄 정보
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">→ 카드 가격</span>
          </span>
          <input
            value={draft.price_info}
            onChange={(e) => setDraft({ ...draft, price_info: e.target.value })}
            placeholder="예: 包廂 ¥288起 / 룸 288위안~"
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-stone-500">
          <span className="flex items-center gap-2">
            主圖 URL / 프로필 이미지
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">→ 대표 사진</span>
          </span>
          <input
            value={draft.profile_image_url}
            onChange={(e) => setDraft({ ...draft, profile_image_url: e.target.value })}
            placeholder="https://example.com/shop-photo.jpg"
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-stone-500 sm:pt-5">
          <input
            type="checkbox"
            checked={draft.is_pinned}
            onChange={(e) => setDraft({ ...draft, is_pinned: e.target.checked })}
          />
          置頂 / 상단 고정
        </label>
        <label className="block text-xs font-medium text-stone-500">
          排序 / 정렬（數字越大越靠前 / 숫자 클수록 앞에）
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs font-medium text-stone-500">
        <span className="flex items-center gap-2">
          圖片集 URL / 갤러리 이미지 URL
          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">→ 상세 갤러리 (한 줄에 하나씩)</span>
        </span>
        <textarea
          value={galleryStr}
          onChange={(e) => {
            const parts = e.target.value
              .split(/[\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean);
            setDraft({ ...draft, gallery_image_urls: parts });
          }}
          rows={3}
          placeholder={"https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg"}
          className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="mt-3 block text-xs font-medium text-stone-500">
        <span className="flex items-center gap-2">
          影片 URL / 영상 URL
          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] text-sky-700">→ 상세 영상 (YouTube Shorts / MP4)</span>
        </span>
        <input
          value={draft.video_url ?? ""}
          onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
          placeholder="https://youtube.com/shorts/xxxx 또는 https://example.com/video.mp4"
          className="mt-1 w-full rounded-xl border border-stone-200/80 bg-(--bv-surface-2) px-3 py-2 text-sm"
        />
      </label>

      {draft.profile_image_url?.trim() ? (
        <div className="mt-3 rounded-[12px] border border-stone-200/80 bg-(--bv-surface-2) p-3">
          <p className="mb-2 text-[11px] font-medium text-stone-500">主圖預覽 / 대표 이미지 미리보기</p>
          <div className="relative aspect-video w-full max-w-[200px] overflow-hidden rounded-lg bg-stone-200">
            <Image src={draft.profile_image_url} alt="preview" fill className="object-cover" sizes="200px" unoptimized />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSave(draft)}
          className="rounded-xl bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          儲存卡片 / 저장
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onDelete(draft.id)}
          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-50"
        >
          刪除 / 삭제
        </button>
      </div>
    </li>
  );
}
