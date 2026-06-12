#!/usr/bin/env bash
# GoalChain master performance tuning & ECC optimization setup.
# Safe to re-run. Mac or VPS.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

log() { printf '[ecc-optimizations] %s\n' "$*"; }

# 1. Setup local environment flags
setup_env_flags() {
  log "Setting environment flags for token optimization & performance..."

  # Setup for Mac shell if we are running locally
  local shell_rcs=("$HOME/.zshrc" "$HOME/.bashrc")
  local vars=(
    "ECC_HOOK_PROFILE=minimal"
    "ECC_SESSION_START_CONTEXT=off"
    "ECC_CONTEXT_MONITOR_COST_WARNINGS=off"
    "ECC_SESSION_RETENTION_DAYS=7"
    "ECC_AGENT_DATA_HOME=\"\$HOME/.cursor/ecc\""
  )

  for rc in "${shell_rcs[@]}"; do
    if [[ -f "${rc}" ]]; then
      for var in "${vars[@]}"; do
        local key="${var%%=*}"
        if ! grep -q "export ${key}=" "${rc}"; then
          echo "export ${var}" >> "${rc}"
          log "Added ${key} export to ${rc}"
        fi
      done
    fi
  done

  # VPS settings: write to ~/hermes/config.env and ~/.hermes/.env if they exist
  local vps_envs=("$HOME/.hermes/.env" "$HOME/hermes/config.env")
  for env_file in "${vps_envs[@]}"; do
    if [[ -f "${env_file}" ]]; then
      for var in "${vars[@]}"; do
        local key="${var%%=*}"
        local val="${var#*=}"
        # Strip quotes if any
        val="${val%\"}"
        val="${val#\"}"
        if grep -q "^${key}=" "${env_file}"; then
          # replace existing value
          sed -i.bak "s|^${key}=.*|${key}=\"${val}\"|g" "${env_file}" && rm -f "${env_file}.bak"
        else
          echo "${key}=\"${val}\"" >> "${env_file}"
        fi
      done
      log "Patched ${env_file} with ECC options"
    fi
  done
}

# 2. SQLite Database Vacuuming (Maintenance)
vacuum_databases() {
  log "Pruning database overhead and vacuuming logs..."
  local dbs=(
    "$HOME/.hermes/state.db"
    "$HOME/.hermes/kanban.db"
    "$HOME/hermes/state.db"
  )

  for db in "${dbs[@]}"; do
    if [[ -f "${db}" ]] && command -v sqlite3 >/dev/null 2>&1; then
      local size_before
      size_before=$(wc -c < "${db}")
      sqlite3 "${db}" "VACUUM;"
      local size_after
      size_after=$(wc -c < "${db}")
      log "Vacuumed SQLite DB: ${db} (${size_before} -> ${size_after} bytes)"
    fi
  done
}

# 3. Trim Memory and Prune Stale Files
prune_stale_files() {
  log "Pruning stale backups and session cache files..."
  # Clean up temp files older than 7 days if they exist
  local cache_dirs=(
    "$HOME/.hermes/session-data"
    "$HOME/.cursor/ecc/session-data"
  )
  for dir in "${cache_dirs[@]}"; do
    if [[ -d "${dir}" ]]; then
      find "${dir}" -type f -mtime +7 -delete 2>/dev/null || true
      log "Pruned files older than 7 days in ${dir}"
    fi
  done

  # Trim main memory if script exists
  if [[ -f "${SCRIPT_DIR}/trim-hermes-memory.sh" ]]; then
    bash "${SCRIPT_DIR}/trim-hermes-memory.sh" || true
  fi
}

main() {
  setup_env_flags
  vacuum_databases
  prune_stale_files
  
  # Trigger FCC skills installer
  if [[ -x "${SCRIPT_DIR}/install-fcc-skills.sh" ]]; then
    SKIP_GSTACK_BROWSER=1 bash "${SCRIPT_DIR}/install-fcc-skills.sh"
  fi
  
  log "ECC optimizations successfully applied."
}

main "$@"
