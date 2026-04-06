-- 064: Admins skip phone verification (middleware reads bestvip77_admins).
-- Ensure table exists, RLS allows each user to read their own row, backfill from auth.

create table if not exists public.bestvip77_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.bestvip77_admins is
  'Users in this table are portal admins and bypass phone verification (see lib/supabase/middleware.ts).';

alter table public.bestvip77_admins enable row level security;

grant select on table public.bestvip77_admins to authenticated;

drop policy if exists "bestvip77_admins_select_own" on public.bestvip77_admins;
create policy "bestvip77_admins_select_own"
  on public.bestvip77_admins
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Reserved admin emails (admin123@ / admin456@ bestvip77.admin.local) get a row automatically.
insert into public.bestvip77_admins (user_id)
select u.id
from auth.users u
where u.email is not null
  and split_part(lower(trim(u.email)), '@', 2) = 'bestvip77.admin.local'
on conflict (user_id) do nothing;
