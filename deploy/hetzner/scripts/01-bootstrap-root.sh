#!/usr/bin/env bash
# Hetzner VPS — bir marta ROOT sifatida ishga tushiring (Ubuntu 22.04+).
set -euo pipefail

APP_USER="dressai"
APP_DIR="/home/${APP_USER}/getdressai.com"
REPO_URL="${DRESSAI_REPO_URL:-https://github.com/Abdumutalib/getdressai.com.git}"
DEPLOY_HELPER_DIR="/home/${APP_USER}/hetzner-deploy"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl ca-certificates git ufw

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${APP_USER}"
fi

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
apt-get update -y
apt-get install -y caddy

if [[ ! -d "${APP_DIR}/.git" ]]; then
  sudo -u "${APP_USER}" git clone "${REPO_URL}" "${APP_DIR}"
else
  echo "Repo allaqachon bor: ${APP_DIR}"
fi

SCRIPT_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "${DEPLOY_HELPER_DIR}"
cp -f "${SCRIPT_SRC}/02-npm-build.sh" "${DEPLOY_HELPER_DIR}/"
cp -f "${SCRIPT_SRC}/03-deploy-update.sh" "${DEPLOY_HELPER_DIR}/"
chown -R "${APP_USER}:${APP_USER}" "${DEPLOY_HELPER_DIR}"
chmod +x "${DEPLOY_HELPER_DIR}"/*.sh

UNIT_SRC="$(cd "${SCRIPT_SRC}/.." && pwd)/dressai.service"
if [[ -f "${UNIT_SRC}" ]]; then
  cp -f "${UNIT_SRC}" /etc/systemd/system/dressai.service
else
  echo "dressai.service topilmadi: ${UNIT_SRC}" >&2
  exit 1
fi

systemctl daemon-reload
systemctl enable dressai

echo ""
echo "Keyingi qadamlar:"
echo "  1) nano ${APP_DIR}/dressai-api/.env   (dressai-api/.env.example bo'yicha)"
echo "  2) chown ${APP_USER}:${APP_USER} ${APP_DIR}/dressai-api/.env && chmod 600 ${APP_DIR}/dressai-api/.env"
echo "  3) sudo -u ${APP_USER} ${DEPLOY_HELPER_DIR}/02-npm-build.sh"
echo "  4) /etc/caddy/Caddyfile — Caddyfile.example dan nusxa (domenni to'g'rilang)"
echo "  5) systemctl reload caddy && systemctl start dressai && systemctl status dressai"
echo ""
