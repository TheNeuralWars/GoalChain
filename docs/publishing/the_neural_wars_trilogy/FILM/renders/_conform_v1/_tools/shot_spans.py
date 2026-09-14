#!/usr/bin/env python3
"""Detecta spans near-static en cabeza/cola de CADA shot (video near-static, -50dB).
Salida: _conform_v1/_tools/shot_spans.json  (candidate trims)
"""
import json, os, re, subprocess

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
OUT = os.path.join(ROOT, "_conform_v1", "_tools", "shot_spans.json")


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.stdout + p.stderr


def dur(f):
    o = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", f])
    return float(o.strip())


def fd(f, n="-50dB", d="0.35"):
    o = run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-vf",
             f"freezedetect=n={n}:d={d}", "-an", "-f", "null", "-"])
    st = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", o)]
    du = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", o)]
    return list(zip(st, du))


res = {}
for k in range(1, 9):
    sid = f"FC-S0{k}"
    d = os.path.join(ROOT, sid)
    res[sid] = {}
    for j in range(1, 9):
        sp = os.path.join(d, f"{sid}-{j:02d}.mp4")
        if not os.path.exists(sp):
            continue
        D = dur(sp)
        spans = fd(sp)
        head = None
        tail = None
        for s, dd in spans:
            if s <= 0.30:                      # span pegado a la cabeza
                head = max(head or 0, s + dd)
            if s + dd >= D - 0.30:             # span pegado a la cola
                tail = min(tail or 1e9, s)
        res[sid][f"{sid}-{j:02d}"] = {"dur": round(D, 3),
                                      "spans": [[round(s, 2), round(x, 2)] for s, x in spans],
                                      "head_static_end": round(head, 3) if head else None,
                                      "tail_static_start": round(tail, 3) if tail else None}
        print(f"{sid}-{j:02d} dur=%.2f" % D, "head=", res[sid][f"{sid}-{j:02d}"]["head_static_end"],
              "tail=", res[sid][f"{sid}-{j:02d}"]["tail_static_start"],
              "spans=", res[sid][f"{sid}-{j:02d}"]["spans"][:5], flush=True)

json.dump(res, open(OUT, "w"), indent=1)
print("WROTE", OUT)