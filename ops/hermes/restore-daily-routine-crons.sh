#!/usr/bin/env bash
# Restore daily-gm / daily-gn Hermes crons on the VPS (profile: daily-routine).
set -euo pipefail

export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
PY="${HERMES_PYTHON:-$HERMES_HOME/hermes-agent/venv/bin/python3}"
AGENT="${HERMES_HOME}/hermes-agent"

[[ -x "${PY}" ]] || { echo "ERROR: Hermes venv python not found: ${PY}"; exit 1; }

"${PY}" - <<'PY'
import os
import sys
from pathlib import Path

os.environ["HERMES_HOME"] = str(Path.home() / ".hermes")
sys.path.insert(0, str(Path.home() / ".hermes/hermes-agent"))

from cron.jobs import create_job, load_jobs, save_jobs

origin = {
    "platform": "discord",
    "chat_id": "1507803555765944421",
    "chat_name": "GoalChain / #openclaw-chat",
    "thread_id": None,
}
deliver = "discord:1504234802734174310"

jobs = load_jobs()
existing = {j.get("name") for j in jobs}
specs = [
    ("daily-gm", "0 12 * * *", "Post exactly GM ☀️ in home channel. No other text."),
    ("daily-gn", "0 2 * * *", "Post exactly GN 🌙 in home channel. No other text. Never say que descanses."),
]
added = []
for name, schedule, prompt in specs:
    if name in existing:
        print(f"skip {name} (already exists)")
        continue
    jobs.append(
        create_job(
            prompt=prompt,
            schedule=schedule,
            name=name,
            deliver=deliver,
            origin=origin,
            profile="daily-routine",
            skills=["messaging"],
            skill="messaging",
        )
    )
    added.append(name)

if added:
    save_jobs(jobs)
    print("restored:", ", ".join(added))
else:
    print("nothing to restore")
PY
