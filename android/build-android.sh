#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# EcoSort Heroes — Android Build & Package Script (Agent H)
# Packages web assets into the standalone offline Android distribution.
# ─────────────────────────────────────────────────────────────────────────────

echo "=== [1/3] Building Production Web Assets ==="
cd "$(dirname "$0")/.."
npm run build

echo "=== [2/3] Verifying Performance & Asset Budgets ==="
DIST_SIZE_MB=$(du -sm dist | cut -f1)
echo "Total dist size: ${DIST_SIZE_MB} MB"
if [ "$DIST_SIZE_MB" -gt 35 ]; then
  echo "WARNING: Production bundle exceeds recommended 35MB budget!"
fi

echo "=== [3/3] Android Packaging Ready ==="
echo "Artifacts prepared for Capacitor Android runtime."
echo "Use 'npx cap sync android' or Android Studio gradle build."
