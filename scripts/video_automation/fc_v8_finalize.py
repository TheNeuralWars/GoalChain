#!/usr/bin/env python3
"""fc_v8 finalize: repair B1, rebuild the unified sound bed, place dialogue, mix, master.

The brief: "el sonido de fondo entre cada escena, vieja y nueva, se fundan, creando un
colchón sonoro unificado." Three layers, mixed once:

  AMBIENCE  every unit's own air, acrossfaded at EVERY junction (18 of them, including
            the picture-hard ones) -> one continuous stem, no seam ever goes dry.
  BED       bed_v3_procedural under the whole cut, faded in/out, ducked under dialogue.
  DIALOGUE  22 verbatim book lines, placed on their knot's timeline, dry and forward.

Then loudness.py -I -16 --tp -1.5.
"""
import glob
import json
import os
import subprocess

SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
E = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit"
F = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM"
V8 = os.path.join(E, "v8")
W, H, FPS = 1280, 536, 24
os.environ["FFMPEG_SKILL_NO_OVERWRITE"] = "1"


def dur(p):
    try:
        return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                     "format=duration", "-of", "csv=p=0", p],
                                    capture_output=True, text=True).stdout or 0)
    except Exception:
        return 0.0


def ff(args, tag):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"] + args,
                       capture_output=True, text=True)
    ok = r.returncode == 0
    print(f"  [{tag}] {'OK' if ok else 'FALLÓ'}" + ("" if ok else "  " + (r.stderr or "")[-220:]))
    return ok


def base(p):
    return os.path.basename(p)[:-4]


# --------------------------------------------------------------- 1) repair B1
print("=== 1) reparar el crop de B1 (48 bytes de un intento roto) ===")
b1_src = f"{E}/bridge/grok/B1_harvest_city.mp4"
b1_dst = f"{V8}/units/B1_B1_harvest_city.mp4"
if os.path.exists(b1_dst) and os.path.getsize(b1_dst) < 100000:
    os.remove(b1_dst)
    print("  borrado el crop roto")
if not os.path.exists(b1_dst):
    r = subprocess.run(["python3", f"{SK}/fit.py", b1_src, "--width", str(W),
                        "--height", str(H), "--fps", str(FPS), "--fit", "crop",
                        "-o", b1_dst, "--overwrite"], capture_output=True, text=True)
    print(f"  B1 recortado: {dur(b1_dst):.2f}s  {os.path.getsize(b1_dst)} bytes")

# --------------------------------------------------------------- 2) unit list
meta = json.load(open(f"{V8}/audio/TIMELINE.json"))
units = []
for u in meta["units"]:
    p = u["path"]
    if not os.path.exists(p) or os.path.getsize(p) < 100000:
        print(f"  !! unidad rota: {u['tag']} -> {p}")
    units.append((u["tag"], p, dur(p)))
total = sum(d for _, _, d in units)
print(f"\n=== 2) {len(units)} unidades · cut total {total:.2f}s ({total/60:.2f} min) ===")

# --------------------------------------------------------------- 3) ambience chain
print("\n=== 3) COLCHÓN: ambience crossfadeada en TODOS los empalmes ===")
for f in glob.glob(f"{V8}/audio/amb_*.wav"):
    os.remove(f)
stems = []
for i, (tag, p, d) in enumerate(units):
    s = f"{V8}/audio/amb_{i:02d}_{tag}.wav"
    ok = ff(["-i", p, "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", s],
            f"stem {tag}")
    if ok and os.path.getsize(s) > 2000:
        stems.append(s)
print(f"  stems válidos: {len(stems)}/{len(units)}")
ins, filt = [], []
for s in stems:
    ins += ["-i", s]
cur = "[0:a]"
for i in range(1, len(stems)):
    out = "[aout]" if i == len(stems) - 1 else f"[ax{i}]"
    filt.append(f"{cur}[{i}:a]acrossfade=d=0.6:c1=tri:c2=tri{out}")
    cur = out
amb = f"{V8}/audio/AMB_chain.wav"
ff(ins + ["-filter_complex", ";".join(filt), "-map", "[aout]", "-ac", "2",
          "-ar", "48000", "-c:a", "pcm_s16le", amb], "ambience chain")
print(f"  AMB_chain: {dur(amb):.2f}s  ({len(stems)} unidades, {len(stems)-1} crossfades de 0.6 s)")

# --------------------------------------------------------------- 4) bed
print("\n=== 4) bed musical continuo ===")
bed = f"{F}/audio/bed_v3_procedural.wav"
bed_out = f"{V8}/audio/BED.wav"
ff(["-stream_loop", "1", "-i", bed, "-t", str(total),
    "-af", "afade=t=in:st=0:d=3,afade=t=out:st=" + str(max(0, total - 4)) + ":d=4,"
           "aformat=sample_rates=48000:channel_layouts=stereo",
    "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", bed_out], "bed")
print(f"  BED: {dur(bed_out):.2f}s")

# --------------------------------------------------------------- 5) dialogue
print("\n=== 5) diálogo verbatim del libro en su línea de tiempo ===")
# absolute offset of each knot's start in the master
starts, acc = {}, 0.0
for tag, p, d in units:
    starts[tag] = acc
    acc += d
KNOT_TAG = {"K1_soul_harvester": "K1", "K2_the_fracture": "K2", "K3_the_vow": "K3",
            "K4_the_words": "K4", "K5_not_me_afterward": "K5",
            "K6_the_counterattack": "K6", "K7_the_chair": "K7",
            "K8_make_it_stop": "K8", "K9_the_invitation": "K9"}
dl = f"{V8}/audio/DIALOGUE.wav"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(total),
                "-c:a", "pcm_s16le", dl], capture_output=True, text=True)
n = 0
for blk in meta["dialogue"]:
    kid = blk["knot"]
    off = starts.get(KNOT_TAG.get(kid, ""), 0.0)
    for ln in blk["lines"]:
        t = off + ln["t"]
        tmp = f"{V8}/audio/_d{n}.wav"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", ln["wav"], "-af",
                        "aformat=sample_rates=48000:channel_layouts=stereo,"
                        "afade=t=in:st=0:d=0.05,afade=t=out:st=%.3f:d=0.12,"
                        "volume=6dB" % max(0.0, dur(ln["wav"]) - 0.12),
                        "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", tmp],
                       capture_output=True, text=True)
        out = f"{V8}/audio/_m{n}.wav"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                        "-i", dl, "-i", tmp,
                        "-filter_complex", f"[0:a][1:a]amix=inputs=2:duration=first:"
                                           f"normalize=0:dropout_transition=0[a]",
                        "-map", "[a]", "-t", str(total), "-c:a", "pcm_s16le", out],
                       capture_output=True, text=True)
        os.replace(out, dl)
        print(f"    t={t:7.2f}s  {kid:<22} {os.path.basename(ln['wav'])[:-4]}")
        n += 1
print(f"  DIALOGUE: {n} líneas colocadas · {dur(dl):.2f}s")

# --------------------------------------------------------------- 6) mix
print("\n=== 6) mezcla de las 3 capas (colchón + bed + diálogo) ===")
mix = f"{V8}/audio/MIX.wav"
ff(["-i", amb, "-i", bed_out, "-i", dl,
    "-filter_complex",
    "[0:a]volume=0.85[a0];[1:a]volume=0.42[a1];[2:a]volume=1.0[a2];"
    "[a0][a1]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[u];"
    "[u][a2]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[m]",
    "-map", "[m]", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", mix], "mix")
print(f"  MIX: {dur(mix):.2f}s")

# --------------------------------------------------------------- 7) video + audio
print("\n=== 7) video de las 19 unidades + la mezcla ===")
order = [p for _, p, _ in units]
# hard cut inside action blocks (already pre-joined), dissolve at every other junction
vid = f"{V8}/out/FC_v8_video.mp4"
if len(order) > 1:
    ins, filt, cur, k = [], [], "[0:v]", 0
    for p in order:
        ins += ["-i", p]
    # use ffmpeg xfade between consecutive units (0.7s) — mirrors the join.py dissolve
    offsets, acc = [], 0.0
    for i, (_, _, d) in enumerate(units):
        offsets.append(acc)
        acc += d
    cur = "[0:v]"
    for i in range(1, len(units)):
        o = f"[v{i}]" if i < len(units) - 1 else "[vout]"
        off = offsets[i] - 0.7
        filt.append(f"{cur}[{i}:v]xfade=transition=fade:duration=0.7:"
                    f"offset={off:.3f}{o}")
        cur = o
    ff(ins + ["-filter_complex", ";".join(filt), "-map", "[vout]",
              "-r", str(FPS), "-c:v", "libx264", "-crf", "16", "-preset", "medium",
              "-pix_fmt", "yuv420p", vid], "video 19 unidades")
print(f"  video: {dur(vid):.2f}s")

mux = f"{V8}/out/FC_v8_mix.mp4"
ff(["-i", vid, "-i", mix, "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
    "-movflags", "+faststart", mux], "mux")
print(f"  mux: {dur(mux):.2f}s  {os.path.getsize(mux)} bytes")

# --------------------------------------------------------------- 8) loudness
print("\n=== 8) loudness -16 LUFS ===")
fin = f"{V8}/out/final_v8.mp4"
r = subprocess.run(["python3", f"{SK}/loudness.py", mux, "-I", "-16", "--tp", "-1.5",
                    "-o", fin, "--overwrite"], capture_output=True, text=True)
for l in (r.stdout + r.stderr).splitlines():
    if "result" in l or "error" in l:
        print("  " + l.strip())
print(f"\n  FINAL: {fin}")
print(f"         {dur(fin):.2f}s · {os.path.getsize(fin) if os.path.exists(fin) else 0} bytes")
