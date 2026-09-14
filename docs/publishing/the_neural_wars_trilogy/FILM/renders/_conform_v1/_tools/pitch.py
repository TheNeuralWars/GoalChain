#!/usr/bin/env python3
"""Pitch dominante del drone (20-250 Hz) por shot: mide la FUNDAMENTAL media.
Evidencia para justificar continuidad musical (beds distintos por plano).
"""
import json, os, subprocess, numpy as np

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
SR = 16000
NOTES = {32.7: "C1", 36.7: "D1", 41.2: "E1", 43.65: "F1", 49.0: "G1", 55.0: "A1",
         61.7: "B1", 65.4: "C2", 73.4: "D2", 82.4: "E2", 87.3: "F2", 98.0: "G2",
         110.0: "A2", 123.5: "B2", 130.8: "C3", 146.8: "D3", 164.8: "E3"}


def pcm(f):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(p.stdout, dtype="<f4")


def dom(x, sr=SR):
    n = 16384
    frames = [x[i:i + n] for i in range(0, max(1, len(x) - n), n // 2)]
    freqs = np.fft.rfftfreq(n, 1 / sr)
    band = (freqs >= 25) & (freqs <= 250)
    peaks = []
    for f in frames:
        if len(f) < n:
            f = np.pad(f, (0, n - len(f)))
        P = np.abs(np.fft.rfft(f * np.hanning(n))) ** 2
        seg = P[band]
        if seg.sum() <= 0:
            continue
        peaks.append(freqs[band][np.argmax(seg)])
    p = float(np.median(peaks)) if peaks else 0.0
    near = min(NOTES, key=lambda k: abs(k - p)) if p else 0
    return {"dom_hz": round(p, 1), "nearest_note": NOTES.get(near, "?"), "note_hz": near,
            "spread_hz": round(float(np.percentile(peaks, 90) - np.percentile(peaks, 10)), 1) if peaks else 0.0}


res = {}
for k in range(1, 9):
    sid = f"FC-S0{k}"
    d = os.path.join(ROOT, sid)
    res[sid] = {"cut": dom(pcm(os.path.join(d, f"{sid}_cut_v1.mp4"))), "shots": {}}
    print("==", sid, "CUT", res[sid]["cut"], flush=True)
    for j in range(1, 9):
        sp = os.path.join(d, f"{sid}-{j:02d}.mp4")
        if not os.path.exists(sp):
            continue
        r = dom(pcm(sp))
        res[sid]["shots"][f"{sid}-{j:02d}"] = r
        print("   ", f"{sid}-{j:02d}", r, flush=True)

json.dump(res, open(os.path.join(ROOT, "_conform_v1", "_tools", "pitch.json"), "w"), indent=1)
print("WROTE pitch.json")