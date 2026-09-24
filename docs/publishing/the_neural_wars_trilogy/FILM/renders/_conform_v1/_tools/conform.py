#!/usr/bin/env python3
"""CONFORM v1 - Fractured Code (pass BARATO, sin regenerar imagen/video con IA).

Por escena:
  1) recorte de colas/entradas quietas (medidas, documentadas)
  2) loudnorm 2-pasadas a -20 LUFS / -2 dBTP, modo lineAL (preserva dinamica)
  3) cama musical continua (canon 528 Hz, WAV determinista) recortada en fase
     segun el offset del film, mezclada suave
  4) fade in 0.5 s / fade out 1.0 s  (el "fade cruzado" al inicio/fin)

Uso:
  python3 conform.py --scenes 1 2 3 ...     (por defecto todas)
  python3 conform.py --master               (arma el film completo con acrossfade)
"""
import argparse, json, math, os, re, subprocess, sys

FILM = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM"
ROOT = os.path.join(FILM, "renders")
OUTDIR = os.path.join(ROOT, "_conform_v1")
TOOLS = os.path.join(OUTDIR, "_tools")
STEMS = os.path.join(TOOLS, "stems")
TMP = os.path.join(TOOLS, "tmp")
BED = "/tmp/bed_full.wav"
BED_GAIN_DB = -13.26          # pcm de la cama (-6 dBFS pico) -> ~-30 LUFS
TARGET_I, TARGET_TP, TARGET_LRA = -20.0, -2.0, 11.0
FADE_IN, FADE_OUT = 0.5, 1.0
XFADE = 0.8

# Recortes medidos (script _tools/shot_spans.py + freezedetect -45dB/0.35)
#  FC-S03: 0.5417 s de cabeza estatica en el plano 4 (t=24.125..24.6667)
#  FC-S05: cola near-static del plano 8 (freeze 63.148..64.065) -> fin en 63.05
TRIMS = {"FC-S03": {"cut": [(24.125, 24.6667)]},
         "FC-S05": {"end": 63.05}}

for d in (OUTDIR, TOOLS, STEMS, TMP):
    os.makedirs(d, exist_ok=True)


def sh(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout + p.stderr


def dur(f):
    rc, o = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "default=nw=1:nk=1", f])
    return float(o.strip())


def vid_dur(f):
    """Duracion del stream de video (evita el padding AAC del contenedor)."""
    rc, o = sh(["ffprobe", "-v", "error", "-select_streams", "v",
                "-show_entries", "stream=duration,nb_frames,r_frame_rate",
                "-of", "json", f])
    try:
        st = json.loads(o)["streams"][0]
        if st.get("duration"):
            return float(st["duration"])
        num, den = st["nb_frames"], 1
        fr = st["r_frame_rate"].split("/")
        return int(st["nb_frames"]) * float(fr[1]) / float(fr[0])
    except Exception:
        return dur(f)


def probe(f):
    rc, o = sh(["ffprobe", "-v", "error", "-show_entries",
                "format=duration,size,bit_rate",
                "-show_entries", "stream=codec_name,codec_type,width,height,"
                "r_frame_rate,sample_rate,channels",
                "-of", "json", f])
    return json.loads(o)


def loud(f, extra_input=None):
    cmd = ["ffmpeg", "-hide_banner", "-nostats"]
    if extra_input:
        cmd += extra_input
    cmd += ["-i", f, "-af", "loudnorm=print_format=json", "-f", "null", "-"]
    rc, o = sh(cmd)
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", o, re.S)
    if not m:
        raise RuntimeError("loudnorm fallo para %s: %s" % (f, o[-500:]))
    d = json.loads(m.group(0))
    return {k: float(v) for k, v in d.items() if k != "normalization_type"}


def make_source(sid):
    """Devuelve (path_fuente, duracion, nota_de_recorte)."""
    src = os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4")
    tr = TRIMS.get(sid)
    if not tr:
        return src, vid_dur(src), "sin recorte (no se detectaron colas muertas)"
    out = os.path.join(TMP, f"{sid}_trim.mp4")
    fc = ""
    if "cut" in tr:
        (a, b) = tr["cut"][0]
        fc = (f"[0:v]trim=end={a},setpts=PTS-STARTPTS[v1];"
              f"[0:a]atrim=end={a},asetpts=PTS-STARTPTS[a1];"
              f"[0:v]trim=start={b},setpts=PTS-STARTPTS[v2];"
              f"[0:a]atrim=start={b},asetpts=PTS-STARTPTS[a2];"
              f"[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]")
        note = "recorte interno %.3f-%.3f s (cabeza estatica del plano) = -%.3f s" % (
            a, b, b - a)
    else:
        end = tr["end"]
        fc = (f"[0:v]trim=end={end},setpts=PTS-STARTPTS[v];"
              f"[0:a]atrim=end={end},asetpts=PTS-STARTPTS[a]")
        note = "recorte de cola quieta: fin en %.3f s = -%.3f s" % (end, dur(src) - end)
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", src, "-filter_complex", fc,
           "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "18",
           "-preset", "medium", "-pix_fmt", "yuv420p", "-r", "24",
           "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2", out]
    rc, o = sh(cmd)
    if rc != 0:
        raise RuntimeError("trim fallo %s: %s" % (sid, o[-600:]))
    return out, vid_dur(out), note


def norm_stem(sid, src, D):
    """loudnorm 2 pasadas -> stem WAV a -20 LUFS (ganancia lineal, sin comprimir)."""
    m = loud(src)
    stem = os.path.join(STEMS, f"{sid}_norm.wav")
    af = (f"loudnorm=I={TARGET_I}:TP={TARGET_TP}:LRA={TARGET_LRA}:linear=true:"
          f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:"
          f"offset={m['target_offset']}:print_format=summary")
    rc, o = sh(["ffmpeg", "-y", "-v", "error", "-i", src, "-vn", "-af", af,
                "-ar", "44100", "-ac", "2", "-c:a", "pcm_s16le", stem])
    if rc != 0:
        raise RuntimeError("loudnorm fallo %s: %s" % (sid, o[-600:]))
    return stem, m, o.strip().splitlines()


def mix_scene(sid, src, stem, offset, D, bed=BED, gain_db=BED_GAIN_DB,
              out=None, extra_prog=""):
    out = out or os.path.join(OUTDIR, f"{sid}_cut_conform.mp4")
    fade_out_st = max(0.0, D - FADE_OUT)
    prog = (f"[2:a]atrim=end={D:.3f},asetpts=PTS-STARTPTS,"
            f"highpass=f=30:poles=1{extra_prog}")
    fc = (f"{prog}[pa];[1:a]volume={gain_db}dB[be];"
          f"[pa][be]amix=inputs=2:duration=first:normalize=0,"
          f"afade=t=in:st=0:d={FADE_IN},afade=t=out:st={fade_out_st:.3f}:d={FADE_OUT},"
          f"alimiter=limit=0.794:level=disabled[mix]")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", src,
           "-ss", "%.3f" % offset, "-t", "%.3f" % D, "-i", bed, "-i", stem,
           "-filter_complex", fc, "-map", "0:v", "-map", "[mix]",
           "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
           "-ac", "2", "-movflags", "+faststart", "-map_metadata", "-1",
           "-t", "%.3f" % D, out]
    rc, o = sh(cmd)
    if rc != 0:
        raise RuntimeError("mix fallo %s: %s" % (sid, o[-700:]))
    return out


def fix_gain(sid, path, delta_db):
    tmp = path + ".fix.mp4"
    rc, o = sh(["ffmpeg", "-y", "-v", "error", "-i", path, "-map", "0:v", "-map", "0:a",
                "-af", f"volume={delta_db:.2f}dB,alimiter=limit=0.794:level=disabled",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", tmp])
    if rc != 0:
        raise RuntimeError("fix_gain fallo %s: %s" % (sid, o[-400:]))
    os.replace(tmp, path)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", nargs="*", type=int, default=list(range(1, 9)))
    ap.add_argument("--master", action="store_true")
    a = ap.parse_args()

    report_path = os.path.join(TOOLS, "conform_report.json")
    report = json.load(open(report_path)) if os.path.exists(report_path) else {}

    if not os.path.exists(BED):
        raise SystemExit("falta la cama musical %s (generala con bed.py)" % BED)
    bed_dur = dur(BED)

    # offsets = linea de tiempo del film (orden de escena)
    offsets, acc = {}, 0.0
    for k in range(1, 9):
        offsets[f"FC-S0{k}"] = acc
        p = os.path.join(OUTDIR, f"FC-S0{k}_cut_conform.mp4")
        d = dur(p) if os.path.exists(p) else dur(os.path.join(ROOT, f"FC-S0{k}",
                                                             f"FC-S0{k}_cut_v1.mp4"))
        acc += d
    total = acc

    for k in a.scenes:
        sid = f"FC-S0{k}"
        src, D, note = make_source(sid)
        off = offsets[sid]
        if off + D > bed_dur:
            raise SystemExit("cama musical demasiado corta (%.1f < %.1f)" % (bed_dur, off + D))
        stem, measure, summary = norm_stem(sid, src, D)
        out = mix_scene(sid, src, stem, off, D)
        got = loud(out)
        d_i = TARGET_I - got["input_i"]
        fixed = None
        if abs(d_i) > 0.35:
            fix_gain(sid, out, d_i)
            fixed = round(d_i, 2)
            got = loud(out)
        p = probe(out)
        vs = [s for s in p["streams"] if s["codec_type"] == "video"][0]
        as_ = [s for s in p["streams"] if s["codec_type"] == "audio"][0]
        report[sid] = {
            "source": os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4"),
            "output": out, "trim": note,
            "dur_in_s": round(dur(os.path.join(ROOT, sid, f"{sid}_cut_v1.mp4")), 3),
            "dur_out_s": round(vid_dur(out), 3),
            "bed_offset_s": round(off, 3),
            "loudness_in": {kk: measure[kk] for kk in
                            ("input_i", "input_tp", "input_lra")},
            "loudness_out": {"I": got["input_i"], "TP": got["input_tp"],
                             "LRA": got["input_lra"]},
            "gain_fix_db": fixed,
            "video": {"codec": vs["codec_name"], "w": vs["width"], "h": vs["height"],
                      "fps": vs["r_frame_rate"]},
            "audio": {"codec": as_["codec_name"], "sr": as_["sample_rate"],
                      "ch": as_["channels"]},
            "bytes": p["format"]["size"],
        }
        print(f"{sid}: {report[sid]['dur_in_s']}s -> {report[sid]['dur_out_s']}s  "
              f"I={got['input_i']:.2f} TP={got['input_tp']:.2f} LRA={got['input_lra']:.2f} "
              f"fix={fixed}  {note}", flush=True)
        json.dump(report, open(report_path, "w"), indent=1)

    if a.master:
        build_master(report, report_path)

    json.dump(report, open(report_path, "w"), indent=1)
    print("REPORT:", report_path)


def build_master(report, report_path):
    """Film completo (extra): video con xfade 0.8 s + UNA cama continua.

    Por etapas (grafos simples, mas robusto que un filter_complex unico):
      1) stems (programa puro, sin cama) -> acrossfade 0.8 s -> master_prog.wav
      2) master_prog + UNA cama continua (recorte unico) -> master_mix.wav
      3) mux sin recodificar video
    """
    sids = [f"FC-S0{k}" for k in range(1, 9)]
    stems = [os.path.join(STEMS, f"{s}_norm.wav") for s in sids]
    conf = [os.path.join(OUTDIR, f"{s}_cut_conform.mp4") for s in sids]
    outs = {}
    # --- etapa 1: video con xfade (si aun no existe) -------------------------
    rm = os.path.join(TMP, "master_av.mp4")
    if os.path.exists(rm):
        try:
            vid_dur(rm)
        except Exception:
            os.remove(rm)          # master previo corrupto/incompleto
    if not os.path.exists(rm):
        inputs, fc = [], []
        for i, f in enumerate(conf):
            inputs += ["-i", f]
            fc.append(f"[{i}:v]setpts=PTS-STARTPTS[v{i}]")
        v, d = "v0", vid_dur(conf[0])
        for i in range(1, len(conf)):
            off = d - XFADE
            fc.append(f"[{v}][v{i}]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[vx{i}]")
            v = f"vx{i}"
            d = off + vid_dur(conf[i])
        fc.append(f"[{v}]null[vout]")
        rc, o = sh(["ffmpeg", "-y", "-v", "error"] + inputs +
                   ["-filter_complex", ";".join(fc), "-map", "[vout]", "-an",
                    "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                    "-pix_fmt", "yuv420p", rm])
        if rc != 0:
            raise RuntimeError("master video xfade fallo: %s" % o[-800:])
    D = vid_dur(rm)
    print("master video dur %.3f" % D, flush=True)

    # --- etapa 2a: programa solo audio con acrossfade ------------------------
    if all(os.path.exists(s) for s in stems):
        inputs = []
        for s in stems:
            inputs += ["-i", s]
        fc = [f"[{i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[sa{i}]"
              for i in range(len(stems))]
        ac = "sa0"
        for i in range(1, len(stems)):
            fc.append(f"[{ac}][sa{i}]acrossfade=d={XFADE}:c1=tri:c2=tri[ac{i}]")
            ac = f"ac{i}"
        fc.append(f"[{ac}]atrim=end={D:.3f},asetpts=PTS-STARTPTS,highpass=f=30:poles=1,"
                  f"afade=t=in:st=0:d=1.5,afade=t=out:st={max(0.0, D-1.5):.3f}:d=1.5[mprog]")
        mp = os.path.join(TMP, "master_prog.wav")
        rc, o = sh(["ffmpeg", "-y", "-v", "error"] + inputs +
                   ["-filter_complex", ";".join(fc), "-map", "[mprog]",
                    "-c:a", "pcm_s16le", mp])
        if rc != 0:
            raise RuntimeError("master acrossfade fallo: %s" % o[-800:])
        # --- etapa 2b: mezcla con UNA cama continua --------------------------
        mm = os.path.join(TMP, "master_mix.wav")
        fc2 = (f"[0:a]atrim=end={D:.3f},asetpts=PTS-STARTPTS[pa];"
               f"[1:a]volume={BED_GAIN_DB}dB,afade=t=out:st={max(0.0, D-2.5):.3f}:d=2.5[bed];"
               f"[pa][bed]amix=inputs=2:duration=first:normalize=0,"
               f"alimiter=limit=0.794:level=disabled[mix]")
        rc, o = sh(["ffmpeg", "-y", "-v", "error", "-i", mp,
                    "-ss", "0", "-t", "%.3f" % D, "-i", BED,
                    "-filter_complex", fc2, "-map", "[mix]",
                    "-c:a", "pcm_s16le", mm])
        if rc != 0:
            raise RuntimeError("master mix fallo: %s" % o[-800:])
    else:
        mm = None  # sin stems: se conserva el audio xfadeado del concat

    out = os.path.join(OUTDIR, "FC_full_conform_v1.mp4")
    if mm:
        rc, o = sh(["ffmpeg", "-y", "-v", "error", "-i", rm, "-i", mm,
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-ar", "44100", "-ac", "2", "-t", "%.3f" % D,
                    "-movflags", "+faststart", out])
        if rc != 0:
            raise RuntimeError("master mux fallo: %s" % o[-800:])
    else:
        os.replace(rm, out)
    g = loud(out)
    report["_master"] = {"output": out, "duration_s": round(vid_dur(out), 3),
                         "loudness": {"I": g["input_i"], "TP": g["input_tp"],
                                      "LRA": g["input_lra"]},
                         "xfade_s": XFADE, "audio": "programa acrossfade 0.8s + cama continua"}
    print("MASTER:", out, "%.2fs I=%.2f TP=%.2f" % (vid_dur(out), g["input_i"], g["input_tp"]),
          flush=True)
    json.dump(report, open(report_path, "w"), indent=1)


if __name__ == "__main__":
    main()