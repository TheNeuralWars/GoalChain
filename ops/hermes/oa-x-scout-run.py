#!/usr/bin/env python3
"""
Hermes X-Scout v2: X signals + Grok synthesis → one markdown report → Discord forum.

Writes: ~/.hermes/workspace/docs/ai-radar-<UTC>.md
Publish: ops/hermes/oa-x-scout-discord.py (active-research forum, embeds, dedup)
"""
from __future__ import annotations

import base64
import hmac
import os
import re
import subprocess
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from hashlib import sha1
from pathlib import Path

import requests

HOME = Path.home()
OUT_DIR = HOME / ".hermes" / "workspace" / "docs"
HERMES_HOME = Path(os.getenv("HERMES_HOME", str(HOME / "hermes")))
DISCORD_PUBLISH = HERMES_HOME / "scripts" / "oa-x-scout-discord.py"
STATE_FILE = HERMES_HOME / "oa" / "state" / "x-scout-discord.json"

QUERIES = [
    "(solana OR web3) (AI agent OR agents) -is:retweet lang:en",
    "#goalchain OR goalchainmanager lang:en",
    "(Claude Code OR MCP) (open source OR github) -is:retweet lang:en",
]


def getenv(name: str, default: str = "") -> str:
    return (os.getenv(name) or default).strip()


def _pct(value: str) -> str:
    return urllib.parse.quote(value, safe="~-._")


def oauth1_header(
    method: str,
    url: str,
    ck: str,
    cs: str,
    at: str,
    ats: str,
    query: dict[str, str] | None = None,
) -> str:
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


def fetch_x_snippets() -> tuple[str, int]:
    ck, cs, at, ats = (
        getenv("X_API_KEY"),
        getenv("X_API_SECRET"),
        getenv("X_ACCESS_TOKEN"),
        getenv("X_ACCESS_SECRET"),
    )
    if not all([ck, cs, at, ats]):
        return "(X API credentials missing — synthesis uses Grok only.)", 0

    lines: list[str] = []
    hits = 0
    for q in QUERIES:
        qparams = {
            "query": q,
            "max_results": "10",
            "tweet.fields": "created_at,public_metrics",
            "expansions": "author_id",
            "user.fields": "username",
        }
        url = "https://api.x.com/2/tweets/search/recent"
        auth = oauth1_header("GET", url, ck, cs, at, ats, qparams)
        try:
            r = requests.get(
                url,
                params=qparams,
                headers={"Authorization": auth, "User-Agent": "GoalChainXScout/2.0"},
                timeout=25,
            )
            if r.status_code != 200:
                lines.append(f"- query `{q[:36]}…` HTTP {r.status_code}")
                continue
            data = r.json()
            users = {
                u.get("id"): u.get("username", "?")
                for u in (data.get("includes") or {}).get("users") or []
            }
            for t in (data.get("data") or [])[:5]:
                uid = t.get("author_id", "")
                user = users.get(uid, "?")
                text = re.sub(r"\s+", " ", (t.get("text") or ""))[:180]
                tid = t.get("id", "")
                lines.append(f"- [@{user}](https://x.com/{user}/status/{tid}): {text}")
                hits += 1
        except Exception as e:
            lines.append(f"- query error: {e}")
        time.sleep(0.35)
    body = "\n".join(lines) if lines else "(no X results this cycle)"
    return body, hits


def grok_synthesize(x_context: str, x_hits: int, score_min: int, ts: str) -> str:
    key = getenv("XAI_API_KEY")
    if not key:
        raise SystemExit("XAI_API_KEY missing in ~/hermes/config.env")

    # Modelo configurable via env (default: el que Hermes tenga activo)
    # Nico puede testear distintos modelos sin tocar código:
    #   OA_SCOUT_SYNTH_MODEL=mistralai/mistral-large-3-675b-instruct-2512
    #   OA_SCOUT_SYNTH_MODEL=z-ai/glm-5.1
    #   OA_SCOUT_SYNTH_MODEL=nvidia/nemotron-3-super-120b-a12b
    model = getenv("OA_SCOUT_SYNTH_MODEL", "grok-3")
    tone = getenv("OA_SCOUT_TONE", "balanced")
    strategy_depth = getenv("OA_SCOUT_STRATEGY_DEPTH", "expert")

    prompt = f"""You are GoalChain X-Scout (Hermes). Your mission: synthesize a **Grok-scale** radar for the Discord **active-research** forum.

**Constraints Mistral Large 3 (32K tokens)**:
- Analyze the X snippets as raw market signals.
- **Structure output as a 3-pass MoA draft**:
  1. **First pass**: Generate 3 table rows (projects), score 0-40, include ALL evidence from X (cite usernames).
  2. **Second pass**: Critique each row — what’s missing? (e.g., "Project A lacks a public GitHub").
  3. **Third pass**: Produce the final markdown with:
     - Opening thesis (1 paragraph, **bold claims only**).
     - Table (max 3 rows) with columns: | Project | Score /40 | Strategic Fit | Build Viability | Unique Edge | Links |.
     - **Why now** section: exactly 3 bullets (timing, tech, or market shifts).
     - **48h PoC** section: branch name, 5 numbered steps (realistic, testable).
- **Tone**: {tone} (options: "balanced", "visionary", "skeptical").
- **Strategy depth**: {strategy_depth} (options: "novice", "expert", "world-class").

UTC: {ts}
Minimum candidate score: {score_min}/40
X snippets collected: {x_hits}

## Live X snippets
{x_context}

## Output rules (strict)
1. If **no** project meets ALL criteria (score ≥ {score_min}, active GitHub, real X proof):
   - Output ONLY:
     # GoalChain AI Radar — {ts}
     <!-- X_SCOUT_QUIET -->
     Explain why this cycle is quiet (max 3 sentences).
2. If candidates exist:
   - Include **full GitHub/X links** (clickable in Discord).
   - **Never** repeat boilerplate from prior cycles.
3. **Markdown only**. No JSON."""

    r = requests.post(
        "https://api.x.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.35,
        },
        timeout=180,
    )
    if r.status_code != 200:
        raise SystemExit(f"xAI HTTP {r.status_code}: {r.text[:400]}")
    content = r.json()["choices"][0]["message"]["content"].strip()
    if not content.startswith("#"):
        content = f"# GoalChain AI Radar — {ts}\n\n{content}"
    return content + "\n"


def publish_to_discord(report_path: Path) -> int:
    if not Path(DISCORD_PUBLISH).is_file():
        print(f"x_scout: WARN discord publisher missing at {DISCORD_PUBLISH}")
        return 0
    env = {**os.environ, "OA_X_SCOUT_STATE_FILE": str(STATE_FILE)}
    proc = subprocess.run(
        [sys.executable, str(DISCORD_PUBLISH), str(report_path), "--state-file", str(STATE_FILE)],
        env=env,
        capture_output=True,
        text=True,
        timeout=60,
    )
    if proc.stdout:
        print(proc.stdout.rstrip())
    if proc.stderr:
        print(proc.stderr.rstrip(), file=sys.stderr)
    return proc.returncode


def main() -> int:
    score_min = int(getenv("OA_SCOUT_SCORE_MIN", "28") or "28")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    out = OUT_DIR / f"ai-radar-{ts}.md"

    x_ctx, x_hits = fetch_x_snippets()
    body = grok_synthesize(x_ctx, x_hits, score_min, ts)
    out.write_text(body, encoding="utf-8")
    print(f"x_scout: wrote {out} ({len(body)} bytes, x_hits={x_hits})")

    if getenv("OA_RESEARCH_PUBLISHER_ENABLED", "false").lower() in ("1", "true", "yes"):
        return publish_to_discord(out)
    print("x_scout: discord publish skipped (OA_RESEARCH_PUBLISHER_ENABLED=false)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
