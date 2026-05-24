#!/usr/bin/env python3
"""
Post fresh OA/OpenClaw research artifacts to a dedicated Discord channel.

Auth modes (first match wins):
1) DISCORD_RESEARCH_WEBHOOK_URL
2) DISCORD_TOKEN + DISCORD_RESEARCH_CHANNEL_ID
"""
from __future__ import annotations

import argparse
import base64
import glob
import hmac
import json
import os
import pathlib
import re
import sys
import time
import urllib.parse
from hashlib import sha1
from datetime import datetime, timezone

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


def extract_x_aliases(text: str) -> list[str]:
    aliases = re.findall(r"https?://(?:x|twitter)\.com/([A-Za-z0-9_]{1,15})", text, flags=re.I)
    unique: list[str] = []
    for a in aliases:
        if a not in unique:
            unique.append(a)
    return unique


def find_narrative_line(lines: list[str]) -> str:
    for line in lines:
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("-") or s.startswith("|"):
            continue
        if len(s) >= 30:
            return s[:240]
    return "Se detecto una oportunidad con potencial real para acelerar partnerships y ejecucion en GoalChain."


def get_tone() -> str:
    tone = getenv("OA_SCOUT_TONE", "balanced").lower()
    if tone not in {"balanced", "influencer", "technical"}:
        return "balanced"
    return tone


def is_useless_report(text: str) -> bool:
    """Return True if the report has no real value and should not be posted."""
    lower = text.lower()

    # Hard useless markers
    useless_markers = [
        "none met the minimum score",
        "no candidates reached",
        "no useful projects found",
        "no projects with concrete integration",
        "score: 22/40",
        "predominantly hype-driven",
        "no high-value opportunities found this cycle",
    ]
    for marker in useless_markers:
        if marker in lower:
            return True

    # Must contain at least one concrete signal to be considered useful
    useful_signals = [
        "github.com/",
        "x.com/",
        "twitter.com/",
        "@",
        "integration",
        "partnership",
        "repo",
        "protocol",
        "embed",
        "build on",
        "opportunity",
    ]
    has_signal = any(signal in lower for signal in useful_signals)
    if not has_signal:
        return True

    return False


def make_message(path: pathlib.Path) -> tuple[str, str]:
    text = path.read_text(encoding="utf-8", errors="ignore")

    # Skip posting if the report has no real value
    if is_useless_report(text):
        return "", text

    lines = text.splitlines()
    title = first_heading(lines, path.name)
    narrative = find_narrative_line(lines)
    body = compact_body(lines)
    aliases = extract_x_aliases(text)
    mention = f" @{' @'.join(aliases[:3])}" if aliases else ""
    tone = get_tone()
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    header = f"{discord_t('research_header')}\n**{title}**"
    narrative_block = f"**Influencer take**\n{narrative}{mention}"
    technical_block = f"**Technical breakdown**\n{body}" if body else ""
    footer = f"\n{discord_t('research_footer')}\nSource: `{path}`\nGenerated: {ts}"
    if tone == "influencer":
        content = "\n\n".join(x for x in [header, narrative_block] if x) + footer
    elif tone == "technical":
        content = "\n\n".join(x for x in [header, technical_block] if x) + footer
    else:
        content = "\n\n".join(x for x in [header, narrative_block, technical_block] if x) + footer
    if len(content) > 1900:
        content = content[:1890] + "…"
    return content, text


def _pct(value: str) -> str:
    return urllib.parse.quote(value, safe="~-._")


def _oauth1_header(method: str, url: str, consumer_key: str, consumer_secret: str, token: str, token_secret: str) -> str:
    nonce = base64.urlsafe_b64encode(os.urandom(16)).decode("ascii").rstrip("=")
    timestamp = str(int(time.time()))
    oauth = {
        "oauth_consumer_key": consumer_key,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": timestamp,
        "oauth_token": token,
        "oauth_version": "1.0",
    }
    base_url = url.split("?", 1)[0]
    param_str = "&".join(f"{_pct(k)}={_pct(v)}" for k, v in sorted(oauth.items()))
    base_str = "&".join([_pct(method.upper()), _pct(base_url), _pct(param_str)])
    signing_key = f"{_pct(consumer_secret)}&{_pct(token_secret)}"
    sig = base64.b64encode(hmac.new(signing_key.encode("utf-8"), base_str.encode("utf-8"), sha1).digest()).decode("ascii")
    oauth["oauth_signature"] = sig
    return "OAuth " + ", ".join(f'{_pct(k)}="{_pct(v)}"' for k, v in sorted(oauth.items()))


def make_x_post_text(path: pathlib.Path, raw_text: str) -> str:
    title = first_heading(raw_text.splitlines(), path.name)
    aliases = extract_x_aliases(raw_text)
    mentions = " ".join(f"@{a}" for a in aliases[:3])
    tone = get_tone()
    if tone == "technical":
        prefix = "OA Tech Brief:"
    elif tone == "influencer":
        prefix = "OA Alpha Spotlight:"
    else:
        prefix = "OA Research:"
    base = f"{prefix} {title}"
    if mentions:
        base += f" {mentions}"
    base += " #AI #Web3 #GoalChain"
    return base[:275]


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

    try:
        response = requests.post(
            url,
            headers={**headers, "User-Agent": "GoalChainOA/1.0"},
            json=payload,
            timeout=20,
        )
        if response.status_code in (200, 201, 204):
            return True, f"ok:{response.status_code}"
        return False, f"http_{response.status_code}:{response.text[:300]}"
    except Exception as e:
        return False, f"error:{e}"


def post_x(content: str) -> tuple[bool, str]:
    if not truthy(getenv("OA_X_PUBLISH_ENABLED", "false")):
        return True, "skipped_x_disabled"
    ck = getenv("X_API_KEY")
    cs = getenv("X_API_SECRET")
    at = getenv("X_ACCESS_TOKEN")
    ats = getenv("X_ACCESS_SECRET")
    if not all([ck, cs, at, ats]):
        return False, "missing_x_credentials"

    url = "https://api.x.com/2/tweets"
    auth = _oauth1_header("POST", url, ck, cs, at, ats)
    headers = {
        "Authorization": auth,
        "Content-Type": "application/json",
        "User-Agent": "GoalChainOA/1.0",
    }
    try:
        response = requests.post(url, headers=headers, json={"text": content[:280]}, timeout=20)
        if response.status_code in (200, 201):
            try:
                tweet_id = response.json().get("data", {}).get("id", "")
            except Exception:
                tweet_id = ""
            return True, f"ok:{response.status_code}:{tweet_id}"
        return False, f"http_{response.status_code}:{response.text[:300]}"
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
    if not truthy(getenv("OA_RESEARCH_PUBLISHER_ENABLED", "false")):
        return 0
    print(discord_t("publisher_disabled"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
