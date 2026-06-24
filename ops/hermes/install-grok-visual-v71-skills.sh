#!/usr/bin/env bash
# Install Grok Visual V7.1 skills for Hermes.
# Usage: bash install-grok-visual-v71-skills.sh [profile_name]
set -euo pipefail

HERMES_ROOT="${HERMES_HOME:-$HOME/.hermes}"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills-grok-v71"

log() { printf '[install-grok-visual-v71-skills] %s\n' "$*"; }

if [[ ! -d "${SRC_DIR}" ]]; then
  echo "ERROR: Source skills directory ${SRC_DIR} not found" >&2
  exit 1
fi

# Profile selection (default to active profile, fallback to hermes-ceo)
PROFILE="${1:-}"
if [[ -z "${PROFILE}" ]]; then
  ACTIVE_PROFILE_FILE="${HERMES_ROOT}/active_profile"
  if [[ -f "${ACTIVE_PROFILE_FILE}" ]]; then
    PROFILE="$(cat "${ACTIVE_PROFILE_FILE}" | xargs)"
  fi
fi
if [[ -z "${PROFILE}" ]]; then
  PROFILE="hermes-ceo"
fi

log "Target profile: ${PROFILE}"

# Target skills directories
TARGET_SKILLS_DIR="${HERMES_ROOT}/profiles/${PROFILE}/skills"
GLOBAL_SKILLS_DIR="${HERMES_ROOT}/skills"

mkdir -p "${TARGET_SKILLS_DIR}"
mkdir -p "${GLOBAL_SKILLS_DIR}"

SKILLS=(
  "grok_skill_jersey_upgrade"
  "grok_skill_physiognomy_refinement"
  "grok_skill_branding_details"
  "goalchain-grok-visual-v71"
  "goalchain-grok-batch-autopilot"
)

for skill in "${SKILLS[@]}"; do
  if [[ -d "${SRC_DIR}/${skill}" ]]; then
    # Copy to profile skills
    rm -rf "${TARGET_SKILLS_DIR}/${skill}"
    cp -a "${SRC_DIR}/${skill}" "${TARGET_SKILLS_DIR}/"
    log "Copied ${skill} to profile → ${TARGET_SKILLS_DIR}/${skill}"

    # Copy to global skills
    rm -rf "${GLOBAL_SKILLS_DIR}/${skill}"
    cp -a "${SRC_DIR}/${skill}" "${GLOBAL_SKILLS_DIR}/"
    log "Copied ${skill} to global → ${GLOBAL_SKILLS_DIR}/${skill}"
  else
    log "WARNING: Skill folder ${skill} not found in ${SRC_DIR}"
  fi
done

# Profile config.yaml adjustment
CONFIG_PATH="${HERMES_ROOT}/profiles/${PROFILE}/config.yaml"
if [[ -f "${CONFIG_PATH}" ]]; then
  log "Configuring external_dirs and enabling skills in ${CONFIG_PATH}..."
  python3 - "${CONFIG_PATH}" "${GLOBAL_SKILLS_DIR}" <<'PY'
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("WARNING: PyYAML not found, skipping config.yaml updates. Run 'pip install pyyaml' to enable autoconfig.")
    sys.exit(0)

config_path = Path(sys.argv[1])
global_skills_dir = sys.argv[2]

if config_path.exists():
    try:
        data = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
    except Exception:
        data = {}
else:
    data = {}

if not isinstance(data, dict):
    data = {}

# Ensure external_dirs includes global skills directory
external_dirs = data.setdefault("external_dirs", [])
if isinstance(external_dirs, str):
    external_dirs = [external_dirs]
if global_skills_dir not in external_dirs:
    external_dirs.append(global_skills_dir)
data["external_dirs"] = external_dirs

# Enable the skills
skills = data.setdefault("skills", {})
if not isinstance(skills, dict):
    skills = {}
    data["skills"] = skills

enabled = skills.setdefault("enabled", [])
if not isinstance(enabled, list):
    enabled = []

new_skills = [
  "grok_skill_jersey_upgrade",
  "grok_skill_physiognomy_refinement",
  "grok_skill_branding_details",
  "goalchain-grok-visual-v71",
  "goalchain-grok-batch-autopilot"
]

for ns in new_skills:
    if ns not in enabled:
        enabled.append(ns)
skills["enabled"] = enabled

config_path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")
print(f"Updated config.yaml at {config_path}")
PY
else:
  log "WARNING: config.yaml not found at ${CONFIG_PATH}. Skipping configuration step."
fi

log "Installation complete. Resyncing skills..."
if command -v hermes &>/dev/null; then
  hermes skills resync || true
fi
