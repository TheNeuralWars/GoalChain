#!/usr/bin/env python3
"""regen_stills.py — targeted still regeneration for The Neural Wars FILM.

Follows FILM/reports/REGEN_QUEUE_v1.md: replace a listed set of stills with
prompts rebuilt from the FROZEN lock sheets + VISUAL_BIBLE (hex only, no
faction names, no readable text, one camera per shot).

The scene storyboard's own (sanitized) image_prompt supplies the scene content;
the lock-sheet identity/marker text is prepended, and the bible negative block
is appended.

Usage:
  python3 regen_stills.py --shots FC-S03-02,FC-S03-03 [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import logging
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")
import locksheet_gen as LG  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("regen_stills")

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
CHAR_KEY = {
    "Mileo Chen": "MILEO",
    "Kora Vega": "KORA",
    "Sierra Catalano": "SIERRA",
}


FACE_ONLY = {
    # Wardrobe state is per-shot (see each shot's wardrobe_ref) — never force the
    # lock-sheet's default tunic/vest here or Mileo comes back in his pre-cut grey
    # tunic in scenes where he is already AFTER the Link cut.
    "MILEO": (
        "Mileo Chen: East Asian male ~32, lean-athletic analyst frame, oval-to-rectangular jaw, "
        "medium cheekbones, straight nasal bridge, moderate brow, clean-shaven, black regulation hair "
        "cut exactly 3.2 cm (neat, never long), vivid saturated GREEN iris (never brown, never blue)."
    ),
    "KORA": (
        "Kora Vega: Latina mestiza woman ~24, angular cheekbones, defined jaw, dark unkempt "
        "shoulder-length hair 28-35 cm, warm dark BROWN iris with a few indigo flecks (the eyes are "
        "NOT blue, NOT cyan, NOT grey, NOT glowing), NO cybernetic implant anywhere, NO earpiece, "
        "NO metal or glowing device on the ear or temple, NO scar on the cheek and NO scar on the "
        "forehead; her only marker is a pale healed fibrous surgical scar ridge BEHIND HER RIGHT EAR "
        "(her right ear, viewer's left) plus a subtle subcutaneous ridge at the LEFT clavicle."
    ),
    "SIERRA": (
        "Sierra Catalano: European-descent field commander woman, visual age ~33-38, strong angular "
        "jaw, high cheekbones, composed brow, hazel mixed brown-green eyes (never vivid green, never "
        "blue), dark practical commander hair 8-12 cm above the collar, and ONE pale temple-to-jaw "
        "scar on her LEFT cheek only (no scar on the right cheek, no forehead scars)."
    ),
}


def lock_block(characters: List[str]) -> str:
    parts = []
    for c in characters:
        key = CHAR_KEY.get(c)
        if not key:
            continue
        parts.append(f"[{LG.SPECS[key]['id']}] {FACE_ONLY[key]}")
    return " ".join(parts)


SCENE_COMMON = (
    "Cinematic film still, one camera setup per shot (never a multi-panel layout), the characters "
    "kept consistent with the described identities. Lighting: hard practical key cutting deep shadow, "
    "volumetric haze always present, scale contrast. Background: deep Atmosphere black / dark purple "
    "(#000000 / #301934) with soft fog; practical sources amber sodium / warm filament / cold glass "
    "bounce / indigo bioluminescence post-awakening only."
)


NEG_OPENERS = (
    "Cinematic photoreal, chiaroscuro, volumetric fog, scale contrast",
    "NO cybernetic ear implants",
)


def unwrap_scene_text(prompt: str) -> str:
    """Return just the scene content of a shot prompt.

    A previous regen pass may have already written a composed prompt
    (<COMMON> <lock block> Scene content: <text>. <negatives>) back into the
    storyboard. Strip that wrapper so re-runs never nest prompts.
    """
    t = prompt.strip()
    if "Scene content: " in t:
        t = t.split("Scene content: ", 1)[1]
    for opener in NEG_OPENERS:
        if opener in t:
            t = t.split(opener)[0]
    return t.strip().rstrip(".")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--shots", required=True, help="comma list of shot ids")
    ap.add_argument("--film", default=str(FILM))
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--tag", default="20260914", help="backup dir suffix")
    args = ap.parse_args(argv)

    film = Path(args.film).resolve()
    wanted = [s.strip() for s in args.shots.split(",") if s.strip()]
    scenes_dir = film / "scenes"
    backup_dir = film / "renders" / f"_pre_regen_bak_{args.tag}"
    backup_dir.mkdir(parents=True, exist_ok=True)

    report: List[Dict] = []
    ok = fail = 0
    for shot_id in wanted:
        scene = shot_id.rsplit("-", 1)[0]
        sb_path = scenes_dir / f"{scene}.json"
        sb = json.loads(sb_path.read_text(encoding="utf-8"))
        shot = next((s for s in sb["shots"] if s["id"] == shot_id), None)
        if shot is None:
            log.error("shot %s not found in %s", shot_id, sb_path.name)
            fail += 1
            report.append({"id": shot_id, "status": "failed", "error": "shot not in storyboard"})
            continue

        dest = film / "renders" / scene / f"{shot_id}.png"
        lb = lock_block(shot.get("characters") or [])
        scene_txt = unwrap_scene_text(shot.get("image_prompt") or "")
        prompt = (
            f"{SCENE_COMMON} {lb} Scene content: {scene_txt}. "
            "NO cybernetic ear implants, NO glowing ear hardware, NO cheek scars on the young woman, "
            "NO blue eyes. " + LG.NEG
        )

        if args.dry_run:
            print(shot_id, "->", dest)
            print(prompt[:400], "...\n")
            continue

        try:
            if dest.is_file():
                shutil.copy2(dest, backup_dir / f"{scene}__{dest.name}")
            mode = LG.generate(prompt, dest, None)
            shot["image_prompt"] = prompt
            shot["reference_images"] = [
                f"locksheets/{LG.SPECS[k]['file']}_{v}.png"
                for c in (shot.get("characters") or [])
                for k in [CHAR_KEY.get(c)] if k
                for v in ("3Q", "PROFILE", "FULL")
            ]
            shot["lock_sheet_ids"] = [LG.SPECS[k]["id"] for c in (shot.get("characters") or [])
                                      for k in [CHAR_KEY.get(c)] if k]
            if shot["lock_sheet_ids"]:
                shot["lock_sheet_id"] = shot["lock_sheet_ids"][0]
            shot["status"] = "still_regenerated"
            shot["regen_note"] = (
                f"REGEN_QUEUE_v1 still replaced {args.tag} (lock-sheet face block + per-shot wardrobe, "
                "no faction text, no readable text)"
            )
            # Re-read and merge so a concurrent writer's changes to other shots survive.
            fresh = json.loads(sb_path.read_text(encoding="utf-8"))
            for s in fresh.get("shots", []):
                if s.get("id") == shot_id:
                    s.update({k: shot[k] for k in (
                        "image_prompt", "reference_images", "lock_sheet_ids",
                        "lock_sheet_id", "status", "regen_note") if k in shot})
            sb_path.write_text(json.dumps(fresh, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            ok += 1
            log.info("OK %s (%d bytes, mode=%s)", shot_id, dest.stat().st_size, mode)
            report.append({"id": shot_id, "status": "rendered", "mode": mode,
                           "still": str(dest), "bytes": dest.stat().st_size})
        except Exception as e:  # noqa: BLE001
            fail += 1
            log.error("FAILED %s: %s", shot_id, e)
            report.append({"id": shot_id, "status": "failed", "error": str(e)})

    if not args.dry_run:
        out = film / "reports" / f"REGEN_QUEUE_v1_run_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}.json"
        out.write_text(json.dumps({
            "queue_doc": str(film / "reports" / "REGEN_QUEUE_v1.md"),
            "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "ok": ok, "fail": fail, "results": report,
        }, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        log.info("regen_stills done ok=%d fail=%d report=%s", ok, fail, out)
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
