#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_IDL="${ROOT}/goalchain_program/target/idl/goalchain_program.json"

TARGETS=(
  "${ROOT}/goalchain-sdk/src/goalchain_program.json"
  "${ROOT}/goalchain-sdk/dist/goalchain_program.json"
  "${ROOT}/docs/assets/js/generated/goalchain_program.idl.json"
)

CHECK_ONLY="${1:-}"

if [[ ! -f "${SOURCE_IDL}" ]]; then
  echo "IDL source not found: ${SOURCE_IDL}"
  echo "Run: cd goalchain_program && anchor build --ignore-keys"
  exit 1
fi

if [[ "${CHECK_ONLY}" == "--check" ]]; then
  for target in "${TARGETS[@]}"; do
    if [[ ! -f "${target}" ]]; then
      echo "Missing synced IDL target: ${target}"
      exit 1
    fi
    if ! cmp -s "${SOURCE_IDL}" "${target}"; then
      echo "IDL out of sync: ${target}"
      exit 1
    fi
  done
  echo "IDL sync check OK."
  exit 0
fi

for target in "${TARGETS[@]}"; do
  mkdir -p "$(dirname "${target}")"
  cp "${SOURCE_IDL}" "${target}"
  echo "Synced IDL -> ${target}"
done

echo "IDL sync completed."
