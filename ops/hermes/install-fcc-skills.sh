#!/usr/bin/env bash
# Install Claude Code skills for FCC (frontend-design + gstack subset).
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
  if command -v npx >/dev/null 2>&1 && [[ "${DRY_RUN}" != "1" ]]; then
    (cd "${REPO_ROOT}" && npx --yes skills add https://github.com/anthropics/skills --skill frontend-design) \
      && log "frontend-design: installed via npx skills (repo .agents/skills)" || true
  fi
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

link_repo_claude_md() {
  if [[ -f "${REPO_ROOT}/CLAUDE.md" ]]; then
    log "CLAUDE.md present at repo root (FCC loads from workdir)"
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
  if command -v claude >/dev/null 2>&1; then
    log "claude CLI: $(command -v claude)"
  else
    log "WARN: claude CLI not in PATH (FCC wraps it when installed)"
  fi
}

main() {
  log "skills dir: ${SKILLS_DIR}"
  log "repo: ${REPO_ROOT}"
  install_frontend_design
  install_gstack
  link_repo_claude_md
  verify_fcc
  log "done — see ai_context/AGENT_TOOLS_GUIDE.md for usage"
}

main "$@"
