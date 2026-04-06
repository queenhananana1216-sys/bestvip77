const ADMIN_EMAIL_DOMAIN = "bestvip77.admin.local";
const MEMBER_EMAIL_DOMAIN = "bestvip77.user.local";

export const ADMIN_USERNAME_MAP = {
  admin123: `admin123@${ADMIN_EMAIL_DOMAIN}`,
  admin456: `admin456@${ADMIN_EMAIL_DOMAIN}`,
} as const;

export type ReservedAdminUsername = keyof typeof ADMIN_USERNAME_MAP;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

const EMAIL_IN_TEXT_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/**
 * 붙여넣기용: mailto:, <email>, 따옴표, NBSP, 첫 줄만 등 정리 후 이메일 또는 admin123 형 식별자 반환
 */
export function normalizeLoginIdentifierInput(raw: string): string {
  const s = String(raw)
    .replace(/\u200b/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/^\ufeff/, "")
    .trim();

  const lines = s.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
  const chunks = lines.length > 0 ? lines : [s];

  for (const chunk of chunks) {
    let t = chunk;
    const mailto = t.match(/mailto:\s*<?([^>\s"']+)/i);
    if (mailto?.[1]) t = mailto[1];
    const angle = t.match(/<([^>\s]+@[^>\s]+)>/);
    if (angle?.[1]) t = angle[1];
    t = t.replace(/^[\s"'`「『]+|[\s"'`」』]+$/g, "").trim();

    const found = t.match(EMAIL_IN_TEXT_RE);
    if (found) return found[0].toLowerCase();

    if (isReservedAdminUsername(t)) return normalize(t);
  }

  let rest = chunks[0] ?? s;
  const mailto = rest.match(/mailto:\s*<?([^>\s"']+)/i);
  if (mailto?.[1]) rest = mailto[1];
  rest = rest.replace(/^[\s"'`「『]+|[\s"'`」』]+$/g, "").trim();
  return normalize(rest);
}

export function isEmailLike(value: string) {
  const normalized = normalize(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function isReservedAdminUsername(value: string) {
  const normalized = normalize(value);
  return normalized in ADMIN_USERNAME_MAP;
}

export function isAdminEmailDomain(value: string) {
  return normalize(value).endsWith(`@${ADMIN_EMAIL_DOMAIN}`);
}

export function isReservedAdminEmail(value: string) {
  const normalized = normalize(value);
  return Object.values(ADMIN_USERNAME_MAP).includes(normalized as (typeof ADMIN_USERNAME_MAP)[ReservedAdminUsername]);
}

export function isMemberLoginId(value: string) {
  const normalized = normalize(value);
  return /^[a-z0-9](?:[a-z0-9._-]{2,28}[a-z0-9])?$/.test(normalized);
}

export function toMemberAuthEmail(loginId: string) {
  return `${normalize(loginId)}@${MEMBER_EMAIL_DOMAIN}`;
}

export function fromMemberAuthEmail(email: string) {
  const normalized = normalize(email);
  const suffix = `@${MEMBER_EMAIL_DOMAIN}`;
  if (!normalized.endsWith(suffix)) return null;
  const loginId = normalized.slice(0, -suffix.length);
  return isMemberLoginId(loginId) ? loginId : null;
}

export function validateMemberLoginId(value: string) {
  const normalized = normalizeLoginIdentifierInput(value);
  if (!normalized) {
    return {
      ok: false as const,
      error: "아이디를 입력해 주세요. (영문 소문자/숫자, 4~30자)",
    };
  }
  if (isEmailLike(normalized)) {
    return {
      ok: false as const,
      error: "회원가입은 이메일이 아닌 아이디로 진행해 주세요.",
    };
  }
  if (isReservedAdminUsername(normalized) || isReservedAdminEmail(normalized) || isAdminEmailDomain(normalized)) {
    return {
      ok: false as const,
      error: "해당 아이디는 관리자 전용으로 사용할 수 없습니다.",
    };
  }
  if (!isMemberLoginId(normalized)) {
    return {
      ok: false as const,
      error: "아이디는 영문 소문자/숫자/._- 조합으로 4~30자여야 합니다.",
    };
  }
  return {
    ok: true as const,
    loginId: normalized,
    email: toMemberAuthEmail(normalized),
  };
}

export function resolveAdminLoginIdentifier(value: string) {
  const normalized = normalize(value);
  if (normalized in ADMIN_USERNAME_MAP) {
    return ADMIN_USERNAME_MAP[normalized as ReservedAdminUsername];
  }
  return value.trim();
}

export function validateLoginIdentifier(value: string) {
  const trimmed = normalizeLoginIdentifierInput(value);
  if (!trimmed) {
    return { ok: false as const, error: "Email 또는 아이디를 입력해 주세요." };
  }

  if (isReservedAdminUsername(trimmed)) {
    return { ok: true as const, email: resolveAdminLoginIdentifier(trimmed) };
  }

  if (isReservedAdminEmail(trimmed) || isAdminEmailDomain(trimmed)) {
    return { ok: true as const, email: trimmed };
  }

  if (isEmailLike(trimmed)) {
    return { ok: true as const, email: trimmed };
  }

  if (isMemberLoginId(trimmed)) {
    return { ok: true as const, email: toMemberAuthEmail(trimmed) };
  }

  return {
    ok: false as const,
    error: "아이디(영문 소문자/숫자) 또는 이메일을 입력해 주세요.",
  };
}
