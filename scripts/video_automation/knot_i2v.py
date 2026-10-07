#!/usr/bin/env python3
"""i2v: animate the 9 conflict-knot key arts with grok-imagine-video-1.5.

Same verified path as bridge_i2v.py (novel_film_builder.generate_video_api).
The key arts already passed the no-readable-text hard rule, so this only animates
them. Download uses the Mozilla UA -- Cloudflare 1010 blocks urllib's default UA.
"""
import os
import sys
import pathlib
import time

sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")
import novel_film_builder as nfb  # noqa: E402

OUT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/knots/vid"
KEYART = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/knots"

# id -> (png, motion)
KNOTS = [
    ("K1_soul_harvester", "K1_soul_harvester.png",
     "A man stares at his own reflection in a dark dead monitor in a workshop. The failing "
     "screen flickers faintly. Behind him rows of human silhouettes stand motionless in pods, "
     "faint indigo light pulsing slowly in their chests. Very slow push in on his face. "
     "No cuts, no text, no letters, no logos."),
    ("K2_the_fracture", "K2_the_fracture.png",
     "A tense war room under one hanging lamp. People on opposite sides of a scratched table "
     "shift and gesture in open argument, a standing man with a fist on the table mid-sentence. "
     "Holographic map light flickers upward across their faces. Subtle handheld drift. "
     "No cuts, no text, no letters, no logos."),
    ("K3_the_vow", "K3_the_vow.png",
     "A woman soldier in dim emergency light looks down at a small blank photograph in her palm, "
     "breathing, a single tear catching amber light and falling. Slow push in. "
     "No cuts, no text, no letters, no logos."),
    ("K4_the_words", "K4_the_words.png",
     "A doctor sits on the floor of a dim clinic with hands over his face, shoulders shaking. "
     "Bars of cold light from slatted blinds crawl slowly across the floor. Dust drifts. "
     "Static, almost still, faint breathing motion. No cuts, no text, no letters, no logos."),
    ("K5_not_me_afterward", "K5_not_me_afterward.png",
     "Two children seen from behind climb high branches of an enormous tree at dusk, silhouetted "
     "against a burning orange sky. Leaves stir. The older child reaches back a steady hand. "
     "Slow upward drift. No cuts, no text, no letters, no logos."),
    ("K6_the_counterattack", "K6_the_counterattack.png",
     "A vast server chamber rupturing. Crystalline columns crack with spreading hairline fractures "
     "of white light, an emergency lamp torn half from the ceiling swings trailing sparks, screens "
     "blow out to blank white glare. A woman braces against the blast, hair and coat driven back. "
     "Shake and surge. No cuts, no text, no letters, no logos."),
    ("K7_the_chair", "K7_the_chair.png",
     "THE CLIMAX. A man in an activation chair at the center of a dark spherical chamber, cables "
     "rising from his shoulders, eyes open and luminous with calm wonder. Energy blooms slowly "
     "upward like a sunrise. A woman leans toward him. Behind glass, figures watch instruments. "
     "Slow orbit. No cuts, no text, no letters, no logos."),
    ("K8_make_it_stop", "K8_make_it_stop.png",
     "A man on his knees on a wet plaza at night, hands pressed to his temples, face contorted in "
     "a gasp. Rain falls and light refracts off the wet ground. Around him people are doubled over "
     "or frozen mid-step. Subtle handheld tremor. No cuts, no text, no letters, no logos."),
    ("K9_the_invitation", "K9_the_invitation.png",
     "Enormous silent cosmic observers, forms only half resolvable, standing in deep space before "
     "a luminous threshold of light. Slow drift forward toward the threshold. Particles of light "
     "drift through space. Vast scale, immense stillness. No cuts, no text, no letters, no logos."),
]

# Second unit of coverage per knot: a different camera move from the same key art
# so dialogue can be cut against two angles instead of held on one frozen tableau.
# K7_the_chair is the climax and gets three more.
COVERAGE = {
    "K1_soul_harvester": [
        "The same man at the dead monitor. Very slow pull out revealing the endless rows "
        "of pods behind him, indigo light pulsing in each chest. Reflection moves on the "
        "screen. No cuts, no text, no letters, no logos.",
    ],
    "K2_the_fracture": [
        "The same war room. Slow lateral track past the table, people leaning in and apart "
        "in argument, the lamp swinging slightly and shadows moving on the wall. "
        "No cuts, no text, no letters, no logos.",
    ],
    "K3_the_vow": [
        "The same woman with the blank photograph. Slow tilt up from her hand to her face, "
        "her jaw tight, breathing. Emergency light flickers. No cuts, no text, no letters, no logos.",
    ],
    "K4_the_words": [
        "The same doctor on the floor. Slow push past the empty small chair toward him, "
        "dust drifting through the bars of light. No cuts, no text, no letters, no logos.",
    ],
    "K5_not_me_afterward": [
        "The same tree at dusk. Slow pull back to reveal the height and the ground far below, "
        "leaves stirring, sky burning orange. No cuts, no text, no letters, no logos.",
    ],
    "K6_the_counterattack": [
        "The same rupturing server chamber. Slow push through drifting sparks and falling "
        "fragments toward the braced woman. Screens flare. No cuts, no text, no letters, no logos.",
    ],
    "K7_the_chair": [
        "The activation chair, closer. Slow push in on the man's luminous eyes, energy "
        "gathering around his head, cables swaying. No cuts, no text, no letters, no logos.",
        "The activation chamber from behind the glass. Figures watch instruments whose "
        "displays pulse with light but show no readable content. Slow drift sideways. "
        "No cuts, no text, no letters, no logos.",
        "The man in the chair and the woman leaning toward him, slow orbit around them as "
        "the energy blooms brighter. No cuts, no text, no letters, no logos.",
    ],
    "K8_make_it_stop": [
        "The same rain plaza. Slow pull back revealing more people doubled over or frozen, "
        "rain streaking the light. No cuts, no text, no letters, no logos.",
    ],
    "K9_the_invitation": [
        "The cosmic observers before the luminous threshold. Slow lateral drift showing their "
        "vast scale against the small distant light. No cuts, no text, no letters, no logos.",
    ],
}


def main():
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:] or [k[0] for k in KNOTS]
    ok, fail = [], []
    jobs = []
    for kid, png, motion in KNOTS:
        jobs.append((kid, png, motion, ""))
        for i, m in enumerate(COVERAGE.get(kid, []), start=2):
            jobs.append((kid, png, m, "_v%d" % i))
    for kid, png, motion, suf in jobs:
        if kid not in only:
            continue
        dst = os.path.join(OUT, f"{kid}{suf}.mp4")
        if os.path.exists(dst) and os.path.getsize(dst) > 100000:
            print(f"  skip {kid} (existe)")
            ok.append(kid)
            continue
        src = os.path.join(KEYART, png)
        if not os.path.exists(src):
            print(f"  !! falta {png}")
            fail.append(kid)
            continue
        print(f"  -> {kid} (i2v) ...", flush=True)
        t0 = time.time()
        try:
            nfb.generate_video_api(motion, pathlib.Path(src), pathlib.Path(dst))
            print(f"     OK {dst}  ({os.path.getsize(dst)} bytes, {time.time()-t0:.0f}s)")
            ok.append(kid)
        except Exception as e:
            print(f"     FAILED {type(e).__name__}: {str(e)[:200]}")
            fail.append(kid)
        time.sleep(3)
    print(f"\n  === ok {len(ok)}/{len([k for k in KNOTS if k[0] in only])}  fail {fail}")


if __name__ == "__main__":
    main()
