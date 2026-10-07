#!/usr/bin/env python3
"""Smooth the 4 dirtiest audio boundaries in MIX_RECUED, then remux + export."""
import os
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
AUDIO = f"{V8}/audio"
OUT = f"{V8}/out"
SRC_MIX = f"{AUDIO}/MIX_RECUED.wav"
SMOOTH = f"{AUDIO}/MIX_SMOOTH.wav"
VIDEO = f"{OUT}/FC_v8_video_REAL2.mp4"
MIXED = f"{OUT}/FC_v8_SMOOTH_mix.mp4"
FINAL = f"{OUT}/final_v8_SMOOTH.mp4"

# dirtiest boundaries (seconds) + direction of the jump
# B1->K1 @6.04 : -21 -> -35  (need 3s fade down into K1 then back)
# B2->K2 @219.54: -9.5 -> -14.6
# K5->S6A @357.08: -16.2 -> -20.8
# S6A->K6 @381.29: -14.8 -> -10.3
# apply 1.2s volume dip centered on each seam via volume envelope segments

# Build a single volume automation:
# default 1.0, dip to 0.42 at seams B1/K1, 0.62 at B2/K2, 0.58 at K5/S6A, 0.58 at S6A/K6
# using volume='if(between(t,t0,t1), ...)' chained.

def clamp(v, lo=0.05, hi=1.0):
    return max(lo, min(hi, v))

# piecewise: for each seam, 0.6s ramp down, 0.6s ramp up
# volume expression using between + linear interp is messy; use 4 discrete volume filters on splits? 
# Simpler: one volume filter with eval=frame and a piecewise expression.

expr = "1.0"
# seam dips as triangular envelopes
seams = [
    (6.04, 1.4, 0.38),
    (219.54, 1.2, 0.55),
    (357.08, 1.2, 0.55),
    (381.29, 1.2, 0.55),
    (505.71, 1.0, 0.70),
]
# triangular: amp * max(0, 1 - abs(t-c)/w)  -> volume = 1 - (1-amp)*tri
parts = []
for c, w, amp in seams:
    parts.append(f"(1-{1-amp:.3f})*max(0,1-abs(t-{c})/{w})")
expr = "1.0-" + "-".join(f"({1-amp:.3f}*max(0,1-abs(t-{c})/{w}))" for c,w,amp in seams)

def run(cmd, tag):
    print(f"\n=== {tag} ===", flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAIL", flush=True)
        print((r.stderr or "")[-1500:], flush=True)
        raise SystemExit(1)
    print("OK", flush=True)

run([
    "ffmpeg","-hide_banner","-loglevel","error","-y",
    "-i", SRC_MIX,
    "-af", f"volume='1.0-{'+'.join(f'({1-amp:.3f}*max(0,1-abs(t-{c})/{w}))' for c,w,amp in seams)}':eval=frame",
    "-ac","2","-ar","48000","-c:a","pcm_s16le",
    SMOOTH,
], "seam volume dips")

run([
    "ffmpeg","-hide_banner","-loglevel","error","-y",
    "-i", VIDEO, "-i", SMOOTH,
    "-map","0:v:0","-map","1:a:0",
    "-c:v","copy","-c:a","aac","-b:a","256k","-ac","2","-ar","48000",
    "-movflags","+faststart",
    MIXED,
], "mux")

SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
run([
    "python3", f"{SK}/loudness.py", MIXED,
    "-I","-16","--tp","-1.5",
    "-o", FINAL, "--overwrite",
], "loudness")

print("FINAL", FINAL, os.path.getsize(FINAL))
print("DONE")
