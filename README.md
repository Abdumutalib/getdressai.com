# AKBEL CRM V2

Production-ready offline-first ERP/CRM platform for wholesale business operations.

## 1) Installation

```bash
npm install
```

## 2) Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_API_KEY=
APP_ENV=development
APP_MODE=supabase
NEXT_PUBLIC_APP_MODE=supabase
EXTERNAL_API_BASE_URL=
NEXT_PUBLIC_APP_NAME=AKBEL CRM
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### External Server Mode (No Supabase)

If you want to run frontend with your own backend only:

```env
APP_MODE=external_server
NEXT_PUBLIC_APP_MODE=external_server
EXTERNAL_API_BASE_URL=https://api.your-domain.com
```

Frontend `/api/*` calls will be rewritten to your external server.
Contract reference: `docs/external-api-contract.md`

Validate required endpoint mapping:

```bash
npm run check:external-api
```

## 3) Database Setup

1. Install Supabase CLI.
2. Link project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

3. Run migrations:

```bash
npm run db:migrate
```

4. (Development only) run seed data:

```bash
supabase db reset
```

Seed file: `supabase/seed.sql`

## 4) Supabase Setup

1. Enable Email auth provider.
2. Create users in Supabase Auth.
3. Insert corresponding profiles in `public.users`.
4. Assign roles through `public.user_roles`.
5. Ensure RLS policies are enabled (migration `20260813_000002_rls.sql`).

## 5) Local Development

```bash
npm run dev
```

Default routes:

- `/login`
- `/dashboard`
- `/products`
- `/warehouses`

## 6) PWA Installation

- Manifest route: `/manifest.webmanifest`
- Service worker: auto-generated in `public/sw.js` by `next-pwa`
- Install prompt works in supported browsers (Chrome, Edge, Android)

## 7) Offline Architecture

- Local database: IndexedDB (`Dexie`) in `db/indexeddb.ts`
- Offline queue: `sync_queue` table in IndexedDB
- Network status tracking: `stores/network-store.ts`
- Offline banner in UI: `components/shared/offline-status-banner.tsx`

## 8) Sync Architecture

- Queue writer: `sync/queue.ts`
- Auto sync engine: `sync/engine.ts`
- Server endpoint: `POST /api/private/sync/push`
- Idempotency: `idempotency_key` unique on key transactional tables

## 9) Deployment

Vercel recommended.

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

## 10) Backup

Recommended strategy:

- Daily automated PostgreSQL backup (Supabase scheduled backup).
- Weekly full export snapshot.
- Monthly restore drill to staging.

## 11) Security

- Supabase Auth with server-side checks.
- RLS enabled on domain tables.
- Role/permission model (`roles`, `permissions`, `role_permissions`, `user_roles`).
- API key guard for Telegram endpoints.
- Zod validation in API routes.
- Service role key never exposed to client code.

## 12) Testing

Run all tests:

```bash
npm test
```

Quality gates:

```bash
npm run typecheck
npm run lint
npm run build
```

Current automated coverage includes:

- Currency precision helpers.
- Offline sync queue persistence/status transitions.

## Current Implementation Status

Implemented in this iteration:

- PHASE 1 foundation: architecture, schema, migrations, auth plumbing.
- PHASE 2 partial: products and warehouses APIs + pages.
- PWA baseline, offline queue, auto-sync core skeleton.
- Telegram API-ready endpoints.

Pending modules will be implemented phase-by-phase with full business logic.
