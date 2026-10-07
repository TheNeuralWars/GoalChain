#!/usr/bin/env python3
"""Remix with boosted dialogue (+6 dB = 2x voltage)"""
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"

def run(cmd, tag=""):
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(f"  [{tag}] {'OK' if r.returncode==0 else 'FAIL'}" + ("" if r.returncode==0 else f" {r.stderr[-200:]}"))
    return r

# 1) remix stems with dialogue boosted
print("=== remix stems ===")
r = subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-i", f"{V8}/audio/AMB_chain.wav",
    "-i", f"{V8}/audio/BED.wav",
    "-i", f"{V8}/audio/DIALOGUE.wav",
    "-filter_complex",
    "[0:a]volume=0.85[a0];"
    "[1:a]volume=0.42[a1];"
    "[2:a]volume=2.0[a2];"
    "[a0][a1]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[u];"
    "[u][a2]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[m]",
    "-map", "[m]", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le",
    f"{V8}/audio/MIX_BOOST.wav"
], capture_output=True, text=True)
print(f"  remix: {'OK' if r.returncode==0 else 'FAIL'}")

# 2) mux with video
print("=== mux ===")
r = subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-i", f"{V8}/out/FC_v8_video.mp4",
    "-i", f"{V8}/audio/MIX_BOOST.wav",
    "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
    "-movflags", "+faststart",
    f"{V8}/out/FC_v8_mix_BOOST.mp4"
], capture_output=True, text=True)
print(f"  mux: {'OK' if r.returncode==0 else 'FAIL'}")

# 3) loudness
print("=== loudness ===")
r = subprocess.run([
    "python3",
    "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts/loudness.py",
    f"{V8}/out/FC_v8_mix_BOOST.mp4",
    "-I", "-16", "--tp", "-1.5",
    "-o", f"{V8}/out/final_v8_BOOST.mp4",
    "--overwrite"
], capture_output=True, text=True)
for l in (r.stdout + r.stderr).splitlines():
    if "result" in l or "error" in l:
        print(f"  {l.strip()}")
print(f"  loudness: {'OK' if r.returncode==0 else 'FAIL'}")