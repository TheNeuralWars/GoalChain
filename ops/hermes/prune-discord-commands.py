#!/usr/bin/env python3
"""Prune Discord global slash commands when the 100-command limit is hit."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

API = "https://discord.com/api/v10"


def getenv(name: str) -> str:
    return (os.getenv(name) or "").strip()


def request(method: str, url: str, token: str, body: dict | None = None) -> tuple[int, str]:
    data = None
    headers = {"Authorization": f"Bot {token}", "User-Agent": "GoalChain-Hermes-Prune/1.0"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", errors="replace")


def main() -> int:
    token = getenv("DISCORD_TOKEN")
    if not token:
        print("ERROR: DISCORD_TOKEN not set", file=sys.stderr)
        return 1

    keep = int(getenv("DISCORD_COMMANDS_KEEP") or "25")
    dry = getenv("DISCORD_PRUNE_DRY_RUN") == "true"

    status, raw = request("GET", f"{API}/oauth2/applications/@me", token)
    if status != 200:
        print(f"ERROR: applications/@me HTTP {status}: {raw[:300]}", file=sys.stderr)
        return 1
    app_id = json.loads(raw).get("id")
    if not app_id:
        print("ERROR: could not resolve application id", file=sys.stderr)
        return 1

    status, raw = request("GET", f"{API}/applications/{app_id}/commands", token)
    if status != 200:
        print(f"ERROR: list commands HTTP {status}: {raw[:300]}", file=sys.stderr)
        return 1
    commands = json.loads(raw)
    if not isinstance(commands, list):
        print("ERROR: unexpected commands payload", file=sys.stderr)
        return 1

    total = len(commands)
    print(f"application_id={app_id} global_commands={total} keep={keep} dry_run={dry}")
    if total <= keep:
        print("No prune needed.")
        return 0

    # Delete oldest/lowest-id extras first (Discord returns unsorted; sort by id).
    commands.sort(key=lambda c: int(c.get("id", 0)))
    to_delete = commands[: max(0, total - keep)]
    print(f"Will delete {len(to_delete)} command(s).")

    import time

    pause = float(getenv("DISCORD_PRUNE_PAUSE_SEC") or "1.2")
    deleted = 0
    for cmd in to_delete:
        cmd_id = cmd.get("id")
        name = cmd.get("name", "?")
        if not cmd_id:
            continue
        if dry:
            print(f"  dry-run delete: {name} ({cmd_id})")
            deleted += 1
            continue
        for attempt in range(5):
            st, body = request("DELETE", f"{API}/applications/{app_id}/commands/{cmd_id}", token)
            if st in (200, 204):
                print(f"  deleted: {name} ({cmd_id})")
                deleted += 1
                break
            if st == 429:
                retry = 2.0
                try:
                    retry = float(json.loads(body).get("retry_after", retry))
                except Exception:
                    pass
                time.sleep(retry + 0.2)
                continue
            print(f"  WARN delete {name}: HTTP {st} {body[:120]}", file=sys.stderr)
            break
        time.sleep(pause)

    print(f"Done. deleted={deleted} remaining≈{total - deleted}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
