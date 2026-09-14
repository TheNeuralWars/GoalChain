#!/usr/bin/env python3
"""Pass 3 — hard negatives for the stubborn cases (scar side, emblems, face tattoos)."""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
p1 = {j["id"]: j for j in json.loads((HERE / "jobs_locksheets.json").read_text())}
p2 = {j["id"]: j for j in json.loads((HERE / "jobs_pass2.json").read_text())}

BASE = p2 if False else p1

STRICT = ("STRICT: exactly one person in frame. ")

FIX = {
    "LOCK-KORA_VEGA-3q": (
        "STRICT CORRECTION: her face is COMPLETELY FREE of scars, cuts, lines and marks — no scar on the "
        "cheek, none near the eye, none on the jaw, none on the forehead. The sole continuity marking is a "
        "subtle raised fibrous ridge BEHIND THE RIGHT EAR, largely hidden by hair. Hair: dark, loose, "
        "shoulder-length, slightly unkempt. Wardrobe: plain unmarked copper-bronze vest — no glowing symbol "
        "on the chest, no emblem, no patch, no pendant, no jewellery, no text of any kind. " + STRICT),
    "LOCK-KORA_VEGA-profile": (
        "STRICT CORRECTION: RIGHT profile. The cheek is clean and unmarked — no scar across the cheek and "
        "none from temple to jaw. The only continuity marking is the raised fibrous ridge BEHIND THE RIGHT "
        "EAR, seen in profile. Hands empty, no weapon in frame. Plain unmarked vest, no emblem, no patch, "
        "no jewellery, no text. " + STRICT),
    "LOCK-SIERRA_CATALANO-3q": (
        "STRICT CORRECTION: the single pale faded scar runs from temple to jaw on the cheek that is on the "
        "VIEWER'S RIGHT side of the frame (her LEFT cheek). The cheek on the viewer's left is completely "
        "clean. No other facial marks. Hair: short chin-length commander bob, dark. Plain unmarked dark "
        "leather jacket, no emblem, no patch, no insignia, no text. " + STRICT),
    "REGEN-FC-S07-07": (
        "STRICT CORRECTION: no patches, no emblems, no insignia, no square tabs anywhere on any clothing. "
        "No tattoos, no markings, no lines on either character's FACE or NECK — both faces are clean skin. "
        "Mileo's only glowing element is the indigo bio-luminescent lines under the skin of his LEFT wrist "
        "and LEFT forearm. Kora's only glow is a faint violet shimmer at the temples, reading as light "
        "under the skin, never as cracks or tattoos. " + STRICT),
}

out = []
for jid, extra in FIX.items():
    base = BASE.get(jid)
    if not base:
        print("!! missing", jid)
        continue
    jobs1 = dict(base)
    jobs1["prompt"] = base["prompt"] + " " + extra
    out.append(jobs1)

(HERE / "jobs_pass3.json").write_text(json.dumps(out, indent=2))
print("pass3 jobs:", len(out), [j["id"] for j in out])