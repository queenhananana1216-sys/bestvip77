/** 가입 폼 — 한국 / 중국 통신사 (값은 DB·메타데이터에 저장) */
export type CarrierCountry = "KR" | "CN";

export const KR_CARRIERS = [
  { value: "SKT", label: "SK텔레콤 (SKT)" },
  { value: "KT", label: "KT" },
  { value: "LGU", label: "LG유플러스 (U+)" },
  { value: "MVNO_KR", label: "알뜰폰 (MVNO)" },
] as const;

export const CN_CARRIERS = [
  { value: "CMCC", label: "中国移动" },
  { value: "CUCC", label: "中国联通" },
  { value: "CTCC", label: "中国电信" },
  { value: "CN_OTHER", label: "其他" },
] as const;

export function carriersForCountry(c: CarrierCountry) {
  return c === "KR" ? KR_CARRIERS : CN_CARRIERS;
}
