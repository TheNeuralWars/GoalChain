#!/usr/bin/env bash
# ops/hermes/server-cleanup.sh
# Emergency + ongoing cleanup for overloaded GoalChain/Hermes VPS
# Usage (on VPS):
#   chmod +x ops/hermes/server-cleanup.sh
#   ./ops/hermes/server-cleanup.sh --safe          # conservative (recommended first)
#   ./ops/hermes/server-cleanup.sh --aggressive    # stops Postiz/Twenty/Temporal too
#   ./ops/hermes/server-cleanup.sh --move-assets   # moves big player assets to extra volume

set -euo pipefail

MODE="${1:---safe}"
EXTRA_VOLUME="/mnt/HC_Volume_105898751"
GOALCHAIN_HOME="${GOALCHAIN_HOME:-/home/goalchain}"
HERMES_HOME="${HERMES_HOME:-$GOALCHAIN_HOME/hermes}"

echo "=== GoalChain/Hermes Server Cleanup ==="
echo "Mode: $MODE"
echo "Date: $(date)"
df -h | head -5
free -h | head -3
echo

# 1. Docker reclaim (always safe-ish)
echo ">>> Docker system prune (images, containers, volumes, build cache)..."
docker system prune -a --volumes -f || true
docker builder prune -f || true
echo "Docker reclaimed."

# 2. Log vacuum
echo ">>> Vacuum logs (systemd + hermes)..."
sudo journalctl --vacuum-time=7d --vacuum-size=300M || true
find "$HERMES_HOME/logs" -type f -mtime +7 -delete 2>/dev/null || true
sudo find /var/log -type f \( -name "*.log" -o -name "*.gz" \) -mtime +14 -delete 2>/dev/null || true
echo "Logs cleaned."

# 3. Clean apt / tmp
echo ">>> Apt and tmp cleanup..."
sudo apt-get clean -y || true
sudo rm -rf /tmp/* /var/tmp/* 2>/dev/null || true
echo "Apt/tmp cleaned."

# 4. Aggressive: stop heavy non-core stacks (Postiz, Twenty, full Temporal)
if [[ "$MODE" == "--aggressive" ]]; then
  echo ">>> AGGRESSIVE: stopping Postiz, Twenty, Temporal stacks..."
  if [[ -f "$GOALCHAIN_HOME/twenty/docker-compose.yml" ]]; then
    (cd "$GOALCHAIN_HOME/twenty" && docker compose down --remove-orphans || true)
  fi
  if [[ -f "$GOALCHAIN_HOME/postiz-marketing/docker-compose.yaml" ]]; then
    (cd "$GOALCHAIN_HOME/postiz-marketing" && docker compose down --remove-orphans || true)
  fi
  echo "Heavy stacks stopped (you can bring them up later when you actively need the CRM/scheduler)."
fi

# 5. Move big static assets to the extra volume (if present and has space)
if [[ "$MODE" == "--move-assets" || "$MODE" == "--aggressive" ]]; then
  if mount | grep -q "$EXTRA_VOLUME"; then
    echo ">>> Moving large assets to extra volume ($EXTRA_VOLUME)..."
    sudo mkdir -p "$EXTRA_VOLUME/goalchain-data/mint_assets"
    sudo chown -R goalchain:goalchain "$EXTRA_VOLUME/goalchain-data" || true

    MINT_SRC="$GOALCHAIN_HOME/GoalChain/mint_setup/assets"
    if [[ -d "$MINT_SRC" && "$(du -sm "$MINT_SRC" 2>/dev/null | cut -f1 || echo 0)" -gt 200 ]]; then
      echo "  Moving mint_setup/assets (~1 GB+)..."
      rsync -a --info=progress2 "$MINT_SRC/" "$EXTRA_VOLUME/goalchain-data/mint_assets/" || true
      rm -rf "${MINT_SRC:?}"/* 2>/dev/null || true
      ln -sfn "$EXTRA_VOLUME/goalchain-data/mint_assets" "$MINT_SRC"
      echo "  mint assets moved + symlinked."
    fi

    # Optional: move some heavy .hermes profile data (only if you know what you're doing)
    # echo "  (Skipping heavy .hermes profiles by default — do manually if needed)"
  else
    echo "Extra volume $EXTRA_VOLUME not mounted or not found. Skipping asset move."
  fi
fi

# 6. Trim very large individual profile dirs (hermes-ceo is often the biggest)
if [[ -d "$GOALCHAIN_HOME/.hermes/profiles/hermes-ceo" ]]; then
  DU=$(du -sm "$GOALCHAIN_HOME/.hermes/profiles/hermes-ceo" 2>/dev/null | cut -f1 || echo 0)
  if [[ "$DU" -gt 800 ]]; then
    echo ">>> hermes-ceo profile is ${DU}M — consider pruning old sandboxes/sessions inside it."
    echo "    Example (review first): find ~/.hermes/profiles/hermes-ceo -name 'sandboxes' -type d -exec rm -rf {} +"
  fi
fi

echo
echo "=== After cleanup ==="
df -h | head -5
free -h | head -3
docker system df | head -5

echo
echo "Cleanup done. If disk is still tight, consider:"
echo "  - Moving /var/lib/docker to the extra volume (edit /etc/docker/daemon.json)"
echo "  - Dropping Postiz/Twenty/Temporal entirely or moving them to their own tiny VPS"
echo "  - Upgrading the VPS or moving to Oracle Always Free (see docs/SERVER_UPGRADE_LOW_BUDGET.md)"
echo
echo "Reboot recommended after big prunes: sudo reboot"