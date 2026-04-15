#!/usr/bin/env bash
# dressai foydalanuvchisi: API va veb papkalarida npm ci (monolit `npm run build` йўқ).
set -euo pipefail
APP_DIR="/home/dressai/getdressai.com"
cd "${APP_DIR}/dressai-api"
npm ci
cd "${APP_DIR}/getdressai"
npm ci
# Mobil build VPSда одатда шарт эмас; керак бўлса:
# cd "${APP_DIR}/mobile" && npm ci
