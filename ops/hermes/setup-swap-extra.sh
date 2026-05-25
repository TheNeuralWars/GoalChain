#!/usr/bin/env bash
# Add extra swap on Hermes VPS (default: +2GB at /swapfile2). Idempotent.
# Usage: sudo SWAP_SIZE_GB=2 SWAP_FILE=/swapfile2 bash ops/hermes/setup-swap-extra.sh
set -euo pipefail

SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"
SWAP_FILE="${SWAP_FILE:-/swapfile2}"

if swapon --show 2>/dev/null | grep -qF "${SWAP_FILE}"; then
  echo "swap: already active on ${SWAP_FILE}"
  swapon --show
  free -h | head -4
  exit 0
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo:"
  echo "  sudo SWAP_SIZE_GB=${SWAP_SIZE_GB} SWAP_FILE=${SWAP_FILE} bash $0"
  exit 1
fi

echo "==> Creating ${SWAP_SIZE_GB}G swap at ${SWAP_FILE}"
fallocate -l "${SWAP_SIZE_GB}G" "${SWAP_FILE}" 2>/dev/null \
  || dd if=/dev/zero of="${SWAP_FILE}" bs=1M count=$((SWAP_SIZE_GB * 1024)) status=none
chmod 600 "${SWAP_FILE}"
mkswap "${SWAP_FILE}"
swapon "${SWAP_FILE}"

if ! grep -qF "${SWAP_FILE} " /etc/fstab 2>/dev/null; then
  echo "${SWAP_FILE} none swap sw 0 0" >> /etc/fstab
fi

sysctl vm.swappiness=10 >/dev/null

echo "==> Done (+${SWAP_SIZE_GB}G swap)"
swapon --show
free -h
