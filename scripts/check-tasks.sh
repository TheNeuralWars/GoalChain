#!/usr/bin/env bash
# scripts/check-tasks.sh
# Syncs repository and lists pending / in-progress / dispatch tasks from Manager.

set -euo pipefail

MUNDIAL_ONLY=0
if [[ "${1:-}" == "--mundial" || "${1:-}" == "-m" || "${1:-}" == "--mundial-only" || ( "${1:-}" == "--label" && "${2:-}" == "mundial-mvp" ) ]]; then
  MUNDIAL_ONLY=1
fi

echo "🔄 Sincronizando repositorio..."
git pull 2>/dev/null || echo "⚠️ Sincronización git pull omitida (sin rama remota o tracking info)."

echo ""
if ! command -v gh >/dev/null 2>&1; then
  echo "⚠️ GitHub CLI (gh) no está instalado o autenticado. Revisando docs/intake/..."
  find docs/intake/ -name "*.md" -mtime -2 -exec grep -H "status: ready" {} \; 2>/dev/null || true
  exit 0
fi

list_agent_tasks() {
  local agent="$1"
  local status="$2"
  local labels_arg=(--label "status:${status}" --label "agent:${agent}")
  if [[ "${MUNDIAL_ONLY}" -eq 1 ]]; then
    labels_arg+=(--label "mundial-mvp")
  fi
  gh issue list \
    "${labels_arg[@]}" \
    --limit 8 \
    --json number,title,labels,updatedAt \
    --jq '.[] | "\(.number)\t\(.title)"' 2>/dev/null || true
}

echo "🤖 Tareas activas asignadas por Manager:"
if [[ "${MUNDIAL_ONLY}" -eq 1 ]]; then
  echo "🏆 [Filtro: mundial-mvp activo]"
fi

for agent in cursor antigravity opencode grok; do
  echo ""
  echo "--- ${agent} (ready) ---"
  list_agent_tasks "${agent}" "ready"
  echo "--- ${agent} (in_progress) ---"
  list_agent_tasks "${agent}" "in_progress"
done

echo ""
echo "--- Dispatch (local bridge) ---"
echo "queued:"
gh issue list --label "dispatch:local-queued" --limit 8 \
  --json number,title --jq '.[] | "\(.number)\t\(.title)"' 2>/dev/null || true
echo "running:"
gh issue list --label "dispatch:local-running" --limit 8 \
  --json number,title --jq '.[] | "\(.number)\t\(.title)"' 2>/dev/null || true
echo "blocked:"
gh issue list --label "status:blocked" --limit 8 \
  --json number,title --jq '.[] | "\(.number)\t\(.title)"' 2>/dev/null || true
