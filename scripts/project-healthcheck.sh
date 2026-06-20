#!/usr/bin/env bash
# scripts/project-healthcheck.sh
# Verifies compile-time health of all GoalChain components.

set -euo pipefail

PRIMARY_ROOT="/Users/NicoPez/GoalChain"
if [ ! -d "$PRIMARY_ROOT" ]; then
  PRIMARY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

log() { printf '[%s] [HEALTHCHECK] %s\n' "$(date -u '+%F %T UTC')" "$*"; }

failed=0

log "Starting GoalChain components healthcheck..."

# 1. Check SDK
log "Checking goalchain-sdk..."
if (cd "$PRIMARY_ROOT/goalchain-sdk" && npm run build) >/dev/null 2>&1; then
  log "✓ goalchain-sdk build: OK"
else
  log "✗ goalchain-sdk build: FAILED"
  failed=1
fi

# 2. Check API
log "Checking goalchain_api..."
if (cd "$PRIMARY_ROOT/goalchain_api" && npx tsc --noEmit) >/dev/null 2>&1; then
  log "✓ goalchain_api typecheck: OK"
else
  log "✗ goalchain_api typecheck: FAILED"
  failed=1
fi

# 3. Check Webapp
log "Checking goalchain_webapp..."
if (cd "$PRIMARY_ROOT/goalchain_webapp" && npx tsc --noEmit && npm run build) >/dev/null 2>&1; then
  log "✓ goalchain_webapp build: OK"
else
  log "✗ goalchain_webapp build: FAILED"
  failed=1
fi

# 4. Check Program
log "Checking goalchain_program..."
if (cd "$PRIMARY_ROOT/goalchain_program" && cargo check) >/dev/null 2>&1; then
  log "✓ goalchain_program check: OK"
else
  log "✗ goalchain_program check: FAILED"
  failed=1
fi

if [ $failed -eq 0 ]; then
  log "🎉 All healthchecks PASSED!"
  exit 0
else
  log "🚨 Healthcheck FAILED for one or more components."
  exit 1
fi
