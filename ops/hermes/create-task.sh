#!/usr/bin/env bash
# Create a GoalChain task issue from server with owner labels.
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
# shellcheck disable=SC1090
source "$HERMES_HOME/config.env"

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <owner:cursor|antigravity|hermes|code|grok> <priority:P0|P1|P2> <title> <objective>"
  echo "Example:"
  echo "  $0 cursor P1 \"Webapp devnet bets\" \"Wire real place_bet tx in webapp\""
  exit 1
fi

OWNER="$1"
PRIORITY="$2"
TITLE="$3"
OBJECTIVE="$4"

case "$OWNER" in
  code|opencode) OWNER="hermes" ;;
  cursor|antigravity|hermes|grok) ;;
  *)
    echo "ERROR: owner must be one of: cursor|antigravity|hermes|code|grok"
    exit 1
    ;;
esac

case "$PRIORITY" in
  P0|P1|P2) ;;
  *)
    echo "ERROR: priority must be P0, P1, or P2"
    exit 1
    ;;
esac

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI not found"
  exit 1
fi

# Ensure canonical labels exist (ignore if already present).
gh label create "agent:${OWNER}" --repo "$GITHUB_REPO" --color "1f6feb" --description "Task owner ${OWNER}" >/dev/null 2>&1 || true
gh label create "priority:${PRIORITY}" --repo "$GITHUB_REPO" --color "d73a4a" --description "Priority ${PRIORITY}" >/dev/null 2>&1 || true
gh label create "status:ready" --repo "$GITHUB_REPO" --color "0e8a16" --description "Ready to start" >/dev/null 2>&1 || true
gh label create "source:manager" --repo "$GITHUB_REPO" --color "5319e7" --description "Created by Manager/OpenClaw" >/dev/null 2>&1 || true

ISSUE_TITLE="[${OWNER^^}] ${TITLE}"
ISSUE_BODY="$(cat <<EOF
## Objective
${OBJECTIVE}

## Owner
${OWNER}

## Priority
${PRIORITY}

## Context
Requested by Nico via Manager (WhatsApp/OpenClaw). Keep scope tight and aligned with GoalChain orchestration rules.

## Required output
- Proposed file list
- Risks/regressions + rollback
- Exact test commands

## Workflow
- One implementer only
- Branch naming:
  - cursor: \`feat/*\` or \`fix/*\`
  - antigravity: \`exp/antigravity-*\`
  - hermes: \`exp/hermes-*\`
  - grok: \`exp/grok-*\`
- Draft PR for Antigravity/Nico review — no direct merge to \`main\` unless \`cambio urgente\`
EOF
)"

ISSUE_URL="$(gh issue create \
  --repo "$GITHUB_REPO" \
  --title "$ISSUE_TITLE" \
  --body "$ISSUE_BODY" \
  --label "agent:${OWNER}" \
  --label "priority:${PRIORITY}" \
  --label "status:ready" \
  --label "source:manager")"

echo "Created issue: $ISSUE_URL"
