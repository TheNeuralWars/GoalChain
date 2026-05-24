#!/usr/bin/env bash
# Pull latest GoalChain + optional health check
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
[[ -f "${HERMES_HOME}/config.env" ]] && source "${HERMES_HOME}/config.env"

REPO="${GOALCHAIN_REPO_PATH:?GOALCHAIN_REPO_PATH not set}"
BRANCH="${GITHUB_DEFAULT_BRANCH:-main}"

echo "==> git pull (${BRANCH}) in ${REPO}"
git -C "${REPO}" fetch origin
git -C "${REPO}" checkout "${BRANCH}" 2>/dev/null || true
git -C "${REPO}" pull --ff-only origin "${BRANCH}" || git -C "${REPO}" pull origin "${BRANCH}"

echo "==> Intake briefs:"
ls -1 "${REPO}/docs/intake/"*.md 2>/dev/null | grep -v TEMPLATE | grep -v README || echo "(none)"

if [[ -n "${HEALTH_URL:-}" ]] || [[ -n "${API_BASE_URL:-}" ]]; then
  URL="${HEALTH_URL:-${API_BASE_URL}/api/economy/health}"
  echo "==> Health: ${URL}"
  curl -sf "${URL}" | head -c 500 || echo "WARN: health check failed"
  echo ""
fi

if command -v gh >/dev/null 2>&1 && [[ -n "${GITHUB_REPO:-}" ]]; then
  echo "==> Open PRs:"
  gh pr list --repo "${GITHUB_REPO}" --state open --limit 5
fi

if [[ -f "${REPO}/scripts/anytype_sync.py" ]]; then
  echo "==> Running Anytype synchronization..."
  python3 "${REPO}/scripts/anytype_sync.py" || echo "WARN: Anytype sync failed"
fi
