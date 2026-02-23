#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Building frontend ==="
cd "$ROOT_DIR/frontend"
npm install
VITE_API_BASE_URL="" npm run build

echo "=== Building admin (base=/admin/) ==="
cd "$ROOT_DIR/admin"
npm install
VITE_API_BASE_URL="" npx vite build --base=/admin/

echo "=== Building backend ==="
cd "$ROOT_DIR/backend"
npm install
npx prisma generate
npm run build

echo "=== Copying static files to backend/client/ ==="
rm -rf "$ROOT_DIR/backend/client"
mkdir -p "$ROOT_DIR/backend/client/frontend"
mkdir -p "$ROOT_DIR/backend/client/admin"
cp -r "$ROOT_DIR/frontend/dist/." "$ROOT_DIR/backend/client/frontend/"
cp -r "$ROOT_DIR/admin/dist/." "$ROOT_DIR/backend/client/admin/"

echo "=== Build complete ==="
echo "Frontend → backend/client/frontend/"
echo "Admin    → backend/client/admin/"
echo "Backend  → backend/dist/"
