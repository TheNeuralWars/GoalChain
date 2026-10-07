#!/usr/bin/env python3
"""Rebuild v8 VIDEO from the 19 real units. Prefer stream-copy concat.

The previous master cloned one frame after ~191.5s. This build concatenates
every TIMELINE unit, then muxes the existing 530.1s mixed audio.
"""
import json
import os
import subprocess

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
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL", flush=True)
        print((r.stderr or "")[-1800:], flush=True)
        raise SystemExit(1)
    tail = (r.stderr or "").strip().splitlines()[-2:]
    print("OK", " | ".join(tail), flush=True)
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
for p in clips:
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        print("BAD CLIP", p)
        raise SystemExit(2)

with open(LIST, "w", encoding="utf-8") as fh:
    for p in clips:
        fh.write(f"file '{p}'\n")

# 1) concat with stream copy (all clips already 1280x536 24fps h264 yuv420p)
for cand in (VIDEO_ONLY, VIDEO_ONLY + ".tmp"):
    if os.path.exists(cand):
        os.remove(cand)

run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", LIST,
    "-an",
    "-c:v", "copy",
    "-movflags", "+faststart",
    VIDEO_ONLY,
], "concat copy 19 units")

print("VIDEO:", probe(VIDEO_ONLY), flush=True)

# 2) mux existing mixed audio
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
    "-movflags", "+faststart",
    MIXED,
], "mux video + audio")

print("MIXED:", probe(MIXED), flush=True)

# 3) loudness on audio only
SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
run([
    "python3", f"{SK}/loudness.py", MIXED,
    "-I", "-16", "--tp", "-1.5",
    "-o", FINAL, "--overwrite",
], "loudness")

print("FINAL:", probe(FINAL), flush=True)
print("SIZE", os.path.getsize(FINAL), flush=True)
print("DONE", flush=True)
