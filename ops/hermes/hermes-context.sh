#!/usr/bin/env bash
# Markdown context snapshot for Hermes Manager (chat / heartbeat).
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
[[ -f "$HERMES_HOME/config.env" ]] && source "$HERMES_HOME/config.env"

REPO="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
GITHUB_REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
OA_HOME="${HERMES_HOME}/oa"

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

echo "## Open opencode / FCC tasks"
if command -v gh >/dev/null 2>&1; then
  gh issue list --repo "$GITHUB_REPO" --state open --label "agent:opencode" --limit 8 2>/dev/null || echo "(gh failed)"
else
  echo "(gh not available)"
fi
echo

echo "## Intake briefs"
if [[ -d "$REPO/docs/intake" ]]; then
  ls -1 "$REPO/docs/intake"/*.md 2>/dev/null | grep -v TEMPLATE | grep -v README || echo "(none)"
else
  echo "(docs/intake missing)"
fi
echo

if [[ -n "${API_BASE_URL:-}" ]] || [[ -n "${HEALTH_URL:-}" ]]; then
  URL="${HEALTH_URL:-${API_BASE_URL}/api/economy/health}"
  echo "## Economy health"
  curl -sf "$URL" 2>/dev/null | head -c 400 || echo "(health check failed)"
  echo
fi

echo "## OA worker"
if [[ -f "${OA_HOME}/RUNNING" ]]; then
  echo "- worker: running"
else
  echo "- worker: stopped (touch ${OA_HOME}/RUNNING or oa-control.sh start)"
fi
if command -v fcc-claude >/dev/null 2>&1 || [[ -x "${HOME}/.local/bin/fcc-claude" ]]; then
  echo "- code agent: Free Claude Code (fcc-claude)"
elif command -v opencode >/dev/null 2>&1; then
  echo "- code agent: OpenCode ($(command -v opencode))"
else
  echo "- code agent: NOT AVAILABLE (install FCC or OpenCode)"
fi
echo

echo "## Hermes gateway"
if systemctl --user is-active hermes-gateway.service >/dev/null 2>&1; then
  echo "- hermes-gateway: active"
else
  echo "- hermes-gateway: inactive"
fi
echo

echo "## GBrain"
if command -v gbrain >/dev/null 2>&1; then
  gbrain stats 2>/dev/null | head -8 || echo "(gbrain stats failed)"
  echo "- Mac agents: Cursor + Antigravity share ~/.gbrain (MCP); reload IDE if tools missing"
  echo "- Re-sync after main merge: gbrain import ai_context docs/intake"
else
  echo "(gbrain not installed — bash ops/hermes/install-gbrain-hermes.sh)"
fi
