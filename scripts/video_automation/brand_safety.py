#!/usr/bin/env python3
"""
brand_safety.py — STUB. Brand-safety vision check (face similarity).

Triggered post-generation in `grok_super_pipeline.run_pipeline()` only when
`BRAND_SAFETY_ENABLED=true` in `.env`.

Goal: detect faces in the generated still image that resemble real-world
footballers we don't have rights to use. Models like Messi / Mbappé / CR7 /
Haaland / Bellingham / Pedri / Yamal / Vinícius / etc. carry likeness rights
that should NOT be reproduced in marketing material — losing a single
copyright strike on TikTok can blow a 0-5k channel out of the algorithm.

Implementation plan (deferred — requires host approval):

  1) sudo apt-get install -y libgl1 libglib2.0-0 # CUDA libs for retinaface
  2) pip install insightface onnxruntime
  3) download arcface-onnx weights under /opt/models (centrally managed)
  4) per generated image:
       - detect faces via retinaface
       - extract arcface embeddings
       - cosine similarity vs a curated gallery of canonical player shots
         (5-10 reference shots per player, manually seeded)
       - if max similarity > 0.55 (configurable), flag run as high-risk,
         skip Buffer upload, alert Manager via WhatsApp

Until Insightface is installed, this module returns:
    {"status": "disabled", "reason": "BRAND_SAFETY_ENABLED=false or deps missing"}

It is wired in grok_super_pipeline.run_pipeline() after `update_run_state({...video_url...})`.
"""
import os
from pathlib import Path
from typing import Optional

SIMILARITY_THRESHOLD = float(os.getenv("BRAND_SAFETY_THRESHOLD", "0.55"))
KNOWN_PLAYERS = [
    "Lionel Messi", "Kylian Mbappé", "Cristiano Ronaldo",
    "Erling Haaland", "Vinícius Jr.", "Jude Bellingham",
    "Lamine Yamal", "Pedri", "Julián Álvarez",
]


def check_image(image_path: Optional[Path]) -> dict:
    """Return brand-safety verdict for a generated image.

    Returns one of:
        {"status": "ok", "max_similarity": 0.x, "matched_player": str|None}
        {"status": "skip", "reason": "BRAND_SAFETY_ENABLED=false"}
        {"status": "blocked", "max_similarity": 0.x, "matched_player": str}
        {"status": "error", "reason": str}
    """
    if os.getenv("BRAND_SAFETY_ENABLED", "false").lower() != "true":
        return {"status": "skip", "reason": "BRAND_SAFETY_ENABLED=false"}

    # Defer real implementation — see module docstring.
    try:
        # Placeholder so the daemon has a hook to swap in later.
        from insightface.app import FaceAnalysis  # noqa: F401
        return {"status": "pending", "reason": "insightface present — implement me"}
    except ImportError:
        return {"status": "skip", "reason": "insightface not installed"}


if __name__ == "__main__":
    print(check_image(None))
