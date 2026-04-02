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
3. Admin reviews the member inside `/admin`
4. Only approved members can enter the portal
