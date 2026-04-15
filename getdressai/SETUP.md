# GetdressAI — Supabase + OpenRouter / Groq (no OpenAI)

Low cost: **Supabase free** + **Vercel hobby** + **OpenRouter** (or **Groq** free tier where available) + cheap models like `mistralai/mixtral-8x7b`.

## Where to paste keys

| Key | Where |
|-----|--------|
| **Supabase URL + anon key** | `index.html` → `window.GETDRESSAI_CONFIG` → `supabaseUrl`, `supabaseAnonKey` |
| **OpenRouter API key** | **Only** Vercel **Environment Variables** or your shell when running `npm run dev` — **never** in `index.html` |

## Environment variables (server)

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | Yes (default path) | Proxies to `https://openrouter.ai/api/v1/chat/completions` |
| `OPENROUTER_SITE_URL` | No | `HTTP-Referer` header (e.g. your Vercel URL) |
| `OPENROUTER_APP_NAME` | No | `X-Title` header (default `GetdressAI`) |
| `GROQ_API_KEY` | Alternative | Use with `AI_PROVIDER=groq` |
| `AI_PROVIDER` | Optional | Set to `groq` to force Groq when both keys exist |
| `AMAZON_PARTNER_TAG` | No | Local dev: injected into `amazonAffiliateTag` in served `index.html` |
| `AMAZON_ACCESS_KEY` / `AMAZON_SECRET_KEY` | No | Server-only; PA-API when you add a signed backend (never in the browser) |
| `EBAY_APP_ID` / `EBAY_CERT_ID` / `EBAY_DEV_ID` / `EBAY_RUNAME` | No | eBay Browse search (`POST /api/ebay-search`) — server `.env` only |
| `EBAY_USE_SANDBOX`, `EBAY_MARKETPLACE_ID`, `EBAY_OAUTH_SCOPE`, `EBAY_PRICE_CURRENCY` | No | eBay sandbox / marketplace / scope / price filter currency |
| `ALIEXPRESS_APP_KEY` / `ALIEXPRESS_APP_SECRET` | No | AliExpress Open Platform — server `.env` only |
| `ALIEXPRESS_APP_SIGNATURE` / `ALIEXPRESS_TRACKING_ID` | No | Affiliate `product.query` — Open Platform кабинетидан |
| `ALIEXPRESS_SYNC_URL` | No | Default `https://api-sg.aliexpress.com/sync` |

Copy `.env.example` to `.env` for local testing (do not commit `.env`).

---

## 1. Supabase

1. Create project at [supabase.com](https://supabase.com).
2. Enable **Authentication → Email**.
3. Run `supabase/schema.sql` in **SQL Editor**.
4. Paste **Project URL** and **anon public** key into `index.html` → `GETDRESSAI_CONFIG`.

---

## 2. OpenRouter

1. Create an API key at [openrouter.ai/keys](https://openrouter.ai/keys).
2. **Local:**  
   ` $env:OPENROUTER_API_KEY="sk-or-v1-..."` (PowerShell) then `npm run dev`
3. **Vercel:** Project → Settings → Environment Variables → add `OPENROUTER_API_KEY` → redeploy.

Model: edit `aiModel` in `index.html`. Example: `mistralai/mixtral-8x7b` (matches OpenRouter docs). Browse models and prices on [openrouter.ai/models](https://openrouter.ai/models).

---

## 3. Groq (optional)

1. Key from [console.groq.com](https://console.groq.com/keys).
2. Set `GROQ_API_KEY` and `AI_PROVIDER=groq` (Vercel or shell).
3. Set `aiModel` in `index.html` to a **Groq** model id (e.g. `llama-3.1-8b-instant`).

---

## 4. Run locally

```powershell
cd getdressai
$env:OPENROUTER_API_KEY="your-key"
npm run dev
```

Open **http://127.0.0.1:8787** (not `file://`).

---

## 5. Deploy Vercel

- Root: `getdressai` if needed.
- Env: `OPENROUTER_API_KEY` (and optional referer/title).
- Add Vercel URL to Supabase **Authentication → URL configuration → Redirect URLs**.

---

## 6. Amazon Associates & Product Advertising API (PA-API)

1. [Amazon Associates](https://affiliate-program.amazon.com) — рўйхатдан ўтинг (мақсад веб-сайт / илова).
2. Associate Central ичида **Product Advertising API** ни ёқинг (ҳисобот ва талаблар бўйича).
3. **Access Key** ва **Secret Key** олинг (одатда AWS IAM калитлари; PA-API сўровларини имзолаш учун). Буларни **фақат сервер** `.env` да сақланг — браузер ёки `index.html` га қўйманг.
4. `getdressai/.env` (маҳаллий `npm run dev`):

| Variable | Purpose |
|----------|---------|
| `AMAZON_PARTNER_TAG` | Associates **store tag** (`&tag=...`) — dev-server `index.html` га инъекция қилади; search / affiliate ҳаволалар учун. |
| `AMAZON_ACCESS_KEY` | PA-API (кейин server route ёки `dressai-api` да). |
| `AMAZON_SECRET_KEY` | PA-API (сервердагина). |

`AMAZON_PARTNER_TAG` бўлмаса, илова ичидаги fallback tag ишлайди. **PA-API** орқали маҳсулот қидирув/тафсилот учун алоҳида бекенд имзо логикаси керак (AWS Signature V4); калитлар клиентга берилмасligi шарт.

`dressai-api/.env.example` да ҳам шу калитлар учун қаторлар бор.

**Каталог қидирув (PA-API):** маҳаллий `POST http://127.0.0.1:8787/api/amazon-search` — JSON тана: `keywords`, иҳтиёрий `minPrice` / `maxPrice` (доллар), `searchIndex`, `size`, `color`, `brands`, `expandVariations`. Жавобда `products` + `fitScore` + `affiliateUrl`. `dressai-api`: `AMAZON_PA_API_UPSTREAM_URL` орқали `POST /v1/amazon-search` прокси.

### eBay Developer (OAuth иловаси)

1. [developer.ebay.com](https://developer.ebay.com) — аккаунт яратинг.
2. **Create Application** (Application Keys) — Production ёки Sandbox ключларни олинг; OAuth учун **User токен**ларни RuName ва redirect URL билан созланг ([eBay OAuth документацияси](https://developer.ebay.com/api-docs/static/oauth-tokens.html)).
3. `getdressai/.env` ёки `dressai-api/.env`:

| Variable | Purpose |
|----------|---------|
| `EBAY_APP_ID` | App ID (Client ID) |
| `EBAY_CERT_ID` | Cert ID (Client Secret) |
| `EBAY_DEV_ID` | Developer ID |
| `EBAY_RUNAME` | eBay redirect URL name (RuName) — OAuth callback номи |

**Каталог қидирув (Browse API):** маҳаллий `POST http://127.0.0.1:8787/api/ebay-search` — JSON тана: `keywords` (мажбурий), иҳтиёрий `minPrice` / `maxPrice`, `categoryIds`, `size`, `color`, `brand`, `currency`, `limit`. Жавобда `products` (`fitScore` бўйича сараланган) + `total`. `dressai-api`: `EBAY_BROWSE_UPSTREAM_URL` орқали `POST /v1/ebay-search` прокси.

### AliExpress Open Platform (Affiliate)

1. [AliExpress Open Platform](https://openservice.aliexpress.com) — илова яратинг, **App Key** ва **App Secret** олинг.
2. Affiliate API учун одатда **App Signature** ва **Tracking ID** керак (`aliexpress.affiliate.product.query`).
3. `getdressai/.env`:

| Variable | Purpose |
|----------|---------|
| `ALIEXPRESS_APP_KEY` | App Key |
| `ALIEXPRESS_APP_SECRET` | App Secret |
| `ALIEXPRESS_APP_SIGNATURE` | Affiliate app signature (кейс бўйича мажбурий) |
| `ALIEXPRESS_TRACKING_ID` | Tracking ID |

**Каталог қидирув:** маҳаллий `POST http://127.0.0.1:8787/api/aliexpress-search` — JSON: `keywords` (мажбурий), иҳтиёрий `minPrice` / `maxPrice` (доллар; API га тийин сифатида юборилади), `sort` (`price_asc`, `price_desc`, `sale_desc`, `best_match`), `pageNo`, `pageSize` (1–50). Жавобда `products` + `fitScore`. `dressai-api`: `ALIEXPRESS_AFFILIATE_UPSTREAM_URL` орқали `POST /v1/aliexpress-search` прокси.

**Гибрид (уч маркетплейс):** `POST http://127.0.0.1:8787/api/hybrid-marketplace-search` — JSON: `keywords` ёки `style`, иҳтиёрий `budget` (`min`/`max`), `size`, `color`, `measurements.recommendedSize`, `preferredBrands`, `sources` (`["amazon","ebay","aliexpress"]`). Жавоб: бирлаштирилган `products` (`totalFitScore`), `grouped`, `marketplaceErrors` (бирор маркетплейс калитсиз бўлса). `dressai-api`: `HYBRID_MARKETPLACE_UPSTREAM_URL` → `POST /v1/hybrid-marketplace-search`.

Бу калитларни **фақат сервер**да сақланг; репога коммит қилманг.

---

## 7. Production API (Node + HTTPS)

`dressai-api` ni istalgan Node хостингда ишлатинг (HTTPS, `ALLOWED_ORIGIN` веб домени билан мос). Калитлар: `dressai-api/.env.example`, умумий йўналиш — репо `README.md` да **Deploy** бўлими. Веб: **§5** (Vercel).

---

## 8. Hybrid VTON (FASHN + OmniTry + FastFit)

Virtual try-on **Python + GPU** (Linux/CUDA тавсия этилади). Бу каталогларни одатда **инференс VPS**да `git clone` қиласиз; `getdressai` монорепоси ичига мажбурий эмас.

### 1-босқич: FASHN VTON (кийим асоси)

```bash
git clone https://github.com/fashn-AI/fashn-vton-1.5.git
pip install -r fashn-vton-1.5/requirements.txt
```

Keyin `GETDRESSAI` Node API учун **`FASHN_VTON_RUN_PY`** муҳит ўзгарувчисида **FASHN `run.py`** (ёки сиз ишлатадиган entry script) тўлиқ йўли кўрсатилсин. Мисол: `export FASHN_VTON_RUN_PY=/opt/fashn-vton-1.5/run.py`.

### 2-босқич: OmniTry (аксессуарлар)

```bash
git clone https://github.com/omnitry/omnitry.git
cd omnitry && pip install -e .
```

Node томонда **`OMNITRY_RUN_PY`** — `--person`, `--object`, `--type`, `--output` аргументларини қабул қилувчи кичик Python wrapper йўли (омнитрийнинг расмий CLI бошқа бўлса, у ерда wrapper ёзинг).

### 3-босқич: FastFit (тезлатиш / кеш)

```bash
git clone https://github.com/fastfit/fastfit.git
cd fastfit && pip install -e .
```

`getdressai/api/hybrid-vton.js` ичида FastFit учун **reference cache stub** бор; тўлиқ tensor encode учун кейинроқ `fastfit` ни Node дан чақирувни алоҳида улаш керак.

### GetdressAI билан боғлаш

| Variable | Purpose |
|----------|---------|
| `FASHN_VTON_RUN_PY` | FASHN inference script (мисол `run.py`) |
| `OMNITRY_RUN_PY` | OmniTry wrapper script |
| `PYTHON` | Ихтиёрий, одатда `python` |

Локал: `POST http://127.0.0.1:8787/api/hybrid-vton` (`npm run dev`). Фронт: `public/hybrid-tryon.js` (автоматик `index.html` да уланган; дўконда «Try on photo» аввал бу API ни чақиради, хато бўлса — демо модал).

**Mobil (Expo):** `dressai-api` да `HYBRID_VTON_SERVICE_URL=http://<LAN-IP>:8787` — илова `POST /v1/hybrid-vton` орқали шу проксига тушади. Таб: **Try-on**.

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| 401 from proxy | Wrong or missing `OPENROUTER_API_KEY` / `GROQ_API_KEY`. |
| Model not found | Change `aiModel` in `index.html` to an id your provider lists. |
| Invalid JSON from AI | Try a larger model or shorten the prompt; app expects strict JSON in the reply. |
| CORS if calling OpenRouter from browser | Don’t — always use `/api/outfit` proxy. |
| Hybrid VTON 500 | Set `FASHN_VTON_RUN_PY` / GPU drivers; check Python can run the script from the same user as Node. |
