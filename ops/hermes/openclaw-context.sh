#!/usr/bin/env bash
# Markdown context for OpenClaw heartbeat / general agent (GoalChain ops)
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
[[ -f "$HERMES_HOME/config.env" ]] && source "$HERMES_HOME/config.env"

REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
GITHUB_REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"

echo "# GoalChain ops snapshot ($(date -u '+%Y-%m-%d %H:%M UTC'))"
echo

if [[ -d "$REPO/.git" ]]; then
  echo "## Git"
  git -C "$REPO" fetch origin -q 2>/dev/null || true
  git -C "$REPO" status -sb | head -3
  echo
fi

echo "## Open PRs"
if command -v gh >/dev/null 2>&1; then
  gh pr list --repo "$GITHUB_REPO" --state open --limit 12 2>/dev/null || echo "(gh failed)"
else
  echo "(gh not available)"
fi
echo

echo "## Intake briefs"
if [[ -d "$REPO/docs/intake" ]]; then
  ls -1 "$REPO/docs/intake"/*.md 2>/dev/null | grep -v TEMPLATE | grep -v README || echo "(none)"
else
  echo "(docs/intake missing — merge PR #34?)"
fi
echo

echo "## Merge order (reference)"
echo "1. PR #32 consolidation"
echo "2. PR #33 video (flags off)"
echo "3. PR #34 observability"
echo

echo "## Blocked until Nico confirms merge"
echo "- docs/intake/2026-05-22-webapp-devnet-transactions.md → do not assign implementation yet"
echo

if [[ -n "${API_BASE_URL:-}" ]] || [[ -n "${HEALTH_URL:-}" ]]; then
  URL="${HEALTH_URL:-${API_BASE_URL}/api/economy/health}"
  echo "## Economy health"
  curl -sf "$URL" 2>/dev/null | head -c 400 || echo "(health check failed)"
  echo
fi

echo "## Gateway"
openclaw gateway status 2>/dev/null | grep -E "Runtime:|Connectivity|Listening" || echo "(openclaw status unavailable)"
