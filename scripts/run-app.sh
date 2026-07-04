#!/usr/bin/env bash
# Start FolioMint locally.
#
# Usage:
#   npm run app
#   npm run app -- --reset-db
#   bash scripts/run-app.sh --reset-db
#
# Use --reset-db once after large schema rewrites. It backs up data/dev.db,
# creates a fresh local SQLite database, applies Drizzle migrations, then
# starts the Next.js dev server.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RESET_DB=false
SKIP_INSTALL=false

for arg in "$@"; do
  case "$arg" in
    --reset-db)
      RESET_DB=true
      ;;
    --skip-install)
      SKIP_INSTALL=true
      ;;
    -h|--help)
      cat <<'EOF'
Start FolioMint locally.

Usage:
  npm run app
  npm run app -- --reset-db
  bash scripts/run-app.sh --reset-db

Use --reset-db once after large schema rewrites. It backs up data/dev.db,
creates a fresh local SQLite database, applies Drizzle migrations, then
starts the Next.js dev server.
EOF
      exit 0
      ;;
    *)
      echo "error: unknown argument: $arg" >&2
      echo "Run: npm run app -- --help" >&2
      exit 1
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  echo "error: node is not installed or not on PATH" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "error: npm is not installed or not on PATH" >&2
  exit 1
fi

if [[ ! -f .env.local ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example (LOCAL_DEV_MODE=true for auth/Pro/mock-AI bypass)."
  else
    echo "warning: no .env.local and no .env.example; create .env.local before relying on auth or AI features." >&2
  fi
fi

mkdir -p data

if [[ "$SKIP_INSTALL" == "false" ]]; then
  if [[ ! -d node_modules ]]; then
    echo "Installing dependencies..."
    npm install
  else
    echo "Dependencies found. Skipping install. Use npm install manually if package files changed."
  fi
fi

if [[ "$RESET_DB" == "true" ]]; then
  if [[ -f data/dev.db ]]; then
    backup="data/dev.db.backup.$(date +%Y%m%d%H%M%S)"
    mv data/dev.db "$backup"
    echo "Backed up existing local database to $backup"
  fi

  echo "Applying local database migrations..."
  npm run db:migrate
else
  echo "Skipping database reset."
  echo "If the app errors because your local DB has old columns, run: npm run app -- --reset-db"
fi

echo "Starting development server..."
exec npm run dev
