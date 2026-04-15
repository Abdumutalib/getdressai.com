# GetdressAI / DressAI — backend stack

Бу репозиторий [getdressai.com](https://getdressai.com) учун **асосий код база** (аввалги монолит `server.js` + `dressai-web` ўрнига).

## Тузilish

| Папка | Рол |
|--------|-----|
| `getdressai/` | Статик веб + `npm run dev` (порт 8787), маркетплейс прокси, `public/premium.html` |
| `dressai-api/` | Express API (auth, Stripe, Paddle webhook, OpenAI, Supabase service) |
| `mobile/` | Expo илова (DressAI) |
| `scripts/` | `verify-services.mjs`, publish ёрдамчилари |
| `.github/workflows/` | CI |

## Тез бошлаш

```bash
npm run install:api && npm run install:web && npm run install:mobile
# терминал 1
npm run dev:api
# терминал 2
npm run dev:web
```

`getdressai/.env` ва `dressai-api/.env` — `.env.example` дан нусха.

## Tekshiruv

```bash
npm run verify
```

## Deploy

- Веб: `getdressai` → Vercel / Netlify (`npm run publish:web -- --prod`).
- API: `dressai-api` → Node хостинг (HTTPS, `ALLOWED_ORIGIN`).
- Илова: `mobile` → EAS (`npm run publish:mobile`).

## Supabase

Лойиҳа реф: `rmsluskirebmjxbnebyu` — `getdressai/.env.example` ва `dressai-api/.env.example` да URL намунаси.
