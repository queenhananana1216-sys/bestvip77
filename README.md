# bestvip77

Chinese-first portal and admin console built with Next.js + Supabase.

## Local

1. Copy `.env.example` to `.env.local`
2. Fill in the Supabase environment variables
3. Run `npm install`
4. Run `npm run dev`

## Admin CRM rollout

1. Add these environment variables locally and in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Apply `../supabase/migrations/062_bestvip77_admin_crm.sql`
3. Build with `npm run build`
4. Deploy on Vercel after the migration has succeeded

## Current member flow

1. User signs up with Chinese name required, Korean/English aliases optional
2. User completes KR/CN phone OTP verification
3. As soon as phone OTP is verified, the user can enter the portal (`/`)
4. Admin can still review member records inside `/admin` for operations, but it is no longer a login gate
5. OTP guardrails are server-enforced (cooldown + request rate limit + obvious test-number pattern block)

## Environment keys (all `.env.local` settings)

Each key below is a `.env.local` setting in this project.

1. `NEXT_PUBLIC_SUPABASE_URL`
   - Purpose: Supabase project URL used by browser/server auth clients.
   - Where used: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/server-auth.ts`, `lib/supabase/middleware.ts`, `app/auth/callback/route.ts`.
   - How to verify:
     - Local: run `echo $env:NEXT_PUBLIC_SUPABASE_URL` (PowerShell), value should start with `https://` and contain `.supabase.co`.
     - App check: open browser devtools Network and confirm auth/api requests target the same Supabase host.

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Purpose: public anon key for browser and server auth session handling.
   - Where used: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/server-auth.ts`, `lib/supabase/middleware.ts`, `app/auth/callback/route.ts`.
   - How to verify:
     - Local: run `echo $env:NEXT_PUBLIC_SUPABASE_ANON_KEY` and ensure non-empty.
     - App check: login/register page loads without "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 필요" error.

3. `SUPABASE_SERVICE_ROLE_KEY`
   - Purpose: server-only privileged key for admin APIs and phone availability check.
   - Where used: `lib/supabase/service-role.ts`, `app/api/register/phone-availability/route.ts`, `lib/admin/server.ts`, `scripts/seed-demo-posts.mjs`, `scripts/seed-admin-users.mjs`.
   - How to verify:
     - Local: run `echo $env:SUPABASE_SERVICE_ROLE_KEY` and ensure non-empty.
     - API check: POST `/api/register/phone-availability` returns JSON instead of server 500 from missing key.
   - Important: keep this key only on server `.env.local` / hosting env vars. Never expose to client code.

4. `ADMIN123_PASSWORD` (optional)
   - Purpose: seed password for `admin123` account in `scripts/seed-admin-users.mjs`.
   - Where used: `scripts/seed-admin-users.mjs`.
   - How to verify:
     - Run `echo $env:ADMIN123_PASSWORD`; required only when running admin seed script.

5. `ADMIN456_PASSWORD` (optional)
   - Purpose: seed password for `admin456` account in `scripts/seed-admin-users.mjs`.
   - Where used: `scripts/seed-admin-users.mjs`.
   - How to verify:
     - Run `echo $env:ADMIN456_PASSWORD`; required only when running admin seed script.

## OTP guardrail migration

- Apply `../supabase/migrations/066_bestvip77_phone_otp_guardrails.sql`
- This creates `public.bestvip77_phone_otp_requests` used by `/api/register/phone-otp-guard`
- Default limits in code:
  - same phone cooldown: 60s
  - same phone: 6 requests / hour
  - same IP: 20 requests / 10 minutes
