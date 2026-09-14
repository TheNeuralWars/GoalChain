#!/usr/bin/env python3
"""Verificacion del conformado: fades, cama, sincronia, consistencia entre escenas."""
import json, os, re, subprocess, numpy as np

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
OUTDIR = os.path.join(ROOT, "_conform_v1")
SR = 16000


def sh(c):
    p = subprocess.run(c, capture_output=True, text=True)
    return p.stdout + p.stderr


def pcm(f, extra=()):
    p = subprocess.run(["ffmpeg", "-v", "error", *extra, "-i", f, "-ac", "1",
                        "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    return np.frombuffer(p.stdout, dtype="<f4")


def loud(f):
    o = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af",
            "loudnorm=print_format=json", "-f", "null", "-"])
    d = json.loads(re.search(r"\{[^{}]*input_i[^{}]*\}", o, re.S).group(0))
    return {k: float(v) for k, v in d.items() if k != "normalization_type"}


def low_ratio(x, sr=SR):
    n = 8192
    fr = np.fft.rfftfreq(n, 1 / sr)
    P = np.zeros(len(fr))
    cnt = 0
    for i in range(0, len(x) - n, n * 4):
        P += np.abs(np.fft.rfft(x[i:i + n] * np.hanning(n))) ** 2
        cnt += 1
    if cnt == 0:
        return 0.0
    return float(P[(fr > 20) & (fr < 120)].sum() / P.sum())


def db(x):
    return 20 * np.log10(max(float(np.sqrt(np.mean(x ** 2))), 1e-9))


res = {}
rows = []
for k in range(1, 9):
    sid = f"FC-S0{k}"
    src = os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4")
    out = os.path.join(OUTDIR, f"{sid}_cut_conform.mp4")
    a = pcm(out)
    b = pcm(src)
    head = db(a[:int(0.05 * SR)])          # 50 ms: el fade-in es una rampa de 0.5 s
    ramp = [round(db(a[int(t * SR):int(t * SR) + int(0.05 * SR)]), 1)
            for t in (0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6)]
    body = db(a[int(1.5 * SR):int(3.5 * SR)])
    tail = db(a[-int(0.20 * SR):])
    L = loud(out)
    # sincronia (lag 0?)
    n = min(len(a), len(b))
    seg_a = a[10 * SR:40 * SR] if n > 40 * SR else a[:n // 2]
    seg_b = b[10 * SR:40 * SR] if n > 40 * SR else b[:n // 2]
    m = min(len(seg_a), len(seg_b))
    seg_a, seg_b = seg_a[:m], seg_b[:m]
    cors = []
    for lag_ms in (-200, -100, 0, 100, 200):
        l = int(lag_ms / 1000 * SR)
        s2 = np.roll(seg_b, l) if l else seg_b
        cors.append((lag_ms, round(float(np.dot(seg_a, s2) /
                    (np.linalg.norm(seg_a) * np.linalg.norm(s2) + 1e-12)), 3)))
    best = max(cors, key=lambda t: t[1])
    r = {"loudness": {kk: L[kk] for kk in ("input_i", "input_tp", "input_lra")},
         "head_50ms_dbfs": round(head, 1), "body_dbfs": round(body, 1),
         "ramp_in_dbfs": ramp,
         "tail_200ms_dbfs": round(tail, 1),
         "fade_in_ok": bool(head < body - 15), "fade_out_ok": bool(tail < body - 12),
         "low_ratio_src": round(low_ratio(b), 3), "low_ratio_out": round(low_ratio(a), 3),
         "sync_best_lag_ms": best[0], "sync_corr": best[1]}
    res[sid] = r
    rows.append((sid, r))
    print(f"{sid} I={L['input_i']:.2f} TP={L['input_tp']:.2f} head50={r['head_50ms_dbfs']}"
          f" body={r['body_dbfs']} tail={r['tail_200ms_dbfs']} fi={r['fade_in_ok']}"
          f" fo={r['fade_out_ok']} low {r['low_ratio_src']}->{r['low_ratio_out']}"
          f" lag={best[0]}ms(corr {best[1]})", flush=True)

Is = [r["loudness"]["input_i"] for _, r in rows]
tps = [r["loudness"]["input_tp"] for _, r in rows]
summary = {"I_min": min(Is), "I_max": max(Is), "I_spread_db": round(max(Is) - min(Is), 2),
           "TP_max": max(tps),
           "fade_in_ok": all(r["fade_in_ok"] for _, r in rows),
           "fade_out_ok": all(r["fade_out_ok"] for _, r in rows),
           "sync_ok": all(abs(r["sync_best_lag_ms"]) <= 100 for _, r in rows)}
res["_summary"] = summary
json.dump(res, open(os.path.join(OUTDIR, "_tools", "verify.json"), "w"), indent=1)
print("SUMMARY", json.dumps(summary))