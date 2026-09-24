#!/usr/bin/env python3
"""Rebuild scene cuts as *_cut_v2.mp4 (never overwrites _cut_v1.mp4).

- per-shot clips are normalised (1280x720, 24 fps, aac stereo; silent track added
  when a clip has no audio) into a temp dir
- then concatenated with the concat demuxer
- emits a manifest with durations for the assembly doc
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
RENDERS = FILM / "renders"
TMP = RENDERS / "_cutbuild_tmp"
ORDER = ["FC-S01", "FC-S02", "FC-S03", "FC-S04", "FC-S05", "FC-S06", "FC-S06A", "FC-S07", "FC-S08"]


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def has_audio(path: Path) -> bool:
    p = run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
             "stream=codec_type", "-of", "csv=p=0", str(path)])
    return bool(p.stdout.strip())


def duration(path: Path) -> float:
    p = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)])
    try:
        return float(p.stdout.strip())
    except Exception:
        return 0.0


def norm(src: Path, dst: Path) -> bool:
    vf = ("scale=1280:720:force_original_aspect_ratio=decrease,"
          "pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,fps=24,setsar=1")
    base = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(src)]
    if has_audio(src):
        cmd = base + ["-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                      "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
                      "-ac", "2", "-movflags", "+faststart", str(dst)]
    else:
        cmd = base + ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
                      "-shortest", "-vf", vf, "-c:v", "libx264", "-preset", "veryfast",
                      "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                      "-movflags", "+faststart", str(dst)]
    p = run(cmd)
    if p.returncode != 0:
        print(f"  !! normalize failed {src.name}: {p.stderr.strip()[:200]}")
        return False
    return True


manifest = {}
only = sys.argv[1:] or ORDER
for scene in only:
    sdir = RENDERS / scene
    if not sdir.is_dir():
        print(f"skip {scene} (no dir)")
        continue
    shots = sorted(p for p in sdir.glob(f"{scene}-*.mp4")
                   if not re.search(r"_(cut_v\d|norm)\.mp4$", p.name))
    if not shots:
        print(f"skip {scene} (no per-shot mp4)")
        continue
    TMP.mkdir(parents=True, exist_ok=True)
    normed = []
    for s in shots:
        n = TMP / f"{scene}__{s.stem}.mp4"
        if not n.exists() and not norm(s, n):
            continue
        normed.append(n)
    lst = TMP / f"{scene}_concat.txt"
    lst.write_text("".join(f"file '{n}'\n" for n in normed))
    out = sdir / f"{scene}_cut_v2.mp4"
    p = run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat",
             "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(out)])
    if p.returncode != 0:
        p = run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0",
                 "-i", str(lst), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                 "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out)])
    if p.returncode != 0:
        print(f"  !! concat failed {scene}: {p.stderr.strip()[:200]}")
        continue
    manifest[scene] = {
        "cut": str(out),
        "shots": [s.stem for s in shots],
        "duration_s": round(duration(out), 2),
        "per_shot_s": {s.stem: round(duration(s), 2) for s in shots},
    }
    print(f"OK {scene}: {len(shots)} shots, {manifest[scene]['duration_s']}s -> {out.name}")

(RENDERS / "_cutbuild_tmp" / "cuts_manifest.json").write_text(json.dumps(manifest, indent=2))
total = sum(v["duration_s"] for v in manifest.values())
print(f"\nTOTAL {len(manifest)} cuts, {round(total,2)}s ({round(total/60,2)} min)")
