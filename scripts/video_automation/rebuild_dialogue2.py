#!/usr/bin/env python3
"""Rebuild DIALOGUE stem: each line normalized to -16 dB RMS via measured gain"""
import json
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
TOTAL = 530.1

meta = json.load(open(f"{V8}/audio/TIMELINE.json"))

def run(cmd, tag=""):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  [{tag}] FAIL: {r.stderr[-300:]}")
    return r

def get_mean_volume(wav):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "info", "-i", wav, 
                        "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True)
    for line in r.stderr.splitlines():
        if "mean_volume" in line:
            return float(line.split(":")[-1].strip().replace(" dB", ""))
    return None

# 1) create silence bed
print("=== create silence bed ===")
run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
     "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(TOTAL),
     "-c:a", "pcm_s16le", f"{V8}/audio/DIALOGUE2.wav"], "silence bed")

# 2) place each line with calculated gain
print("=== place lines with gain ===")
for blk in meta["dialogue"]:
    kid = blk["knot"]
    for ln in blk["lines"]:
        t = ln["t"]
        wav = ln["wav"]
        mean_db = get_mean_volume(wav)
        if mean_db is None:
            print(f"  WARNING: could not measure {wav}")
            continue
        gain_db = -16.0 - mean_db  # target -16 dB
        print(f"  {kid}@{t:.1f}s: mean={mean_db:.1f} dB -> gain={gain_db:.1f} dB")
        
        # apply gain and place on timeline
        run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-i", f"{V8}/audio/DIALOGUE2.wav",
             "-i", wav,
             "-filter_complex", f"[1:a]volume={gain_db}dB,aformat=sample_rates=48000:channel_layouts=stereo[a1];[0:a][a1]amix=inputs=2:duration=first:normalize=0:dropout_transition=0[a]",
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