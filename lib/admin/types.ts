export type AdminMemberStatus = "pending" | "approved" | "rejected";

export type AdminMemberRecord = {
  user_id: string;
  email: string | null;
  carrier_country: string;
  carrier_label: string | null;
  status: AdminMemberStatus;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string | null;
  display_name_zh: string | null;
  display_name_ko: string | null;
  display_name_en: string | null;
  phone_e164: string | null;
  phone_verified_at: string | null;
  last_seen_at: string | null;
  admin_note: string | null;
  search_text: string | null;
  search_chosung: string | null;
  auth_phone: string | null;
  auth_phone_confirmed_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
};
