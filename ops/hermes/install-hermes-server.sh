#!/usr/bin/env bash
# Idempotent Hermes + OA + optional OpenClaw server install path.
# Safe to re-run: refreshes scripts under ~/hermes/scripts without overwriting secrets.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
SCRIPTS_DIR="${HERMES_HOME}/scripts"
INSTALL_OPENCLAW="${INSTALL_OPENCLAW:-auto}"
INSTALL_SYSTEMD="${INSTALL_SYSTEMD:-false}"

echo "==> GoalChain Hermes server install"
echo "    HERMES_HOME=${HERMES_HOME}"

bash "${SCRIPT_DIR}/bootstrap.sh"

mkdir -p "${SCRIPTS_DIR}" "${HERMES_HOME}/oa/inbox" "${HERMES_HOME}/oa/logs" "${HERMES_HOME}/oa/state"

copy_if_present() {
  local name="$1"
  local src="${SCRIPT_DIR}/${name}"
  [[ -f "${src}" ]] || return 0
  cp "${src}" "${SCRIPTS_DIR}/${name}"
  chmod +x "${SCRIPTS_DIR}/${name}" 2>/dev/null || true
}

for f in "${SCRIPT_DIR}"/*.sh "${SCRIPT_DIR}"/*.py; do
  [[ -f "${f}" ]] || continue
  copy_if_present "$(basename "${f}")"
done

bash "${SCRIPT_DIR}/oa-enable-handsfree.sh"

if [[ "${INSTALL_OPENCLAW}" == "true" ]] || { [[ "${INSTALL_OPENCLAW}" == "auto" ]] && command -v openclaw >/dev/null 2>&1; }; then
  echo "==> OpenClaw optional install"
  if [[ -f "${REPO_ROOT}/ops/openclaw/deploy-workspace.sh" ]]; then
    bash "${REPO_ROOT}/ops/openclaw/deploy-workspace.sh" || echo "WARN: openclaw workspace deploy skipped"
  fi
  if [[ -f "${REPO_ROOT}/ops/openclaw/install-cron.sh" ]]; then
    bash "${REPO_ROOT}/ops/openclaw/install-cron.sh" || echo "WARN: openclaw cron install skipped"
  fi
else
  echo "==> OpenClaw skipped (set INSTALL_OPENCLAW=true when openclaw CLI is available)"
fi

if [[ "${INSTALL_SYSTEMD}" == "true" ]]; then
  bash "${SCRIPTS_DIR}/oa-systemd-install.sh"
fi

echo ""
echo "Install complete."
echo "  config:  ${HERMES_HOME}/config.env"
echo "  scripts: ${SCRIPTS_DIR}"
echo "  start:   bash ${SCRIPTS_DIR}/oa-control.sh restart"
echo "  status:  bash ${SCRIPTS_DIR}/oa-control.sh status"
