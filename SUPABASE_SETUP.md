# Supabase Setup

1. In Supabase, open your project and copy these values from `Project Settings -> API`:
   `Project URL`, `anon public key`, `service_role key`.
2. In this repo, create `getdressai.com/.env.local` by copying `getdressai.com/.env.local.example`.
3. Replace these placeholders in `getdressai.com/.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   `SUPABASE_URL`
   `SUPABASE_ANON_KEY`
   `SUPABASE_SERVICE_ROLE_KEY`
4. In Supabase SQL Editor, run these files in order:
   `supabase/migrations/20260418_create_user_generations.sql`
   `supabase/migrations/20260418_enable_rls.sql`
   `supabase/migrations/20260419_create_user_profiles_and_harden_generations.sql`
   `supabase/migrations/20260419_create_user_generator_preferences.sql`
   `supabase/migrations/20260419_create_guest_generations.sql`
5. In Supabase Authentication -> URL Configuration, add:
   Site URL: `http://localhost:3000`
   Redirect URL: `http://localhost:3000/reset-password`
6. Start the app with `npm run dev` inside `getdressai.com`.

## What should work after this

- Email signup and login
- Dashboard history from `user_generations`
- Guest history from `guest_generations`
- Saved generator preferences
- Signed storage URLs for uploaded and generated images

## Quick check

- Open `/login` and create a test account
- Open `/dashboard`
- Confirm `GET /api/preferences` no longer returns a Supabase config error
- Confirm `GET /api/generate` returns `401` before login and data after login

## Important

- Do not put placeholder values like `your-project` or `your_supabase_anon_key` into production.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Keep it only in `.env.local`, never in client code.
