#!/usr/bin/env python3
"""
X-Scout Discord forum publisher — one clean thread per radar cycle.

Posts to DISCORD_RESEARCH_CHANNEL_ID (active-research forum) with embeds.
Dedup by content hash + min interval. State persisted immediately after Discord OK.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

try:
    from discord_i18n import t as discord_t
except ImportError:  # pragma: no cover

    def discord_t(key: str, **kwargs: str) -> str:
        return key


def getenv(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def truthy(val: str) -> bool:
    return val.strip().lower() in ("1", "true", "yes")


def load_state(path: Path) -> dict:
    if not path.exists():
        return {"files": {}, "hashes": {}, "last_post_at": 0}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"files": {}, "hashes": {}, "last_post_at": 0}
    if not isinstance(data, dict):
        return {"files": {}, "hashes": {}, "last_post_at": 0}
    data.setdefault("files", {})
    data.setdefault("hashes", {})
    data.setdefault("last_post_at", 0)
    return data


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def content_hash(text: str) -> str:
    norm = re.sub(r"\s+", " ", text.lower().strip())[:2000]
    return hashlib.sha256(norm.encode("utf-8")).hexdigest()[:16]


def first_heading(lines: list[str], fallback: str) -> str:
    for line in lines:
        s = line.strip()
        if s.startswith("#"):
            return re.sub(r"^#+\s*", "", s).strip()[:100] or fallback
    return fallback[:100]


def is_quiet_or_useless(text: str) -> bool:
    lower = text.lower()
    if "<!-- x_scout_quiet -->" in lower or "x_scout_quiet" in lower:
        return True
    junk = [
        "none met the minimum",
        "no candidates reached",
        "no high-value opportunities",
        "predominantly hype-driven",
        "no useful projects",
        "score: 22/40",
        "score: 20/40",
        "score: 21/40",
    ]
    if any(m in lower for m in junk):
        return True
    if "github.com/" not in lower:
        return True
    return False


def extract_thesis(lines: list[str]) -> str:
    for line in lines:
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("|") or s.startswith("-"):
            continue
        if len(s) >= 40:
            return s[:500]
    return ""


def extract_table_rows(lines: list[str], max_rows: int = 3) -> list[str]:
    rows: list[str] = []
    in_table = False
    for line in lines:
        s = line.strip()
        if s.startswith("|") and "---" not in s:
            in_table = True
            cells = [c.strip() for c in s.strip("|").split("|") if c.strip()]
            if cells and cells[0].lower() not in ("name", "candidate", "project"):
                rows.append(" · ".join(cells[:4])[:180])
        elif in_table and not s.startswith("|"):
            break
        if len(rows) >= max_rows:
            break
    return rows


def extract_section(lines: list[str], heading: str, max_bullets: int = 3) -> list[str]:
    target = heading.lower()
    bullets: list[str] = []
    capture = False
    for line in lines:
        s = line.strip()
        if s.startswith("#") and target in s.lower():
            capture = True
            continue
        if capture and s.startswith("#"):
            break
        if capture and s.startswith(("-", "*")):
            bullets.append(s.lstrip("-* ").strip()[:200])
            if len(bullets) >= max_bullets:
                break
    return bullets


def build_forum_payload(report_path: Path, raw: str) -> tuple[str, list[dict]] | None:
    """Return (thread_title, embeds) or None to skip."""
    if is_quiet_or_useless(raw):
        return None

    lines = raw.splitlines()
    title = first_heading(lines, report_path.stem)
    thesis = extract_thesis(lines)
    candidates = extract_table_rows(lines)
    why_now = extract_section(lines, "why now")
    poc = extract_section(lines, "48h")

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    thread_title = f"🔭 {title}"[:100]
    if not thread_title.startswith("🔭"):
        thread_title = f"🔭 Radar · {ts}"[:100]

    desc_parts = [thesis] if thesis else []
    if not desc_parts:
        desc_parts.append(discord_t("xscout_default_thesis"))
    description = "\n\n".join(desc_parts)[:1800]

    fields: list[dict] = []
    if candidates:
        fields.append(
            {
                "name": discord_t("xscout_field_candidates"),
                "value": "\n".join(f"• {c}" for c in candidates)[:1024],
                "inline": False,
            }
        )
    if why_now:
        fields.append(
            {
                "name": discord_t("xscout_field_why_now"),
                "value": "\n".join(f"• {b}" for b in why_now)[:1024],
                "inline": False,
            }
        )
    if poc:
        fields.append(
            {
                "name": discord_t("xscout_field_poc"),
                "value": "\n".join(f"• {b}" for b in poc)[:1024],
                "inline": False,
            }
        )

    x_links = re.findall(r"https?://(?:x|twitter)\.com/\S+", raw, flags=re.I)[:3]
    gh_links = re.findall(r"https?://github\.com/\S+", raw, flags=re.I)[:3]
    links_val = []
    for u in gh_links:
        links_val.append(f"[GitHub]({u.split(')')[0].rstrip('.,;')})")
    for u in x_links:
        links_val.append(f"[X]({u.split(')')[0].rstrip('.,;')})")
    if links_val:
        fields.append(
            {
                "name": discord_t("xscout_field_links"),
                "value": " · ".join(links_val)[:1024],
                "inline": False,
            }
        )

    embed: dict = {
        "title": title[:256],
        "description": description,
        "color": 0x3498DB,
        "fields": fields[:8],
        "footer": {"text": discord_t("xscout_footer", ts=ts)},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    return thread_title, [embed]


def post_forum_thread(thread_name: str, embeds: list[dict]) -> tuple[bool, str]:
    webhook = getenv("DISCORD_RESEARCH_WEBHOOK_URL")
    token = getenv("DISCORD_TOKEN")
    channel = getenv("DISCORD_RESEARCH_CHANNEL_ID")

    payload: dict = {"embeds": embeds[:1]}
    if webhook:
        url = webhook
        headers = {"Content-Type": "application/json"}
        body = {**payload, "thread_name": thread_name[:100]}
    elif token and channel:
        url = f"https://discord.com/api/v10/channels/{channel}/threads"
        headers = {"Authorization": f"Bot {token}", "Content-Type": "application/json"}
        body = {
            "name": thread_name[:100],
            "auto_archive_duration": 10080,
            "message": payload,
        }
    else:
        return False, "missing_discord_credentials"

    try:
        r = requests.post(
            url,
            headers={**headers, "User-Agent": "GoalChainXScout/2.0"},
            json=body,
            timeout=25,
        )
        if r.status_code in (200, 201, 204):
            return True, f"ok:{r.status_code}"
        return False, f"http_{r.status_code}:{r.text[:300]}"
    except Exception as e:
        return False, f"error:{e}"


def publish_report(report_path: Path, state_file: Path) -> int:
    if not truthy(getenv("OA_RESEARCH_PUBLISHER_ENABLED", "false")):
        print("x_scout_discord: publisher_disabled")
        return 0

    if not report_path.is_file():
        print(f"x_scout_discord: missing_file path={report_path}")
        return 1

    raw = report_path.read_text(encoding="utf-8", errors="ignore")
    digest = content_hash(raw)
    state = load_state(state_file)
    now = datetime.now(timezone.utc).timestamp()

    min_interval = int(getenv("OA_X_SCOUT_MIN_INTERVAL_SEC", "7200") or "7200")
    last = float(state.get("last_post_at") or 0)
    if now - last < min_interval:
        print(f"x_scout_discord: cooldown skip ({int(now - last)}s < {min_interval}s)")
        state["files"][str(report_path)] = report_path.stat().st_mtime
        save_state(state_file, state)
        return 0

    if digest in state.get("hashes", {}):
        print(f"x_scout_discord: duplicate_hash skip hash={digest}")
        state["files"][str(report_path)] = report_path.stat().st_mtime
        save_state(state_file, state)
        return 0

    built = build_forum_payload(report_path, raw)
    if not built:
        print(f"x_scout_discord: skip_low_signal file={report_path}")
        state["files"][str(report_path)] = report_path.stat().st_mtime
        state["hashes"][digest] = now
        save_state(state_file, state)
        return 0

    thread_name, embeds = built
    ok, info = post_forum_thread(thread_name, embeds)
    if not ok:
        print(f"x_scout_discord: send_failed reason={info}")
        return 1

    state["files"][str(report_path)] = report_path.stat().st_mtime
    state["hashes"][digest] = now
    state["last_post_at"] = now
    save_state(state_file, state)
    print(f"x_scout_discord: posted thread={thread_name!r} status={info}")
    return 0


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: oa-x-scout-discord.py <report.md> [--state-file PATH]", file=sys.stderr)
        return 2
    report = Path(sys.argv[1]).expanduser()
    state_file = Path(
        getenv("OA_X_SCOUT_STATE_FILE", str(Path.home() / "hermes/oa/state/x-scout-discord.json"))
    ).expanduser()
    if "--state-file" in sys.argv:
        idx = sys.argv.index("--state-file")
        if idx + 1 < len(sys.argv):
            state_file = Path(sys.argv[idx + 1]).expanduser()
    return publish_report(report, state_file)


if __name__ == "__main__":
    sys.exit(main())
