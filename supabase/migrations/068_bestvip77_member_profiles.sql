-- 068: bestvip77 member profiles table
-- Stores profiles for members who sign up via loginId/password.
-- The auth email is a synthetic @bestvip77.user.local address.

create table if not exists public.bestvip77_member_profiles (
  user_id        uuid        primary key references auth.users(id) on delete cascade,
  email          text,
  carrier_country text        not null default 'KR',
  carrier_label  text,
  display_name_zh text,
  display_name_ko text,
  display_name_en text        not null default '',
  status         text        not null default 'pending'
                             check (status in ('pending','approved','rejected')),
  reviewed_at    timestamptz,
  phone_e164     text,
  phone_verified_at timestamptz,
  last_seen_at   timestamptz,
  admin_note     text,
  search_text    text        not null default '',
  search_chosung text        not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz
);

comment on table public.bestvip77_member_profiles is
  'Member profiles for bestvip77 users who sign up via ID/password (email is a synthetic @bestvip77.user.local address).';

alter table public.bestvip77_member_profiles enable row level security;

grant select on table public.bestvip77_member_profiles to authenticated;
grant all on table public.bestvip77_member_profiles to service_role;

drop policy if exists "bestvip77_member_profiles_select_own" on public.bestvip77_member_profiles;
create policy "bestvip77_member_profiles_select_own"
  on public.bestvip77_member_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create index if not exists bestvip77_member_profiles_status_idx
  on public.bestvip77_member_profiles (status);

create index if not exists bestvip77_member_profiles_search_idx
  on public.bestvip77_member_profiles (search_text);
