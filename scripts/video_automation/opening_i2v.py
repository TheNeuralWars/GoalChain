#!/usr/bin/env python3
"""Animate the 2 opening plot keyarts with grok-imagine-video-1.5."""
import os
import pathlib
import sys
import time

sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")
import novel_film_builder as nfb  # noqa: E402

OUT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/opening"

JOBS = [
    ("B00a_the_harvest", "B00a_the_harvest.png",
     "A vast cathedral of pod towers rises into darkness. Thousands of glass pods hold faint "
     "human silhouettes, each with a small indigo light in the chest. Thin luminous threads of "
     "stolen memory stream upward into a single cold geometric core. A tiny figure on a catwalk "
     "is dwarfed by the towers. Very slow push in. No cuts, no text, no letters, no logos."),
    ("B00b_neo_citania", "B00b_neo_citania.png",
     "Aerial night over a perfect geometric megalopolis. Avenues form a flawless grid like "
     "circuit traces. Spires rise under a computed mauve dawn. A colder indigo pulse glows "
     "beneath the city like a buried heart. Slow aerial drift forward. No cuts, no text, "
     "no letters, no logos."),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    ok, fail = [], []
    for kid, png, motion in JOBS:
        dst = os.path.join(OUT, f"{kid}.mp4")
        if os.path.exists(dst) and os.path.getsize(dst) > 100_000:
            print(f"  skip {kid} (existe)")
            ok.append(kid)
            continue
        src = os.path.join(OUT, png)
        if not os.path.exists(src):
            print(f"  !! falta {png}")
            fail.append(kid)
            continue
        print(f"  -> {kid} (i2v) ...", flush=True)
        t0 = time.time()
        try:
            nfb.generate_video_api(motion, pathlib.Path(src), pathlib.Path(dst))
            print(f"     OK {dst} ({os.path.getsize(dst)} bytes, {time.time()-t0:.0f}s)")
            ok.append(kid)
        except Exception as e:
            print(f"     FAILED {type(e).__name__}: {str(e)[:220]}")
            fail.append(kid)
        time.sleep(3)
    print(f"\n  === ok {len(ok)}/{len(JOBS)}  fail {fail}")


if __name__ == "__main__":
    main()
