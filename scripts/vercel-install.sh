#!/usr/bin/env bash
set -e

# Works whether Vercel Root Directory is empty (repo root) or wrongly set to "backend"
if [ -f "frontend/package.json" ]; then
  REPO_ROOT="$(pwd)"
elif [ -f "../frontend/package.json" ]; then
  REPO_ROOT="$(cd .. && pwd)"
else
  echo "Could not find frontend/package.json. Set Vercel Root Directory to empty (project root)." >&2
  exit 1
fi

echo "Installing dependencies in $REPO_ROOT"
cd "$REPO_ROOT"
npm install --prefix frontend
npm install --prefix backend
