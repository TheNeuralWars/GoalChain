#!/usr/bin/env bash
# Prepare Grok Visual V7.1 session for Hermes on the VPS.
set -euo pipefail

log() { printf '[prepare-grok-v71-session] %s\n' "$*"; }

# 1. Run the skills installer
log "Installing visual skills..."
bash "$(dirname "${BASH_SOURCE[0]}")/install-grok-visual-v71-skills.sh" hermes-ceo

# 2. Make sure the batch directory structures exist in scratch on the VPS
log "Ensuring directory structures in scratch..."
mkdir -p /data/apps/GoalChain/scratch/grok_batches_v7/sources
mkdir -p /data/apps/GoalChain/scratch/grok_batches_v7/outputs

# 3. Copy the logo to the correct path if it exists
if [[ -f "/data/apps/GoalChain/scratch/grok_batches_v7/logo_3d_jersey.jpg" ]]; then
  log "logo_3d_jersey.jpg already exists."
else
  # Try to find logo in assets or parent folder
  if [[ -f "/data/apps/GoalChain/scratch/logo_3d_jersey.jpg" ]]; then
    cp "/data/apps/GoalChain/scratch/logo_3d_jersey.jpg" "/data/apps/GoalChain/scratch/grok_batches_v7/"
    log "Copied logo from scratch root."
  fi
fi

# 4. Optional sync tip:
# If you need to sync all sources/ images from your local PC to the VPS, you can run from your local Windows PowerShell:
# rsync -avz --exclude="outputs/" scratch/grok_batches_v7/ ubuntu@<vps-ip>:/data/apps/GoalChain/scratch/grok_batches_v7/

log "Grok V7.1 session preparation finished. You can now prompt Hermes."
