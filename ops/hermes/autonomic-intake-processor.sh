#!/usr/bin/env bash
#
# autonomic-intake-processor.sh — Automatically process docs/intake/ briefs into GitHub issues.
# Part of the GoalChain "Humans-0" Extreme Automation pipeline.
#
set -euo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/hermes}"
REPO_ROOT="${GOALCHAIN_REPO_PATH:-$HERMES_HOME/workspace/GoalChain}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1090
if [[ -f "$HERMES_HOME/config.env" ]]; then
  source "$HERMES_HOME/config.env"
else
  # Fallback to current repo dir config if exists
  if [[ -f "$SCRIPT_DIR/config.env" ]]; then
    source "$SCRIPT_DIR/config.env"
  fi
fi

INTAKE_DIR="$REPO_ROOT/docs/intake"
[[ -d "$INTAKE_DIR" ]] || {
  echo "[INFO] docs/intake directory not found. Skipping intake processing."
  exit 0
}

log() { printf "[%s] [INTAKE-PROCESSOR] %s\n" "$(date -u '+%Y-%m-%d %H:%M:%S UTC')" "$*"; }

log "Scanning for new briefs in $INTAKE_DIR..."

for filepath in "$INTAKE_DIR"/*.md; do
  [[ -f "$filepath" ]] || continue
  filename=$(basename "$filepath")
  [[ "$filename" == "TEMPLATE.md" || "$filename" == "README.md" ]] && continue

  # Skip if already processed
  if grep -q -Fi "Task Created:" "$filepath" || grep -q -Fi "task_created:" "$filepath"; then
    continue
  fi

  log "Found new unprocessed brief: $filename. Synthesizing task..."

  # Python parsing helper to read clean metadata
  parsed_json=$(python3 -c '
import json, re, sys

filepath = sys.argv[1]
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Default values
title = "New Ingested Brief"
priority = "P1"
owner = "opencode"
objective = "Please review and implement the research/intake recommendations."

# 1. Parse Title
title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
if title_match:
    title = title_match.group(1).strip()

# 2. Parse Metadata Lines
for line in content.split("\n"):
    line_norm = line.strip().lower()
    if "- **priority:**" in line_norm:
        p_match = re.search(r"\b(P0|P1|P2)\b", line, re.IGNORECASE)
        if p_match:
            priority = p_match.group(1).upper()
    elif "- **owner:**" in line_norm:
        # Map to valid agent owners: cursor, antigravity, opencode, grok
        if "grok" in line_norm:
            owner = "grok"
        elif "antigravity" in line_norm:
            owner = "antigravity"
        elif "cursor" in line_norm:
            owner = "cursor"
        else:
            owner = "opencode"

# 3. Parse Objective Section
obj_match = re.search(r"##\s+Objective\s*\n\n?([\s\S]+?)(?=\n##|$)", content, re.IGNORECASE)
if obj_match:
    objective = obj_match.group(1).strip()

# Clean up objective length
objective = objective[:1500]

print(json.dumps({
    "title": title,
    "priority": priority,
    "owner": owner,
    "objective": objective
}))
' "$filepath" 2>/dev/null || echo "")

  if [[ -z "$parsed_json" ]]; then
    log "WARN: Failed parsing $filename. Skipping."
    continue
  fi

  # Extract fields
  title=$(python3 -c "import json, sys; print(json.loads(sys.argv[1])['title'])" "$parsed_json")
  priority=$(python3 -c "import json, sys; print(json.loads(sys.argv[1])['priority'])" "$parsed_json")
  owner=$(python3 -c "import json, sys; print(json.loads(sys.argv[1])['owner'])" "$parsed_json")
  objective=$(python3 -c "import json, sys; print(json.loads(sys.argv[1])['objective'])" "$parsed_json")

  # Complete objective with path to intake brief
  objective_with_ref="${objective}

---
**Canonical specification file:** [${filename}](file://${filepath})
Please execute the implementation following the steps outlined in this intake brief."

  log "Creating GitHub Issue for $title (Owner: $owner, Priority: $priority)..."

  # Run create task script (CEO context)
  create_task_script="$SCRIPT_DIR/create-task-ceo.sh"
  if [[ ! -f "$create_task_script" ]]; then
    create_task_script="$SCRIPT_DIR/create-task.sh"
  fi

  if [[ -f "$create_task_script" ]]; then
    task_out=$(bash "$create_task_script" "$owner" "$priority" "$title" "$objective_with_ref" 2>&1 || true)
    
    # Extract Issue URL
    issue_url=$(python3 -c 'import re,sys
t=sys.stdin.read()
m=re.findall(r"https://github\.com/[^\s]+/issues/\d+", t)
print(m[-1] if m else "")' <<< "$task_out")

    if [[ -n "$issue_url" ]]; then
      log "Successfully created Issue: $issue_url"
      
      # Annotate the Markdown file at the top (right after the title)
      temp_file=$(mktemp)
      python3 -c '
import sys
filepath = sys.argv[1]
issue_url = sys.argv[2]

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
inserted = False
for line in lines:
    new_lines.append(line)
    if line.startswith("# ") and not inserted:
        new_lines.append("\n")
        new_lines.append(f"- **Task Created:** {issue_url}\n")
        new_lines.append("- **Task Status:** ready\n")
        inserted = True

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
' "$filepath" "$issue_url"
      
      log "Annotated brief $filename."
    else
      log "WARN: Failed to extract Issue URL from output: $task_out"
    fi
  else
    log "ERROR: Task creation script not found. Cannot proceed."
  fi
done

log "Intake scan finished."
