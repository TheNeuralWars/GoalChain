#!/usr/bin/env bash
# scripts/check-tasks.sh
# Syncs repository and lists pending tasks from Manager.

echo "🔄 Sincronizando repositorio..."
git pull

echo ""
echo "🤖 Tareas activas asignadas por Manager:"
if command -v gh &> /dev/null; then
  echo "--- Cursor ---"
  gh issue list --label "status:ready" --label "agent:cursor" --limit 5
  echo ""
  echo "--- Antigravity (Spikes) ---"
  gh issue list --label "status:ready" --label "agent:antigravity" --limit 5
  echo ""
  echo "--- OpenCode ---"
  gh issue list --label "status:ready" --label "agent:opencode" --limit 5
else
  echo "⚠️ GitHub CLI (gh) no está instalado o autenticado. Revisando docs/intake/..."
  find docs/intake/ -name "*.md" -mtime -2 -exec grep -H "status: ready" {} \;
fi
