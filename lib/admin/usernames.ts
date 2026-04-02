const ADMIN_EMAIL_DOMAIN = "bestvip77.admin.local";

export const ADMIN_USERNAME_MAP = {
  admin123: `admin123@${ADMIN_EMAIL_DOMAIN}`,
  admin456: `admin456@${ADMIN_EMAIL_DOMAIN}`,
} as const;

export type ReservedAdminUsername = keyof typeof ADMIN_USERNAME_MAP;

function normalize(value: string) {
  return value.trim().toLowerCase();
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

export function resolveAdminLoginIdentifier(value: string) {
  const normalized = normalize(value);
  if (normalized in ADMIN_USERNAME_MAP) {
    return ADMIN_USERNAME_MAP[normalized as ReservedAdminUsername];
  }
  return value.trim();
}

export function validateLoginIdentifier(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false as const, error: "請輸入 Email 或管理員 ID。/ 이메일 또는 관리자 아이디를 입력해 주세요." };
  }

  if (isReservedAdminUsername(trimmed)) {
    return { ok: true as const, email: resolveAdminLoginIdentifier(trimmed) };
  }

  if (isReservedAdminEmail(trimmed)) {
    return {
      ok: false as const,
      error: "管理員帳號請使用 admin123 或 admin456 登入。/ 관리자 계정은 admin123 또는 admin456으로만 로그인할 수 있습니다.",
    };
  }

  if (isAdminEmailDomain(trimmed)) {
    return { ok: false as const, error: "此管理員專用 Email 網域不可直接使用。/ 관리자 전용 이메일 도메인은 직접 사용할 수 없습니다." };
  }

  if (isEmailLike(trimmed)) {
    return { ok: true as const, email: trimmed };
  }

  return {
    ok: false as const,
    error: "一般會員只能用 Email 登入，管理員 ID 只允許 admin123 / admin456。/ 일반 회원은 이메일만, 관리자 아이디는 admin123 / admin456만 사용할 수 있습니다.",
  };
}
