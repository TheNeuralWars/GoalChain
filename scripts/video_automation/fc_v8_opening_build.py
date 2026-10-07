#!/usr/bin/env python3
"""v8 opening rebuild: insert B00a (The Harvest) + B00b (Neo-Citania) before B1.

Purpose: make the book's premise visible in the first 12 seconds —
8 million minds as crops, Neo-Citania as a processor — before the action block.

The dialogue stays re-cued (fc_v8_recue_mix) and the seams stay smooth
(fc_v8_smooth_seams). This only prepends 2 video units.
"""
import os
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
OPEN = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/opening"
OUT = f"{V8}/out"
os.makedirs(OUT, exist_ok=True)

SMOOTH = f"{OUT}/final_v8_SMOOTH.mp4"   # current best: recued dialogue + smooth seams
VIDEO_CUR = f"{OUT}/FC_v8_video_cur.mp4"
VIDEO_OPEN = f"{OUT}/FC_v8_video_OPEN.mp4"
AUDIO = f"{V8}/audio/MIX_SMOOTH.wav"
FINAL = f"{OUT}/final_v8_OPEN.mp4"

UNITS = [
    f"{OPEN}/B00a_the_harvest_239.mp4",
    f"{OPEN}/B00b_neo_citania_239.mp4",
    f"{V8}/units/B1_B1_harvest_city.mp4",
]


def run(cmd, step):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FAILED {step}\n{(r.stderr or '')[-2000:]}")
        raise SystemExit(1)
    print(f"ok {step}")
    return r.stdout.strip()


def probe(path):
    r = run(f'ffprobe -v error -show_entries stream=codec_type,duration,nb_frames,width,height '
            f'-of default=noprint_wrappers=1:noprint_wrappers=1 "{path}"', f"probe {os.path.basename(path)}")
    print(r)


def main():
    for p in [SMOOTH, AUDIO] + UNITS:
        if not os.path.exists(p):
            print("missing", p)
            raise SystemExit(1)

    # 1. extract current video from SMOOTH (strip audio)
    if not os.path.exists(VIDEO_CUR) or os.path.getsize(VIDEO_CUR) < 1_000_000:
        run(f'ffmpeg -hide_banner -loglevel error -y -i "{SMOOTH}" -an -c:v copy '
            f'-movflags +faststart "{VIDEO_CUR}"', "extract current video")

    # 2. concat B00a + B00b + current
    concat_list = f"{OUT}/opening_concat.txt"
    with open(concat_list, "w") as fh:
        for u in [f"{OPEN}/B00a_the_harvest_239.mp4", f"{OPEN}/B00b_neo_citania_239.mp4", VIDEO_CUR]:
            fh.write(f"file '{u}'\n")
    if os.path.exists(VIDEO_OPEN):
        os.remove(VIDEO_OPEN)
    run(f'ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "{concat_list}" '
        f'-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 24 -an '
        f'-movflags +faststart "{VIDEO_OPEN}"', "concat opening")

    # 3. extract audio from SMOOTH
    tmp_audio = f"{OUT}/MIX_open.wav"
    if not os.path.exists(tmp_audio) or os.path.getsize(tmp_audio) < 1_000_000:
        run(f'ffmpeg -hide_banner -loglevel error -y -i "{SMOOTH}" -vn -c:a pcm_s16le "{tmp_audio}"',
            "extract audio")

    # 4. The video concat already shifted everything +12.083s. Dialogue in MIX_open
    #    must therefore shift by the SAME +12.083s to stay in sync with picture.
    PAD = 12.083333
    padded = f"{OUT}/MIX_open_pad.wav"
    run(f'ffmpeg -hide_banner -loglevel error -y -i "{tmp_audio}" '
        f'-af "adelay={int(PAD*1000)}|{int(PAD*1000)}" -ac 2 -ar 48000 "{padded}"',
        "pad audio")

    # 5. mux
    if os.path.exists(FINAL):
        os.remove(FINAL)
    run(f'ffmpeg -hide_banner -loglevel error -y -i "{VIDEO_OPEN}" -i "{padded}" '
        f'-map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ac 2 -ar 48000 '
        f'-movflags +faststart -shortest "{FINAL}"', "mux")
    probe(FINAL)
    print("FINAL", FINAL, os.path.getsize(FINAL))


if __name__ == "__main__":
    main()
