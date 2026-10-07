#!/usr/bin/env python3
"""v8 opening build + sound bed under the 2 new shots.

The 2 new shots (B00a The Harvest, B00b Neo-Citania) arrive cold with
no ambience. We reuse the first 12s of the existing AMB chain (which is
the harvest-city bed, thematically correct) and crossfade it into the
existing mix so the opening is not dead silent.
"""
import os
import subprocess

V8 = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/v8"
OPEN = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/edit/opening"
OUT = f"{V8}/out"
os.makedirs(OUT, exist_ok=True)

SMOOTH = f"{OUT}/final_v8_SMOOTH.mp4"
AUDIO = f"{V8}/audio/MIX_SMOOTH.wav"
AMB_CHAIN = f"{V8}/audio/AMB_chain.wav"
VIDEO_CUR = f"{OUT}/FC_v8_video_cur.mp4"
VIDEO_OPEN = f"{OUT}/FC_v8_video_OPEN.mp4"
FINAL = f"{OUT}/final_v8_OPEN.mp4"

PAD = 12.083333  # 2 units * 6.041667


def run(cmd, step):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FAILED {step}\n{(r.stderr or '')[-2000:]}")
        raise SystemExit(1)
    print(f"ok {step}")
    return r.stdout.strip()


def probe(path):
    r = run(f'ffprobe -v error -show_entries stream=codec_type,duration,nb_frames,width,height '
            f'-of default=noprint_wrappers=1 "{path}"', f"probe {os.path.basename(path)}")
    print(r)


def main():
    # 1. concat 2 new shots + existing video
    if not os.path.exists(VIDEO_CUR) or os.path.getsize(VIDEO_CUR) < 1_000_000:
        run(f'ffmpeg -hide_banner -loglevel error -y -i "{SMOOTH}" -an -c:v copy '
            f'-movflags +faststart "{VIDEO_CUR}"', "extract current video")

    concat_list = f"{OUT}/opening_concat.txt"
    with open(concat_list, "w") as fh:
        for u in [f"{OPEN}/B00a_the_harvest_239.mp4", f"{OPEN}/B00b_neo_citania_239.mp4", VIDEO_CUR]:
            fh.write(f"file '{u}'\n")
    if os.path.exists(VIDEO_OPEN):
        os.remove(VIDEO_OPEN)
    run(f'ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "{concat_list}" '
        f'-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 24 -an '
        f'-movflags +faststart "{VIDEO_OPEN}"', "concat opening")

    # 2. extract existing audio
    base = f"{OUT}/MIX_open.wav"
    if not os.path.exists(base) or os.path.getsize(base) < 1_000_000:
        run(f'ffmpeg -hide_banner -loglevel error -y -i "{SMOOTH}" -vn -c:a pcm_s16le "{base}"',
            "extract audio")

    # 3. build the opening bed: take the first 12.083s of the existing AMB_chain
    #    (harvest-city bed) and use it under the new shots.
    bed = f"{OUT}/opening_bed.wav"
    run(f'ffmpeg -hide_banner -loglevel error -y -t {PAD} -i "{AMB_CHAIN}" '
        f'-af "afade=t=in:d=1.0,afade=t=out:st={PAD-1.5:.3f}:d=1.5,volume=0.75" '
        f'-ac 2 -ar 48000 "{bed}"', "opening bed")

    # 4. pad existing audio + bed
    padded = f"{OUT}/MIX_open_pad.wav"
    run(f'ffmpeg -hide_banner -loglevel error -y -i "{base}" '
        f'-af "adelay={int(PAD*1000)}|{int(PAD*1000)}" -ac 2 -ar 48000 "{padded}"', "pad audio")

    # 5. amix bed (first 12s) + padded (rest). The bed already fades out in step 3,
    #    so we just mix them. No global afade here (it would silence the whole mix).
    mixed = f"{OUT}/MIX_open_bed.wav"
    run(f'ffmpeg -hide_banner -loglevel error -y -i "{bed}" -i "{padded}" '
        f'-filter_complex "[0:a]apad=whole_dur={PAD}[a0];[a0][1:a]amix=inputs=2:duration=longest:dropout_transition=0[out]" '
        f'-map "[out]" -ac 2 -ar 48000 "{mixed}"', "mix bed+padded")

    # 6. mux
    if os.path.exists(FINAL):
        os.remove(FINAL)
    run(f'ffmpeg -hide_banner -loglevel error -y -i "{VIDEO_OPEN}" -i "{mixed}" '
        f'-map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ac 2 -ar 48000 '
        f'-movflags +faststart "{FINAL}"', "mux")
    probe(FINAL)
    print("FINAL", FINAL, os.path.getsize(FINAL))


if __name__ == "__main__":
    main()
