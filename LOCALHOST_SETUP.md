# Localhost setup

This project is now isolated locally from other apps by using dedicated ports:

- Web: `http://localhost:3100`
- API: `http://localhost:3101`

## Run

1. Web
   `npm run dev:local`
2. API
   `cd dressai-api`
   `npm run dev`
3. Mobile
   `cd mobile`
   `npm start`

## Notes

- `getdressai.com/.env.local` points the web app to `localhost:3100` and `localhost:3101`.
- `getdressai.com/dressai-api/.env` uses port `3101` and allows origin `http://localhost:3100`.
- `getdressai.com/mobile/.env` points Expo to the local API on port `3101`.
- This avoids colliding with any other project already using `3000` or `3001`, including FinAIvocalist.
