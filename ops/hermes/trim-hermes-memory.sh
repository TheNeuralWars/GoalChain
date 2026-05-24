#!/usr/bin/env bash
# Compact ~/.hermes/memories/MEMORY.md to stay under Hermes memory tool limits.
set -euo pipefail

MEMORY_FILE="${HERMES_MEMORY_FILE:-$HOME/.hermes/memories/MEMORY.md}"
MAX_CHARS="${HERMES_MEMORY_MAX_CHARS:-1800}"

[[ -f "${MEMORY_FILE}" ]] || { echo "No memory file: ${MEMORY_FILE}"; exit 0; }

python3 - "${MEMORY_FILE}" "${MAX_CHARS}" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
max_chars = int(sys.argv[2])
text = path.read_text(encoding="utf-8")
if len(text) <= max_chars:
    print(f"memory ok: {len(text)} chars (limit {max_chars})")
    raise SystemExit(0)

lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
# Keep project/role/rules first; drop oldest heartbeat lines if needed.
priority = []
heartbeat = []
other = []
for ln in lines:
    low = ln.lower()
    if low.startswith("project:") or low.startswith("you are:") or "permanent rules" in low:
        priority.append(ln)
    elif "heartbeat summary" in low:
        heartbeat.append(ln)
    else:
        other.append(ln)

def join_chunks(chunks):
    out = []
    size = 0
    for ln in chunks:
        add = len(ln) + (1 if out else 0)
        if size + add > max_chars:
            break
        out.append(ln)
        size += add
    return out, size

kept = []
for group in (priority, other, list(reversed(heartbeat))):
    for ln in group:
        if ln in kept:
            continue
        trial = kept + [ln]
        if sum(len(x) for x in trial) + len(trial) - 1 <= max_chars:
            kept.append(ln)

new_text = "\n".join(kept) + "\n"
path.write_text(new_text, encoding="utf-8")
print(f"memory trimmed: {len(text)} -> {len(new_text)} chars (limit {max_chars})")
PY
