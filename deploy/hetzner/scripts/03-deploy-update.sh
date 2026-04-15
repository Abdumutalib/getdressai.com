#!/usr/bin/env bash
# ROOT: git pull + npm ci (dressai-api, getdressai) + systemd restart.
set -euo pipefail
APP_USER="dressai"
APP_DIR="/home/${APP_USER}/getdressai.com"
sudo -u "${APP_USER}" bash -c "set -e; cd '${APP_DIR}'; git pull; cd dressai-api && npm ci; cd ../getdressai && npm ci"
systemctl restart dressai
echo "OK: dressai-api qayta ishga tushirildi."
