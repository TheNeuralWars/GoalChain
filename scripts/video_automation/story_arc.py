#!/usr/bin/env python3
"""
story_arc.py — Hermes Story-Arc Planner

Assigns each run to a Story Arc (a multi-episode narrative thread per account)
so audiences see continuity across posts instead of disconnected one-offs.
Becomes especially valuable at 5k+ followers where subscribers start
recognising series.

State:    arc_state.json in /data/marketing_pipeline/. Lightweight, atomic.
          Keeps each "active" arc per account (max 2 simultaneously), and what
          episode each arc is on.
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARC_STATE_FILE = BASE_DIR / "data" / "marketing_pipeline" / "arc_state.json"

MAX_PARALLEL_ARCS = 2        # per account
ARC_EPISODES_MIN = 2
ARC_EPISODES_MAX = 4
ARC_REUSE_THRESHOLD_DAYS = 14  # if last episode of an arc is older than this, retire


def _archive_arc(arc: dict, account: str) -> dict:
    arc["status"] = "archived"
    arc["archived_at"] = datetime.utcnow().isoformat() + "Z"
    return arc


def _load_state() -> dict:
    if ARC_STATE_FILE.exists():
        try:
            return json.loads(ARC_STATE_FILE.read_text())
        except Exception:
            pass
    return {"accounts": {}}


def _save_state(state: dict) -> None:
    ARC_STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    ARC_STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def assign_arc(account: str, topic: str) -> dict:
    """
    Return an arc descriptor for the upcoming run:
        {"story_arc_id": "...", "episode": 1, "total_episodes": 3,
         "status": "active"}
    Tries to place the new run into an existing in-progress arc if its topic
    shares a keyword with the arc's seed topic. Otherwise creates a new arc.
    Archives arcs whose last episode is older than ARC_REUSE_THRESHOLD_DAYS.
    """
    state = _load_state()
    acct = state["accounts"].setdefault(account, {"active": [], "archived": []})

    # Retire cold arcs
    now = datetime.utcnow()
    still_active = []
    for arc in acct["active"]:
        try:
            last = datetime.fromisoformat(arc["last_episode_at"].replace("Z", "+00:00"))
            if (now - last).days > ARC_REUSE_THRESHOLD_DAYS:
                acct["archived"].append(_archive_arc(arc, account))
            else:
                still_active.append(arc)
        except Exception:
            still_active.append(arc)
    acct["active"] = still_active

    topic_kw = set(t.lower() for t in topic.split() if len(t) > 4)

    # Try to slot into an existing arc.
    best_arc = None
    best_overlap = 0
    for arc in acct["active"]:
        seed = arc.get("seed_topic", "").lower()
        seed_kw = set(seed.split())
        overlap = len(topic_kw & seed_kw)
        if overlap > best_overlap and arc.get("episode", 0) < arc.get("total_episodes", ARC_EPISODES_MAX):
            best_overlap = overlap
            best_arc = arc

    if best_arc and best_overlap >= 1:
        best_arc["episode"] += 1
        best_arc["last_episode_at"] = now.isoformat() + "Z"
        best_arc["episode_history"].append({"episode": best_arc["episode"], "topic": topic})
        _save_state(state)
        return {
            "story_arc_id": best_arc["id"],
            "episode": best_arc["episode"],
            "total_episodes": best_arc["total_episodes"],
            "status": "active",
        }

    # Need a new arc, unless we are already at max parallel.
    if len(acct["active"]) >= MAX_PARALLEL_ARCS:
        # Force-archive oldest active to make room.
        oldest = min(acct["active"], key=lambda a: a.get("started_at", ""))
        acct["archived"].append(_archive_arc(oldest, account))
        acct["active"].remove(oldest)

    new_arc = {
        "id": f"arc_{account.lower()}_{int(now.timestamp())}",
        "seed_topic": topic,
        "episode": 1,
        "total_episodes": ARC_EPISODES_MAX,  # we don't know N yet; revise on episode 2
        "started_at": now.isoformat() + "Z",
        "last_episode_at": now.isoformat() + "Z",
        "episode_history": [{"episode": 1, "topic": topic}],
    }
    acct["active"].append(new_arc)
    _save_state(state)

    return {
        "story_arc_id": new_arc["id"],
        "episode": new_arc["episode"],
        "total_episodes": new_arc["total_episodes"],
        "status": "active",
    }


if __name__ == "__main__":
    # Mini demo: assign 5 imaginary episodes for each account
    for acc in ("GoalChainSol", "NicoPezDorado"):
        for t in (f"Episode topic {i}" for i in range(5)):
            print(acc, t, "->", assign_arc(acc, t))
