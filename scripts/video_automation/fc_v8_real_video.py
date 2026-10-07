#!/usr/bin/env python3
"""Rebuild v8 VIDEO stream from the 19 real unit clips (no freeze).

Previous masters ended real picture at ~191.5s and cloned one frame for the
rest. This concat-demuxer build uses every unit in TIMELINE.json, then muxes
the already-built 530.1s audio bed.
"""
import json
import os
import subprocess
import sys

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
OUT = f"{V8}/out"
NORM = f"{V8}/norm_v9"
LIST = f"{NORM}/concat.txt"
VIDEO_ONLY = f"{OUT}/FC_v8_video_REAL.mp4"
MIXED = f"{OUT}/FC_v8_video_REAL_mix.mp4"
FINAL = f"{OUT}/final_v8_REAL.mp4"

os.makedirs(NORM, exist_ok=True)
os.makedirs(OUT, exist_ok=True)


def run(cmd, tag):
    print(f"\n=== {tag} ===", flush=True)
    print(" ".join(cmd) if isinstance(cmd, list) else cmd, flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL", flush=True)
        print((r.stderr or "")[-1500:], flush=True)
        raise SystemExit(1)
    tail = (r.stderr or "").strip().splitlines()[-3:]
    print("OK", " | ".join(tail), flush=True)
    return r


def probe(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=duration,nb_frames,width,height,r_frame_rate,pix_fmt",
         "-of", "default=noprint_wrappers=1", path],
        capture_output=True, text=True)
    return (r.stdout or "").strip().replace("\n", " | ")


tl = json.load(open(f"{V8}/audio/TIMELINE.json"))
clips = [u["path"] for u in tl["units"]]
for p in clips:
    if not os.path.exists(p):
        print("MISSING CLIP", p)
        raise SystemExit(2)

# concat demuxer: same codec/size/fps already verified
with open(LIST, "w", encoding="utf-8") as fh:
    for p in clips:
        fh.write(f"file '{p}'\n")

# 1) video-only concat, re-encode for a clean continuous CFR timeline
run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", LIST,
    "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", "18",
    "-pix_fmt", "yuv420p", "-r", "24", "-vsync", "cfr",
    "-movflags", "+faststart",
    VIDEO_ONLY,
], "concat 19 units -> video")

print("VIDEO probe:", probe(VIDEO_ONLY))

# 2) mux with the already-built audio (no new mix math)
audio_src = f"{V8}/audio/MIX_FINAL.wav"
if not os.path.exists(audio_src):
    audio_src = f"{V8}/audio/MIX_FIXED.wav"
run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-i", VIDEO_ONLY,
    "-i", audio_src,
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
    "-shortest",
    "-movflags", "+faststart",
    MIXED,
], "mux real video + mixed audio")

# 3) loudness
SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
run([
    "python3", f"{SK}/loudness.py", MIXED,
    "-I", "-16", "--tp", "-1.5",
    "-o", FINAL, "--overwrite",
], "loudness -16 LUFS")

print("\nFINAL probe:", probe(FINAL))
print("WROTE", FINAL, os.path.getsize(FINAL))
print("DONE")
