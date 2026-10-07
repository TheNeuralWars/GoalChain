#!/usr/bin/env python3
"""v8 audio rebuild — ZERO-DRIFT.

Root cause of the progressive audio-ahead drift:
  The video concat re-times every unit to 24 fps CFR (setpts=N/(24*TB)), so a
  unit's timeline length = nb_frames/24, which is NOT its container duration.
  The audio was built by naive concat of amb_*.wav, each ~25-140 ms shorter
  than its video unit. Over 19 units that accumulated to ~-0.75 s (audio ran
  ahead of picture, growing toward the end).

Fix:
  Anchor every ambience stem to its video unit's START time in the 24 fps CFR
  timeline (computed from real frame counts), and anchor every dialogue line to
  (knot_start + t). Nothing is concatenated, so no per-unit duration mismatch
  can accumulate. Trim/pad the result to exactly the video timeline length.
"""
import json
import os
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
OUT = f"{V8}/out"
os.makedirs(OUT, exist_ok=True)

TL = json.load(open(f"{V8}/audio/TIMELINE.json"))
VT = json.load(open(f"{V8}/audio/VIDEO_TIMELINE.json"))

# tag -> (start, dur) on the 24fps CFR video timeline
VSTART = {u["tag"]: u["start"] for u in VT}
VDUR = {u["tag"]: u["dur"] for u in VT}
TOTAL = sum(u["dur"] for u in VT)          # 530.000 s
OPEN_PAD = 12.083333                        # 2 new opening shots

# ambience stem per video unit, in timeline order
AMB = {
    "B1": "audio/amb_00_B1.wav",
    "K1": "audio/amb_01_K1.wav",
    "A": "audio/amb_02_A.wav",
    "B2": "audio/amb_03_B2.wav",
    "K2": "audio/amb_04_K2.wav",
    "K3": "audio/amb_05_K3.wav",
    "B": "audio/amb_06_B.wav",
    "B3": "audio/amb_07_B3.wav",
    "K4": "audio/amb_08_K4.wav",
    "K5": "audio/amb_09_K5.wav",
    "S6A": "audio/amb_10_S6A.wav",
    "K6": "audio/amb_11_K6.wav",
    "B4": "audio/amb_12_B4.wav",
    "C": "audio/amb_13_C.wav",
    "K7": "audio/amb_14_K7.wav",
    "B5": "audio/amb_15_B5.wav",
    "K8": "audio/amb_16_K8.wav",
    "B6": "audio/amb_17_B6.wav",
    "K9": "audio/amb_18_K9.wav",
}

# dialogue: knot tag -> list of (t_rel, wav)
KNOT_TAG = {
    "K1_soul_harvester": "K1",
    "K2_the_fracture": "K2",
    "K3_the_vow": "K3",
    "K4_the_words": "K4",
    "K5_not_me_afterward": "K5",
    "K6_the_counterattack": "K6",
    "K7_the_chair": "K7",
    "K8_make_it_stop": "K8",
    "K9_the_invitation": "K9",
}

# Lines start at the same instant as their shot in the source scene, so no extra
# margin is added here. (A +0.55 s margin was measured as a constant offset and
# removed — the TTS files have zero leading silence.)
LINE_MARGIN = 0.0


def run(cmd, tag):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FAILED {tag}\n{(r.stderr or '')[-2200:]}")
        raise SystemExit(1)
    print(f"ok {tag}")
    return r.stdout.strip()


def main():
    inputs = []
    filters = []
    mix_labels = []
    idx = 0

    # ---- ambience stems, anchored at video start (+ open pad) ----
    for u in VT:
        tag = u["tag"]
        wav = f"{V8}/{AMB[tag]}"
        if not os.path.exists(wav):
            print("missing amb", wav)
            raise SystemExit(1)
        at = u["start"] + OPEN_PAD
        inputs += ["-i", wav]
        # force 48k stereo, delay to timeline start, trim to the unit's video dur
        ms = int(round(at * 1000))
        filters.append(
            f"[{idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"adelay={ms}|{ms},apad,atrim=0:{u['dur']:.6f},"
            f"afade=t=in:d=0.25,afade=t=out:st={max(u['dur']-0.35,0):.6f}:d=0.35[a{idx}]"
        )
        mix_labels.append(f"[a{idx}]")
        idx += 1

    # ---- dialogue lines, anchored at knot_start + t_rel + margin ----
    n_lines = 0
    for blk in TL["dialogue"]:
        tag = KNOT_TAG.get(blk["knot"])
        if tag is None:
            print("unknown knot", blk["knot"])
            raise SystemExit(1)
        kstart = VSTART[tag] + OPEN_PAD
        for ln in blk["lines"]:
            wav = ln["wav"]
            if not os.path.exists(wav):
                print("missing line", wav)
                raise SystemExit(1)
            at = kstart + ln["t"] + LINE_MARGIN
            inputs += ["-i", wav]
            ms = int(round(at * 1000))
            filters.append(
                f"[{idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
                f"volume=1.6,adelay={ms}|{ms}[a{idx}]"
            )
            mix_labels.append(f"[a{idx}]")
            idx += 1
            n_lines += 1

    # ---- opening bed (first 12.083 s only) ----
    amb_chain = f"{V8}/audio/AMB_chain.wav"
    if os.path.exists(amb_chain):
        inputs += ["-i", amb_chain]
        filters.append(
            f"[{idx}:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,"
            f"atrim=0:{OPEN_PAD:.6f},volume=0.75,"
            f"afade=t=in:d=1.2,afade=t=out:st={OPEN_PAD-1.6:.6f}:d=1.6[a{idx}]"
        )
        mix_labels.append(f"[a{idx}]")
        idx += 1

    n = len(mix_labels)
    filters.append(
        f"{''.join(mix_labels)}amix=inputs={n}:duration=longest:dropout_transition=0,"
        f"atrim=0:{TOTAL + OPEN_PAD:.6f},apad=whole_dur={TOTAL + OPEN_PAD:.6f}[mix]"
    )

    fc = ";".join(filters)
    mixed = f"{OUT}/MIX_ANCHORED.wav"
    cmd = (
        "ffmpeg -hide_banner -loglevel error -y "
        + " ".join(inputs)
        + f' -filter_complex "{fc}" -map "[mix]" -ac 2 -ar 48000 "{mixed}"'
    )
    run(cmd, f"amix anchored ({n} stems, {n_lines} lines)")
    print("MIX", mixed, os.path.getsize(mixed))

    # ---- verify exact length ----
    r = subprocess.run(
        f'ffprobe -v error -show_entries format=duration -of csv=p=0 "{mixed}"',
        shell=True, capture_output=True, text=True)
    print("audio duration:", r.stdout.strip(), " target:", f"{TOTAL + OPEN_PAD:.6f}")


if __name__ == "__main__":
    main()
