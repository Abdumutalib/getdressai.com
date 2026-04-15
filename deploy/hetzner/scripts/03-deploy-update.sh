#!/usr/bin/env bash
# ROOT sifatida ishga tushiring: git pull + build + systemd restart.
set -euo pipefail
APP_USER="dressai"
APP_DIR="/home/${APP_USER}/getdressai.com"
sudo -u "${APP_USER}" bash -c "cd '${APP_DIR}' && git pull && npm ci && npm run build"
systemctl restart dressai
echo "OK: dressai qayta ishga tushirildi."
