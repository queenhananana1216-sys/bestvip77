import type { CarrierCountry } from "@/lib/register/carriers";

const STORAGE_KEY = "bestvip77.pendingPhone";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeKrPhone(input: string) {
  const digits = digitsOnly(input);
  if (!digits) return null;

  if (digits.startsWith("82")) {
    const local = digits.slice(2);
    if (!/^1\d{8,9}$/.test(local)) return null;
    return `+82${local}`;
  }

  if (/^01\d{8,9}$/.test(digits)) {
    return `+82${digits.slice(1)}`;
  }

  if (/^1\d{8,9}$/.test(digits)) {
    return `+82${digits}`;
  }

  return null;
}

function normalizeCnPhone(input: string) {
  const digits = digitsOnly(input);
  if (!digits) return null;

  if (digits.startsWith("86")) {
    const local = digits.slice(2);
    if (!/^1\d{10}$/.test(local)) return null;
    return `+86${local}`;
  }

  if (/^1\d{10}$/.test(digits)) {
    return `+86${digits}`;
  }

  return null;
}

export function normalizePhoneNumber(country: CarrierCountry, input: string) {
  return country === "KR" ? normalizeKrPhone(input) : normalizeCnPhone(input);
}

export function phonePlaceholder(country: CarrierCountry) {
  return country === "KR" ? "01012345678" : "13800138000";
}

export function explainPhoneAuthError(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes("duplicate") ||
    lower.includes("already been taken") ||
    lower.includes("already exists") ||
    lower.includes("unique") ||
    lower.includes("already registered") ||
    lower.includes("already in use")
  ) {
    return "此手機號碼已被使用，請改用其他號碼。/ 이미 가입에 사용된 휴대폰 번호입니다.";
  }

  if (
    lower.includes("sms provider") ||
    lower.includes("phone provider") ||
    lower.includes("unsupported provider") ||
    lower.includes("phone login")
  ) {
    return "Supabase Phone 與 SMS provider 尚未設定完成。/ Supabase Phone 로그인과 SMS provider 설정이 아직 완료되지 않았습니다.";
  }

  if (lower.includes("otp") || lower.includes("token")) {
    return "驗證碼錯誤或已過期，請重新取得。/ 인증번호가 올바르지 않거나 만료되었습니다.";
  }

  if (lower.includes("rate limit") || lower.includes("security purposes")) {
    return "請求過於頻繁，請稍後再試。/ 요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
  }

  return message;
}

export function rememberPendingPhone(phone: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, phone);
}

export function readPendingPhone() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function clearPendingPhone() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
