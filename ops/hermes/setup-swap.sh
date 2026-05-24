#!/usr/bin/env bash
# Add a swap file on Hermes VPS for GBrain PGLite + dream cycle (needs sudo once).
# Default: 2GB at /swapfile. Idempotent if swap already active.
set -euo pipefail

SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"
SWAP_FILE="${SWAP_FILE:-/swapfile}"

if swapon --show 2>/dev/null | grep -q "${SWAP_FILE}"; then
  echo "swap: already active on ${SWAP_FILE}"
  swapon --show
  free -h | head -3
  exit 0
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "This script must run with sudo (one time):"
  echo "  sudo bash $0"
  exit 1
fi

echo "==> Creating ${SWAP_SIZE_GB}G swap at ${SWAP_FILE}"
fallocate -l "${SWAP_SIZE_GB}G" "${SWAP_FILE}" 2>/dev/null || dd if=/dev/zero of="${SWAP_FILE}" bs=1M count=$((SWAP_SIZE_GB * 1024)) status=progress
chmod 600 "${SWAP_FILE}"
mkswap "${SWAP_FILE}"
swapon "${SWAP_FILE}"

if ! grep -q "^${SWAP_FILE} " /etc/fstab 2>/dev/null; then
  echo "${SWAP_FILE} none swap sw 0 0" >> /etc/fstab
fi

# Prefer swap only under memory pressure
sysctl vm.swappiness=10
grep -q '^vm.swappiness=' /etc/sysctl.conf 2>/dev/null \
  && sed -i 's/^vm.swappiness=.*/vm.swappiness=10/' /etc/sysctl.conf \
  || echo 'vm.swappiness=10' >> /etc/sysctl.conf

echo "==> Done"
swapon --show
free -h
