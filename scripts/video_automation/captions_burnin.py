#!/usr/bin/env python3
"""
captions_burnin.py — STUB for video captioning overlay (Whisper + ffmpeg)

GoalChain vertical videos need burnt-in captions to convert well:
  - 85% of TikTok viewers watch muted
  - yellow #FFD700 with black outline, 2-line layout, lower-third
  - rendered with ffmpeg drawtext

Wiring it requires:
  1) sudo apt-get install -y ffmpeg
  2) pip install openai-whisper (or use Faster-Whisper for CPU)
  3) TTS / ASR either via ElevenLabs + Whisper STT of that audio,
     or transcribed from the original `post_text` directly (preferred,
     no STT needed — just chunk the text into <2s blocks timed to the video)

Until ffmpeg is installed on this host, this module exports `render()` and
`plan_cues()` but the render function returns "ffmpeg not available"
gracefully and logs a one-liner todo so the daemon doesn't blow up.

Once ffmpeg is available, set:
    CAPTIONS_ENABLED = True  (in .env)
and the pipeline call site (grok_super_pipeline) will invoke render().
"""
import os
import shutil
import subprocess
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def is_ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def plan_cues(post_text: str, total_seconds: float = 58.0) -> List[dict]:
    """Chunk the post_text into ~2s cues spanning the video.

    Each cue: {"start": float, "end": float, "text": str}
    The script splits on whitespace and packs words greedily into ~2.5-second
    windows to mimic a casual speech cadence.
    """
    words = post_text.split()
    cues = []
    if not words:
        return cues

    # ~150 words per minute reading speed
    words_per_second = 150.0 / 60.0
    bucket_words = max(2, int(words_per_second * 2.0))
    n_cues = max(1, (len(words) + bucket_words - 1) // bucket_words)
    seconds_per_cue = total_seconds / n_cues

    for i in range(n_cues):
        chunk = words[i * bucket_words : (i + 1) * bucket_words]
        if not chunk:
            break
        cues.append({
            "start": round(i * seconds_per_cue, 2),
            "end":   round((i + 1) * seconds_per_cue, 2),
            "text":  " ".join(chunk),
        })
    return cues


def render(video_path: Path, post_text: str, out_path: Path) -> dict:
    """Burn cues into the video. Returns a status dict.

    If ffmpeg is unavailable, returns {"status": "skipped", "reason": "no ffmpeg"}.
    """
    if not is_ffmpeg_available():
        return {
            "status": "skipped",
            "reason": "ffmpeg not installed on host — see scripts/video_automation/captions_burnin.py",
            "todo": "sudo apt-get install ffmpeg && set CAPTIONS_ENABLED=True in .env",
        }

    cues = plan_cues(post_text)
    if not cues:
        return {"status": "skipped", "reason": "empty post_text"}

    # For each cue, render an ffmpeg drawtext filter and concat. Kept minimal
    # here — production wiring can use ffmpeg-python for readability.
    filter_parts = []
    for c in cues:
        # ffmpeg drawtext escape rules: backslash, single quote, colon, percent
        safe = (
            c["text"]
            .replace("\\", "\\\\")
            .replace("'", r"\'")
            .replace(":", "\\:")
            .replace("%", "\\%")
        )
        filter_parts.append(
            f"drawtext=text='{safe}':"
            "fontsize=42:fontcolor=yellow:box=1:boxcolor=black@0.4:boxborderw=12:"
            "x=(w-text_w)/2:y=h*0.78:"
            f"enable='between(t,{c['start']},{c['end']})'"
        )
    vf = ",".join(filter_parts)

    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "copy",
        str(out_path),
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, encoding="utf-8", timeout=120)
        if res.returncode == 0:
            return {"status": "ok", "out_path": str(out_path), "cues": len(cues)}
        return {"status": "failed", "stderr": res.stderr[-500:]}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


if __name__ == "__main__":
    print("ffmpeg available:", is_ffmpeg_available())
    sample = "Hola Nico. Hoy vamos a hablar de Messi en su último Mundial."
    print("plan_cues:", plan_cues(sample, total_seconds=20.0))
