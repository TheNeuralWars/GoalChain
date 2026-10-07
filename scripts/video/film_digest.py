#!/usr/bin/env python3
"""FILM_DIGEST harness for Fractured Code masters (objective A/D layers)."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

FILM_ROOT = Path(
    "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM"
)
DEFAULT_MASTER = FILM_ROOT / "renders/_conform_v2/FC_full_conform_v2.mp4"
DEFAULT_SCENES = FILM_ROOT / "renders/_conform_v2"
DEFAULT_OUT = FILM_ROOT / "reports"
ASSEMBLY_ORDER = [
    "FC-S01", "FC-S02", "FC-S03", "FC-S04", "FC-S05",
    "FC-S06", "FC-S06A", "FC-S07", "FC-S08",
]

ASSEMBLY_V3_AX = [
    "FC-S01", "FC-S02", "FC-AX01", "FC-S03", "FC-S04", "FC-S05",
    "FC-AX02", "FC-S06", "FC-AX03", "FC-S06A", "FC-S07",
    "FC-AX04", "FC-AX05", "FC-S08",
]


def run(cmd, timeout=900, binary=False):
    p = subprocess.run(
        cmd, capture_output=True, timeout=timeout,
        text=not binary,
    )
    return p.returncode, p.stdout, p.stderr


def ffprobe_json(path: Path) -> dict:
    code, out, err = run([
        "ffprobe", "-v", "error",
        "-show_entries",
        "format=duration,size,bit_rate:stream=index,codec_type,codec_name,"
        "width,height,r_frame_rate,avg_frame_rate,sample_rate,channels,bit_rate",
        "-of", "json", str(path),
    ])
    if code != 0:
        raise RuntimeError("ffprobe failed: " + str(err)[:400])
    return json.loads(out)


def parse_rate(r: str) -> float:
    if not r or r in ("0/0", "N/A"):
        return 0.0
    if "/" in r:
        a, b = r.split("/", 1)
        try:
            return float(a) / float(b) if float(b) else 0.0
        except ValueError:
            return 0.0
    try:
        return float(r)
    except ValueError:
        return 0.0


def stream_summary(probe: dict) -> dict:
    fmt = probe.get("format", {})
    streams = probe.get("streams", [])
    v = next((s for s in streams if s.get("codec_type") == "video"), {})
    a = next((s for s in streams if s.get("codec_type") == "audio"), {})
    return {
        "duration_s": float(fmt.get("duration") or 0),
        "size_bytes": int(fmt.get("size") or 0),
        "bit_rate": int(fmt.get("bit_rate") or 0),
        "video_codec": v.get("codec_name"),
        "width": v.get("width"),
        "height": v.get("height"),
        "fps": parse_rate(v.get("avg_frame_rate") or v.get("r_frame_rate") or "0/0"),
        "audio_codec": a.get("codec_name"),
        "sample_rate": int(a.get("sample_rate") or 0) if a else None,
        "channels": a.get("channels"),
        "has_audio": bool(a),
    }


def volumedetect(path: Path) -> dict:
    code, out, err = run([
        "ffmpeg", "-hide_banner", "-i", str(path),
        "-af", "volumedetect", "-f", "null", "-",
    ])
    text = (err or "") + "\n" + (out or "")

    def grab(key, cast=float):
        m = re.search(key + r":\s*([-\d.]+)", text)
        return cast(m.group(1)) if m else None

    return {
        "mean_volume_db": grab("mean_volume"),
        "max_volume_db": grab("max_volume"),
    }


def ebur128(path: Path) -> dict:
    code, out, err = run([
        "ffmpeg", "-hide_banner", "-i", str(path),
        "-af", "ebur128=framelog=verbose", "-f", "null", "-",
    ])
    text = (err or "") + "\n" + (out or "")
    integrated = None
    m = re.search(r"I:\s*([-\d.]+)\s*LUFS", text)
    if m:
        integrated = float(m.group(1))
    lra = None
    m = re.search(r"LRA:\s*([-\d.]+)", text)
    if m:
        lra = float(m.group(1))
    peak = None
    m = re.search(r"Peak:\s*([-\d.]+)\s*dBFS", text)
    if m:
        peak = float(m.group(1))
    return {
        "integrated_lufs": integrated,
        "loudness_range_lu": lra,
        "true_peak_dbfs": peak,
    }


def silencedetect(path: Path, noise_db=-40.0, min_d=0.4) -> list:
    af = "silencedetect=noise={}dB:d={}".format(noise_db, min_d)
    code, out, err = run([
        "ffmpeg", "-hide_banner", "-i", str(path),
        "-af", af, "-f", "null", "-",
    ])
    text = (err or "") + "\n" + (out or "")
    starts = [float(x) for x in re.findall(r"silence_start:\s*([-\d.]+)", text)]
    end_pairs = re.findall(
        r"silence_end:\s*([-\d.]+)\s*\|\s*silence_duration:\s*([-\d.]+)", text
    )
    silences = []
    for i, s in enumerate(starts):
        if i < len(end_pairs):
            silences.append({
                "start": s,
                "end": float(end_pairs[i][0]),
                "duration": float(end_pairs[i][1]),
            })
        else:
            silences.append({"start": s, "end": None, "duration": None})
    return silences


def motion_energy(path: Path, fps=4.0) -> dict:
    try:
        import numpy as np
    except ImportError:
        return {"mean_mad": None, "error": "numpy missing"}
    w, h = 96, 54
    frame_bytes = w * h
    vf = "fps={},scale={}:{},format=gray".format(fps, w, h)
    code, out, err = run([
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-i", str(path),
        "-vf", vf,
        "-f", "rawvideo", "-pix_fmt", "gray", "-",
    ], binary=True)
    if code != 0 or not out:
        err_s = err.decode("utf-8", "replace")[:300] if isinstance(err, bytes) else str(err)[:300]
        return {"mean_mad": None, "error": err_s}
    raw = np.frombuffer(out, dtype=np.uint8)
    n = len(raw) // frame_bytes
    if n < 2:
        return {"mean_mad": 0.0, "frames": n, "static_flag": True}
    frames = raw[: n * frame_bytes].reshape(n, frame_bytes).astype(np.float32)
    diffs = np.abs(frames[1:] - frames[:-1]).mean(axis=1)
    mean_mad = float(diffs.mean())
    return {
        "mean_mad": mean_mad,
        "median_mad": float(np.median(diffs)),
        "p95_mad": float(np.percentile(diffs, 95)),
        "min_mad": float(diffs.min()),
        "max_mad": float(diffs.max()),
        "frames": int(n),
        "fps_sample": fps,
        "static_flag": bool(mean_mad < 1.0),
    }


def extract_contact(path: Path, out_dir: Path, fps=1.0) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    pattern = str(out_dir / "fc_v2_%06d.jpg")
    code, out, err = run([
        "ffmpeg", "-hide_banner", "-y", "-i", str(path),
        "-vf", "fps={}".format(fps), "-q:v", "3", pattern,
    ], timeout=1200)
    if code != 0:
        raise RuntimeError("contact extract failed: " + str(err)[:400])
    return out_dir


def extract_midframe(path: Path, out_path: Path) -> Path | None:
    tech = stream_summary(ffprobe_json(path))
    mid = max(0.1, tech["duration_s"] / 2.0)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    code, out, err = run([
        "ffmpeg", "-hide_banner", "-y",
        "-ss", "{:.3f}".format(mid), "-i", str(path),
        "-frames:v", "1", "-q:v", "2", str(out_path),
    ], timeout=120)
    if code != 0 or not out_path.exists():
        return None
    return out_path


def find_scene_cuts(scenes_dir: Path, order=None):
    found = []
    for sid in (order or ASSEMBLY_ORDER):
        for name in (
            "{}_cut_conform.mp4".format(sid),
            "{}_cut_v2.mp4".format(sid),
            "{}_cut_v1.mp4".format(sid),
            "{}.mp4".format(sid),
        ):
            c = scenes_dir / name
            if c.is_file():
                found.append((sid, c))
                break
    return found


def tc(seconds):
    if seconds is None:
        return "-"
    s = max(0.0, float(seconds))
    m = int(s // 60)
    sec = s % 60
    return "{:02d}:{:06.3f}".format(m, sec)


def list_improve():
    d = Path("/data/apps/GoalChain/docs/assets/film/improve_20260915")
    if not d.is_dir():
        return []
    rows = []
    for p in sorted(d.iterdir()):
        if p.name.startswith("."):
            continue
        if p.is_file():
            rows.append("{} ({:.1f} MB)".format(p, p.stat().st_size / 1e6))
        else:
            rows.append(str(p) + "/")
    return rows


def write_report(
    report_path, master, tech, vol, lufs, silences,
    scenes, jumps, motion, contact_dir, midframes, improve_listing,
):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    L = []
    L.append("# Film Digest v2 — Fractured Code (FC_full_conform_v2)")
    L.append("")
    L.append("- Generated: {}".format(today))
    L.append("- Master: `{}`".format(master))
    L.append("- Protocol: FILM_DIGEST_v1 (ops/FILM_DIGEST_AND_V3_PLAN.md)")
    L.append("- Objective methods: ai-film-visual-qc (ffprobe / volumedetect / motion MAD / silence)")
    L.append("- Vision pass: **TODO** (checklist + frame paths; no paid vision run)")
    L.append("")

    L.append("## 1. Tech metrics")
    L.append("")
    L.append("| Field | Value |")
    L.append("|---|---|")
    L.append("| Duration | {:.3f} s ({}) |".format(tech["duration_s"], tc(tech["duration_s"])))
    L.append("| Resolution | {}x{} |".format(tech.get("width"), tech.get("height")))
    L.append("| FPS | {} |".format(tech.get("fps")))
    L.append("| Video codec | {} |".format(tech.get("video_codec")))
    L.append("| Audio | {} {} Hz / {}ch |".format(
        tech.get("audio_codec"), tech.get("sample_rate"), tech.get("channels")))
    L.append("| Size | {:.1f} MB |".format(tech.get("size_bytes", 0) / 1e6))
    L.append("| mean_volume | {} dB |".format(vol.get("mean_volume_db")))
    L.append("| max_volume | {} dB |".format(vol.get("max_volume_db")))
    L.append("| Integrated LUFS | {} |".format(lufs.get("integrated_lufs")))
    L.append("| LRA | {} LU |".format(lufs.get("loudness_range_lu")))
    L.append("| True peak | {} dBFS |".format(lufs.get("true_peak_dbfs")))
    if motion:
        L.append("| Motion MAD (4fps 96x54) | mean={} median={} static_flag={} |".format(
            motion.get("mean_mad"), motion.get("median_mad"), motion.get("static_flag")))
    L.append("")

    L.append("## 2. Per-scene cuts (conform)")
    L.append("")
    L.append("| Scene | Path | Dur (s) | mean dB | max dB | LUFS | Motion MAD |")
    L.append("|---|---|---|---|---|---|---|")
    for sc in scenes:
        mad = (sc.get("motion") or {}).get("mean_mad")
        L.append("| {} | `{}` | {:.2f} | {} | {} | {} | {} |".format(
            sc["id"], sc["path"], sc["duration_s"],
            sc["vol"].get("mean_volume_db"), sc["vol"].get("max_volume_db"),
            sc["lufs"].get("integrated_lufs"), mad,
        ))
    L.append("")

    L.append("## 3. Audio seams (adjacent mean-dB jumps)")
    L.append("")
    L.append("Threshold: flag jumps **>6 dB** at scene boundaries.")
    L.append("")
    L.append("| Boundary | mean_A -> mean_B | delta dB | Flag |")
    L.append("|---|---|---|---|")
    for j in jumps:
        d = abs(j["delta_db"])
        flag = "**>6 dB**" if d > 6 else ("soft >3" if d > 3 else "ok")
        L.append("| {} -> {} @ ~{} | {} -> {} | {:+.2f} | {} |".format(
            j["a"], j["b"], tc(j["boundary_s"]),
            j["mean_a"], j["mean_b"], j["delta_db"], flag,
        ))
    if not jumps:
        L.append("| - | no scene cuts | - | - |")
    L.append("")
    L.append("### Silences (master, noise=-40 dB, min 0.4 s)")
    L.append("")
    if not silences:
        L.append("- None detected at this threshold.")
    else:
        L.append("- Count: **{}**".format(len(silences)))
        for s in silences[:40]:
            if s.get("duration") is not None:
                L.append("- {} -> {} (dur {} s)".format(
                    tc(s["start"]), tc(s["end"]), s["duration"]))
            else:
                L.append("- start {}".format(tc(s["start"])))
        if len(silences) > 40:
            L.append("- ... +{} more".format(len(silences) - 40))
    L.append("")

    L.append("## 4. Architect presence (vision checklist — TODO)")
    L.append("")
    L.append("Lock status at digest time: **NO** LOCK_SHEET_THE_ARCHITECT / no the_architect in WORLD_TOKENS characters / no locks/refs/architect*.")
    L.append("")
    L.append("Manual / Hermes vision checklist:")
    L.append("- [ ] Screen time: is The Architect visible / implied?")
    L.append("- [ ] Coil / indigo motif without readable on-screen text")
    L.append("- [ ] Threat beat readable without dialogue")
    L.append("- [ ] Insert slots: between S02-S03, S05-S06, pre-S06A, pre-S08")
    L.append("")
    if midframes:
        L.append("### Midframe paths (per scene)")
        L.append("")
        for m in midframes:
            L.append("- {}: `{}`".format(m["id"], m["path"]))
        L.append("")
    if contact_dir:
        L.append("### 1 fps contact frames")
        L.append("")
        L.append("- Directory: `{}`".format(contact_dir))
        n = len(list(Path(contact_dir).glob("*.jpg")))
        L.append("- Frame count: {}".format(n))
        L.append("- Vision TODO: sample every ~8-12 s (avoid near-duplicate pairs as defects).")
        L.append("")

    L.append("## 5. Action density notes")
    L.append("")
    dens = []
    for sc in scenes:
        mad = (sc.get("motion") or {}).get("mean_mad")
        if mad is not None:
            dens.append((sc["id"], mad, sc["duration_s"]))
    dens.sort(key=lambda x: x[1], reverse=True)
    if dens:
        L.append("| Scene | Motion MAD | Dur | Note |")
        L.append("|---|---|---|---|")
        for sid, mad, dur in dens:
            note = "high motion" if mad > 4 else ("low/static-ish" if mad < 1.5 else "mid")
            L.append("| {} | {} | {:.1f}s | {} |".format(sid, mad, dur, note))
    else:
        L.append("- Motion energy not computed per scene.")
    L.append("")
    L.append("Known CG motion flags (prior ContinuityGuard): FC-S06-01, FC-S06-05, FC-S08-06.")
    L.append("")

    L.append("## 6. improve_20260915 assets")
    L.append("")
    if improve_listing:
        for row in improve_listing:
            L.append("- `{}`".format(row))
    else:
        L.append("- (none listed)")
    L.append("")

    L.append("## 7. Priority fix list")
    L.append("")
    red = []
    soft = []
    for j in jumps:
        if abs(j["delta_db"]) > 6:
            red.append(
                "Audio seam {}->{}: delta {:+.1f} dB (>6). Unify with continuous music bed + crossfade 0.8-1.2 s.".format(
                    j["a"], j["b"], j["delta_db"])
            )
        elif abs(j["delta_db"]) > 3:
            soft.append(
                "Soft seam {}->{}: delta {:+.1f} dB.".format(
                    j["a"], j["b"], j["delta_db"])
            )
    red.append(
        "P0 music: replace 528 Hz drone placeholder with continuous dark techno/"
        "cyber thriller bed (~382-390 s, indigo/Coil vibe, no vocals, loopable ends). "
        "See docs/ops/MUSIC_BED_SPEC_FC_v3.md."
    )
    red.append(
        "P1 Architect: create lock sheet + WORLD_TOKENS entry + 3-5 insert shots "
        "(no SuperGrok Imagine in this digest pass)."
    )
    if motion and motion.get("static_flag"):
        red.append("Master motion MAD <1.0 — investigate static/still-with-noise segments.")
    for sc in scenes:
        m = sc.get("motion") or {}
        if m.get("static_flag"):
            soft.append("{}: motion MAD {} (static_flag).".format(sc["id"], m.get("mean_mad")))
    long_sil = [s for s in silences if (s.get("duration") or 0) >= 1.5]
    if long_sil:
        soft.append(
            "{} silence region(s) >=1.5 s on master — check intentional holds vs dead air.".format(
                len(long_sil))
        )
    soft.append("Vision pass: run Hermes ai-film-visual-qc on midframes/contact (Architect / text / climax).")
    soft.append("Optional ContinuityGuard re-scan after Architect inserts.")

    L.append("### Red / P0-P1")
    L.append("")
    for i, item in enumerate(red, 1):
        L.append("{}. {}".format(i, item))
    L.append("")
    L.append("### Soft / follow-ups")
    L.append("")
    for i, item in enumerate(soft, 1):
        L.append("{}. {}".format(i, item))
    L.append("")
    L.append("---")
    L.append("*End of digest. Do not treat sampling-grid near-duplicates as defects.*")
    L.append("")

    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(L), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser(description="FILM_DIGEST harness")
    ap.add_argument("--master", type=Path, default=DEFAULT_MASTER)
    ap.add_argument("--scenes-dir", type=Path, default=DEFAULT_SCENES)
    ap.add_argument("--out", type=Path, default=DEFAULT_OUT)
    ap.add_argument("--fps-contact", type=float, default=1.0)
    ap.add_argument("--skip-contact", action="store_true")
    ap.add_argument("--skip-motion", action="store_true")
    ap.add_argument("--date-tag", default=None)
    ap.add_argument("--report-stem", default=None,
                    help="Report basename without .md (default film_digest_v2_<date>)")
    ap.add_argument("--assembly", choices=["v2", "v3_ax"], default="v2")
    args = ap.parse_args()

    master = args.master
    if not master.is_file():
        alt = Path(
            "/data/apps/GoalChain/docs/assets/film/improve_20260915/FC_full_conform_v2.mp4"
        )
        if alt.is_file():
            master = alt
        else:
            print("ERROR: master not found: {}".format(args.master), file=sys.stderr)
            sys.exit(1)

    date_tag = args.date_tag or datetime.now(timezone.utc).strftime("%Y%m%d")
    work = args.out / ("_digest_work_" + date_tag)
    work.mkdir(parents=True, exist_ok=True)
    contact_dir = work / "contact_1fps"
    mid_dir = work / "midframes"
    assembly_order = ASSEMBLY_V3_AX if args.assembly == "v3_ax" else ASSEMBLY_ORDER

    print("[digest] master={}".format(master))
    tech = stream_summary(ffprobe_json(master))
    print("[digest] duration={:.3f}s fps={}".format(tech["duration_s"], tech["fps"]))

    vol = volumedetect(master)
    print("[digest] vol mean={} max={}".format(
        vol.get("mean_volume_db"), vol.get("max_volume_db")))

    lufs = ebur128(master)
    print("[digest] LUFS={}".format(lufs.get("integrated_lufs")))

    sil = silencedetect(master)
    print("[digest] silences={}".format(len(sil)))

    motion = None
    if not args.skip_motion:
        print("[digest] motion energy master...")
        motion = motion_energy(master)
        print("[digest] motion MAD mean={}".format(motion.get("mean_mad")))

    scenes_meta = []
    midframes = []
    cuts = find_scene_cuts(args.scenes_dir, order=assembly_order)
    print("[digest] scene cuts found={} under {}".format(len(cuts), args.scenes_dir))
    cursor = 0.0
    for sid, path in cuts:
        print("[digest] scene {}...".format(sid))
        st = stream_summary(ffprobe_json(path))
        sv = volumedetect(path)
        sl = ebur128(path)
        sm = None if args.skip_motion else motion_energy(path)
        scenes_meta.append({
            "id": sid,
            "path": str(path),
            "duration_s": st["duration_s"],
            "start_s": cursor,
            "vol": sv,
            "lufs": sl,
            "motion": sm,
            "tech": st,
        })
        mf = extract_midframe(path, mid_dir / (sid + "_mid.jpg"))
        if mf:
            midframes.append({"id": sid, "path": str(mf)})
        cursor += st["duration_s"]

    jumps = []
    for i in range(len(scenes_meta) - 1):
        a = scenes_meta[i]
        b = scenes_meta[i + 1]
        ma = a["vol"].get("mean_volume_db")
        mb = b["vol"].get("mean_volume_db")
        if ma is None or mb is None:
            continue
        jumps.append({
            "a": a["id"],
            "b": b["id"],
            "mean_a": ma,
            "mean_b": mb,
            "delta_db": mb - ma,
            "boundary_s": a["start_s"] + a["duration_s"],
        })

    contact_path = None
    if not args.skip_contact:
        print("[digest] extracting {} fps contact...".format(args.fps_contact))
        contact_path = extract_contact(master, contact_dir, fps=args.fps_contact)
        print("[digest] contact -> {}".format(contact_path))

    stem = args.report_stem or ("film_digest_v2_" + date_tag)
    report_path = args.out / (stem + ".md")
    write_report(
        report_path, master, tech, vol, lufs, sil,
        scenes_meta, jumps, motion, contact_path, midframes, list_improve(),
    )
    sidecar = {
        "master": str(master),
        "tech": tech,
        "vol": vol,
        "lufs": lufs,
        "silences": sil,
        "scenes": scenes_meta,
        "jumps": jumps,
        "motion": motion,
        "contact_dir": str(contact_path) if contact_path else None,
        "midframes": midframes,
        "report": str(report_path),
    }
    sidecar["assembly"] = args.assembly
    json_path = args.out / (stem + ".json")
    json_path.write_text(json.dumps(sidecar, indent=2, default=str), encoding="utf-8")
    print("[digest] REPORT {}".format(report_path))
    print("[digest] JSON   {}".format(json_path))
    return 0


if __name__ == "__main__":
    sys.exit(main())
