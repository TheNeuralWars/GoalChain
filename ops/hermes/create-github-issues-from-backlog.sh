#!/usr/bin/env bash
# Bulk-create GitHub issues from docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv
# Usage: DRY_RUN=1 bash ops/hermes/create-github-issues-from-backlog.sh
#        bash ops/hermes/create-github-issues-from-backlog.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CSV="${REPO_ROOT}/docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.csv"
GITHUB_REPO="${GITHUB_REPO:-TheNeuralWars/GoalChain}"
DRY_RUN="${DRY_RUN:-1}"

[[ -f "${CSV}" ]] || { echo "ERROR: missing ${CSV}"; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ERROR: gh CLI required"; exit 1; }

create_labels() {
  local labels=(
    "P0:P0:b60205" "P1:P1:d93f0b" "P2:P2:0e8a16"
    "mundial-mvp:Mundial MVP:1d76db" "post-mundial:Post-Mundial:5319e7"
    "agent:opencode:agent:opencode:0052cc" "agent:antigravity:agent:antigravity:5319e7"
    "agent:grok:agent:grok:fbca04" "agent:cursor:agent:cursor:c5def5"
    "agent:hermes:agent:hermes:006b75"
  )
  for entry in "${labels[@]}"; do
    IFS=: read -r name desc color <<<"${entry}"
    gh label create "${name}" --repo "${GITHUB_REPO}" --description "${desc}" --color "${color}" 2>/dev/null || true
  done
}

create_labels

python3 - "${CSV}" "${GITHUB_REPO}" "${DRY_RUN}" <<'PY'
import csv, subprocess, sys
csv_path, repo, dry = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
created = 0
known_labels = set()

def ensure_label(lab):
    if lab in known_labels:
        return
    # Try to create label on the fly
    if not dry:
        subprocess.run(["gh", "label", "create", lab, "--repo", repo, "--color", "a2eeef"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    known_labels.add(lab)

with open(csv_path, newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        iid = row["id"].strip()
        if iid in ("50",):
            continue
        title = row["title"].strip()
        labels = [x.strip() for x in row["labels"].split(",") if x.strip()]
        
        # Ensure all labels exist in the repo
        for lab in labels:
            ensure_label(lab)
            
        body = f"""## Imported from intake backlog (2026-05-26)

- **Backlog ID:** {iid}
- **Priority:** {row['priority']}
- **Suggested agent:** `{row['agent']}`
- **Epic:** {row.get('epic') or '—'}
- **Source:** {row.get('source') or '—'}
- **Blocked by:** {row.get('blocked_by') or '—'}

Full specification: `docs/intake/GITHUB_ISSUES_BACKLOG_MUNDIAL_2026.md` (issue #{iid}).

## Hermes coordination
See `docs/intake/2026-05-26-hermes-manager-handoff.md` for wave order.

## Agent hints (opencode)
When implementing: Apply frontend-design skill for webapp; Follow gstack review pass before draft PR; P0 items use gstack investigate workflow.
"""
        cmd = ["gh", "issue", "create", "--repo", repo, "--title", title, "--body", body]
        for lab in labels:
            cmd.extend(["--label", lab])
        if dry:
            print(f"[dry-run] #{iid}: {title[:70]}")
        else:
            subprocess.run(cmd, check=True)
            created += 1
            print(f"created #{iid}")
print(f"done created={created} dry_run={dry}")
PY
