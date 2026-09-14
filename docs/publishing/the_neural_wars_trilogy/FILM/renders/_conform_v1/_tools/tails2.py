#!/usr/bin/env python3
"""Analisis fino de colas: RMS por ventana (decodificado a PCM mono 8k en Python)
+ freezedetect laxo para detectar 'colas quietas' (near-static) y bordes.
Salida: _conform_v1/_tools/tails2.json
"""
import json, os, re, subprocess, statistics, array

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
OUT = os.path.join(ROOT, "_conform_v1", "_tools", "tails2.json")
SR = 8000


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.stdout + p.stderr


def pcm_mono(f):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR),
                        "-f", "s16le", "-"], capture_output=True)
    a = array.array("h")
    a.frombytes(p.stdout[:len(p.stdout) // 2 * 2])
    return a


def win_rms(a, win=0.5):
    n = int(SR * win)
    out = []
    for i in range(0, len(a) - n + 1, n):
        s = a[i:i + n]
        m = sum(x * x for x in s) / len(s)
        out.append(10 * (m ** 0.5) / 32768.0)
    return [round(20 * __import__("math").log10(v) if v > 0 else -99.0, 1) for v in
            [(10 ** (x / 20)) for x in out]]  # placeholder replaced below


def win_db(a, win=0.5):
    import math
    n = int(SR * win)
    out = []
    for i in range(0, len(a) - n + 1, n):
        s = a[i:i + n]
        m = sum(x * x for x in s) / len(s)
        out.append(round(20 * math.log10((m ** 0.5) / 32768.0), 1) if m > 0 else -99.0)
    return out


def freezedetect(f, n="-45dB", d="0.40"):
    o = run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-vf",
             f"freezedetect=n={n}:d={d}", "-an", "-f", "null", "-"])
    return {"starts": [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", o)],
            "durs": [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", o)]}


res = {}
for k in range(1, 9):
    sid = f"FC-S0{k}"
    cut = os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4")
    a = pcm_mono(cut)
    db = win_db(a, 0.5)
    dur = len(a) / SR
    med = statistics.median(db)
    thr = med - 12
    # cola baja: desde el final, ventanas consecutivas < thr
    i = len(db) - 1
    while i >= 0 and db[i] < thr:
        i -= 1
    tail_low_start = (i + 1) * 0.5 if i < len(db) - 1 else None
    # cabeza baja
    j = 0
    while j < len(db) and db[j] < thr:
        j += 1
    head_low_end = j * 0.5 if j > 0 else None
    res[sid] = {"duration_s": round(dur, 3), "rms_median_db": med, "threshold_db": round(thr, 1),
                "head_low_end_s": head_low_end, "tail_low_start_s": tail_low_start,
                "windows_db": db, "freeze_-45dB_0.4": freezedetect(cut)}
    print(sid, "dur=%.2f" % dur, "med=%.1f" % med, "thr=%.1f" % thr,
          "head_low_end=", head_low_end, "tail_low_start=", tail_low_start,
          "freezes=", list(zip(res[sid]["freeze_-45dB_0.4"]["starts"], res[sid]["freeze_-45dB_0.4"]["durs"]))[:6],
          flush=True)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(res, open(OUT, "w"), indent=1)
print("WROTE", OUT)