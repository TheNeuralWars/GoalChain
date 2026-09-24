#!/usr/bin/env python3
"""Build jobs.json for (A) lock sheets and (B) selective still regen.

Deterministic prompts: hex tokens only, no faction names, no readable text,
fixed scars/eyes. Refs = best existing stills from renders/.
"""
from __future__ import annotations

import json
from pathlib import Path

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
R = FILM / "renders"
LS = FILM / "locksheets"
OUT = Path(__file__).resolve().parent

NEG = ("single camera, one view only, no multi-panel, no contact sheet collage, "
       "NO readable text, NO letters, NO logos, NO signage, NO badges with lettering, "
       "no faction names on cloth, PG-13, cinematic photoreal, anamorphic 2.39 feel, "
       "chiaroscuro, volumetric haze")

CHARS = {
    "MILEO_CHEN": {
        "id": "LOCK_SHEET_MILEO_CHEN",
        "identity": ("East Asian male ~32, oval-to-rectangular jaw, medium cheekbones, "
                     "straight nasal bridge, moderate brow, clean-shaven, vivid green eyes, "
                     "black regulation hair 3.2 cm, lean-athletic analyst build"),
        "state": ("pre-cut state: plain dark grey-steel Level-7 utility tunic (#708090 / #C0C0C0) "
                  "over dark underlay (#000000 / #301934), abstract blank hexagonal badge geometry "
                  "with no letters, belt with abstract EMP dampener pouch; link nodule subtle at nape"),
        "scars": ("link nodule subtle under skin at base of skull (nape); no wrist glow in this state"),
        "refs": [R / "FC-S01/FC-S01-02.png", R / "FC-S01/FC-S01-04.png", R / "FC-S01/FC-S01-06.png"],
    },
    "KORA_VEGA": {
        "id": "LOCK_SHEET_KORA_VEGA",
        "identity": ("Latina mestiza woman ~24, angular cheekbones, defined jaw, slightly wide-set "
                     "brown eyes with faint indigo flecks (#4B0082 flecks only, not a solid indigo iris), "
                     "fullish lips, dark practical Underbelly hair shoulder-brushing 28-35 cm, "
                     "compact agile street-operative build — FEMALE lead, never a male figure in this vest"),
        "state": ("worn copper-bronze tactical vest (#B87333 / #FFBF00 / #FF8C00) with BLANK unmarked "
                  "plates (zero lettering, zero patches) over dark underlayer (#000000 / #301934), "
                  "dark pants (#301934), scuffed boots, compact abstract non-branded shock pistol shape"),
        "scars": ("fibrous raised extraction scar ridge behind RIGHT ear (must read clearly); "
                  "subtle subcutaneous bone-conduction ridge at LEFT clavicle, faint copper #B87333 glow, no UI text"),
        "refs": [R / "FC-S03/FC-S03-05.png", R / "FC-S03/FC-S03-02.png"],
    },
    "SIERRA_CATALANO": {
        "id": "LOCK_SHEET_SIERRA_CATALANO",
        "identity": ("European-descent woman ~38 commander, hazel calculating eyes, dark practical short "
                     "commander hair, weathered angular face with a pale scar from LEFT cheek temple to jaw, "
                     "upright composed posture"),
        "state": ("weathered dark leather jacket with copper seam accents (#B87333 / #FF8C00) over black "
                  "combat pants (#000000), no insignia, no lettering, no patches"),
        "scars": ("pale scar LEFT cheek temple to jaw (must read); no other facial scarring"),
        "refs": [R / "FC-S04/FC-S04-05.png", R / "FC-S04/FC-S04-07.png"],
    },
}

VIEWS = {
    "3q": ("three-quarter front medium close-up reference view, head-and-shoulders, camera at eye height, "
           "subject turned 30-45 degrees from camera, both eyes visible, neutral expression, "
           "subject seen from the side that shows the characteristic scar", "3:4"),
    "profile": ("true profile medium close-up reference view showing the characteristic scar side in clear "
                "silhouette, head-and-shoulders, neutral expression, clean jawline and nasal bridge silhouette",
                "3:4"),
    "full": ("full-body head-to-toe reference view, standing neutral, arms relaxed at sides, feet planted, "
             "camera eye-level mid-distance, whole figure in frame from hair to boots, slight anamorphic wide feel",
             "2:3"),
}

jobs = []
for ckey, c in CHARS.items():
    for vkey, (vtext, aspect) in VIEWS.items():
        prompt = (
            f"Character reference still, {vtext}. Characterization: {c['identity']}. "
            f"Wardrobe — {c['state']}. Continuity markers — {c['scars']}. "
            f"Environment: plain industrial undercity concrete bay, sodium amber practical (#FF8C00) rim light, "
            f"deep shadow atmosphere (#000000 / #301934), volumetric haze. "
            f"Keep the same face, hair and wardrobe as the reference image(s); only change the camera view. "
            f"{NEG}."
        )
        jobs.append({
            "id": f"LOCK-{ckey}-{vkey}",
            "kind": "image",
            "dest": str(LS / c["id"] / f"{vkey}.jpg"),
            "model": "grok-imagine-image-quality",
            "aspect": aspect,
            "refs": [str(p) for p in c["refs"][:2] if p.is_file()],
            "prompt": prompt,
        })

# ---- B. selective still regen (prompts stripped of Resistencia / cue words) ----
s07 = json.loads((FILM / "scenes/FC-S07.json").read_text())
s08 = json.loads((FILM / "scenes/FC-S08.json").read_text())
by_id = {sh["id"]: sh for sh in s07["shots"] + s08["shots"]}


def clean(text: str) -> str:
    t = text
    for bad in ("Resistencia copper-gold accents, ", "Resistencia copper-gold accents, ",
                "street/resistance copper-bronze tactical vest", "street/resistance copper-bronze"):
        t = t.replace(bad, "copper-bronze tactical vest")
    t = t.replace("Resistencia copper-gold accents", "hex copper-gold accents")
    t = t.replace("Resistencia", "unmarked")
    t = t.replace("resistance copper-bronze", "copper-bronze")
    t = t.replace("Resist", "")
    return t


EXTRA = {
    "FC-S07-07": ("Wardrobe plates are BLANK and unmarked: no lettering, no words, no patches, "
                  "no partial letters, no fabric text — only abstract copper #B87333 geometry. "
                  "Remove any lettering on clothing."),
    "FC-S07-08": ("Wardrobe plates are BLANK and unmarked: no lettering, no words, no patches, "
                  "no partial letters, no fabric text — only abstract copper #B87333 geometry. "
                  "Remove any lettering on clothing."),
    "FC-S08-06": ("Extreme close-up optics beat: cold abstract cyan-amber lens flare over the frozen sky, "
                  "cut to a Sierra close-up portrait with a small urgent hand gesture. "
                  "No title cards, no caption text, no on-screen words, no diptych, no split frame, "
                  "one camera only. The hand gesture is depicted physically and never labelled."),
}

for sid in ("FC-S07-07", "FC-S07-08", "FC-S08-06"):
    sh = by_id[sid]
    scene = "FC-S07" if sid.startswith("FC-S07") else "FC-S08"
    refs = []
    if sid == "FC-S08-06":
        refs = [R / "FC-S04/FC-S04-05.png", R / "FC-S08/FC-S08-05.png"]
    else:
        refs = [R / "FC-S07/FC-S07-06.png", R / "FC-S03/FC-S03-05.png"]
    refs = [p for p in refs if p.is_file()]
    jobs.append({
        "id": f"REGEN-{sid}",
        "kind": "image",
        "dest": str(R / scene / f"{sid}.png"),
        "model": "grok-imagine-image-quality",
        "refs": [str(p) for p in refs],
        "prompt": f"{clean(sh['image_prompt'])} {EXTRA[sid]} {NEG}.",
    })

(OUT / "jobs_locksheets.json").write_text(json.dumps(jobs, indent=2))
print(f"jobs: {len(jobs)}")
for j in jobs:
    print(f"  {j['id']:>28} -> {j['dest']}  refs={len(j['refs'])}")