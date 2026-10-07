#!/usr/bin/env python3
"""Final remix: dialogue +3dB more"""
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"

def run(cmd, tag=""):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  [{tag}] FAIL: {r.stderr[-300:]}")
    else:
        print(f"  [{tag}] OK")
    return r

# remix with dialogue +3dB (volume=2.0 instead of 1.0)
print("=== remix (+3dB dialogue) ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-i", f"{V8}/audio/AMB_chain.wav",
     "-i", f"{V8}/audio/BED.wav",
     "-i", f"{V8}/audio/DIALOGUE2.wav",
     "-filter_complex",
     "[0:a]volume=0.85[a0];"
     "[1:a]volume=0.42[a1];"
     "[2:a]volume=2.0[a2];"  # +6dB total from original
     "[a0][a1]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[u];"
     "[u][a2]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[m]",
     "-map", "[m]", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le",
     f"{V8}/audio/MIX_FINAL.wav"], "remix")

# mux with extended video
print("=== mux ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-i", f"{V8}/out/FC_v8_video_EXT.mp4",
     "-i", f"{V8}/audio/MIX_FINAL.wav",
     "-map", "0:v", "-map", "1:a",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
     "-movflags", "+faststart",
     f"{V8}/out/FC_v8_mix_FINAL.mp4"], "mux")

# loudness
print("=== loudness ===")
SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
run(["python3", f"{SK}/loudness.py", f"{V8}/out/FC_v8_mix_FINAL.mp4",
     "-I", "-16", "--tp", "-1.5", "-o", f"{V8}/out/final_v8_FINAL.mp4", "--overwrite"], "loudness")

print("DONE")