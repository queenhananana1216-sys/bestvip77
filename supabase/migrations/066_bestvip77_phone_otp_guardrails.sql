-- 066: OTP 요청 가드레일 테이블 생성
-- /api/register/phone-otp-guard 에서 사용하는 rate-limit 추적 테이블

create table if not exists public.bestvip77_phone_otp_requests (
  id          bigserial primary key,
  phone_e164  text        not null,
  ip_hash     text        not null,
  created_at  timestamptz not null default now()
);

comment on table public.bestvip77_phone_otp_requests is
  'Tracks OTP send attempts for rate-limiting: per-phone cooldown 60s, 6/hr; per-IP 20/10min.';

create index if not exists bestvip77_phone_otp_requests_phone_idx
  on public.bestvip77_phone_otp_requests (phone_e164, created_at desc);

create index if not exists bestvip77_phone_otp_requests_ip_idx
  on public.bestvip77_phone_otp_requests (ip_hash, created_at desc);

-- service_role 만 insert/select 허용 (RLS 비활성화 — 서버 전용 테이블)
alter table public.bestvip77_phone_otp_requests enable row level security;

drop policy if exists "otp_requests_service_only" on public.bestvip77_phone_otp_requests;
create policy "otp_requests_service_only"
  on public.bestvip77_phone_otp_requests
  for all
  to service_role
  using (true)
  with check (true);
