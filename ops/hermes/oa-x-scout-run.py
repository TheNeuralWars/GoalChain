#!/usr/bin/env python3
"""
Hermes X-Scout: fetch X signals + synthesize ai-radar report for Discord active-research.

Writes: ~/.hermes/workspace/docs/ai-radar-<UTC>.md
"""
from __future__ import annotations

import base64
import hmac
import json
import os
import re
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path

import requests

HOME = Path.home()
OUT_DIR = HOME / ".hermes" / "workspace" / "docs"
QUERIES = [
    "(solana OR web3) (AI agent OR agents) -is:retweet lang:en",
    "#goalchain OR goalchainmanager lang:en",
    "(Claude Code OR MCP) (open source OR github) lang:en",
]


def getenv(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _pct(value: str) -> str:
    return urllib.parse.quote(value, safe="~-._")


def oauth1_header(method: str, url: str, ck: str, cs: str, at: str, ats: str, query: dict[str, str] | None = None) -> str:
    nonce = base64.urlsafe_b64encode(os.urandom(16)).decode("ascii").rstrip("=")
    timestamp = str(int(time.time()))
    oauth = {
        "oauth_consumer_key": ck,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": timestamp,
        "oauth_token": at,
        "oauth_version": "1.0",
    }
    base_url = url.split("?", 1)[0]
    sign_params = {**(query or {}), **oauth}
    param_str = "&".join(f"{_pct(k)}={_pct(v)}" for k, v in sorted(sign_params.items()))
    base_str = "&".join([_pct(method.upper()), _pct(base_url), _pct(param_str)])
    signing_key = f"{_pct(cs)}&{_pct(ats)}"
    sig = base64.b64encode(hmac.new(signing_key.encode(), base_str.encode(), sha1).digest()).decode()
    oauth["oauth_signature"] = sig
    return "OAuth " + ", ".join(f'{_pct(k)}="{_pct(v)}"' for k, v in sorted(oauth.items()))


def fetch_x_snippets() -> str:
    ck, cs, at, ats = (
        getenv("X_API_KEY"),
        getenv("X_API_SECRET"),
        getenv("X_ACCESS_TOKEN"),
        getenv("X_ACCESS_SECRET"),
    )
    if not all([ck, cs, at, ats]):
        return "(X API credentials missing — synthesis uses Grok only.)"

    lines: list[str] = []
    for q in QUERIES:
        qparams = {
            "query": q,
            "max_results": "12",
            "tweet.fields": "created_at,public_metrics,author_id",
            "expansions": "author_id",
            "user.fields": "username",
        }
        url = "https://api.x.com/2/tweets/search/recent"
        auth = oauth1_header("GET", url, ck, cs, at, ats, qparams)
        try:
            r = requests.get(
                url,
                params=qparams,
                headers={"Authorization": auth, "User-Agent": "GoalChainXScout/1.0"},
                timeout=25,
            )
            if r.status_code != 200:
                lines.append(f"- query `{q[:40]}…` HTTP {r.status_code}")
                continue
            data = r.json()
            users = {
                u.get("id"): u.get("username", "?")
                for u in (data.get("includes") or {}).get("users") or []
            }
            for t in (data.get("data") or [])[:6]:
                uid = t.get("author_id", "")
                user = users.get(uid, "?")
                text = re.sub(r"\s+", " ", (t.get("text") or ""))[:200]
                tid = t.get("id", "")
                lines.append(f"- @{user}: {text} https://x.com/{user}/status/{tid}")
        except Exception as e:
            lines.append(f"- query error: {e}")
        time.sleep(0.4)
    return "\n".join(lines) if lines else "(no X results this cycle)"


def grok_synthesize(x_context: str, score_min: int) -> str:
    key = getenv("XAI_API_KEY")
    if not key:
        raise SystemExit("XAI_API_KEY missing in ~/hermes/config.env")

    model = getenv("OA_SCOUT_GROK_MODEL", "grok-3")
    tone = getenv("OA_SCOUT_TONE", "balanced")
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    prompt = f"""You are GoalChain X-Scout. Write a markdown radar report for the team.

UTC stamp: {ts}
Tone: {tone}
Minimum candidate score: {score_min}/40 (only include candidates meeting this).

## X snippets (live)
{x_context}

## Requirements
- Title: # GoalChain AI Radar — {ts}
- 1 paragraph thesis on why these matter for GoalChain (Solana, agents, play webapp, ops).
- Table with max 3 candidates: Name | Score /40 | Strategic | Build | Edge | Maturity | Links
- Each candidate MUST include at least one https://github.com/ repo AND one https://x.com/ or @alias reference.
- Section "Why now" with 3 bullets.
- Section "48h PoC" with branch name exp/scout-<slug> and 5 steps.
- If nothing strong enough, still pick ONE "near-miss" with honest gaps (do NOT write "none met minimum" only).

Output markdown only."""

    r = requests.post(
        "https://api.x.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.4,
        },
        timeout=180,
    )
    if r.status_code != 200:
        raise SystemExit(f"xAI HTTP {r.status_code}: {r.text[:400]}")
    content = r.json()["choices"][0]["message"]["content"]
    if not content.strip().startswith("#"):
        content = f"# GoalChain AI Radar — {ts}\n\n{content}"
    return content.strip() + "\n"


def main() -> int:
    score_min = int(getenv("OA_SCOUT_SCORE_MIN", "28") or "28")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    out = OUT_DIR / f"ai-radar-{ts}.md"

    x_ctx = fetch_x_snippets()
    body = grok_synthesize(x_ctx, score_min)
    out.write_text(body, encoding="utf-8")
    print(f"x_scout: wrote {out} ({len(body)} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
