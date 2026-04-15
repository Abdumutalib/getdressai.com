#!/usr/bin/env bash
# dressai foydalanuvchisi sifatida: npm ci + build (bir marta va har deployda).
set -euo pipefail
APP_DIR="/home/dressai/getdressai.com"
cd "${APP_DIR}"
npm ci
npm run build
