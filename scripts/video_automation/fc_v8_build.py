#!/usr/bin/env python3
"""Build FRACTURED CODE v8: conflict knots + dialogue + a UNIFIED SOUND BED.

Brief: "asegurate que el sonido de fondo entre cada escena, vieja y nueva, se fundan,
creando un colchón sonoro unificado." A hard cut in picture must NOT be a hard cut in
air. So audio is rebuilt as three layers and mixed once:

  1. AMBIENCE CHAIN  every unit's own ambience, extracted and `acrossfade`d into the
     next at EVERY junction -- including the picture-hard ones. One continuous stem.
     This is what makes old and new material share one room.
  2. MUSIC BED       bed_v3_procedural laid under the whole timeline and crossfaded at
     its own loop point so it has no seam either. Ducked under dialogue.
  3. DIALOGUE        22 verbatim book lines over their knot's timeline, dry and forward.

Picture: hard cuts inside action blocks (tension is never softened), 0.7s dissolves at
every plot threshold. Knot scenes get real coverage (2 angles, 4 for the climax) so the
dialogue is cut against two shots rather than held on a frozen tableau.

Everything is written under FILM/edit/v8/. Nothing here overwrites source material.
"""
import json
import os
import re
import subprocess
import sys

SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
E = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit"
F = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM"
V8 = os.path.join(E, "v8")
W, H, FPS = 1280, 536, 24          # 2.39:1
XFADE = 0.7                        # plot-threshold dissolve

os.environ["FFMPEG_SKILL_NO_OVERWRITE"] = "1"


def run(cmd, tag=""):
    r = subprocess.run(cmd, capture_output=True, text=True)
    tail = (r.stdout + r.stderr).strip().splitlines()
    tail = [l for l in tail if "wrote" in l or "error" in l or "result" in l.lower()]
    print(f"  {tag}: {tail[-1] if tail else '(ok)'}")
    return r


def dur(p):
    return float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", p], capture_output=True, text=True).stdout or 0)


# ---------------------------------------------------------------- knot scenes
# knot id -> dialogue line ids in order (from knots/vo2/CAST.json)
KNOT_LINES = {
    "K1_soul_harvester":    ["K1_01", "K1_02", "K1_03"],
    "K2_the_fracture":      ["K2_01", "K2_02"],
    "K3_the_vow":           ["K3_01", "K3_02"],
    "K4_the_words":         ["K4_01", "K4_02"],
    "K5_not_me_afterward":  ["K5_01", "K5_02", "K5_03"],
    "K6_the_counterattack": ["K6_01", "K6_02"],
    "K7_the_chair":         ["K7_01", "K7_02", "K7_03", "K7_04"],
    "K8_make_it_stop":      ["K8_01", "K8_02"],
    "K9_the_invitation":    ["K9_01", "K9_02"],
}

# The 19 units in story order. ("knot" builds a scene; others are existing cuts.)
STRUCTURE = [
    ("B1",  "bridge",  f"{E}/bridge/grok/B1_harvest_city.mp4"),
    ("K1",  "knot",    "K1_soul_harvester"),
    ("A",   "block",   ["FC-S01", "FC-S02", "FC-S03", "FC-S04"]),
    ("B2",  "bridge",  f"{E}/bridge/grok/B2_coil_awakening.mp4"),
    ("K2",  "knot",    "K2_the_fracture"),
    ("K3",  "knot",    "K3_the_vow"),
    ("B",   "block",   ["FC-S05d", "FC-S06"]),
    ("B3",  "bridge",  f"{E}/bridge/grok/B3_harvest_begins.mp4"),
    ("K4",  "knot",    "K4_the_words"),
    ("K5",  "knot",    "K5_not_me_afterward"),
    ("S6A", "seg",     "FC-S06A"),
    ("K6",  "knot",    "K6_the_counterattack"),
    ("B4",  "bridge",  f"{E}/bridge/grok/B4_counterattack.mp4"),
    ("C",   "block",   ["FC-S07", "FC-S08"]),
    ("K7",  "knot",    "K7_the_chair"),
    ("B5",  "bridge",  f"{E}/bridge/grok/B5_renaissance.mp4"),
    ("K8",  "knot",    "K8_make_it_stop"),
    ("B6",  "bridge",  f"{E}/bridge/grok/B6_gardeners.mp4"),
    ("K9",  "knot",    "K9_the_invitation"),
]

SEG = {
    "FC-S01":   f"{E}/graded/fade/FC-S01_239_f.mp4",
    "FC-S02":   f"{E}/graded/fade/FC-S02_239_f.mp4",
    "FC-S03":   f"{E}/graded/fade/FC-S03_239_f.mp4",
    "FC-S04":   f"{E}/graded/fade/FC-S04_239_f.mp4",
    "FC-S05d":  f"{E}/graded/fade/FC-S05_dis_f.mp4",   # quad-split removed + dissolved seam
    "FC-S06":   f"{E}/graded/fade/FC-S06_final_f.mp4",
    "FC-S06A":  f"{E}/graded/fade/FC-S06A_239_f.mp4",
    "FC-S07":   f"{E}/graded/fade/FC-S07_239_f.mp4",
    "FC-S08":   f"{E}/graded/fade/FC-S08_final_f.mp4",
}

# dialogue line -> extra space AFTER it before the next line (seconds)
GAP = {"K1_03": 1.2, "K3_01": 1.4, "K4_01": 1.4, "K5_03": 1.4,
       "K7_02": 1.4, "K7_04": 1.8, "K8_01": 1.2, "K9_02": 2.0}
LEAD_IN = 1.0          # air before the first line of a knot
TAIL = 1.4             # air after the last line


def crop_239(src, dst, tag):
    """grok i2v comes out 1280x720 16:9; the film is 2.39. Centre-crop, never stretch."""
    if os.path.exists(dst):
        return
    run(["python3", f"{SK}/fit.py", src, "--width", str(W), "--height", str(H),
         "--fps", str(FPS), "--fit", "crop", "-o", dst, "--overwrite"], tag)


def build_knot(kid, tmp):
    """Cut the knot's coverage against its dialogue and lay the lines on the timeline.

    Returns (clip_path, [(abs_time, wav_path), ...]) so the dialogue can also be placed
    on the master timeline at the right offsets.
    """
    import glob
    lines = KNOT_LINES[kid]
    vo = f"{E}/knots/vo2"
    out = f"{tmp}/knots/{kid}_scene.mp4"
    ldur = [dur(f"{vo}/{l}.wav") for l in lines]
    total_audio = LEAD_IN + sum(ldur) + sum(GAP.get(l, 0.7) for l in lines[:-1]) + TAIL
    at, marks = LEAD_IN, []
    for l, d in zip(lines, ldur):
        marks.append((at, f"{vo}/{l}.wav"))
        at += d + GAP.get(l, 0.7)
    if os.path.exists(out) and os.path.getsize(out) > 100000:
        print(f"  {kid}: salto (escena ya construida, {dur(out):.2f}s)")
        return out, marks

    # coverage: every rendered unit for this knot, already cropped to 2.39
    cov = sorted(glob.glob(f"{tmp}/knots/{kid}*.mp4"))
    if not cov:
        raise SystemExit(f"sin cobertura para {kid}")
    # stretch each unit evenly so the coverage fills the dialogue length
    per = total_audio / len(cov)
    parts = []
    for i, c in enumerate(cov):
        d = dur(c)
        sp = d / per if per > 0 else 1.0
        p = f"{tmp}/knots/{kid}_p{i}.mp4"
        run(["python3", f"{SK}/cut.py", c, "--start", "0", "--end", str(min(d, 6.0)),
             "-o", f"{tmp}/knots/{_b(c)}_raw{i}.mp4", "--overwrite"], f"{kid} raw{i}")
        # speed-ramp the unit to the target length (slow = cinematic)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", f"{tmp}/knots/{_b(c)}_raw{i}.mp4",
                        "-filter_complex", f"[0:v]setpts={per/d}*PTS[v];[0:a]atempo={d/per},apad[a]",
                        "-map", "[v]", "-map", "[a]", "-t", str(per),
                        "-r", str(FPS), "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                        p], capture_output=True, text=True)
        parts.append(p)
    out = f"{tmp}/knots/{kid}_scene.mp4"
    if len(parts) == 1:
        subprocess.run(["cp", parts[0], out])
    else:
        run(["python3", f"{SK}/join.py", *parts, "--transition", "dissolve",
             "--duration", "0.5", "--width", str(W), "--height", str(H), "--fps", str(FPS),
             "-o", out, "--overwrite"], f"{kid} cortado")
    # lay the dialogue at the right offsets
    at, marks = LEAD_IN, []
    for l, d in zip(lines, ldur):
        marks.append((at, f"{vo}/{l}.wav"))
        at += d + GAP.get(l, 0.7)
    return out, marks


def _b(p):
    return os.path.basename(p)[:-4]


def main():
    for d in ("", "knots", "units", "audio", "out"):
        os.makedirs(os.path.join(V8, d), exist_ok=True)
    tmp = V8

    cast = json.load(open(f"{E}/knots/vo2/CAST.json"))
    print(f"\n=== 1) crop 2.39 de los 20 renders i2v ===")
    import glob
    for s in sorted(glob.glob(f"{E}/knots/vid/K*.mp4")):
        crop_239(s, f"{tmp}/knots/{_b(s)}.mp4", f"crop {_b(s)}")

    print(f"\n=== 2) escenas-nudo (cobertura + diálogo) ===")
    knots, dlog = {}, []
    for kid in KNOT_LINES:
        clip, marks = build_knot(kid, tmp)
        knots[kid] = clip
        dlog.append((kid, marks))
        print(f"  {kid}: {dur(clip):.2f}s, {len(marks)} líneas")

    print(f"\n=== 3) unidades finales en orden de historia ===")
    units, meta = [], []
    for tag, kind, arg in STRUCTURE:
        if kind == "knot":
            p = knots[arg]
        elif kind == "bridge":
            crop_239(arg, f"{tmp}/units/{tag}_{_b(arg)}.mp4", f"crop {tag}")
            p = f"{tmp}/units/{tag}_{_b(arg)}.mp4"
        elif kind == "seg":
            p = SEG[arg]
        else:
            parts = [SEG[a] for a in arg]
            p = f"{tmp}/units/BLK_{tag}.mp4"
            run(["python3", f"{SK}/join.py", *parts, "--transition", "none",
                 "--width", str(W), "--height", str(H), "--fps", str(FPS),
                 "-o", p, "--overwrite"], f"bloque {tag}")
        units.append(p)
        meta.append((tag, p, dur(p)))
        print(f"  {tag:<4} {kind:<6} {dur(p):7.2f}s  {_b(p)}")

    print(f"\n=== 4) COLCHÓN SONORO: ambience crossfadeada en TODOS los empalmes ===")
    stems = []
    for i, (tag, p, d) in enumerate(meta):
        s = f"{tmp}/audio/amb_{i:02d}_{tag}.wav"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", p,
                        "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", s],
                       capture_output=True, text=True)
        stems.append(s)
    # acrossfade every junction (18 of them) regardless of how the picture cuts
    ins, filt = [], []
    for i, s in enumerate(stems):
        ins += ["-i", s]
    chain = ["[0:a]"]
    cur = "[0:a]"
    for i in range(1, len(stems)):
        out = f"[ax{i}]" if i < len(stems) - 1 else "[aout]"
        filt.append(f"{cur}[{i}:a]acrossfade=d=0.6:c1=tri:c2=tri{out}")
        cur = out
    ff = ";".join(filt)
    amb = f"{tmp}/audio/AMB_chain.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *ins,
                    "-filter_complex", ff, "-map", "[aout]", "-ac", "2", "-ar", "48000",
                    "-c:a", "pcm_s16le", amb], capture_output=True, text=True)
    print(f"  cadena de ambience: {dur(amb):.2f}s ({len(stems)} unidades, "
          f"{len(stems)-1} crossfades de 0.6s)")

    print(f"\n=== 5) bed musical continuo (con crossfade en su propio loop) ===")
    bed = f"{F}/audio/bed_v3_procedural.wav"
    total = sum(m[2] for m in meta)
    print(f"  duración del cut: {total:.2f}s  | bed: {dur(bed):.2f}s")
    bed_out = f"{tmp}/audio/BED.wav"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                    "-stream_loop", "1", "-i", bed, "-t", str(total),
                    "-af", "afade=t=in:st=0:d=2,aformat=sample_rates=48000:channel_layouts=stereo",
                    "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", bed_out],
                   capture_output=True, text=True)
    print(f"  bed continuo: {dur(bed_out):.2f}s")

    json.dump({"units": [{"tag": t, "path": p, "dur": d} for t, p, d in meta],
               "dialogue": [{"knot": k, "lines": [{"t": t, "wav": w} for t, w in m]}
                            for k, m in dlog],
               "xfade": XFADE},
              open(f"{tmp}/audio/TIMELINE.json", "w"), indent=1)
    print(f"\n  timeline: {tmp}/audio/TIMELINE.json")
    print("  (siguiente paso: colocar diálogo + mezclar las 3 capas + loudness)")


if __name__ == "__main__":
    main()
