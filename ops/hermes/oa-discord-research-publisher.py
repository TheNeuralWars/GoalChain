#!/usr/bin/env python3
"""
Post fresh OA/OpenClaw research artifacts to a dedicated Discord channel.

Auth modes (first match wins):
1) DISCORD_RESEARCH_WEBHOOK_URL
2) DISCORD_TOKEN + DISCORD_RESEARCH_CHANNEL_ID
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone


def getenv(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def build_sources() -> list[str]:
    home = pathlib.Path.home()
    repo = pathlib.Path(getenv("GOALCHAIN_REPO_PATH", str(home / "hermes/workspace/GoalChain")))
    return [
        str(home / ".openclaw/workspace/docs/ai-radar-*.md"),
        str(home / ".openclaw/workspace/memory/weekly-ai-deepdive-*.md"),
        str(repo / "docs/intake/*ai-ecosystem-opportunities*.md"),
    ]


def read_state(path: pathlib.Path) -> dict[str, float]:
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {str(k): float(v) for k, v in data.items()}
    except Exception:
        pass
    return {}


def write_state(path: pathlib.Path, data: dict[str, float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def first_heading(lines: list[str], fallback: str) -> str:
    for line in lines:
        s = line.strip()
        if s.startswith("#"):
            return s.lstrip("#").strip()[:120] or fallback
    return fallback


def compact_body(lines: list[str], max_lines: int = 6) -> str:
    cleaned: list[str] = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if s.startswith("#"):
            continue
        if s.startswith("|") and s.endswith("|"):
            continue
        s = re.sub(r"\s+", " ", s)
        cleaned.append(s)
        if len(cleaned) >= max_lines:
            break
    return "\n".join(f"- {x[:220]}" for x in cleaned if x)


def make_message(path: pathlib.Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    title = first_heading(lines, path.name)
    body = compact_body(lines)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    header = f"🧪 **OA Research Update**\n**{title}**"
    footer = f"\nSource: `{path}`\nGenerated: {ts}"
    content = f"{header}\n{body}{footer}" if body else f"{header}{footer}"
    if len(content) > 1900:
        content = content[:1890] + "…"
    return content


def post_discord(content: str) -> tuple[bool, str]:
    webhook = getenv("DISCORD_RESEARCH_WEBHOOK_URL")
    token = getenv("DISCORD_TOKEN")
    channel = getenv("DISCORD_RESEARCH_CHANNEL_ID")

    if webhook:
        url = webhook
        headers = {"Content-Type": "application/json"}
        payload = {"content": content}
    elif token and channel:
        url = f"https://discord.com/api/v10/channels/{channel}/messages"
        headers = {"Authorization": f"Bot {token}", "Content-Type": "application/json"}
        payload = {"content": content}
    else:
        return False, "missing_discord_credentials"

    req = urllib.request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            code = getattr(resp, "status", 200)
            if code in (200, 201, 204):
                return True, f"ok:{code}"
            return False, f"http_{code}"
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")[:300]
        return False, f"http_{e.code}:{detail}"
    except Exception as e:
        return False, f"error:{e}"


def collect_new_files(patterns: list[str], state: dict[str, float]) -> list[pathlib.Path]:
    files: list[pathlib.Path] = []
    for pattern in patterns:
        for raw in glob.glob(pattern):
            p = pathlib.Path(raw)
            if not p.is_file():
                continue
            mtime = p.stat().st_mtime
            if state.get(str(p), 0) >= mtime:
                continue
            files.append(p)
    files.sort(key=lambda p: p.stat().st_mtime)
    return files


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--state-file", required=True)
    parser.add_argument("--max-per-run", type=int, default=1)
    parser.add_argument("--source-glob", action="append", default=[])
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    state_path = pathlib.Path(args.state_file).expanduser()
    state = read_state(state_path)
    patterns = args.source_glob or build_sources()

    fresh = collect_new_files(patterns, state)
    if not fresh:
        print("research_publisher: no_new_reports")
        return 0

    sent = 0
    for p in fresh[: max(args.max_per_run, 1)]:
        msg = make_message(p)
        ok, info = post_discord(msg)
        if not ok:
            print(f"research_publisher: send_failed file={p} reason={info}")
            if info == "missing_discord_credentials":
                return 0
            return 1
        state[str(p)] = p.stat().st_mtime
        sent += 1
        print(f"research_publisher: sent file={p} status={info}")

    write_state(state_path, state)
    print(f"research_publisher: done sent={sent}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
