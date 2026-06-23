"""Grok-powered English narrative generator for oracle video alerts.

Reads env XAI_API_KEY. If absent or on API error, falls back to a
deterministic English template (no Spanish literals; English Max Law safe).
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Optional

XAI_URL = "https://api.x.ai/v1/chat/completions"

SYSTEM = (
    "You write punchy 6-10 second narration scripts for short vertical "
    "sports crypto videos. Output one paragraph, max 200 chars, English only. "
    "No Spanish words. No hashtags. No emojis unless in the event payload."
)


def _event_to_xai(event: dict) -> dict:
    """Build the user message from the canonical event payload."""
    team = f"{event.get('teamA', 'Team A')} vs {event.get('teamB', 'Team B')}"
    score = f"{event.get('scoreA', 0)}-{event.get('scoreB', 0)}"
    text = event.get("eventText", "live update")
    yld = event.get("yieldChange", "")
    user = (
        f"Match: {team}. Score: {score}. Event: {text}. Yield: {yld}."
        " Write a tight energetic commentator line."
    )
    return {"role": "user", "content": user}


def _fallback(event: dict) -> str:
    """Deterministic English fallback so the pipeline never produces Spanish."""
    a = event.get("teamA", "Team A")
    b = event.get("teamB", "Team B")
    s = f"{event.get('scoreA', 0)}-{event.get('scoreB', 0)}"
    text = event.get("eventText", "the oracle fired a live update")
    yld = event.get("yieldChange", "")
    yld_clause = f" Yields moved {yld}." if yld else ""
    return f"GoalChain oracle: {a} vs {b} at {s}. {text}.{yld_clause} Bullish on-chain!"


def call_grok(event: dict, *, timeout: float = 15.0) -> str:
    """Return an English narration line. Falls back if XAI is unreachable."""
    key = os.environ.get("XAI_API_KEY") or os.environ.get("GROK_API_KEY")
    if not key:
        return _fallback(event)

    body = json.dumps(
        {
            "model": "grok-3",
            "messages": [SYSTEM, _event_to_xai(event)],
            "temperature": 0.6,
            "max_tokens": 200,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        XAI_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            payload = json.loads(r.read())
        return payload["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, KeyError, json.JSONDecodeError):
        return _fallback(event)


def safe(event: dict) -> str:
    """Call Grok and verify the result is English-only."""
    narrative = call_grok(event)
    # Local import keeps grok_narrative importable without circular deps.
    try:
        from english_check import assert_english  # type: ignore
    except ImportError:
        from .english_check import assert_english  # type: ignore

    try:
        assert_english(narrative, what="narrative")
    except Exception:
        return _fallback(event)
    return narrative
