#!/bin/bash
# HOK Interior Designs — Backend Startup Script
set -e

cd "$(dirname "$0")/backend"

# Create venv if not present
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

echo "Installing dependencies..."
pip install -q -r requirements.txt

# Copy .env if not present
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ".env created from .env.example — using SQLite by default."
fi

echo "Starting Flask backend on http://localhost:5000 ..."
python app.py
