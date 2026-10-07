#!/usr/bin/env python3
"""FC S10+ rough assemblies v1b (adds still-hold items) (2026-10-06, Grok Bot). NEW file. ffmpeg only, no generation.
Reads a spec JSON {scene: [ {clip: rel_path} | {slug: "text", dur: 1.5} ...]} and writes, per scene, into
renders/FC-S10plus_20261006/review_20261006/: <scene>_rough_assembly_20261006.mp4 (1280x720, 24 fps, AAC),
<scene>_review_web.mp4 (960x540 H.264 Main yuv420p CRF26 faststart) and a slug-free <scene>_cut_v1.mp4 for ContinuityGuard."""
import json, subprocess, sys, os
from pathlib import Path
FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
OUT = FILM / "renders/FC-S10plus_20261006/review_20261006"; OUT.mkdir(parents=True, exist_ok=True)
TMP = Path.home() / "fc_s10plus_20261006/asm_tmp"; TMP.mkdir(parents=True, exist_ok=True)
def run(cmd): subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
def has_audio(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    return bool(r.stdout.strip())
def norm(item, i, scene):
    o = TMP / f"{scene}_{i:02d}.mp4"
    if "clip" in item:
        src = FILM / item["clip"]
        a = ["-i", str(src)] if has_audio(src) else ["-i", str(src), "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
        amap = ["-map", "0:v:0", "-map", "0:a:0"] if has_audio(src) else ["-map", "0:v:0", "-map", "1:a:0", "-shortest"]
        ss = ["-ss", str(item.get("in", 0))] if item.get("in") else []
        to = ["-t", str(item["dur"])] if item.get("dur") else []
        run(["ffmpeg", "-y", "-loglevel", "error"] + ss + a + to + amap + ["-vf", "scale=1280:720,fps=24,format=yuv420p", "-c:v", "libx264", "-crf", "16", "-preset", "veryfast",
             "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "160k", str(o)])
    elif "still" in item:
        src = FILM / item["still"]; d = item.get("dur", 6); lab = item.get("label", "").replace(":", "\\:").replace("'", "")
        vf = f"scale=1280:720,zoompan=z='min(zoom+0.0006,1.08)':d={int(d*24)}:s=1280x720:fps=24" + (f",drawtext=text='{lab}':fontcolor=white@0.7:fontsize=20:x=20:y=h-40" if lab else "") + ",format=yuv420p"
        run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(src), "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-vf", vf, "-t", str(d), "-map", "0:v", "-map", "1:a",
             "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "160k", str(o)])
    else:
        txt = item["slug"].replace(":", "\\:").replace("'", "")
        run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c=black:s=1280x720:r=24:d={item.get('dur', 1.5)}", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
             "-vf", f"drawtext=text='{txt}':fontcolor=white@0.85:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2,format=yuv420p", "-shortest", "-c:v", "libx264", "-crf", "16", "-preset", "veryfast",
             "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "160k", str(o)])
    return o
def concat(parts, dest):
    lst = TMP / (dest.stem + ".txt"); lst.write_text("".join(f"file '{p}'\n" for p in parts))
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(dest)])
def web(src, dest, crf=26):
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf", "scale=960:540", "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p", "-crf", str(crf), "-preset", "slow",
         "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(dest)])
    return dest.stat().st_size
def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout.strip())
spec = json.load(open(sys.argv[1])); res = {}
for scene, items in spec.items():
    parts = [norm(it, i, scene) for i, it in enumerate(items)]
    master = OUT / f"{scene}_rough_assembly_20261006.mp4"; concat(parts, master)
    cut = OUT / f"{scene}_cut_v1.mp4"; concat([p for p, it in zip(parts, items) if "slug" not in it], cut)
    w = OUT / f"{scene}_review_web.mp4"; sz = web(master, w)
    crf = 26
    while sz >= 10_000_000 and crf < 34: crf += 2; sz = web(master, w, crf)
    res[scene] = {"master": str(master.relative_to(FILM)), "master_s": round(dur(master), 3), "web": str(w.relative_to(FILM)), "web_bytes": sz, "web_crf": crf,
                  "cut_for_cg": str(cut.relative_to(FILM)), "items": items}
    print(json.dumps({scene: res[scene]}, ensure_ascii=False)[:400], flush=True)
(OUT / ("assembly_results_" + Path(sys.argv[1]).stem + ".json")).write_text(json.dumps(res, ensure_ascii=False, indent=1))
