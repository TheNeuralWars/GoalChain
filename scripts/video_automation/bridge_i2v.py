#!/usr/bin/env python3
"""i2v: turn the 6 FC bridge key arts into real video with grok-imagine-video-1.5.

Reuses novel_film_builder.generate_video_api (verified working 2026-09-14) rather
than reimplementing the xAI video contract -- request_id, poll /v1/videos/{id},
read video.url. The key arts already passed the no-readable-text hard rule and the
look spec (burnt orange/amber + neon-green accent, 10:1 key/fill, crushed blacks,
fine grain, sharp foreground + defocused background). This only ANIMATES them, so
the approved look and composition are preserved.

Still images that already carry a Ken Burns clip are kept as fallback: if a render
fails we do not lose the bridge.
"""
import os
import sys
import time

sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")
import novel_film_builder as nfb  # noqa: E402

OUT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/bridge/grok"
KEYART = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/bridge/keyart"

# name -> (keyart file, motion prompt)
BRIDGES = [
    ("B1_harvest_city", "B1_harvest_city.png",
     "Slow aerial drift forward over an endless city of light at night. The lights are "
     "ordered into a vast lattice like a constellation, a circuit board or a neural "
     "network. Subtle parallax, gentle camera push. No cuts, no text, no logos."),
    ("B2_coil_awakening", "B2_coil_awakening.png",
     "Extreme close-up: a glowing spiral mark under human skin slowly brightens and "
     "unfurls like an awakening serpent's coil. Faint breathing motion of the hand, "
     "smoke drifting. Slow push in. No cuts, no text, no logos."),
    ("B3_harvest_begins", "B3_harvest_begins.png",
     "A motionless crowd stands in the rain beneath a vast extraction machine. Light "
     "pulses travel up from the crowd into the apparatus. Slow tilt up from the crowd "
     "to the machine. No cuts, no text, no logos."),
    ("B4_counterattack", "B4_counterattack_v2.png",
     "A fractured intelligence fights back: racks of dark machinery flicker and surge, "
     "sparks and light racing along cables. Failing screens with no legible content. "
     "Slow push in with a subtle handheld tremor. No cuts, no text, no logos, no brand names."),
    ("B5_renaissance", "B5_renaissance.png",
     "A man sits alone in an activation chair in a dark chamber, cables rising from his "
     "shoulders. Energy slowly gathers and blooms around the chair. Slow orbit around "
     "the chair. No cuts, no text, no logos."),
    ("B6_gardeners", "B6_gardeners.png",
     "Vast cosmic observers watch from beyond a threshold of light. Slow drift forward "
     "toward the glowing threshold. Particles and light drifting through space. "
     "No cuts, no text, no logos."),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:] or [b[0] for b in BRIDGES]
    ok, fail = [], []
    for name, ka, motion in BRIDGES:
        if name not in only:
            continue
        dst = os.path.join(OUT, f"{name}.mp4")
        if os.path.exists(dst) and os.path.getsize(dst) > 100000:
            print(f"  skip {name} (existe {os.path.getsize(dst)} bytes)")
            ok.append(name)
            continue
        src = os.path.join(KEYART, ka)
        if not os.path.exists(src):
            print(f"  !! falta keyart {ka}")
            fail.append(name)
            continue
        print(f"  -> {name}  ({ka}, i2v) ...", flush=True)
        t0 = time.time()
        try:
            nfb.generate_video_api(motion, __import__("pathlib").Path(src),
                                   __import__("pathlib").Path(dst))
            sz = os.path.getsize(dst)
            print(f"     OK {dst}  ({sz} bytes, {time.time()-t0:.0f}s)")
            ok.append(name)
        except Exception as e:
            print(f"     FAILED {type(e).__name__}: {e}")
            fail.append(name)
    total = [b[0] for b in BRIDGES if b[0] in only]
    print(f"\n  === ok {len(ok)}/{len(total)} {ok}   fail {len(fail)} {fail}")


if __name__ == "__main__":
    main()
