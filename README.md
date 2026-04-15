# GetdressAI / DressAI — backend stack

Бу репозиторий [getdressai.com](https://getdressai.com) учун **асосий код база**: `getdressai/` (веб), `dressai-api/` (Express API), `mobile/` (Expo).

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

- Веб: `getdressai` → Vercel / Netlify (`npm run publish:web -- --prod`). **Vercel (GitHub):** репо илдизи билан import қилинг; `vercel.json` статик чиқаришни `getdressai/` га йўналтиради. Агар build хато берса, Settings → **Root Directory** ни `getdressai` га ўрнating — `getdressai/vercel.json` ҳам шу учун мавжуд.
- API: `dressai-api` → Node хостинг (HTTPS, `ALLOWED_ORIGIN`).
- Илова: `mobile` → EAS (`npm run publish:mobile`).

## Supabase

Лойиҳа реф: `rmsluskirebmjxbnebyu` — `getdressai/.env.example` ва `dressai-api/.env.example` да URL намунаси.

## GitHub — репони тўлиқ алмаштириш

Локал репо тайёр: `git init`, `main`, `.env` gitдан ташқари.

```bash
cd dressai-backend
git remote add origin https://github.com/Abdumutalib/getdressai.com.git
# агар origin бўлса: git remote set-url origin https://github.com/Abdumutalib/getdressai.com.git
git push -u origin main --force
```

`--force` узоқ tarixни ёзиб юборади — фақат ишончингиз комил бўлса ишлатинг. GitHub да **Personal access token** ёки SSH калит керак.
