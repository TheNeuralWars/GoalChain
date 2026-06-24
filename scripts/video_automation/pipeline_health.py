#!/usr/bin/env python3
"""
pipeline_health.py — Hermes Manager diagnostic snapshot.

Prints one JSON object to stdout capturing:

  - heartbeat_seconds:        age of `daemon_status.json` last_check
  - daemon_pid:               running pid (or "none")
  - daemon_status:            "idle" | "running" | "researching" | ...
  - runs_total / by_status    from `runs.json`
  - buffer_queue_by_channel:  per channel pending count (best-effort)
  - cost_guard_used / cap:    from `cost_guard.json`
  - last_auto_queue_date:     date string of last successful refill
  - last 4 logs:              lines from the daemon's pm2 out-log

Useful for:
  - QA dashboards / `GET /api/marketing/pipeline/health`
  - Manager WhatsApp watchdog (5min ping)
  - Ad-hoc ssh dumps when something feels off

Exit code 0 always (best-effort, never raises).
"""
import json
import os
import time
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MARKETING_DIR = BASE_DIR / "data" / "marketing_pipeline"
DAEMON_STATUS = MARKETING_DIR / "daemon_status.json"
COST_GUARD = MARKETING_DIR / "cost_guard.json"
LAST_AUTO = MARKETING_DIR / "last_auto_queue_date.txt"
RUNS = MARKETING_DIR / "runs.json"
SCHEDULE_PREVIEW = MARKETING_DIR / "schedule_preview.json"
PM2_LOG = Path("/home/ubuntu/.pm2/logs/hermes-video-daemon-out.log")


def _safe_read_json(path: Path) -> dict:
    try:
        if path.exists():
            return json.loads(path.read_text())
    except Exception:
        pass
    return {}


def _safe_read_text(path: Path) -> str:
    try:
        if path.exists():
            return path.read_text().strip()
    except Exception:
        pass
    return ""


def _buffer_queue_counts() -> dict:
    out = {}
    if not SCHEDULE_PREVIEW.exists():
        return {"error": "no schedule_preview.json"}
    try:
        data = json.loads(SCHEDULE_PREVIEW.read_text())
        for cid, info in data.items():
            out[cid] = info.get("pending_in_queue", 0)
    except Exception as e:
        return {"error": str(e)}
    return out


def _tail_lines(path: Path, n: int = 4) -> list[str]:
    try:
        if path.exists():
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
            return [ln.strip() for ln in lines[-n:] if ln.strip()]
    except Exception:
        pass
    return []


def snapshot() -> dict:
    ds = _safe_read_json(DAEMON_STATUS)

    # heartbeat age
    heartbeat_age = None
    if ds.get("last_check"):
        try:
            ts = datetime.fromisoformat(ds["last_check"].replace("Z", "+00:00"))
            heartbeat_age = round((datetime.now(timezone.utc) - ts).total_seconds(), 1)
        except Exception:
            pass

    # runs.json
    runs_data = _safe_read_json(RUNS)
    if isinstance(runs_data, list):
        runs_total = len(runs_data)
        runs_by_status = dict(Counter(r.get("status", "?") for r in runs_data))
    else:
        runs_total = 0
        runs_by_status = {}

    # cost guard
    cg = _safe_read_json(COST_GUARD)
    cost_used = cg.get("count", 0)
    cost_cap = int(os.getenv("MAX_GROK_GENERATIONS_PER_DAY", "40"))

    return {
        "ts_utc": datetime.now(timezone.utc).isoformat(),
        "heartbeat_seconds": heartbeat_age,
        "daemon_pid": ds.get("pid"),
        "daemon_status": ds.get("status"),
        "daemon_current_run": ds.get("current_run"),
        "runs_total": runs_total,
        "runs_by_status": runs_by_status,
        "buffer_queue_by_channel": _buffer_queue_counts(),
        "cost_guard_used": cost_used,
        "cost_guard_cap": cost_cap,
        "cost_guard_date": cg.get("date"),
        "last_auto_queue_date": _safe_read_text(LAST_AUTO),
        "last_daemon_lines": _tail_lines(PM2_LOG, 4),
    }


if __name__ == "__main__":
    print(json.dumps(snapshot(), indent=2, ensure_ascii=False))
