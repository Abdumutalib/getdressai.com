# External API Contract (No Supabase Mode)

When `APP_MODE=external_server`, frontend requests are rewritten to `EXTERNAL_API_BASE_URL`.

## Required Environment Variables

```env
APP_MODE=external_server
NEXT_PUBLIC_APP_MODE=external_server
EXTERNAL_API_BASE_URL=https://api.your-domain.com
# Optional if your backend uses bearer auth for server-to-server checks:
EXTERNAL_API_TOKEN=
```

## Required Endpoints

All endpoints should return JSON in this shape when possible:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Auth

- `GET /api/auth/me`

### Private Data (GET)

- `GET /api/private/products`
- `GET /api/private/warehouses`
- `GET /api/private/sales`
- `GET /api/private/purchases`
- `GET /api/private/payments`
- `GET /api/private/expenses`
- `GET /api/private/cash`

### Private Commands (POST)

- `POST /api/private/sales`
- `POST /api/private/purchases`
- `POST /api/private/payments`
- `POST /api/private/expenses`
- `POST /api/private/cash`
- `POST /api/private/warehouse/expense`
- `POST /api/private/sync/push`

### Optional Telegram

- `GET /api/telegram/products`
- `POST /api/telegram/order`
- `POST /api/telegram/customer`
- `POST /api/telegram/payment`

## Fast Validation

Run:

```bash
npm run check:external-api
```

Notes:
- For POST routes, checker sends empty payload intentionally.
- 4xx can be acceptable for POST in this test (auth/validation), but 404 on required endpoints is a failure.
