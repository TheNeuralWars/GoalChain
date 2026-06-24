#!/usr/bin/env python3
"""
quality_scorer.py — Hermes quality scoring (skeleton, 2026-06-24)

QA check for newly generated runs BEFORE they go to Buffer.
Stub now → the loop is implemented in grok_super_pipeline once
Nico installs `ffmpeg` (requires sudo on this host) and a small vision
model for face-similarity (the brand-safety check).

Checklist when wired:
  [OK]    image_prompt / video_prompt / post_text present and non-empty
  [TODO]  whisper-caption generation (see captions_burnin.py)
  [TODO]  face-similarity brand-safety check (no Messi / Mbappé real face)
  [TODO]  length-check: post_text 220-700 chars, hook < 50 chars
  [OK]    Buffer rate-limit cooldown window started
"""
import re
from pathlib import Path
from typing import Optional

MIN_POST_TEXT_CHARS = 220
MAX_POST_TEXT_CHARS = 700
MAX_HOOK_CHARS = 50


def score_run(run: dict) -> dict:
    issues = []
    checks = {}

    pt = run.get("post_text", "") or ""
    checks["post_text_chars"] = len(pt)
    if not pt.strip():
        issues.append("post_text is empty")
    elif len(pt) < MIN_POST_TEXT_CHARS:
        issues.append(f"post_text too short (<{MIN_POST_TEXT_CHARS})")
    elif len(pt) > MAX_POST_TEXT_CHARS:
        issues.append(f"post_text too long (>{MAX_POST_TEXT_CHARS})")

    ip = run.get("image_prompt", "") or ""
    checks["image_prompt_present"] = bool(ip.strip())
    if not ip.strip():
        issues.append("image_prompt is empty")

    vp = run.get("video_prompt", "") or ""
    checks["video_prompt_present"] = bool(vp.strip())
    if not vp.strip():
        issues.append("video_prompt is empty")

    # crude hook detection: first sentence of `post_text`
    sent_split = re.split(r"[.!?\n]", pt, maxsplit=1)
    hook = sent_split[0] if sent_split else ""
    checks["hook_chars"] = len(hook)
    if len(hook) > MAX_HOOK_CHARS:
        issues.append(f"hook too long (> {MAX_HOOK_CHARS}) — split it")

    checks["score"] = max(0, 100 - (len(issues) * 18))
    checks["issues"] = issues
    checks["passes"] = not issues
    return checks


if __name__ == "__main__":
    sample = {
        "post_text": "Messi va a su último mundial. Y vos ya perdiste plata por él dos veces sin darte cuenta. Mirá por qué.",
        "image_prompt": "a portrait-style poster of an Argentine locker room at dawn",
        "video_prompt": "camera dolly in, golden hour, particles",
    }
    import json
    print(json.dumps(score_run(sample), indent=2))
