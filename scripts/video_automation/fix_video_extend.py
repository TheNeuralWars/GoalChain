#!/usr/bin/env python3
"""Extend video to 530.1s by holding last frame, then full remix"""
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"

def run(cmd, tag=""):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  [{tag}] FAIL: {r.stderr[-300:]}")
    else:
        print(f"  [{tag}] OK")
    return r

# 1) extend video to 530.1s holding last frame
print("=== extend video to 530.1s ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-i", f"{V8}/out/FC_v8_video.mp4",
     "-filter_complex", "[0:v]tpad=stop_mode=clone:stop_duration=338.475[v]",
     "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-crf", "22",
     "-pix_fmt", "yuv420p", "-movflags", "+faststart",
     f"{V8}/out/FC_v8_video_EXT.mp4"], "extend video")

# 2) verify
print("=== verify extended video ===")
run(["ffprobe", "-v", "error", "-show_entries", "stream=duration",
     "-of", "csv=p=0", f"{V8}/out/FC_v8_video_EXT.mp4"], "verify")

# 3) mux with FIXED audio mix
print("=== mux ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-i", f"{V8}/out/FC_v8_video_EXT.mp4",
     "-i", f"{V8}/audio/MIX_FIXED.wav",
     "-map", "0:v", "-map", "1:a",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
     "-movflags", "+faststart",
     f"{V8}/out/FC_v8_mix_FIXED2.mp4"], "mux")

# 4) loudness
print("=== loudness ===")
SK = "/data/hermes-home/profiles/hermes-ceo/skills/ffmpeg-skill/scripts"
run(["python3", f"{SK}/loudness.py", f"{V8}/out/FC_v8_mix_FIXED2.mp4",
     "-I", "-16", "--tp", "-1.5", "-o", f"{V8}/out/final_v8_FIXED2.mp4", "--overwrite"], "loudness")

# 5) web master export
print("=== web master export ===")
run(["python3", f"{SK}/export.py", "--preset", "youtube", "--no-scale", "--crf", "27",
     f"{V8}/out/final_v8_FIXED2.mp4", "-o", f"{V8}/out/FC_minifilm_239_v3_FIXED2.mp4"], "export")

print("DONE")