#!/usr/bin/env python3
"""Rebuild DIALOGUE stem: each line normalized to -16 dB RMS, placed on timeline"""
import json
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
TOTAL = 530.1

# load timeline
meta = json.load(open(f"{V8}/audio/TIMELINE.json"))

def run(cmd, tag=""):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  [{tag}] FAIL: {r.stderr[-300:]}")
    return r

# 1) create silence bed
print("=== create silence bed ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(TOTAL),
     "-c:a", "pcm_s16le", f"{V8}/audio/DIALOGUE2.wav"], "silence bed")

# 2) place each line normalized to -16 dB RMS
print("=== place normalized lines ===")
for blk in meta["dialogue"]:
    kid = blk["knot"]
    for ln in blk["lines"]:
        t = ln["t"]
        wav = ln["wav"]
        # measure and normalize to -16 dB RMS in one pass
        tmp = f"{V8}/audio/_dnorm_{kid}_{t:.1f}.wav"
        r = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-i", wav,
                 "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=-999:linear=true:print_format=json,"
                        "aformat=sample_rates=48000:channel_layouts=stereo",
                 "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le", tmp],
                f"normalize {kid}@{t}")
        # mix onto bed
        run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-i", f"{V8}/audio/DIALOGUE2.wav",
             "-i", tmp,
             "-filter_complex", f"[0:a][1:a]amix=inputs=2:duration=first:normalize=0:dropout_transition=0[a]",
             "-map", "[a]", "-t", str(TOTAL), "-c:a", "pcm_s16le", f"{V8}/audio/DIALOGUE2_tmp.wav"],
            f"mix {kid}@{t}")
        run(["mv", f"{V8}/audio/DIALOGUE2_tmp.wav", f"{V8}/audio/DIALOGUE2.wav"], "replace")

print("=== verify new stem ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "info", "-i", f"{V8}/audio/DIALOGUE2.wav",
     "-af", "volumedetect", "-f", "null", "-"], "verify")

# 3) remix all three stems
print("=== remix ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-i", f"{V8}/audio/AMB_chain.wav",
     "-i", f"{V8}/audio/BED.wav",
     "-i", f"{V8}/audio/DIALOGUE2.wav",
     "-filter_complex",
     "[0:a]volume=0.85[a0];"
     "[1:a]volume=0.42[a1];"
     "[2:a]volume=1.0[a2];"
     "[a0][a1]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[u];"
     "[u][a2]amix=inputs=2:duration=longest:normalize=0:dropout_transition=0[m]",
     "-map", "[m]", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s16le",
     f"{V8}/audio/MIX_FIXED.wav"], "remix")

# 4) mux
print("=== mux ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-i", f"{V8}/out/FC_v8_video.mp4",
     "-i", f"{V8}/audio/MIX_FIXED.wav",
     "-map", "0:v", "-map", "1:a",
     "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-ar", "48000",
     "-movflags", "+faststart",
     f"{V8}/out/FC_v8_mix_FIXED.mp4"], "mux")

print("DONE")