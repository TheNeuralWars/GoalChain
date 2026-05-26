#!/usr/bin/env bash
# Run immediately after: hermes profile create NAME --clone --clone-from default
# Ensures new agent profiles inherit shared Discord, X, and xAI OAuth.
#
# Usage:
#   bash ops/hermes/on-profile-created.sh my-new-agent
set -euo pipefail

PROFILE="${1:-}"
if [[ -z "${PROFILE}" ]]; then
  echo "Usage: bash ops/hermes/on-profile-created.sh PROFILE_NAME"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${SCRIPT_DIR}/sync-goalchain-agent-profiles.sh" --profile "${PROFILE}"
printf '[on-profile-created] %s ready (Discord + X + OAuth shared from default)\n' "${PROFILE}"
