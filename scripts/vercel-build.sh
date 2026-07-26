#!/usr/bin/env bash
set -e

START_DIR="$(pwd)"

if [ -f "$START_DIR/frontend/package.json" ]; then
  REPO_ROOT="$START_DIR"
elif [ -f "$START_DIR/../frontend/package.json" ]; then
  REPO_ROOT="$(cd .. && pwd)"
else
  echo "Could not find frontend/package.json. Set Vercel Root Directory to empty (project root)." >&2
  exit 1
fi

cd "$REPO_ROOT"
npm run build --prefix frontend

# Vercel outputDirectory is "dist" at project root
rm -rf "$REPO_ROOT/dist"
cp -r "$REPO_ROOT/frontend/dist" "$REPO_ROOT/dist"
