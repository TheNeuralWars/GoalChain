#!/usr/bin/env python3
"""Evidencia objectiva de 'no hay cama musical': flatness espectral (Wiener entropy)
y reparto de energia por bandas en cada cut y en el agregado del film.
"""
import json, os, subprocess, numpy as np

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
SR = 16000


def pcm(f):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(p.stdout, dtype="<f4")


def analyze(x, sr=SR):
    n = 4096
    hop = n
    frames = [x[i:i + n] for i in range(0, len(x) - n, hop)]
    fl, lf, hf, cen = [], [], [], []
    freqs = np.fft.rfftfreq(n, 1 / sr)
    for f in frames:
        w = f * np.hanning(n)
        P = np.abs(np.fft.rfft(w)) ** 2 + 1e-12
        band = (freqs > 80) & (freqs < 5000)
        Pb = P[band]
        gm = np.exp(np.mean(np.log(Pb)))
        am = np.mean(Pb)
        fl.append(gm / am)
        lf.append(P[(freqs > 20) & (freqs < 120)].sum() / P.sum())
        hf.append(P[freqs > 4000].sum() / P.sum())
        cen.append((freqs * P).sum() / P.sum())
    return {"flatness": float(np.mean(fl)), "low_frac": float(np.mean(lf)),
            "high_frac": float(np.mean(hf)), "centroid_hz": float(np.mean(cen)),
            "frames": len(frames)}


out = {}
for k in range(1, 9):
    sid = f"FC-S0{k}"
    x = pcm(os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4"))
    r = analyze(x)
    out[sid] = r
    print(sid, "flatness=%.3f" % r["flatness"], "low<120Hz=%.3f" % r["low_frac"],
          "high>4k=%.3f" % r["high_frac"], "centroid=%.0fHz" % r["centroid_hz"], flush=True)

json.dump(out, open(os.path.join(ROOT, "_conform_v1", "_tools", "tonality.json"), "w"), indent=1)
print("WROTE tonality.json")