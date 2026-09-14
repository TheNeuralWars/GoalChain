#!/usr/bin/env python3
"""Pass 2 — corrections found by vision QC of pass 1.

Fixes: scar side/placement integrity, clean unmarked cheeks, no emblems/logos,
Sierra scar on the LEFT cheek, no fresh scratches, blank wardrobe plates.
"""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
jobs1 = {j["id"]: j for j in json.loads((HERE / "jobs_locksheets.json").read_text())}

CLEAN = ("Marking integrity, non-negotiable: skin is clean and free of scratches, bruises, cuts, "
         "and wounds; the ONLY marking is the one described above. ")
NOLOGO = ("Absolutely no emblem, insignia, logo, patch, badge, or circular shoulder marking anywhere "
          "on clothing or armor: plain unmarked surfaces only. ")

FIX = {
    "LOCK-KORA_VEGA-3q": (
        "Correction: the fibrous raised scar ridge sits BEHIND the RIGHT EAR only — it is not on the cheek, "
        "not on the jaw, not on the forehead. Her face is completely unscarred and unmarked; cheeks clean. "
        "The RIGHT ear is angled toward camera so the ridge behind it is visible. "
        "Hair: dark, shoulder-length, slightly unkempt, loose — not tucked into a neat bun. " + CLEAN + NOLOGO),
    "LOCK-KORA_VEGA-profile": (
        "Correction: RIGHT profile with the fibrous raised scar ridge BEHIND THE RIGHT EAR in silhouette. "
        "No cheek scar, no diagonal scar across the face: the cheek and jaw are clean and unmarked. "
        "No pistol visible in this profile view — hands relaxed, arms out of frame. " + CLEAN + NOLOGO),
    "LOCK-KORA_VEGA-full": (
        "Correction: face unmarked — the only scar is the fibrous ridge BEHIND the RIGHT EAR. "
        "Cheeks clean, no face scars. " + CLEAN + NOLOGO),
    "LOCK-SIERRA_CATALANO-3q": (
        "Correction: the single pale faded scar runs on the LEFT cheek from temple to jaw — the LEFT side, "
        "which appears on the VIEWER'S RIGHT side of the frame. The other cheek is completely clean. "
        "No fresh scratches, no cuts, no wounds. Hair: dark practical commander cut 8-12 cm, short, "
        "loose strands at most — not a bun, not long hair. " + CLEAN + NOLOGO),
    "LOCK-MILEO_CHEN-3q": (
        "Correction: his face has NO scars at all — no cheek scar, no cut, no mark; skin clean. "
        "The only continuity marker is a subtle link nodule under the skin at the nape of the neck, "
        "hidden by the collar and not visible in a front view. " + CLEAN + NOLOGO),
    "REGEN-FC-S07-06": (
        "Correction: plain unmarked copper-bronze vest plates with only abstract geometric etching. " + NOLOGO),
    "REGEN-FC-S07-07": (
        "Correction: plain unmarked copper-bronze vest plate geometry only — no round shoulder emblem, "
        "no insignia, no patch, no stitching that reads as a word. Faces clean of scratches; Kora's only "
        "scar is the ridge behind her RIGHT ear; the violet shimmer reads as faint luminous veins at the "
        "temples, never as cuts. " + CLEAN + NOLOGO),
    "REGEN-FC-S08-06": (
        "Correction:keep this as ONE single frame — a close-up portrait of the commander woman with the "
        "single pale faded scar on her LEFT cheek from temple to jaw and NO other facial marks "
        "(no fresh scratches, no bruises). Her right hand is raised in a small clipped urgency gesture, "
        "fingers extended. Copper-trimmed dark jacket, unmarked. " + CLEAN + NOLOGO),
}

out = []
for jid, extra in FIX.items():
    base = jobs1.get(jid)
    if not base:
        print("!! missing base job", jid)
        continue
    j = dict(base)
    j["prompt"] = base["prompt"] + " " + extra
    out.append(j)

(HERE / "jobs_pass2.json").write_text(json.dumps(out, indent=2))
print(f"pass2 jobs: {len(out)}")
for j in out:
    print(" ", j["id"])