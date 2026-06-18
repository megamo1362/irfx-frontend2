#!/bin/bash
set -e

FRONTEND_DIR="/home/megamo/irfx-frontend2"
BACKEND_DIR="/home/megamo/irfx-backend"

# ── Backend ────────────────────────────────────────────────
echo ">>> [Backend] Fixing permissions..."
sudo chown -R "$(whoami)" "$BACKEND_DIR/.git"

echo ">>> [Backend] Pulling..."
cd "$BACKEND_DIR"
git pull

echo ">>> [Backend] Installing dependencies..."
pip3 install -r requirements.txt -q

echo ">>> [Backend] Restarting..."
if pm2 list | grep -q "irfx-backend"; then
  pm2 restart irfx-backend
else
  pm2 start "$FRONTEND_DIR/ecosystem.config.js" --only irfx-backend
fi

# ── Frontend ───────────────────────────────────────────────
echo ">>> [Frontend] Fixing permissions..."
sudo chown -R "$(whoami)" "$FRONTEND_DIR/.git"

echo ">>> [Frontend] Pulling..."
cd "$FRONTEND_DIR"
git pull

echo ">>> [Frontend] Installing dependencies..."
npm install --legacy-peer-deps

echo ">>> [Frontend] Building..."
npm run build

echo ">>> [Frontend] Restarting..."
if pm2 list | grep -q "irfx-frontend2"; then
  pm2 restart irfx-frontend2
else
  pm2 start "$FRONTEND_DIR/ecosystem.config.js" --only irfx-frontend2
fi

pm2 save
echo ">>> Deploy complete!"
