#!/usr/bin/env python3
"""
Hermes X Signal Extractor — parses X content for GoalWorld-relevant signals.

Receives a list of parsed retweet dicts and emits structured signal records.
Signal types:
  competitor   — mentions competitors or comparable projects
  kol          — influencer/KOL tweet (>5k followers + engagement)
  alpha        — news, alpha, or early signal about Web3/Solana/AI agents
  tech         — technical content (code, tools, frameworks)
  engagement   — high RT or like count regardless of content
  goalworld    — directly mentions or references GoalChain/goalworldsol/goalworlddotfun

Each signal record:
  {
    "id": str,            # original tweet ID
    "type": str,          # signal category
    "username": str,      # tweet author
    "text": str,          # full tweet text (or preview)
    "rt_count": int,
    "like_count": int,
    "url": str,           # https://x.com/<user>/status/<id>
    "ts": str,            # ISO 8601 created_at
    "action_tags": [str], # e.g. ["discord-research", "ai-radar"]
    "confidence": float,  # 0.0-1.0
  }
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path

# Keywords for each signal category
_KEYWORDS: dict[str, list[str]] = {
    "competitor": [
        "stake .games", "polymarket", "betereum", "fantasy crypto",
        "football championship", "soccer market", "prediction market",
        "betting dapp", "sports nft game", "futbol crypto",
        "guessing game", "prop shop", "polymarket", "azuro protocol",
        "dextools", "rook", "dexscreener", "football fantasy",
    ],
    "alpha": [
        "alpha", "gem ", "hidden gem", "underrated", "early signal",
        "just in", "breaking", "scoop", "found this", "look into",
        "worth watching", "fire tweet", "big move", "bullish",
        "nft mint", "fair launch", "presale", "airdrop",
    ],
    "tech": [
        "github", "open source", "anchor", "solana program",
        "rust ", "python script", "web3.py", "mcp ", "model context",
        "langgraph", "crewai", "autogen", "llm", "n8n", "workflow",
        "automation", "agent framework", "smart contract", "token 2022",
        "cpi ", "instruction", "idl", "typegen", "buildoor",
        "nucleius", "orca", "raydium", "jupiter", "helius", "triton",
    ],
    "goalworld": [
        "goalworld", "goalchain", "#goalchain", "#goalworld",
        "solana football", "solana soccer", "gch token",
        "528 players", "mythic nft", "legendary player",
    ],
}

# Competitor project names
_COMPETITORS = [
    "polymarket", "azuro", "betereum", "stake games",
    "rooks", "dexalot", "guessinggame", "guess eth",
]

# KOL threshold: follower count above this triggers kol tag
_KOL_FOLLOWER_THRESHOLD = 5000


def classify_signal(record: dict) -> dict:
    """Classify a single tweet record and return enriched signal dict."""
    text = (record.get("text") or record.get("content_preview") or "").lower()
    username = (record.get("username") or record.get("original_author") or "unknown").lstrip("@")
    followers = record.get("follower_count", 0)

    url = f"https://x.com/{username}/status/{record.get('id', '')}"
    ts = record.get("created_at") or datetime.now(timezone.utc).isoformat()

    # Detect goalworld first (highest priority)
    for kw in _KEYWORDS["goalworld"]:
        if kw.lower() in text:
            return _make_signal(
                record, "goalworld", url, ts,
                action_tags=["social-alert", "ai-radar"],
                confidence=0.95,
            )

    # Competitor detection
    for comp in _COMPETITORS:
        if comp.lower() in text:
            return _make_signal(
                record, "competitor", url, ts,
                action_tags=["ai-radar", "discord-research"],
                confidence=0.85,
            )
    for kw in _KEYWORDS["competitor"]:
        if kw.lower() in text:
            return _make_signal(
                record, "competitor", url, ts,
                action_tags=["ai-radar"],
                confidence=0.75,
            )

    # Alpha / news detection
    for kw in _KEYWORDS["alpha"]:
        if kw.lower() in text:
            return _make_signal(
                record, "alpha", url, ts,
                action_tags=["ai-radar", "discord-research"],
                confidence=0.8,
            )

    # Tech detection
    for kw in _KEYWORDS["tech"]:
        if kw.lower() in text:
            return _make_signal(
                record, "tech", url, ts,
                action_tags=["ai-radar"],
                confidence=0.7,
            )

    # KOL detection: high follower count + decent engagement
    rt_count = record.get("rt_count", 0)
    like_count = record.get("like_count", 0)
    if followers >= _KOL_FOLLOWER_THRESHOLD and (rt_count >= 10 or like_count >= 50):
        return _make_signal(
            record, "kol", url, ts,
            action_tags=["social-alert"],
            confidence=min(0.5 + (rt_count / 200), 0.9),
        )

    # Engagement detection: very high RT/like counts
    if rt_count >= 100 or like_count >= 500:
        return _make_signal(
            record, "engagement", url, ts,
            action_tags=["social-alert"],
            confidence=min(0.4 + (rt_count / 1000), 0.85),
        )

    # No signal
    return {
        "id": record.get("id", ""),
        "type": "none",
        "username": username,
        "text": (record.get("text") or "")[:300],
        "rt_count": rt_count,
        "like_count": like_count,
        "url": url,
        "ts": ts,
        "action_tags": [],
        "confidence": 0.0,
    }


def _make_signal(
    record: dict,
    sig_type: str,
    url: str,
    ts: str,
    action_tags: list[str],
    confidence: float,
) -> dict:
    return {
        "id": record.get("id", ""),
        "type": sig_type,
        "username": (record.get("username") or record.get("original_author") or "unknown").lstrip("@"),
        "text": (record.get("text") or record.get("content_preview") or "")[:300],
        "rt_count": record.get("rt_count", 0),
        "like_count": record.get("like_count", 0),
        "url": url,
        "ts": ts,
        "action_tags": action_tags,
        "confidence": round(confidence, 2),
    }


def extract_signals(retweet_records: list[dict]) -> list[dict]:
    """Process a list of retweet records and return all detected signals."""
    signals = []
    for rec in retweet_records:
        sig = classify_signal(rec)
        if sig["type"] != "none":
            signals.append(sig)
    return signals


def write_signals(signals: list[dict], out_path: Path | str | None = None) -> Path:
    """Write signals to a JSON file. Returns the path written."""
    import json
    if out_path is None:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        from pathlib import Path as P
        HOME = P.home()
        out_path = HOME / ".hermes" / "oa" / "state" / f"x-signals-{ts}.json"

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Load existing signals for today to avoid duplicates
    existing: list[dict] = []
    if out_path.exists():
        try:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
        except Exception:
            existing = []

    existing_ids = {s["id"] for s in existing}
    for sig in signals:
        if sig["id"] not in existing_ids:
            existing.append(sig)
            existing_ids.add(sig["id"])

    out_path.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return out_path


# ---- CLI for quick testing ----
if __name__ == "__main__":
    import json, sys

    tests = [
        {
            "id": "test001",
            "username": "cryptopunk",
            "text": "Solana going to 500 — check polymarket for predictions",
            "rt_count": 120,
            "like_count": 340,
            "follower_count": 8000,
            "created_at": "2026-07-10T12:00:00Z",
        },
        {
            "id": "test002",
            "username": "builderdev",
            "text": "Built an Anchor program with CPI calls to the token program. Open source on github",
            "rt_count": 45,
            "like_count": 90,
            "follower_count": 3000,
            "created_at": "2026-07-10T13:00:00Z",
        },
        {
            "id": "test003",
            "username": "degenninja",
            "text": "alpha gem alert: look into this new prediction market on solana",
            "rt_count": 200,
            "like_count": 600,
            "follower_count": 12000,
            "created_at": "2026-07-10T14:00:00Z",
        },
        {
            "id": "test004",
            "username": "randomuser",
            "text": "just a random tweet about lunch",
            "rt_count": 1,
            "like_count": 2,
            "follower_count": 50,
            "created_at": "2026-07-10T15:00:00Z",
        },
        {
            "id": "test005",
            "username": "fanboy",
            "text": "goalchain looking strong today! #goalchain",
            "rt_count": 30,
            "like_count": 80,
            "follower_count": 200,
            "created_at": "2026-07-10T16:00:00Z",
        },
    ]

    signals = extract_signals(tests)
    print(f"Extracted {len(signals)} signals from {len(tests)} test records:")
    for s in signals:
        print(f"  [{s['type']}] @{s['username']} | conf={s['confidence']} | tags={s['action_tags']}")
        print(f"    {s['text'][:80]}...")

    # Test write
    out = write_signals(signals)
    print(f"\nWritten to: {out}")

    # Verify JSON is valid
    with open(out) as f:
        loaded = json.load(f)
    print(f"Verified: {len(loaded)} total signals in file")

    # Clean up test output
    out.unlink(missing_ok=True)
    sys.exit(0)