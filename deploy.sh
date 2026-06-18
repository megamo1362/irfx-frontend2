#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "==> Fixing git permissions..."
sudo chown -R "$(whoami)" .git

echo "==> Pulling latest code..."
git pull

echo "==> Installing dependencies..."
npm install --legacy-peer-deps

echo "==> Building..."
npm run build

echo "==> Restarting app..."
if pm2 list | grep -q "irfx-frontend2"; then
  pm2 restart irfx-frontend2
else
  pm2 start ecosystem.config.js
fi

pm2 save
echo "==> Done!"
