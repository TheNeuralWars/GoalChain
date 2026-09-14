#!/usr/bin/env python3
"""
GoalChain FILM -- Fractured Code continuity QC core.

Three passes, all local, zero network:

  PASS 1 (physics, film level)
    ContinuityGuard CG03 over every scene cut (`FC-S0x_cut_v1.mp4`).
    Because a "cut" is a hard concatenation of shots, the frame-to-frame
    motion heuristic fires at every shot boundary. Those flags are annotated
    `likely_cut_boundary` and should be read as expected, not as defects.

  PASS 2 (physics, shot level)
    CG03 over the individual shot files inside each scene. No concatenation
    boundaries, so a flag here is a genuine within-shot motion discontinuity
    that a human should look at.

  PASS 3 (character consistency)
    CG02 over per-scene face crops produced by cg_face_stage.py
    (`<character>_<SCENE>.mp4`), i.e. face-only embeddings of each scene's
    primary cast member compared across the whole film.

Writes an aggregated JSON + a Markdown summary. Never touches the renders.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time

DEFAULT_FILM_ROOT = "/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM"
DEFAULT_OUT_DIR = "/data/hermes-home/profiles/hermes-ceo/assets/film_qc/continuityguard"
DEFAULT_CG_BIN = "/data/apps/tools/node_modules/.bin/continuityguard"
DEFAULT_CG_PY = "/data/apps/tools/cg-venv/bin/python"
SUPPORTED = (".mp4", ".mov", ".mkv", ".webm", ".avi")


def run(cmd, timeout=1800):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def probe(path: str) -> dict:
    cp = run(["ffprobe", "-v", "error", "-print_format", "json",
              "-show_format", "-show_streams", path], timeout=120)
    if cp.returncode != 0:
        return {"ok": False, "error": cp.stderr.strip()[:300]}
    try:
        data = json.loads(cp.stdout)
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"ffprobe json parse: {exc}"}
    v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
    fmt = data.get("format", {})
    out = {
        "ok": v is not None,
        "duration_s": float(fmt.get("duration", 0) or 0),
        "size_bytes": int(fmt.get("size", 0) or 0),
    }
    if v:
        num, _, den = (v.get("r_frame_rate") or "0/1").partition("/")
        try:
            fps = float(num) / float(den) if float(den) else 0.0
        except Exception:  # noqa: BLE001
            fps = 0.0
        out.update({
            "codec": v.get("codec_name"),
            "width": v.get("width"),
            "height": v.get("height"),
            "fps": round(fps, 3),
            "nb_frames": int(v.get("nb_frames", 0) or 0),
        })
    return out


def link_or_copy(src: str, dst: str) -> None:
    try:
        os.link(src, dst)
    except OSError:
        shutil.copy2(src, dst)


def cg_scan(cg_bin: str, cwd: str, directory: str, fps: float) -> dict:
    cp = run([cg_bin, "scan", directory, "--json", "--fps", str(fps)], timeout=3600)
    raw = (cp.stdout or "").strip()
    if not raw:
        return {"_error": (cp.stderr or "empty stdout").strip()[:500], "_exit": cp.returncode}
    try:
        return json.loads(raw)
    except Exception as exc:  # noqa: BLE001
        return {"_error": f"json parse failed: {exc}", "_stderr": cp.stderr.strip()[:500],
                "_exit": cp.returncode}


def annotate_boundaries(flags: list, boundaries: list, fps: float) -> list:
    """Mark physics flags that sit on a hard cut boundary (expected FP)."""
    out = []
    for f in flags:
        t = f["frame_index_a"] / fps if fps else 0.0
        nearest = None
        if boundaries:
            nearest = min(boundaries, key=lambda b: abs(b - t))
        near = nearest is not None and abs(nearest - t) <= 0.6
        g = dict(f)
        g["time_s"] = round(t, 2)
        g["nearest_shot_boundary_s"] = round(nearest, 2) if nearest is not None else None
        g["class"] = "likely_cut_boundary" if near else "within_shot"
        out.append(g)
    return out


def md_table(rows, headers):
    if not rows:
        return "_(none)_\n"
    lines = ["| " + " | ".join(headers) + " |",
             "|" + "|".join(["---"] * len(headers)) + "|"]
    for r in rows:
        lines.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(lines) + "\n"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--film-root", default=DEFAULT_FILM_ROOT)
    ap.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    ap.add_argument("--cg-bin", default=DEFAULT_CG_BIN)
    ap.add_argument("--cg-python", default=DEFAULT_CG_PY)
    ap.add_argument("--scenes", nargs="*", default=None)
    ap.add_argument("--fps", type=float, default=2.3, help="CG frame sample rate")
    ap.add_argument("--face-fps", type=float, default=1.0)
    ap.add_argument("--skip-face", action="store_true")
    args = ap.parse_args()

    film_root = os.path.abspath(args.film_root)
    out_dir = os.path.abspath(args.out_dir)
    renders = os.path.join(film_root, "renders")
    stage = os.path.join(out_dir, ".stage")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(stage, exist_ok=True)

    started = time.time()
    if args.scenes:
        scenes = list(args.scenes)
    else:
        scenes = sorted(d for d in os.listdir(renders) if d.startswith("FC-S0"))

    report = {
        "tool": "ContinuityGuard",
        "tool_version": None,
        "film_root": film_root,
        "scenes": scenes,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "cg_fps": args.fps,
        "preflight": {},
        "pass1_cut_physics": {},
        "pass2_shot_physics": {},
        "pass3_face_consistency": {},
        "raw_scans": {},
    }

    vp = run([args.cg_bin, "--version"], timeout=120)
    report["tool_version"] = (vp.stdout or "").strip() or None

    # ---------------- preflight ----------------
    cuts = {}
    for scene in scenes:
        cut = os.path.join(renders, scene, f"{scene}_cut_v1.mp4")
        if not os.path.exists(cut):
            report["preflight"][scene] = {"cut": None, "status": "MISSING_CUT"}
            continue
        info = probe(cut)
        shots = sorted(f for f in os.listdir(os.path.join(renders, scene))
                       if f.startswith(f"{scene}-") and f.endswith(".mp4")
                       and not f.endswith("_norm.mp4"))
        shots = [f for f in shots if not f[:-4].endswith("_cut_v1")]
        shot_probes = [{"shot": s[:-4], **probe(os.path.join(renders, scene, s))} for s in shots]
        shot_sum = round(sum(s.get("duration_s", 0) for s in shot_probes), 2)
        report["preflight"][scene] = {
            "cut": os.path.join(renders, scene, f"{scene}_cut_v1.mp4"),
            "status": "OK" if info.get("ok") else "BROKEN",
            "cut_info": info,
            "shots": shot_probes,
            "shots_duration_sum_s": shot_sum,
            "cut_vs_shots_delta_s": round(info.get("duration_s", 0) - shot_sum, 2),
        }
        if info.get("ok"):
            cuts[scene] = os.path.join(renders, scene, f"{scene}_cut_v1.mp4")

    # ------------- PASS 1: cut physics -------------
    cut_stage = os.path.join(stage, "cuts")
    shutil.rmtree(cut_stage, ignore_errors=True)
    os.makedirs(cut_stage, exist_ok=True)
    for scene, src in cuts.items():
        # deliberately NOT `<alpha>_...` so CG02 does not bucket cut clips
        # as one "character" and emit meaningless cross-scene flags.
        link_or_copy(src, os.path.join(cut_stage, f"scene-{scene}_cut_v1.mp4"))

    if cuts:
        raw1 = cg_scan(args.cg_bin, out_dir, cut_stage, args.fps)
        report["raw_scans"]["pass1_cut_physics"] = raw1
        boundaries = {s: [] for s in cuts}
        for scene, pf in report["preflight"].items():
            if scene not in cuts:
                continue
            t = 0.0
            for sp in pf["shots"]:
                t += sp.get("duration_s", 0)
                boundaries[scene].append(round(t, 3))
        flags_by_clip = {}
        for f in raw1.get("physics_plausibility", {}).get("flagged_shots", []):
            scene = f["clip"].replace("scene-", "").replace("_cut_v1.mp4", "")
            flags_by_clip.setdefault(scene, []).append(f)
        for scene in cuts:
            flags = annotate_boundaries(flags_by_clip.get(scene, []),
                                        boundaries.get(scene, []), args.fps)
            report["pass1_cut_physics"][scene] = {
                "max_discontinuity_ratio": max((f["discontinuity_ratio"] for f in flags), default=0.0),
                "flags_total": len(flags),
                "flags_on_cut_boundary": sum(1 for f in flags if f["class"] == "likely_cut_boundary"),
                "flags_within_shot": sum(1 for f in flags if f["class"] == "within_shot"),
                "flags": flags,
            }
    else:
        raw1 = {}

    # ------------- PASS 2: shot physics -------------
    shot_stage = os.path.join(stage, "shots")
    shutil.rmtree(shot_stage, ignore_errors=True)
    for scene in scenes:
        pf = report["preflight"].get(scene) or {}
        if not pf.get("shots"):
            continue
        d = os.path.join(shot_stage, scene)
        os.makedirs(d, exist_ok=True)
        for sp in pf["shots"]:
            src = os.path.join(renders, scene, f"{sp['shot']}.mp4")
            if os.path.exists(src):
                # `shot-S01-01` -> no `<alpha>_` prefix -> unlabeled, physics only
                link_or_copy(src, os.path.join(d, f"shot-{sp['shot'].replace('FC-', '')}.mp4"))
    for scene in sorted(os.listdir(shot_stage)) if os.path.isdir(shot_stage) else []:
        d = os.path.join(shot_stage, scene)
        raw2 = cg_scan(args.cg_bin, out_dir, d, args.fps)
        report["raw_scans"][f"pass2_shot_physics_{scene}"] = raw2
        flags = []
        for f in raw2.get("physics_plausibility", {}).get("flagged_shots", []):
            g = dict(f)
            g["time_s"] = round(f["frame_index_a"] / args.fps, 2) if args.fps else None
            flags.append(g)
        report["pass2_shot_physics"][scene] = {
            "clips_scanned": raw2.get("clips_scanned", 0),
            "max_discontinuity_ratio": max((f["discontinuity_ratio"] for f in flags), default=0.0),
            "flags_total": len(flags),
            "flags": flags,
        }

    # ------------- PASS 3: face consistency -------------
    if not args.skip_face:
        cons_stage = os.path.join(stage, "faces")
        shutil.rmtree(cons_stage, ignore_errors=True)
        os.makedirs(cons_stage, exist_ok=True)
        cp = run([args.cg_python, os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                               "cg_face_stage.py"),
                  "--film-root", film_root, "--stage-dir", cons_stage,
                  "--fps", str(args.face_fps)] + (["--scenes"] + scenes if args.scenes else []),
                  timeout=3600)
        stage_stats = {}
        stats_file = os.path.join(cons_stage, "_face_stage_stats.json")
        if os.path.exists(stats_file):
            with open(stats_file) as fh:
                stage_stats = json.load(fh)
        clips = [c for c in os.listdir(cons_stage) if c.endswith(".mp4")] if os.path.isdir(cons_stage) else []
        report["pass3_face_consistency"]["staging"] = {
            "exit_code": cp.returncode,
            "clips": sorted(clips),
            "clips_written": stage_stats.get("clips_written", []),
            "clips_skipped": stage_stats.get("clips_skipped", []),
            "stderr_tail": (cp.stderr or "").strip()[-500:] if cp.returncode else None,
        }
        if clips:
            raw3 = cg_scan(args.cg_bin, out_dir, cons_stage, args.fps)
            report["raw_scans"]["pass3_face_consistency"] = raw3
            flags = raw3.get("character_consistency", {}).get("flagged_shots", [])
            report["pass3_face_consistency"].update({
                "clips_scanned": raw3.get("clips_scanned", 0),
                "characters_tracked": raw3.get("character_consistency", {}).get("characters_tracked", 0),
                "similarity_threshold": raw3.get("character_consistency", {}).get("similarity_threshold"),
                "flags_total": len(flags),
                "flags": flags,
                "unflagged_clips": sorted(set(clips) - {f["clip"] for f in flags}),
            })
            # exact pairwise cosine scores (CLI only prints flagged ones)
            pair_script = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                       "cg_pairwise_similarity.mjs")
            if os.path.exists(pair_script):
                np_ = run(["node", pair_script, cons_stage, "--fps", str(args.face_fps)],
                          timeout=3600)
                if np_.returncode == 0 and (np_.stdout or "").strip().startswith("{"):
                    try:
                        report["pass3_face_consistency"]["pairwise"] = json.loads(np_.stdout)
                    except Exception as exc:  # noqa: BLE001
                        report["pass3_face_consistency"]["pairwise_error"] = str(exc)[:200]
                else:
                    report["pass3_face_consistency"]["pairwise_error"] = \
                        (np_.stderr or "node pairwise run failed").strip()[-300:]
        else:
            report["pass3_face_consistency"]["note"] = "no face clips staged"

    report["duration_seconds"] = round(time.time() - started, 2)

    # ---------------- writes ----------------
    os.makedirs(out_dir, exist_ok=True)
    json_path = os.path.join(out_dir, "film_continuity_report.json")
    with open(json_path, "w") as fh:
        json.dump(report, fh, indent=2)

    raw_path = os.path.join(out_dir, "continuityguard_report.json")
    with open(raw_path, "w") as fh:
        json.dump(report["raw_scans"], fh, indent=2)

    md_path = os.path.join(out_dir, "film_continuity_report.md")
    with open(md_path, "w") as fh:
        fh.write(render_md(report, json_path, raw_path))

    print(json.dumps({
        "json_report": json_path,
        "raw_report": raw_path,
        "markdown_report": md_path,
        "summary": {
            "scenes": scenes,
            "pass1_cut_physics": {k: {"flags": v["flags_total"],
                                      "on_boundary": v["flags_on_cut_boundary"],
                                      "within_shot": v["flags_within_shot"],
                                      "max_ratio": v["max_discontinuity_ratio"]}
                                  for k, v in report["pass1_cut_physics"].items()},
            "pass2_shot_physics": {k: {"flags": v["flags_total"],
                                       "max_ratio": v["max_discontinuity_ratio"]}
                                   for k, v in report["pass2_shot_physics"].items()},
            "pass3_face_consistency": {
                "characters_tracked": report["pass3_face_consistency"].get("characters_tracked"),
                "flags": report["pass3_face_consistency"].get("flags_total"),
                "clips": report["pass3_face_consistency"].get("staging", {}).get("clips", []),
                "flags_detail": report["pass3_face_consistency"].get("flags", []),
                "pairwise": (report["pass3_face_consistency"].get("pairwise") or {}).get("pairwise", []),
            },
        },
    }, indent=2))
    return 0


def render_md(r, json_path, raw_path) -> str:
    L = []
    L.append("# Fractured Code -- Continuity QC report\n")
    L.append(f"- Tool: `{r['tool']}` v{r['tool_version']} (local, zero-network)")
    L.append(f"- Generated: {r['generated_at']}  |  runtime {r['duration_seconds']}s")
    L.append(f"- Film root: `{r['film_root']}`")
    L.append(f"- Scenes: {', '.join(r['scenes'])}")
    L.append(f"- Raw ContinuityGuard JSON: `{raw_path}`")
    L.append(f"- Machine-readable aggregate: `{json_path}`\n")

    L.append("## 1. Preflight (ffprobe)\n")
    rows = []
    for s in r["scenes"]:
        pf = r["preflight"].get(s) or {}
        ci = pf.get("cut_info") or {}
        rows.append([s, pf.get("status"), ci.get("duration_s"), f"{ci.get('width')}x{ci.get('height')}",
                     ci.get("fps"), len(pf.get("shots", [])),
                     pf.get("shots_duration_sum_s"), pf.get("cut_vs_shots_delta_s")])
    L.append(md_table(rows, ["scene", "status", "cut_dur_s", "res", "fps", "shots",
                             "shots_sum_s", "cut-sum_delta_s"]))

    L.append("\n## 2. PASS 1 -- physics on the concatenated cut (CG03)\n")
    L.append("A cut is a hard concatenation, so the frame-to-frame heuristic fires at shot "
             "boundaries by construction. Flags classified `likely_cut_boundary` are expected "
             "artefacts of the concat, not defects.\n")
    rows = [[s, v["flags_total"], v["flags_on_cut_boundary"], v["flags_within_shot"],
             v["max_discontinuity_ratio"]] for s, v in sorted(r["pass1_cut_physics"].items())]
    L.append(md_table(rows, ["scene", "flags", "on_cut_boundary", "within_shot", "max_ratio"]))
    within = [(s, f) for s, v in sorted(r["pass1_cut_physics"].items())
              for f in v["flags"] if f["class"] == "within_shot"]
    if within:
        L.append("\nWithin-shot flags on the cut:")
        L.append(md_table([[s, f["time_s"], f["frame_index_a"], f["discontinuity_ratio"]]
                           for s, f in within],
                          ["scene", "t_s", "frame", "ratio"]))

    L.append("\n## 3. PASS 2 -- physics per shot (CG03, no concat boundaries)\n")
    rows = [[s, v["clips_scanned"], v["flags_total"], v["max_discontinuity_ratio"]]
            for s, v in sorted(r["pass2_shot_physics"].items())]
    L.append(md_table(rows, ["scene", "shots_scanned", "flags", "max_ratio"]))
    allflags = [(s, f) for s, v in sorted(r["pass2_shot_physics"].items()) for f in v["flags"]]
    if allflags:
        L.append("\nShot-level flags (real within-shot motion discontinuities):")
        L.append(md_table([[s, f["clip"], f["time_s"], f["discontinuity_ratio"]] for s, f in allflags],
                          ["scene", "clip", "t_s", "ratio"]))

    L.append("\n## 4. PASS 3 -- character consistency on face crops (CG02)\n")
    p3 = r["pass3_face_consistency"]
    if p3.get("clips_scanned"):
        L.append(f"- Face clips staged: {', '.join(p3['staging']['clips'])}")
        L.append(f"- Characters tracked: {p3.get('characters_tracked')}  |  "
                 f"threshold: {p3.get('similarity_threshold')}  |  flags: {p3.get('flags_total')}")
        if p3.get("flags"):
            L.append("\n" + md_table(
                [[f["clip"], f["character"], f["reference_clip"], f["similarity_score"]]
                 for f in p3["flags"]],
                ["clip", "character", "reference", "similarity"]))
        if p3.get("unflagged_clips"):
            L.append(f"\nUnflagged (at/above threshold): {', '.join(p3['unflagged_clips'])}")
        pw = (p3.get("pairwise") or {}).get("pairwise") or []
        if pw:
            L.append("\nAll pairwise face-similarity scores (CLI only prints flagged ones, so these "
                     "are computed directly from the same bundled model):")
            L.append(md_table([[row["character"], row["clip_a"], row["clip_b"],
                                row["similarity_score"], "FLAG" if row["flagged"] else "ok"]
                               for row in pw],
                              ["character", "clip_a", "clip_b", "similarity", "verdict"]))
        elif p3.get("pairwise_error"):
            L.append(f"\n_(pairwise scores unavailable: {p3['pairwise_error']})_")
    else:
        L.append(f"No consistency pass: {p3.get('note') or 'no staged clips'}")
    skipped = p3.get("staging", {}).get("clips_skipped", [])
    if skipped:
        L.append("\nScenes without a usable face clip:")
        L.append(md_table([[s["scene"], s["reason"], s.get("faces", "")] for s in skipped],
                          ["scene", "reason", "face_frames"]))

    L.append("\n## 5. Known limits (read before acting on a flag)\n")
    L.append("- CG02/CG03 are heuristics, not detectors. Every flag is 'worth a human look', nothing more.")
    L.append("- CG02's bundled embedding is a generic ImageNet MobileNetV2 (no face-specific model); "
             "this pipeline works around that by feeding it face crops, but the embedding itself is "
             "not a face-recognition network.")
    L.append("- 'Primary character' is taken from each scene's `character_lock.primary`; the largest "
             "detected face per frame is assumed to be that character. In multi-character framing the "
             "assumption can be wrong.")
    L.append("- Nothing was regenerated; renders are read-only inputs. No network calls are made.\n")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    sys.exit(main())
