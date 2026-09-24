#!/usr/bin/env python3
"""locksheet_gen.py — generate character lock-sheet stills (3/4, profile, full-body)
for The Neural Wars FILM from the frozen lock sheets in FILM/locks/.

Prompts are deterministic, derived ONLY from:
  FILM/locks/LOCK_SHEET_*.md  (identity / views / scars / wardrobe hex)
  FILM/VISUAL_BIBLE.md        (lighting grammar, palette, forbidden patterns)

Anchoring: when a good existing still is given (--anchor), it is passed to
/v1/images/generations as an `image` data-URL so the model anchors on that face.
If the endpoint rejects the field, the call is retried text-only.

Usage:
  python3 locksheet_gen.py --out /path/FILM/locksheets [--only MILEO:3q] [--dry-run]
"""

from __future__ import annotations

import argparse
import base64
import json
import logging
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("locksheet_gen")

API_IMAGES = "https://api.x.ai/v1/images/generations"
API_EDITS = "https://api.x.ai/v1/images/edits"

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")

NEG = (
    "Cinematic photoreal, chiaroscuro, volumetric fog, scale contrast, anamorphic 2.39 "
    "widescreen feel, PG-13, single model sheet still of one character. "
    "NO readable text, NO letters, NO numbers, NO logos, NO badges with lettering, "
    "NO faction name labels on clothing or props, NO signage, NO carteles, NO HUD text, "
    "NO multi-panel, NO diptych, NO split-screen, NO storyboard tiles, one camera only, "
    "NO glowing lettering, NO numbers, NO floor projections, NO cybernetic ear implants, "
    "NO readable text, NO logos."
)

COMMON = (
    "Character continuity reference still for a film, neutral expression, neutral stance, "
    "one camera, one subject only, no other people in frame. "
    "Lighting: hard practical key with deep shadow (half-lit face), volumetric haze always present. "
    "Background: deep Atmosphere black / dark purple (#000000 / #301934) with soft fog."
)

SPECS: Dict[str, Dict[str, Any]] = {
    "MILEO": {
        "id": "LOCK_SHEET_MILEO_CHEN",
        "slug": "MILEO_CHEN",
        "file": "MILEO_CHEN",
        "anchor": "renders/FC-S01/FC-S01-04.png",
        "markers": (
            "IDENTITY MARKERS (highest priority, must be exactly this): vivid saturated GREEN eyes."
        ),
        "identity": (
            "East Asian male ~32, lean-athletic analyst frame (not bodybuilder), same face as the "
            "reference still: oval-to-rectangular jaw, medium cheekbones, straight nasal bridge, "
            "moderate brow, clean-shaven, no freckles, subtle under-eye fatigue. "
            "Hair: black regulation cut exactly 3.2 cm, neat trim, never longer, no undercut fade. "
            "Eyes: vivid saturated GREEN iris, bright and unmistakable, the character's signature feature (not hazel, not brown, not blue). "
            "Wardrobe PRE Link cut: NeuroSys-gray regulation tunic, cloth tones approx "
            "#708090 / #C0C0C0 / #F8F8FF, belt pouch with an abstract EMP dampener shape, "
            "optional blank hexagonal badge geometry on the chest with no lettering, "
            "small link nodule implied under the collar at the nape."
        ),
        "views": {
            "3q": (
                "View 3/4 front: medium close-up head-and-shoulders, camera at eye height, subject "
                "turned about 30-45 degrees from camera, both eyes clearly visible, left ear lightly "
                "suggested, soft volumetric rim light from behind-right, neutral mouth. Hair must read "
                "clearly as 3.2 cm black regulation."
            ),
            "profile": (
                "View true LEFT profile: medium close-up, clean silhouette of ear, jawline and nasal "
                "bridge, head in neutral stance, deep Atmosphere fog behind, no signage."
            ),
            "full": (
                "View full-body: full figure head-to-toe, standing neutral, arms relaxed at the sides "
                "with one hand near the belt pouch, feet planted, camera eye level at mid distance, "
                "slight anamorphic wide feel. Environment: plain industrial Underbelly concrete, "
                "no props that introduce logos."
            ),
        },
    },
    "KORA": {
        "id": "LOCK_SHEET_KORA_VEGA",
        "slug": "KORA_VEGA",
        "file": "KORA_VEGA",
        "anchor": "renders/FC-S03/FC-S03-02.png",
        "markers": (
            "IDENTITY MARKERS (highest priority, must be exactly this): a woman, dark shoulder-length "
            "hair 28-35 cm, warm BROWN eyes (brown iris, never blue, never grey, never green) with a "
            "few indigo flecks, and a fibrous pale healed scar ridge BEHIND THE RIGHT EAR (her right "
            "ear, viewer's left) exactly like a surgical extraction scar \u2014 no scar on the cheek, no "
            "scar on the forehead, NO glowing cybernetic implant, NO earpiece, NO ear device, no "
            "metallic hardware on the ear, no glowing orange light on the head."
        ),
        "no_anchor_views": ["3q", "profile"],
        "identity": (
            "Latina mestiza woman ~24, compact agile street-operative build (not tall), same face as "
            "the reference still: angular cheekbones, defined jaw, slightly wide-set eyes, "
            "straight-to-soft nasal bridge, fullish lips, no freckle map. "
            "Hair: dark, practical Underbelly cut, shoulder-brushing 28-35 cm nape to tip, slightly "
            "unkempt, never waist-length, never buzz cut. "
            "Eyes: clearly readable BROWN iris with a few indigo flecks, never a solid indigo iris. "
            "Marker: fibrous Link-extraction scar ridge behind the RIGHT ear (must be readable when "
            "that ear is visible); bone-conduction analog shortwave ridge embedded under the scar "
            "tissue at the LEFT clavicle, may glow faint copper #B87333 / #FFBF00, never any UI text. "
            "Wardrobe: worn copper-bronze vest over a dark underlayer, accents #B87333 / #FFD700 / "
            "#FFBF00 / #FF8C00, underlayer and pants #000000 / #301934 / dark #708090, "
            "scuffed boots, no logos, compact abstract non-branded shock pistol shape."
        ),
        "views": {
            "3q": (
                "View 3/4 front: medium close-up head-and-shoulders, about 35 degree turn, both eyes "
                "clear so the indigo flecks read, RIGHT ear slightly toward camera so the fibrous "
                "extraction ridge behind it is visible, soft practical rim light, neutral mouth."
            ),
            "profile": (
                "View RIGHT profile: medium close, the RIGHT ear scar reads in silhouette and "
                "half-light, clean jawline, Atmosphere fog behind (#000000 / #301934), no signage."
            ),
            "full": (
                "View full-body: head-to-toe neutral stance, shock pistol held low-ready or holstered "
                "as an abstract non-branded shape, scuffed boots planted, copper-bronze vest clearly "
                "readable, mid-distance single camera, industrial tunnel or metro bay environment "
                "with no signage."
            ),
        },
    },
    "SIERRA": {
        "id": "LOCK_SHEET_SIERRA_CATALANO",
        "slug": "SIERRA_CATALANO",
        "file": "SIERRA_CATALANO",
        "anchor": "renders/FC-S04/FC-S04-05.png",
        "markers": (
            "IDENTITY MARKERS (highest priority, must be exactly this): a woman with HAZEL mixed "
            "brown-green eyes, short dark commander hair 8-12 cm above the collar, and ONE pale "
            "temple-to-jaw scar on her LEFT cheek only (her left cheek, on the viewer's right side) "
            "\u2014 absolutely no scar on the right cheek, no forehead scars."
        ),
        "identity": (
            "European-descent woman resistance commander, visual age ~33-38, athletic tactical build, "
            "upright command posture, same face as the reference still: strong angular jaw, high "
            "cheekbones, composed brow, cool closed-mouth default, no soft teen features. "
            "Hair: dark practical commander cut 8-12 cm above the collar, neat, never flowing long. "
            "Eyes: HAZEL, mixed brown-green with dark calculating chill, clearly readable (never vivid green, never solid blue). "
            "Marker: pale scar on the LEFT cheek running from temple to jaw, always present when the "
            "face is visible, never on the right cheek. No bioluminescent lines, no Coil. "
            "Wardrobe: black combat pants #000000, weathered dark brown-black leather jacket with "
            "optional copper seam accents #B87333 / #FF8C00 at the seams only, dark underlayer "
            "#301934 / #708090, no logos, no rank plates, no lettering."
        ),
        "views": {
            "3q": (
                "View 3/4 front: medium close-up head-and-shoulders, about 30-40 degree turn, LEFT "
                "cheek toward camera so the pale temple-to-jaw scar is unmistakable, hazel eyes "
                "catching the practical light, cool command expression, neutral mouth."
            ),
            "profile": (
                "View LEFT profile: medium close, locks the scar silhouette from temple to jaw, dark "
                "Atmosphere backdrop with soft fog, no signage."
            ),
            "full": (
                "View full-body: head-to-toe neutral standing command stance, hands at the sides or one "
                "near the jacket seam, black combat pants and weathered leather jacket readable, "
                "mid-distance single camera, sealed metro redoubt or bunker environment, plain dark "
                "concrete and cold glass bounce only \u2014 no holograms, no glowing lettering, no numbers, "
                "no floor projections."
            ),
        },
    },
}


def get_token() -> str:
    p = Path("/home/ubuntu/.grok/auth.json")
    if not p.exists():
        p = Path.home() / ".grok" / "auth.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    k = list(d.keys())[0]
    return d[k]["key"]


def _post(url: str, token: str, payload: dict, timeout: int = 90) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def _download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.read())


def _data_url(path: Path) -> str:
    raw = path.read_bytes()
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif raw[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    else:
        mime = "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")


def generate(prompt: str, dest: Path, anchor: Optional[Path], attempts: int = 3) -> str:
    token = get_token()
    last_err = None
    for attempt in range(1, attempts + 1):
        for mode in ("anchor", "anchor_edit", "text"):
            if mode.startswith("anchor") and (anchor is None or not anchor.is_file()):
                continue
            try:
                if mode == "text":
                    payload = {"model": "grok-imagine-image", "prompt": prompt}
                    res = _post(API_IMAGES, token, payload)
                elif mode == "anchor":
                    payload = {
                        "model": "grok-imagine-image",
                        "prompt": prompt,
                        "image": _data_url(anchor),
                    }
                    res = _post(API_IMAGES, token, payload)
                else:
                    payload = {
                        "model": "grok-imagine-image",
                        "prompt": prompt,
                        "image": _data_url(anchor),
                    }
                    res = _post(API_EDITS, token, payload)
                url = res["data"][0]["url"]
                _download(url, dest)
                log.info("OK [%s] %s (%d bytes)", mode, dest.name, dest.stat().st_size)
                return mode
            except Exception as e:  # noqa: BLE001
                last_err = e
                log.warning("attempt %d mode=%s failed: %s", attempt, mode, e)
        time.sleep(2 * attempt)
    raise RuntimeError(f"all attempts failed for {dest.name}: {last_err}")


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(FILM / "locksheets"))
    ap.add_argument("--only", default="", help="Comma list like MILEO:3q,KORA:profile")
    ap.add_argument("--film", default=str(FILM))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    film = Path(args.film).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    want = set()
    for chunk in args.only.split(","):
        c = chunk.strip()
        if c:
            want.add(c.upper())

    manifest_path = out / "MANIFEST.json"
    manifest: Dict[str, Any] = {}
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception:
            manifest = {}
    entries: List[Dict[str, Any]] = manifest.get("items", [])
    done = {e["name"] for e in entries}

    ok = fail = 0
    for key, spec in SPECS.items():
        anchor_rel = spec.get("anchor")
        anchor = (film / anchor_rel) if anchor_rel else None
        no_anchor = set(v.lower() for v in spec.get("no_anchor_views", []))
        for view, view_txt in spec["views"].items():
            use_anchor = None if view.lower() in no_anchor else anchor
            if want and f"{key}:{view}".upper() not in want:
                continue
            name = f"{spec['file']}_{view.upper()}.png"
            dest = out / name
            prompt = f"{COMMON} {spec.get('markers', '')} {spec['identity']} {view_txt} {NEG}"
            entry = {
                "name": name,
                "character": spec["slug"],
                "lock_sheet_id": spec["id"],
                "view": view,
                "anchor": str(use_anchor) if use_anchor and use_anchor.is_file() else None,
                "prompt": prompt,
                "dest": str(dest),
            }
            if args.dry_run:
                print(name, "->", anchor)
                continue
            if name in done and dest.is_file():
                log.info("SKIP existing %s", name)
                continue
            try:
                mode = generate(prompt, dest, use_anchor)
                entry["mode"] = mode
                entry["status"] = "rendered"
                entry["bytes"] = dest.stat().st_size
                entry["ts"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                ok += 1
            except Exception as e:  # noqa: BLE001
                entry["status"] = "failed"
                entry["error"] = str(e)
                entry["ts"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                fail += 1
                log.error("FAILED %s: %s", name, e)
            entries = [e for e in entries if e.get("name") != name] + [entry]
            manifest = {
                "generator": "locksheet_gen.py",
                "film": str(film),
                "updated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "items": entries,
            }
            manifest_path.write_text(
                json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
            )

    if not args.dry_run:
        log.info("locksheet_gen done ok=%d fail=%d out=%s", ok, fail, out)
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
