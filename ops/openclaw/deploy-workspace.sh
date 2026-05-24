#!/usr/bin/env bash
# Deploy GoalChain OpenClaw workspace templates to ~/.openclaw/workspace
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES="${SCRIPT_DIR}/workspace-templates"
WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"

if [[ ! -d "$TEMPLATES" ]]; then
  echo "ERROR: missing templates: $TEMPLATES" >&2
  exit 1
fi

mkdir -p "$WORKSPACE/memory"

for f in SOUL.md IDENTITY.md USER.md HEARTBEAT.md MEMORY.md; do
  cp "$TEMPLATES/$f" "$WORKSPACE/$f"
  echo "==> deployed $f"
done

if [[ -f "$TEMPLATES/GOALCHAIN.md" ]]; then
  cp "$TEMPLATES/GOALCHAIN.md" "$WORKSPACE/GOALCHAIN.md"
  echo "==> deployed GOALCHAIN.md"
fi

# Repo symlink for agent file reads
GOALCHAIN="${HERMES_HOME}/workspace/GoalChain"
if [[ -d "$GOALCHAIN" ]]; then
  ln -sfn "$GOALCHAIN" "$WORKSPACE/GoalChain"
  echo "==> symlink GoalChain -> $GOALCHAIN"
fi

# Ops scripts
mkdir -p "$HERMES_HOME/scripts"
if [[ -f "$SCRIPT_DIR/../hermes/openclaw-context.sh" ]]; then
  cp "$SCRIPT_DIR/../hermes/openclaw-context.sh" "$HERMES_HOME/scripts/"
  chmod +x "$HERMES_HOME/scripts/openclaw-context.sh"
  echo "==> installed openclaw-context.sh"
fi
if [[ -f "$SCRIPT_DIR/../hermes/create-task.sh" ]]; then
  cp "$SCRIPT_DIR/../hermes/create-task.sh" "$HERMES_HOME/scripts/"
  chmod +x "$HERMES_HOME/scripts/create-task.sh"
  echo "==> installed create-task.sh"
fi

# GOALCHAIN.md deployed from templates (includes ops instructions)

echo "Done. Restart gateway if needed: openclaw gateway restart"
