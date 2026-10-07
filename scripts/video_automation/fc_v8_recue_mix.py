#!/usr/bin/env python3
"""Rebuild v8 audio: cleaner transitions + re-cued dialogue + ducking.

Fixes reported by user:
- dialogue felt a bit early vs picture (re-cue inside each knot)
- dirty sound transitions at a few concat boundaries
"""
import json
import os
import subprocess
from pathlib import Path

V8 = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8")
AUDIO = V8 / "audio"
VO48 = AUDIO / "vo48"
OUT = V8 / "out"
VIDEO = OUT / "FC_v8_video_REAL2.mp4"
TOTAL = 530.1

# unit starts (measured video durs in the real concat)
DURS = {
    "B1": 6.041667, "K1": 15.916667, "A": 191.541667, "B2": 6.041667,
    "K2": 15.75, "K3": 8.25, "B": 88.125, "B3": 6.041667, "K4": 9.125,
    "K5": 10.25, "S6A": 24.208333, "K6": 11.75, "B4": 6.041667, "C": 80.416667,
    "K7": 20.166667, "B5": 6.041667, "K8": 9.25, "B6": 6.041667, "K9": 9.0,
}
ORDER = ["B1","K1","A","B2","K2","K3","B","B3","K4","K5","S6A","K6","B4","C","K7","B5","K8","B6","K9"]
STARTS = {}
_t = 0.0
for tag in ORDER:
    STARTS[tag] = _t
    _t += DURS[tag]

# previous cue times (for compare) and NEW inside-knot times
# speech starts ~0.05s into each file; old cue=1.0 felt early. Center each line.
tl = json.load(open(AUDIO / "TIMELINE.json"))
VO_DUR = {
    "K1_01.wav": 3.715, "K1_02.wav": 5.619, "K1_03.wav": 3.111,
    "K2_01.wav": 4.087, "K2_02.wav": 8.963,
    "K3_01.wav": 2.926, "K3_02.wav": 1.904,
    "K4_01.wav": 2.043, "K4_02.wav": 3.622,
    "K5_01.wav": 1.858, "K5_02.wav": 3.344, "K5_03.wav": 1.579,
    "K6_01.wav": 3.065, "K6_02.wav": 5.944,
    "K7_01.wav": 6.409, "K7_02.wav": 1.393, "K7_03.wav": 3.483, "K7_04.wav": 4.923,
    "K8_01.wav": 0.929, "K8_02.wav": 5.108,
    "K9_01.wav": 2.368, "K9_02.wav": 3.901,
}

# Re-cue: keep relative drama but add LEAD so speech is not glued to the cut.
# Per-knot lead = max(1.6, (scene_dur - sum(durs) - 0.8) / n_lines)
NEW_CUES = {}  # wav basename -> absolute start time
for blk in tl["dialogue"]:
    knot = blk["knot"]
    # map knot name to unit tag
    tag = {
        "K1_soul_harvester": "K1", "K2_the_fracture": "K2", "K3_the_vow": "K3",
        "K4_the_words": "K4", "K5_not_me_afterward": "K5", "K6_the_counterattack": "K6",
        "K7_the_chair": "K7", "K8_make_it_stop": "K8", "K9_the_invitation": "K9",
    }[knot]
    base = STARTS[tag]
    scene = DURS[tag]
    names = [Path(ln["wav"]).name for ln in blk["lines"]]
    total_speech = sum(VO_DUR[n] for n in names)
    n = len(names)
    slack = scene - total_speech
    # distribute evenly, at least 1.6s lead, never overlapping
    lead = max(1.6, min(3.2, slack / (n + 1)))
    t = lead
    for name in names:
        NEW_CUES[name] = base + t
        t += VO_DUR[name] + max(0.9, lead * 0.55)
        if t > scene - 0.4:
            t = scene - 0.4 - VO_DUR[name]
            NEW_CUES[name] = base + max(0.8, t)
            t = NEW_CUES[name] - base + VO_DUR[name] + 0.8

print("NEW CUES (abs):")
for k, v in NEW_CUES.items():
    print(f"  {k:12s} {v:7.3f}")

# ---- build stems ----
def run(cmd, tag):
    print(f"\n=== {tag} ===", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL", flush=True)
        print((r.stderr or "")[-1500:], flush=True)
        raise SystemExit(1)
    print("OK", flush=True)
    return r


# 1) AMB: existing crossfaded ambience if present, else silence
amb = AUDIO / "AMB_chain.wav"
bed = AUDIO / "BED.wav"
if not amb.exists():
    # fall back to beds present
    candidates = list(AUDIO.glob("*.wav"))
    print("AMB missing, candidates:", [c.name for c in candidates])
    amb = AUDIO / "MIX_FINAL.wav"  # last resort: use mix as bed and only add dialogue on top
    use_mix_as_bed = True
else:
    use_mix_as_bed = False

# 2) DIALOGUE stem: silence + 22 lines at NEW_CUES, each 24ms fade in/out
dlg = AUDIO / "DIALOGUE_RECUED.wav"
run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo",
    "-t", str(TOTAL),
    "-c:a", "pcm_s16le", str(dlg),
], "silence dialogue bed")

for name, abs_t in NEW_CUES.items():
    src = VO48 / name
    tmp = AUDIO / f"_v_{name}"
    # convert + short fades + center a bit forward in the stereo field? keep mono->stereo
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(src),
        "-af", "afade=t=in:st=0:d=0.024,afade=t=out:st=0:d=0.024",
        "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", str(tmp),
    ], f"prep {name}")
    # mix onto stem at abs_t using adelay
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(dlg), "-i", str(tmp),
        "-filter_complex",
        f"[1:a]adelay={int(abs_t*1000)}|{int(abs_t*1000)},apad[a1];"
        f"[0:a][a1]amix=inputs=2:duration=first:normalize=0:dropout_transition=0[a]",
        "-map", "[a]", "-t", str(TOTAL),
        "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le",
        str(AUDIO / "DIALOGUE_RECUED_tmp.wav"),
    ], f"place {name}@{abs_t:.2f}")
    os.replace(AUDIO / "DIALOGUE_RECUED_tmp.wav", dlg)
    tmp.unlink(missing_ok=True)

# 3) mix: bed/amb + dialogue with duck
# Use MIX_FINAL as the musical+ambience bed (already crossfaded), add recued dialogue on top
bed_src = AUDIO / "MIX_FINAL.wav"
if not bed_src.exists():
    bed_src = AUDIO / "MIX_FIXED.wav"

mix_out = AUDIO / "MIX_RECUED.wav"
run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-i", str(bed_src), "-i", str(dlg),
    "-filter_complex",
    # duck bed under dialogue: sidechaincompress
    "[0:a]asplit=2[b1][b2];"
    "[b2][1:a]sidechaincompress=threshold=0.02:ratio=8:attack=25:release=350[duck];"
    "[b1]volume=0.90[bed];"
    "[1:a]volume=1.15[dgl];"
    "[bed][duck]amix=inputs=2:duration=longest:normalize=0[m1];"
    "[m1][dgl]amix=inputs=2:duration=longest:normalize=0[m]",
    "-map", "[m]", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le",
    str(mix_out),
], "mix bed+ducked bed+dialogue")

# 4) mux with REAL2 video
mixed_mp4 = OUT / "FC_v8_RECUED_mix.mp4"
run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-i", str(VIDEO), "-i", str(mix_out),
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
    "-movflags", "+faststart",
    str(mixed_mp4),
], "mux")

# 5) loudness
SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
final = OUT / "final_v8_RECUED.mp4"
run([
    "python3", f"{SK}/loudness.py", str(mixed_mp4),
    "-I", "-16", "--tp", "-1.5",
    "-o", str(final), "--overwrite",
], "loudness")

print("FINAL", final, final.stat().st_size)
print("DONE")
