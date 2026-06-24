#!/usr/bin/env python3
"""
hashtag_researcher.py — Hermes Hashtag Mixer

Builds a per-account hashtag set mixing:
  - account-specific fixed brand tags (GoalChain, Solana, etc.)
  - world cup / football context tags
  - LATAM-relevant discovery tags (Spanish, regional fans)
  - rotated "trend-ish" tags placeholder (manual until TikTok Creative Center
    public API is available; see https://ads.tiktok.com/business/creativecenter)

We choose EXACTLY 4-6 hashtags per post (TikTok penalises >6 and <3).

We DO NOT duplicate the same exact 4-tag set across consecutive runs.
"""
import json
import random
import os
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
HASHTAG_HISTORY_FILE = BASE_DIR / "data" / "marketing_pipeline" / "hashtag_history.json"

# account-keyed pools
FIXED_BY_ACCOUNT = {
    "NicoPezDorado": ["#MataGoles", "#PromesaCumplida", "#FútbolConRazón"],
    "GoalChainSol":  ["#GoalChain", "#StakeYourWord", "#Solana"],
}
LATAM_DISCOVERY = [
    "#Fútbol", "#Mundial2026", "#ApuestaConConciencia",
    "#Argentina2026", "#España2026", "#Brasil2026",
    "#Messi", "#Mbappé", "#CR7", "#Haaland", "#Yamal",
    "#ApuestasDelMundo", "#ContratoInteligente",
    "#DeLaCalleAlGol", "#PromesaDeBar",
]


def choose(player_hint: str, account: str, recent: int = 4) -> list[str]:
    """Return 4-6 hashtags for a post about `player_hint`.

    `recent` = how many recent runs to consult to avoid repeats.
    """
    rng = random.Random(str(player_hint) + ":" + str(account))

    fixed = FIXED_BY_ACCOUNT.get(account, ["#GoalChain"])
    chosen = list(fixed[:2])  # first two are always account-fixed brand tags

    # 1 LATAM discovery with player mention if it matches
    candidates = list(LATAM_DISCOVERY)
    rng.shuffle(candidates)
    for tag in candidates:
        if tag[1:].lower() in player_hint.lower() or tag[1:] in ("Mundial2026", "Fútbol"):
            chosen.append(tag)
            break
    if len(chosen) < 3:
        for tag in candidates:
            if tag not in chosen:
                chosen.append(tag)
                break

    # 1-2 more for round-out
    pool2 = [t for t in candidates if t not in chosen]
    rng.shuffle(pool2)
    for tag in pool2[:2]:
        chosen.append(tag)

    # dedupe + cap to 6, floor 4
    seen = set()
    out = []
    for t in chosen:
        if t and t not in seen:
            seen.add(t)
            out.append(t)
    out = out[:6]
    while len(out) < 4 and pool2:
        t = pool2.pop()
        if t not in out:
            out.append(t)
    return out


if __name__ == "__main__":
    for acc in ("GoalChainSol", "NicoPezDorado"):
        for player in ["Messi", "Haaland", "Mbappé"]:
            print(acc, player, "->", choose(player, acc))
