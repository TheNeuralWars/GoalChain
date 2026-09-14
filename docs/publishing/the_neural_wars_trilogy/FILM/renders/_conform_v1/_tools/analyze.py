#!/usr/bin/env python3
"""Pass BARATO :: analisis read-only de los cuts Fractured Code.
Mide por cut y por shot: loudness (EBU R128), RMS, true peak, espectro (flatness/centroid),
silencios head/tail. Escribe JSON. NO escribe media.
"""
import json, subprocess, sys, os, re

ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM/renders"
OUT = os.path.join(ROOT, "_conform_v1", "_tools", "analysis.json")


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def loudness(f, extra=None):
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", f]
    if extra:
        cmd += extra
    cmd += ["-af", "loudnorm=print_format=json", "-f", "null", "-"]
    rc, out = run(cmd)
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", out, re.S)
    if not m:
        return {"error": out[-400:]}
    d = json.loads(m.group(0))
    return {k: float(v) for k, v in d.items() if k != "normalization_type"}


def astats(f, stream_filter=None, af=None):
    a = af or "astats=metadata=1:reset=0"
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", f]
    if stream_filter:
        cmd += stream_filter
    cmd += ["-af", a, "-f", "null", "-"]
    rc, out = run(cmd)
    res = {}
    for key in ("RMS level dB", "Peak level dB", "Flat factor", "Noise floor dB",
                "Dynamic range", "Zero crossings rate", "Entropy"):
        vals = re.findall(r"%s:\s*(-?[\d.]+|-inf)" % re.escape(key), out)
        if vals:
            res[key] = vals[-1]
    if "overall" in out:
        # tomar bloque Overall
        tail = out[out.rfind("Overall"):]
        for key in ("RMS level dB", "Peak level dB", "Flat factor", "Noise floor dB",
                    "Dynamic range", "Zero crossings rate", "Entropy"):
            vals = re.findall(r"%s:\s*(-?[\d.]+|-inf)" % re.escape(key), tail)
            if vals:
                res["overall_" + key] = vals[-1]
    return res


def silencedetect(f, thresh="-45dB", mind="0.30"):
    rc, out = run(["ffmpeg", "-hide_banner", "-nostats", "-i", f, "-af",
                   f"silencedetect=noise={thresh}:d={mind}", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: (-?[\d.]+)", out)]
    durs = [float(x) for x in re.findall(r"silence_duration: ([\d.]+)", out)]
    return {"silence_start": starts, "silence_end": ends, "silence_duration": durs}


def dur(f):
    rc, out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                   "-of", "default=nw=1:nk=1", f])
    return float(out.strip())


def spectral(f, stream=None):
    """flatness/centroid medios via aspectralstats (si existe)."""
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", f]
    if stream:
        cmd += stream
    cmd += ["-af", "aspectralstats=measure=flatness:win_size=4096,ametadata=mode=print:file=-",
            "-f", "null", "-"]
    rc, out = run(cmd)
    vals = [float(x) for x in re.findall(r"lavfi\.aspectralstats\.flatness=([\d.]+)", out)]
    if not vals:
        return None
    return {"flatness_mean": sum(vals) / len(vals), "n": len(vals)}


def main():
    result = {"cuts": {}, "shots": {}}
    for n in range(1, 9):
        sid = f"FC-S0{n}"
        d = os.path.join(ROOT, sid)
        cut = os.path.join(d, f"{sid}_cut_v1.mp4")
        entry = {"path": cut, "duration_s": dur(cut)}
        entry["loudness"] = loudness(cut)
        entry["astats"] = astats(cut)
        entry["silence_-45_0.30"] = silencedetect(cut)
        entry["silence_-40_0.50"] = silencedetect(cut, "-40dB", "0.50")
        entry["spectral"] = spectral(cut)
        # per-shot: cortar por indice si los shots existen
        shots = []
        for k in range(1, 9):
            sp = os.path.join(d, f"{sid}-{k:02d}.mp4")
            if not os.path.exists(sp):
                continue
            s = {"id": f"{sid}-{k:02d}", "duration_s": dur(sp),
                 "loudness": loudness(sp), "astats": astats(sp),
                 "silence": silencedetect(sp, "-40dB", "0.40")}
            shots.append(s)
        entry["shots"] = shots
        result["cuts"][sid] = entry
        print(sid, "I=%.2f" % entry["loudness"].get("input_i", 999),
              "TP=%.2f" % entry["loudness"].get("input_tp", 999),
              "LRA=%.2f" % entry["loudness"].get("input_lra", 999),
              "shots=%d" % len(shots), flush=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(result, open(OUT, "w"), indent=1)
    print("WROTE", OUT)


if __name__ == "__main__":
    main()