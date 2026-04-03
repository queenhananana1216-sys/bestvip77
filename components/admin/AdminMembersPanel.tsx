"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminMemberRecord, AdminMemberStatus } from "@/lib/admin/types";

type SearchMode = "all" | "zh" | "ko" | "en" | "chosung" | "email" | "phone";
type CountryFilter = "all" | "KR" | "CN";
type PhoneFilter = "all" | "verified" | "unverified";
type ActivityFilter = "all" | "active7d" | "active30d" | "inactive30d" | "never";
type SortMode = "pendingFirst" | "createdDesc" | "lastSignInDesc" | "lastSeenDesc";

const SEARCH_MODE_OPTIONS: { value: SearchMode; label: string }[] = [
  { value: "all", label: "全部 / 전체" },
  { value: "zh", label: "中文姓名" },
  { value: "ko", label: "韓文姓名 / 한국어" },
  { value: "en", label: "英文姓名 / English" },
  { value: "chosung", label: "初聲 / 초성" },
  { value: "email", label: "電子郵件 / Email" },
  { value: "phone", label: "手機 / Phone" },
];

function formatDateTime(value: string | null, locale = "zh-TW") {
  if (!value) return "—";
  return new Date(value).toLocaleString(locale);
}

function formatRelative(value: string | null) {
  if (!value) return "—";

  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 個月前`;

  return `${Math.floor(months / 12)} 年前`;
}

function statusOrder(status: AdminMemberStatus) {
  if (status === "pending") return 0;
  if (status === "approved") return 1;
  return 2;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhoneSearch(value: string) {
  return value.replace(/[^\d+]/g, "").toLowerCase();
}

function isPhoneVerified(row: AdminMemberRecord) {
  return Boolean(row.phone_verified_at || row.auth_phone_confirmed_at);
}

function matchesActivity(row: AdminMemberRecord, filter: ActivityFilter) {
  if (filter === "all") return true;

  const base = row.last_seen_at ?? row.last_sign_in_at;
  if (!base) {
    return filter === "never";
  }

  const ageMs = Date.now() - new Date(base).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  if (filter === "active7d") return ageMs <= sevenDays;
  if (filter === "active30d") return ageMs <= thirtyDays;
  if (filter === "inactive30d") return ageMs > thirtyDays;

  return false;
}

function matchesSearch(row: AdminMemberRecord, query: string, mode: SearchMode) {
  const text = normalizeSearch(query);
  if (!text) return true;

  const phoneQuery = normalizePhoneSearch(query);
  const allHaystack = [
    row.search_text,
    row.search_chosung,
    row.display_name_zh,
    row.display_name_ko,
    row.display_name_en,
    row.email,
    row.phone_e164,
    row.auth_phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (mode === "all") {
    return allHaystack.includes(text) || (phoneQuery && normalizePhoneSearch(allHaystack).includes(phoneQuery));
  }

  if (mode === "zh") return (row.display_name_zh ?? "").toLowerCase().includes(text);
  if (mode === "ko") return (row.display_name_ko ?? "").toLowerCase().includes(text);
  if (mode === "en") return (row.display_name_en ?? "").toLowerCase().includes(text);
  if (mode === "chosung") return (row.search_chosung ?? "").toLowerCase().includes(text);
  if (mode === "email") return (row.email ?? "").toLowerCase().includes(text);
  if (mode === "phone") {
    const phoneHaystack = `${row.phone_e164 ?? ""} ${row.auth_phone ?? ""}`;
    return normalizePhoneSearch(phoneHaystack).includes(phoneQuery);
  }

  return true;
}

function badgeClass(status: AdminMemberStatus) {
  if (status === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (status === "approved") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

function statusText(status: AdminMemberStatus) {
  if (status === "pending") return "待審 / 대기";
  if (status === "approved") return "已通過 / 승인";
  return "已拒絕 / 거절";
}

function sortRows(rows: AdminMemberRecord[], mode: SortMode) {
  return [...rows].sort((a, b) => {
    if (mode === "pendingFirst") {
      if (statusOrder(a.status) !== statusOrder(b.status)) {
        return statusOrder(a.status) - statusOrder(b.status);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    if (mode === "createdDesc") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    if (mode === "lastSignInDesc") {
      return new Date(b.last_sign_in_at ?? 0).getTime() - new Date(a.last_sign_in_at ?? 0).getTime();
    }

    return new Date(b.last_seen_at ?? 0).getTime() - new Date(a.last_seen_at ?? 0).getTime();
  });
}

function rowCountryLabel(country: string) {
  return country === "CN" ? "中國" : "韓國";
}

function aliasLine(row: AdminMemberRecord) {
  return [row.display_name_ko, row.display_name_en].filter(Boolean).join(" / ");
}

async function readJsonSafely(response: Response) {
  try {
    return (await response.json()) as { error?: string; rows?: AdminMemberRecord[]; row?: AdminMemberRecord };
  } catch {
    return {};
  }
}

export function AdminMembersPanel() {
  const [rows, setRows] = useState<AdminMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [statusFilter, setStatusFilter] = useState<AdminMemberStatus | "all">("all");
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");
  const [phoneFilter, setPhoneFilter] = useState<PhoneFilter>("all");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("pendingFirst");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const response = await fetch("/api/admin/members", { cache: "no-store" });
      const body = await readJsonSafely(response);
      if (!response.ok) {
        throw new Error(body.error ?? "無法載入會員資料。/ 회원 자료를 불러오지 못했습니다.");
      }
      setRows(body.rows ?? []);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "無法載入會員資料。/ 회원 자료를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((row) => row.status === "pending").length;
    const approved = rows.filter((row) => row.status === "approved").length;
    const verifiedPhones = rows.filter((row) => isPhoneVerified(row)).length;
    const active7d = rows.filter((row) => matchesActivity(row, "active7d")).length;

    return { total, pending, approved, verifiedPhones, active7d };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const next = rows.filter((row) => {
      if (!matchesSearch(row, search, searchMode)) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (countryFilter !== "all" && row.carrier_country !== countryFilter) return false;
      if (phoneFilter === "verified" && !isPhoneVerified(row)) return false;
      if (phoneFilter === "unverified" && isPhoneVerified(row)) return false;
      if (!matchesActivity(row, activityFilter)) return false;
      return true;
    });

    return sortRows(next, sortMode);
  }, [activityFilter, countryFilter, phoneFilter, rows, search, searchMode, sortMode, statusFilter]);

  async function patchMember(
    userId: string,
    payload: {
      status?: AdminMemberStatus;
      adminNote?: string;
      displayNameZh?: string;
      displayNameKo?: string | null;
      displayNameEn?: string | null;
    },
  ) {
    setBusyId(userId);
    setErr(null);
    try {
      const response = await fetch(`/api/admin/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await readJsonSafely(response);
      if (!response.ok || !body.row) {
        throw new Error(body.error ?? "會員資料儲存失敗。/ 회원 정보 저장에 실패했습니다.");
      }

      setRows((current) => current.map((row) => (row.user_id === userId ? body.row! : row)));
    } catch (error) {
      setErr(error instanceof Error ? error.message : "會員資料儲存失敗。/ 회원 정보 저장에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-stone-900">會員 CRM</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            以中文為主、韓文為輔的會員管理介面。可搜尋中文、韓文、英文姓名與 초성、Email、Phone，並直接處理審核與備註。
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-50"
        >
          重新整理 / 새로고침
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="全部會員 / 전체" value={stats.total} />
        <StatCard label="待審核 / 대기" value={stats.pending} tone="amber" />
        <StatCard label="已通過 / 승인" value={stats.approved} tone="emerald" />
        <StatCard label="手機已驗證 / SMS 인증" value={stats.verifiedPhones} tone="blue" />
        <StatCard label="7日活躍 / 7일 활동" value={stats.active7d} tone="violet" />
      </div>

      <div
        className="rounded-[14px] border border-stone-200/80 bg-white p-4"
        style={{ boxShadow: "var(--bv-shadow-sm)" }}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr),repeat(5,minmax(0,1fr))]">
          <label className="block text-xs font-medium text-stone-500">
            搜尋 / 검색
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="中文 / 한글 / 초성 / email / phone"
              className="mt-1 w-full rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-sm text-stone-900"
            />
          </label>
          <SelectField
            label="搜尋欄位 / 검색 기준"
            value={searchMode}
            onChange={(value) => setSearchMode(value as SearchMode)}
            options={SEARCH_MODE_OPTIONS}
          />
          <SelectField
            label="狀態 / 상태"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as AdminMemberStatus | "all")}
            options={[
              { value: "all", label: "全部 / 전체" },
              { value: "pending", label: "待審 / pending" },
              { value: "approved", label: "已通過 / approved" },
              { value: "rejected", label: "已拒絕 / rejected" },
            ]}
          />
          <SelectField
            label="地區 / 지역"
            value={countryFilter}
            onChange={(value) => setCountryFilter(value as CountryFilter)}
            options={[
              { value: "all", label: "全部 / 전체" },
              { value: "KR", label: "韓國 / 한국" },
              { value: "CN", label: "中國 / 중국" },
            ]}
          />
          <SelectField
            label="手機驗證 / SMS 인증"
            value={phoneFilter}
            onChange={(value) => setPhoneFilter(value as PhoneFilter)}
            options={[
              { value: "all", label: "全部 / 전체" },
              { value: "verified", label: "已驗證 / 완료" },
              { value: "unverified", label: "未驗證 / 미완료" },
            ]}
          />
          <SelectField
            label="活動 / 활동"
            value={activityFilter}
            onChange={(value) => setActivityFilter(value as ActivityFilter)}
            options={[
              { value: "all", label: "全部 / 전체" },
              { value: "active7d", label: "7日內 / 7일 내" },
              { value: "active30d", label: "30日內 / 30일 내" },
              { value: "inactive30d", label: "30日以上無活動 / 30일 이상 비활성" },
              { value: "never", label: "從未記錄 / 기록 없음" },
            ]}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <SelectField
            label="排序 / 정렬"
            value={sortMode}
            onChange={(value) => setSortMode(value as SortMode)}
            options={[
              { value: "pendingFirst", label: "待審核優先 / 대기 우선" },
              { value: "createdDesc", label: "依註冊時間 / 가입순" },
              { value: "lastSignInDesc", label: "依最後登入 / 마지막 로그인" },
              { value: "lastSeenDesc", label: "依最後活動 / 마지막 활동" },
            ]}
          />
        </div>
      </div>

      {err ? (
        <p
          className="rounded-[12px] border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-900"
          style={{ boxShadow: "var(--bv-shadow-sm)" }}
        >
          {err}
        </p>
      ) : null}

      {loading ? <p className="text-sm text-stone-500">載入會員資料中… / 회원 자료를 불러오는 중…</p> : null}

      {!loading && filteredRows.length === 0 ? (
        <div
          className="rounded-[14px] border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500"
          style={{ boxShadow: "var(--bv-shadow-sm)" }}
        >
          查無符合條件的會員。/ 조건에 맞는 회원이 없습니다.
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredRows.map((row) => (
          <MemberCard
            key={row.user_id}
            row={row}
            busy={busyId === row.user_id}
            onSaveProfile={(payload) => patchMember(row.user_id, payload)}
            onSetStatus={(status) => patchMember(row.user_id, { status })}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "zinc",
}: {
  label: string;
  value: number;
  tone?: "zinc" | "amber" | "emerald" | "blue" | "violet";
}) {
  const toneClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
        : tone === "blue"
          ? "bg-sky-50 text-sky-700 ring-sky-200"
          : tone === "violet"
            ? "bg-violet-50 text-violet-700 ring-violet-200"
            : "bg-zinc-50 text-zinc-700 ring-zinc-200";

  return (
    <div
      className={`rounded-[14px] border px-4 py-4 ring-1 ${toneClass}`}
      style={{ boxShadow: "var(--bv-shadow-sm)" }}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-xs font-medium text-stone-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-sm text-stone-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MemberCard({
  row,
  busy,
  onSaveProfile,
  onSetStatus,
}: {
  row: AdminMemberRecord;
  busy: boolean;
  onSaveProfile: (payload: {
    displayNameZh: string;
    displayNameKo: string | null;
    displayNameEn: string | null;
    adminNote: string;
  }) => Promise<void>;
  onSetStatus: (status: AdminMemberStatus) => Promise<void>;
}) {
  const [displayNameZh, setDisplayNameZh] = useState(row.display_name_zh ?? "");
  const [displayNameKo, setDisplayNameKo] = useState(row.display_name_ko ?? "");
  const [displayNameEn, setDisplayNameEn] = useState(row.display_name_en ?? "");
  const [adminNote, setAdminNote] = useState(row.admin_note ?? "");

  useEffect(() => {
    setDisplayNameZh(row.display_name_zh ?? "");
    setDisplayNameKo(row.display_name_ko ?? "");
    setDisplayNameEn(row.display_name_en ?? "");
    setAdminNote(row.admin_note ?? "");
  }, [row]);

  const dirty =
    displayNameZh !== (row.display_name_zh ?? "") ||
    displayNameKo !== (row.display_name_ko ?? "") ||
    displayNameEn !== (row.display_name_en ?? "") ||
    adminNote !== (row.admin_note ?? "");

  return (
    <article
      className="rounded-[14px] border border-stone-200/80 bg-white p-5"
      style={{ boxShadow: "var(--bv-shadow-sm)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-stone-900">{row.display_name_zh ?? row.email ?? row.user_id}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${badgeClass(row.status)}`}>{statusText(row.status)}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                isPhoneVerified(row) ? "bg-sky-50 text-sky-700 ring-sky-200" : "bg-zinc-50 text-zinc-600 ring-zinc-200"
              }`}
            >
              {isPhoneVerified(row) ? "SMS 已驗證" : "SMS 未驗證"}
            </span>
          </div>
          {aliasLine(row) ? <p className="mt-1 text-sm text-stone-500">{aliasLine(row)}</p> : null}
          <p className="mt-1 font-mono text-xs text-stone-400">{row.user_id}</p>
        </div>
        <div className="text-right text-xs text-stone-500">
          <p>最後登入 / 최근 로그인: {formatRelative(row.last_sign_in_at)}</p>
          <p>最後活動 / 최근 활동: {formatRelative(row.last_seen_at)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Email" value={row.email ?? "—"} mono />
        <InfoItem label="手機 / Phone" value={row.phone_e164 ?? row.auth_phone ?? "—"} mono />
        <InfoItem label="地區 / 통신사" value={`${rowCountryLabel(row.carrier_country)} / ${row.carrier_label ?? "—"}`} />
        <InfoItem label="初聲 / 초성" value={row.search_chosung ?? "—"} />
        <InfoItem label="註冊時間 / 가입일" value={formatDateTime(row.created_at)} />
        <InfoItem label="審核時間 / 처리일" value={formatDateTime(row.reviewed_at)} />
        <InfoItem label="最後登入 / 로그인" value={formatDateTime(row.last_sign_in_at)} />
        <InfoItem label="最後活動 / 활동" value={formatDateTime(row.last_seen_at)} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <label className="block text-xs font-medium text-stone-500">
          中文姓名 / 중국어 이름
          <input
            value={displayNameZh}
            onChange={(e) => setDisplayNameZh(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-sm text-stone-900"
          />
        </label>
        <label className="block text-xs font-medium text-stone-500">
          韓文姓名 / 한국어 이름
          <input
            value={displayNameKo}
            onChange={(e) => setDisplayNameKo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-sm text-stone-900"
          />
        </label>
        <label className="block text-xs font-medium text-stone-500">
          英文姓名 / English name
          <input
            value={displayNameEn}
            onChange={(e) => setDisplayNameEn(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-sm text-stone-900"
          />
        </label>
      </div>

      <label className="mt-3 block text-xs font-medium text-stone-500">
        管理員備註 / 관리자 메모
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-stone-200/80 bg-stone-50 px-3 py-2 text-sm text-stone-900"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={() =>
              void onSaveProfile({
                displayNameZh,
                displayNameKo: displayNameKo.trim() || null,
                displayNameEn: displayNameEn.trim() || null,
                adminNote,
              })
            }
            className="rounded-xl bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {busy ? "保存中…" : "儲存資料 / 저장"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {row.status !== "approved" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSetStatus("approved")}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              審核通過 / 승인
            </button>
          ) : null}
          {row.status !== "rejected" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSetStatus("rejected")}
              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              拒絕 / 거절
            </button>
          ) : null}
          {row.status !== "pending" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSetStatus("pending")}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
            >
              改回待審 / 대기
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function InfoItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-[12px] border border-stone-200/80 bg-stone-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className={`mt-1 text-sm text-stone-800 ${mono ? "break-all font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}
