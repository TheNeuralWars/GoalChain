#!/usr/bin/env bash
# Install Claude Code skills for FCC (frontend-design + gstack subset + ECC optimizations).
# Safe to re-run. Mac or VPS (user goalchain / your $HOME).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SKILLS_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
PROJECT_SKILLS_DIR="${REPO_ROOT}/.claude/skills"
GSTACK_REPO="${GSTACK_REPO:-https://github.com/garrytan/gstack.git}"
DRY_RUN="${DRY_RUN:-0}"
SKIP_GSTACK_BROWSER="${SKIP_GSTACK_BROWSER:-0}"

log() { printf '[fcc-skills] %s\n' "$*"; }

run() {
  if [[ "${DRY_RUN}" == "1" ]]; then
    log "dry-run: $*"
  else
    "$@"
  fi
}

mkdir -p "${SKILLS_DIR}"

install_frontend_design() {
  local dest="${SKILLS_DIR}/frontend-design"
  local repo_skill="${REPO_ROOT}/.agents/skills/frontend-design"
  if [[ -f "${dest}/SKILL.md" ]]; then
    log "frontend-design: already present at ${dest}"
    return 0
  fi
  log "frontend-design: installing to ${dest}"
  if [[ -f "${repo_skill}/SKILL.md" ]]; then
    run mkdir -p "${dest}" "${PROJECT_SKILLS_DIR}/frontend-design"
    run cp -R "${repo_skill}/"* "${dest}/"
    run cp -R "${repo_skill}/"* "${PROJECT_SKILLS_DIR}/frontend-design/"
    log "frontend-design: synced to ${dest} and ${PROJECT_SKILLS_DIR}/frontend-design"
    return 0
  fi
  if [[ -f "${PROJECT_SKILLS_DIR}/frontend-design/SKILL.md" && ! -f "${dest}/SKILL.md" ]]; then
    run mkdir -p "${dest}"
    run cp -R "${PROJECT_SKILLS_DIR}/frontend-design/"* "${dest}/"
    log "frontend-design: copied project skill -> ${dest}"
    return 0
  fi
  if [[ -f "${dest}/SKILL.md" ]]; then
    return 0
  fi
  log "frontend-design: npx/git fallback"
  local tmp
  tmp="$(mktemp -d)"
  run git clone --depth 1 --filter=blob:none --sparse https://github.com/anthropics/skills.git "${tmp}/anthropics-skills"
  (
    cd "${tmp}/anthropics-skills"
    run git sparse-checkout set skills/frontend-design
  )
  run mkdir -p "${dest}"
  if [[ -f "${tmp}/anthropics-skills/skills/frontend-design/SKILL.md" ]]; then
    run cp -R "${tmp}/anthropics-skills/skills/frontend-design/"* "${dest}/"
    log "frontend-design: copied from anthropics/skills"
  else
    log "WARN: frontend-design SKILL.md not found; skip"
  fi
  run rm -rf "${tmp}"
}

install_gstack() {
  local dest="${SKILLS_DIR}/gstack"
  if [[ -d "${dest}/.git" ]] || [[ -f "${dest}/setup" ]]; then
    log "gstack: updating ${dest}"
    if [[ -d "${dest}/.git" ]]; then
      (cd "${dest}" && run git pull --ff-only 2>/dev/null) || true
    fi
  else
    log "gstack: cloning to ${dest}"
    run git clone --single-branch --depth 1 "${GSTACK_REPO}" "${dest}"
  fi
  if [[ "${SKIP_GSTACK_BROWSER}" == "1" ]]; then
    log "gstack: SKIP_GSTACK_BROWSER=1 — clone only (FCC uses review/investigate via CLAUDE.md; no Playwright on VPS)"
    return 0
  fi
  if [[ -x "${dest}/setup" ]]; then
    log "gstack: running ./setup (full — Mac/local only; slow on VPS)"
    (cd "${dest}" && run ./setup) || log "WARN: gstack setup exited non-zero (may need interactive deps)"
  else
    log "WARN: gstack setup script missing"
  fi
}

install_ecc_optimization_skills() {
  log "ECC: installing custom optimization skills"

  # Create skills directories
  local names=(
    "parallel-execution-optimizer"
    "latency-critical-systems"
    "recursive-decision-ledger"
    "data-throughput-accelerator"
  )

  for name in "${names[@]}"; do
    run mkdir -p "${SKILLS_DIR}/${name}"
    run mkdir -p "${PROJECT_SKILLS_DIR}/${name}"
  done

  # parallel-execution-optimizer
  cat <<'EOF' > "${SKILLS_DIR}/parallel-execution-optimizer/SKILL.md"
# Parallel Execution Optimizer

Optimize execution speed by running parallel, independent tasks concurrently where supported.

## Usage
- When compiling, building, or running test matrices, segment tasks into non-blocking chunks.
- Avoid cascading synchronous wait commands.
EOF
  run cp "${SKILLS_DIR}/parallel-execution-optimizer/SKILL.md" "${PROJECT_SKILLS_DIR}/parallel-execution-optimizer/SKILL.md"

  # latency-critical-systems
  cat <<'EOF' > "${SKILLS_DIR}/latency-critical-systems/SKILL.md"
# Latency Critical Systems

Guidelines for optimizing runtime and execution latency in agent workflows.

## Usage
- Avoid loading heavy external dependencies in loops.
- Cache compiler outputs and dependencies locally where possible.
EOF
  run cp "${SKILLS_DIR}/latency-critical-systems/SKILL.md" "${PROJECT_SKILLS_DIR}/latency-critical-systems/SKILL.md"

  # recursive-decision-ledger
  cat <<'EOF' > "${SKILLS_DIR}/recursive-decision-ledger/SKILL.md"
# Recursive Decision Ledger

Keep track of complex decision paths to avoid loops and redundant evaluation.

## Usage
- Log major design choices in plain text to prevent context drift and circular thinking.
- Use explicit checkpoints before starting major refactoring steps.
EOF
  run cp "${SKILLS_DIR}/recursive-decision-ledger/SKILL.md" "${PROJECT_SKILLS_DIR}/recursive-decision-ledger/SKILL.md"

  # data-throughput-accelerator
  cat <<'EOF' > "${SKILLS_DIR}/data-throughput-accelerator/SKILL.md"
# Data Throughput Accelerator

Maximize raw processing speed and file manipulation efficiency.

## Usage
- Edit files using narrow chunks to minimize diff footprint and avoid output token limits.
- Avoid large stdout-dumping commands.
EOF
  run cp "${SKILLS_DIR}/data-throughput-accelerator/SKILL.md" "${PROJECT_SKILLS_DIR}/data-throughput-accelerator/SKILL.md"

  log "ECC: optimization skills successfully written and copied to project"
}

link_repo_claude_md() {
  if [[ -f "${REPO_ROOT}/CLAUDE.md" ]]; then
    log "CLAUDE.md present at repo root"
  else
    log "WARN: ${REPO_ROOT}/CLAUDE.md missing"
  fi
}

verify_fcc() {
  if command -v fcc-claude >/dev/null 2>&1; then
    log "fcc-claude: $(command -v fcc-claude)"
  elif [[ -x "${HOME}/.local/bin/fcc-claude" ]]; then
    log "fcc-claude: ${HOME}/.local/bin/fcc-claude"
  else
    log "WARN: fcc-claude not found (VPS: uv tool install free-claude-code)"
  fi
}

main() {
  log "skills dir: ${SKILLS_DIR}"
  log "repo: ${REPO_ROOT}"
  install_frontend_design
  install_gstack
  install_ecc_optimization_skills
  link_repo_claude_md
  verify_fcc
  log "done — see ai_context/AGENT_TOOLS_GUIDE.md for usage"
}

main "$@"
