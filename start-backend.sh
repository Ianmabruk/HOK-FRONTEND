#!/bin/bash
# HOK Interior Designs — Full Stack Dev Startup
# Starts Flask (port 5000) + Vite (port 5173) together.
# Usage:  bash start-backend.sh
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

# ── 1. Free ports ─────────────────────────────────────────────────────────────
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
sleep 1

# ── 2. Flask backend ──────────────────────────────────────────────────────────
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo ".env created from .env.example"
fi

echo "Starting Flask on http://localhost:5000 ..."
nohup python app.py > /tmp/flask.log 2>&1 &
FLASK_PID=$!
disown $FLASK_PID

# Wait for Flask to be ready
for i in $(seq 1 10); do
  sleep 1
  if curl -sf http://localhost:5000/api/products > /dev/null 2>&1; then
    echo "  Flask ready (PID $FLASK_PID)"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "  WARNING: Flask did not respond after 10s — check /tmp/flask.log"
  fi
done

# ── 3. Vite frontend ──────────────────────────────────────────────────────────
cd "$ROOT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting Vite on http://localhost:5173 ..."
nohup npm run dev > /tmp/vite.log 2>&1 &
VITE_PID=$!
disown $VITE_PID

sleep 3
VITE_URL=$(grep -oP 'Local:\s+\K\S+' /tmp/vite.log | tail -1)
echo "  Vite ready at ${VITE_URL:-http://localhost:5173}"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  HOK Interior Designs — dev servers running  ║"
echo "║                                              ║"
echo "║  Frontend : ${VITE_URL:-http://localhost:5173}          ║"
echo "║  Backend  : http://localhost:5000            ║"
echo "║                                              ║"
echo "║  Logs:  /tmp/flask.log  /tmp/vite.log        ║"
echo "╚══════════════════════════════════════════════╝"
