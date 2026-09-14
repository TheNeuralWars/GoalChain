#!/usr/bin/env python3
"""Detecta colas muertas (freeze de video) y colas de baja energia en los cuts FC."""
import json, subprocess, re, os, statistics

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
OUT = os.path.join(ROOT, "_conform_v1", "_tools", "tails.json")


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.stdout + p.stderr


def freezedetect(f, n="-60dB", d="0.30"):
    out = run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-vf",
               f"freezedetect=n={n}:d={d}", "-an", "-f", "null", "-"])
    st = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", out)]
    en = [float(x) for x in re.findall(r"freeze_end: ([\d.]+)", out)]
    du = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", out)]
    return {"freeze_start": st, "freeze_end": en, "freeze_duration": du}


def rms_windows(f, win=1.0):
    """RMS por ventana via astats reset=1 (una linea por ventana)."""
    out = run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af",
               f"astats=metadata=1:reset={int(44100*win)}:length={win}",
               "-f", "null", "-"])
    vals = [float(x) for x in re.findall(r"lavfi\.astats\.Overall\.RMS_level=(-?[\d.]+)", out)]
    return vals


def dur(f):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", f])
    return float(out.strip())


res = {}
for n in range(1, 9):
    sid = f"FC-S0{n}"
    cut = os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4")
    d = dur(cut)
    fz = freezedetect(cut)
    rms = rms_windows(cut)
    med = statistics.median(rms) if rms else None
    tail_rms = rms[-1] if rms else None
    res[sid] = {"duration_s": d, "freeze": fz, "rms_per_sec": rms,
                "rms_median": med, "rms_last_sec": tail_rms}
    print(sid, "dur=%.2f" % d, "freeze=", list(zip(fz["freeze_start"], fz["freeze_duration"])),
          "rms_med=%.1f" % (med if med is not None else -99),
          "rms_last=%.1f" % (tail_rms if tail_rms is not None else -99),
          "rms_tail3=", ["%.1f" % v for v in rms[-3:]], flush=True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(res, open(OUT, "w"), indent=1)
print("WROTE", OUT)