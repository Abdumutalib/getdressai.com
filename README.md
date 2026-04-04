# DressAI

Node.js backend that serves the API and the built web frontend from one service.

## Local Run

1. Create `.env` from `.env.example`.
2. Set `USER_STORE_DRIVER=supabase` and fill `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` if you want the real PostgreSQL-backed store.
3. Use `USER_STORE_DRIVER=file` only for local testing.
4. `/shop` will read from `SUPABASE_SHOP_TABLE` when the table exists, otherwise it falls back to the built-in catalog.
5. Install root dependencies:
	`npm install`
6. Install web dependencies:
	`npm install --prefix dressai-web`
7. Build the web app:
	`npm run build`
8. Start the server:
	`npm start`

The backend serves the web app after build from `dressai-web/dist`.

In production, JSON file storage is blocked and the backend requires the Supabase/PostgreSQL configuration.

## Render Deploy

This repo includes `render.yaml`, so Render can create the web service automatically.

1. Push this repository to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this repository.
4. Render will read `render.yaml` and create one Node web service.
5. Fill in the required environment variables in Render:
	`OPENAI_API_KEY`
	`SUPABASE_URL`
	`SUPABASE_SERVICE_ROLE_KEY`
	`STRIPE_SECRET_KEY`
	`STRIPE_WEBHOOK_SECRET`
	`STRIPE_PRO_PRICE_ID`
	`ALLOWED_ORIGIN`
6. After first deploy, copy your Render URL and set `ALLOWED_ORIGIN` to that exact URL.

## Supabase Setup

Before production migration, apply the SQL schema from `supabase/schema.sql` in your Supabase project.

The schema now includes `public.app_shop_products` for the commerce catalog used by `/shop`.

Use `SUPABASE_SHOP_TABLE` if you want a different table name.

After the schema exists, run:

```bash
npm run supabase:migrate-users
npm run supabase:seed-shop
```

If the schema is missing, migration will fail because `public.app_users` does not exist.

`npm run supabase:seed-shop` copies the built-in catalog into `SUPABASE_SHOP_TABLE` so `/shop` can serve the database-backed catalog immediately.

## Mobile App Config

The Expo app should not hard-code local IP addresses. Use `EXPO_PUBLIC_API_BASE_URL` instead.

1. Create `dressai-app/.env` from `dressai-app/.env.example`.
2. Set `EXPO_PUBLIC_API_BASE_URL` to your backend URL.
3. Read the value through Expo config extra instead of embedding `192.168.x.x` or `localhost` directly in components.

## Mobile Build And Share

The Expo app now includes `dressai-app/eas.json` with ready-to-use build profiles.

1. Install EAS CLI:
	`npm install -g eas-cli`
2. Log in to Expo:
	`eas login`
3. From `dressai-app`, configure the project once:
	`eas init`
4. Create a shareable Android APK:
	`eas build --platform android --profile preview`
5. Create a store-ready Android bundle:
	`eas build --platform android --profile production`

`preview` is intended for direct testing and sharing. `production` is intended for store submission.

## Health Check

Render health check path:

`/health`