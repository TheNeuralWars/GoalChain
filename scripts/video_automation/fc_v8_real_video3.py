#!/usr/bin/env python3
"""Concat 19 real units with forced 24fps timestamps, then mux audio."""
import json
import os
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
OUT = f"{V8}/out"
NORM = f"{V8}/norm_v9"
LIST = f"{NORM}/concat_reenc.txt"
VIDEO_ONLY = f"{OUT}/FC_v8_video_REAL2.mp4"
MIXED = f"{OUT}/FC_v8_video_REAL2_mix.mp4"
FINAL = f"{OUT}/final_v8_REAL2.mp4"

os.makedirs(NORM, exist_ok=True)


def run(cmd, tag):
    print(f"\n=== {tag} ===", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL", flush=True)
        print((r.stderr or "")[-1800:], flush=True)
        raise SystemExit(1)
    print("OK", flush=True)
    return r


def probe(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "stream=codec_type,duration,nb_frames,width,height,r_frame_rate",
         "-of", "default=noprint_wrappers=1", path],
        capture_output=True, text=True)
    return (r.stdout or "").strip().replace("\n", " | ")


tl = json.load(open(f"{V8}/audio/TIMELINE.json"))
clips = [u["path"] for u in tl["units"]]

# filter_complex concat with fps lock + CFR
n = len(clips)
inputs = []
for p in clips:
    inputs += ["-i", p]

# [i:v]fps=24,setpts=N/(24*TB)[vi]; ... concat=n=19:v=1:a=0
parts = []
labels = []
for i in range(n):
    parts.append(f"[{i}:v]fps=24,setpts=N/(24*TB),format=yuv420p[v{i}]")
    labels.append(f"[v{i}]")
parts.append(f"{''.join(labels)}concat=n={n}:v=1:a=0[vout]")
fc = ";".join(parts)

cmd = [
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    *inputs,
    "-filter_complex", fc,
    "-map", "[vout]",
    "-an",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
    "-pix_fmt", "yuv420p", "-r", "24", "-vsync", "cfr",
    "-movflags", "+faststart",
    VIDEO_ONLY,
]
run(cmd, "filter_complex concat 24fps CFR")
print("VIDEO:", probe(VIDEO_ONLY), flush=True)

audio_src = f"{V8}/audio/MIX_FINAL.wav"
run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-i", VIDEO_ONLY,
    "-i", audio_src,
    "-map", "0:v:0", "-map", "1:a:0",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
    "-movflags", "+faststart",
    MIXED,
], "mux")
print("MIXED:", probe(MIXED), flush=True)

SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
run([
    "python3", f"{SK}/loudness.py", MIXED,
    "-I", "-16", "--tp", "-1.5",
    "-o", FINAL, "--overwrite",
], "loudness")
print("FINAL:", probe(FINAL), flush=True)
print("SIZE", os.path.getsize(FINAL), flush=True)
print("DONE", flush=True)
