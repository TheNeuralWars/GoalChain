#!/usr/bin/env python3
"""Build jobs_refs.json — 3 locked ref stills per principal into FILM/locks/refs/<id>/.

Deliverable names (fixed by the C-suite task): front.png / profile.png / fullbody.png
Refs = best approved scene still (S01 Mileo, S03 Kora, S04 Sierra) + the freshly
generated lock-sheet 3q still (face anchor). Max 2 refs (API limit).
No faction names, hex only, no readable text.
"""
from __future__ import annotations

import json
from pathlib import Path

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
R = FILM / "renders"
LS = FILM / "locksheets"
REFS = FILM / "locks/refs"
OUT = Path(__file__).resolve().parent

NEG = ("single camera, one view only, no multi-panel, no contact sheet collage, "
       "NO readable text, NO letters, NO logos, NO signage, NO badges with lettering, "
       "no faction names on cloth, PG-13, cinematic photoreal, anamorphic 2.39 feel, "
       "chiaroscuro, volumetric haze")

CHARS = {
    "mileo_chen": {
        "key": "MILEO_CHEN",
        "identity": ("East Asian male ~32, oval-to-rectangular jaw, medium cheekbones, "
                     "straight nasal bridge, moderate brow, clean-shaven, vivid green eyes, "
                     "black regulation hair 3.2 cm, lean-athletic analyst build"),
        "state": ("pre-cut state: plain dark grey-steel Level-7 utility tunic (#708090 / #C0C0C0) "
                  "over dark underlay (#000000 / #301934), abstract blank hexagonal badge geometry "
                  "with no letters, belt with abstract EMP dampener pouch; link nodule subtle at nape"),
        "scars": ("link nodule subtle under skin at base of skull (nape); no wrist glow in this state"),
        "anchors": [R / "FC-S01/FC-S01-02.png"],
    },
    "kora_vega": {
        "key": "KORA_VEGA",
        "identity": ("Latina mestiza woman ~24, angular cheekbones, defined jaw, slightly wide-set "
                     "brown eyes with faint indigo flecks (#4B0082 flecks only, not a solid indigo iris), "
                     "fullish lips, dark practical Underbelly hair shoulder-brushing 28-35 cm, "
                     "compact agile street-operative build — FEMALE lead, never a male figure in this vest"),
        "state": ("worn copper-bronze tactical vest (#B87333 / #FFBF00 / #FF8C00) with BLANK unmarked "
                  "plates (zero lettering, zero patches) over dark underlayer (#000000 / #301934), "
                  "dark pants (#301934), scuffed boots, compact abstract non-branded shock pistol shape"),
        "scars": ("fibrous raised extraction scar ridge behind RIGHT ear (must read clearly); "
                  "subtle subcutaneous bone-conduction ridge at LEFT clavicle, faint copper #B87333 glow, no UI text"),
        "anchors": [R / "FC-S03/FC-S03-05.png"],
    },
    "sierra_catalano": {
        "key": "SIERRA_CATALANO",
        "identity": ("European-descent woman ~38 commander, hazel calculating eyes, dark practical short "
                     "commander hair, weathered angular face with a pale scar from LEFT cheek temple to jaw, "
                     "upright composed posture"),
        "state": ("weathered dark leather jacket with copper seam accents (#B87333 / #FF8C00) over black "
                  "combat pants (#000000), no insignia, no lettering, no patches"),
        "scars": ("pale scar LEFT cheek temple to jaw (must read); no other facial scarring"),
        "anchors": [R / "FC-S04/FC-S04-05.png"],
    },
}

# view_key -> (deliverable filename, prose, aspect)
VIEWS = {
    "front": ("front.png",
              "three-quarter front medium close-up reference view, head-and-shoulders, camera at eye height, "
              "subject turned 30-45 degrees from camera, both eyes visible, neutral expression, "
              "subject seen from the side that shows the characteristic scar", "3:4"),
    "profile": ("profile.png",
                "true profile medium close-up reference view showing the characteristic scar side in clear "
                "silhouette, head-and-shoulders, neutral expression, clean jawline and nasal bridge silhouette",
                "3:4"),
    "fullbody": ("fullbody.png",
                 "full-body head-to-toe reference view, standing neutral, arms relaxed at sides, feet planted, "
                 "camera eye-level mid-distance, whole figure in frame from hair to boots, slight anamorphic wide feel",
                 "2:3"),
}

jobs = []
for cid, c in CHARS.items():
    anchor = c["anchors"][0]
    lock3q = LS / f"LOCK_SHEET_{c['key']}" / "3q.jpg"
    refs = [p for p in (anchor, lock3q) if p.is_file()][:2]
    for vkey, (fname, vtext, aspect) in VIEWS.items():
        prompt = (
            f"Character reference still, {vtext}. Characterization: {c['identity']}. "
            f"Wardrobe — {c['state']}. Continuity markers — {c['scars']}. "
            f"Environment: plain industrial undercity concrete bay, sodium amber practical (#FF8C00) rim light, "
            f"deep shadow atmosphere (#000000 / #301934), volumetric haze. "
            f"Keep the same face, hair and wardrobe as the reference image(s); only change the camera view. "
            f"{NEG}."
        )
        jobs.append({
            "id": f"REF-{c['key']}-{vkey}",
            "kind": "image",
            "dest": str(REFS / cid / fname),
            "model": "grok-imagine-image-quality",
            "aspect": aspect,
            "refs": [str(p) for p in refs],
            "prompt": prompt,
        })

(OUT / "jobs_refs.json").write_text(json.dumps(jobs, indent=2))
print(f"jobs: {len(jobs)}")
for j in jobs:
    print(f"  {j['id']:>28} -> {j['dest']}  refs={len(j['refs'])}")
