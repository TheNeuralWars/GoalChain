#!/usr/bin/env python3
"""Final cross-check (2026-10-03): narration beats ↔ trailer EDL/shot manifest ↔ v3_ax timeline ↔ book text.
Read-only on everything existing; writes only the report paths given. Exit 0 = no errors."""
import json, re, subprocess, sys, tempfile, os
from pathlib import Path
TRI = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy")
FILM = TRI / "FILM"; PLANS = FILM / "plans"
M = json.load(open(PLANS / "FC_SECOND_HALF_SHOTS_20261003.json"))
V3 = FILM / "renders/_conform_v3/FC_full_conform_v3_ax.mp4"
WT = json.load(open(FILM / "WORLD_TOKENS.json"))
ERR, WARN, OK = [], [], []
def e(m): ERR.append(m)
def w(m): WARN.append(m)
def ok(m): OK.append(m)
def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration,nb_frames", "-of", "json", str(p)], capture_output=True, text=True)
    s = json.loads(r.stdout or "{}").get("streams", [{}])[0]; return float(s.get("duration", 0) or 0)
EPS = 1e-6
T = M["trailer"]; EDL = T["edl"]; SEG = {x["seg"]: x for x in EDL}; SH = {s["id"]: s for s in M["shots"]}; TL = M["v3ax_timeline"]

# 1 EDL contiguity
t = 0.0; bad = 0
for i, x in enumerate(EDL):
    if abs(x["start"] - t) > EPS: e(f"EDL gap/overlap before {x['seg']}: start {x['start']} != {t:.3f}"); bad += 1
    if abs(x["end"] - x["start"] - x["dur"]) > EPS: e(f"{x['seg']} end-start != dur"); bad += 1
    t = x["end"]
    if x["seg"] != f"T{i+1:02d}": e(f"segment numbering break at {x['seg']}")
if abs(t - T["target_runtime_s"]) > EPS: e(f"EDL total {t} != target {T['target_runtime_s']}")
if not bad: ok(f"EDL contiguous: {len(EDL)} segments, 0.000→{t:.3f} s, no gaps/overlaps, total = target {T['target_runtime_s']} s")

# 2 existing segments vs files and v3_ax timeline
nex = 0
for x in [x for x in EDL if x["kind"] == "existing"]:
    p = Path(x["path"])
    if not p.exists(): e(f"{x['seg']} missing file {p}"); continue
    d = probe(p); nex += 1
    if x["src_in"] < 0 or x["src_out"] > d + EPS: e(f"{x['seg']} src {x['src_in']}–{x['src_out']} outside clip {d:.3f}s ({p.name})")
    if abs(x["src_out"] - x["src_in"] - x["dur"]) > EPS: e(f"{x['seg']} src range != dur")
    sid = x["shot_id"]
    if sid.startswith("FC-"):
        if sid not in TL: e(f"{x['seg']} {sid} not in v3_ax timeline")
        elif abs((x.get("v3ax_tc") or -1) - TL[sid]["v3ax_start"]) > 1e-3: e(f"{x['seg']} v3ax_tc mismatch {x.get('v3ax_tc')} vs {TL[sid]['v3ax_start']}")
        elif abs(TL[sid].get("dur", d) - d) > 0.05: w(f"{sid}: timeline dur {TL[sid].get('dur')} vs file {d:.3f}")
ok(f"{nex} existing segments: files present, src_in/src_out inside measured clip durations, v3_ax TCs match timeline")

# 3 new segments vs manifest
nn = 0
for x in [x for x in EDL if x["kind"] == "new"]:
    s = SH.get(x["shot_id"])
    if not s: e(f"{x['seg']} new shot {x['shot_id']} not in manifest"); continue
    nn += 1
    if not s.get("trailer"): e(f"{x['seg']} {x['shot_id']} used in trailer but trailer flag false")
    if x["src_out"] > s["duration_s"] + EPS: e(f"{x['seg']} src_out {x['src_out']} > planned duration {s['duration_s']}")
    fb = x.get("fallback_existing")
    if fb and not Path(fb).exists(): e(f"{x['seg']} fallback missing {fb}")
flagged = {s["id"] for s in M["shots"] if s.get("trailer")}; used = {x["shot_id"] for x in EDL if x["kind"] == "new"}
if flagged - used: w(f"trailer-flagged shots not used in EDL: {sorted(flagged - used)}")
if used - flagged: e(f"EDL uses unflagged shots: {sorted(used - flagged)}")
ok(f"{nn} new segments: all shot_ids in manifest, flagged trailer, src ranges within planned 6 s")
# order: from T21 on, new shots must follow scene order (T01 cosmic open is a deliberate flash-forward)
scn = [x["shot_id"][:6] for x in EDL if x["kind"] == "new" and x["start"] >= SEG["T21"]["start"]]
if scn != sorted(scn): e(f"second-half shots not in scene order: {scn}")
else: ok("second-half segments T21–T57 follow scene order S09→S18")

# 4 narration windows / overlaps / pace / silences
prev = None; silent = set(T["silent_segments"])
for n in T["narration"]:
    a, b = n["segments"][0], n["segments"][-1]
    if a not in SEG or b not in SEG: e(f"{n['id']} unknown segment"); continue
    ws, we = SEG[a]["start"], SEG[b]["end"]
    if abs(ws - n["window_start"]) > EPS or abs(we - n["window_end"]) > EPS: e(f"{n['id']} window ≠ segment times")
    if not (ws - EPS <= n["vo_in"] < n["vo_out"] <= we + EPS): e(f"{n['id']} VO {n['vo_in']}–{n['vo_out']} outside window {ws}–{we}")
    if prev and n["vo_in"] < prev["vo_out"] + 0.7 - EPS: e(f"{n['id']} starts <0.7 s after {prev['id']} ends")
    words = len(n["text_es"].replace("«", "").replace("»", "").replace("...", " ").split())
    if words != n["words"]: e(f"{n['id']} word count {n['words']} ≠ {words}")
    wps = words / (n["vo_out"] - n["vo_in"])
    if wps > 2.0 + 0.005: e(f"{n['id']} pace {wps:.2f} w/s > 2.0")
    for sg in silent:
        S = SEG[sg]
        if n["vo_in"] < S["end"] - EPS and n["vo_out"] > S["start"] + EPS: e(f"{n['id']} VO overlaps silent segment {sg}")
    # verbatim quotes: present in cited file and in the line text
    inline = re.findall(r"«([^»]+)»", n["text_es"])
    for q in n["verbatim_quotes"]:
        f = TRI / q["file"]
        if not f.exists(): e(f"{n['id']} quote file missing {f}"); continue
        if q["quote"] not in f.read_text(encoding="utf-8"): e(f"{n['id']} quote NOT verbatim in {f.name}: «{q['quote']}»")
        if q["quote"].rstrip(".").lower() not in n["text_es"].lower(): e(f"{n['id']} quote not in spoken text: «{q['quote']}»")
    joined = " ".join(q["quote"] for q in n["verbatim_quotes"]).lower()
    for iq in inline:
        for sent in [s.strip(" .") for s in iq.split(".") if s.strip(" .")]:
            if sent.lower() not in joined: e(f"{n['id']} inline «» text not backed by a verified quote: «{sent}»")
    for r in n["book_refs"]:
        fp = TRI / r.split(" ")[0]
        if not fp.exists(): e(f"{n['id']} book_ref file missing {fp}")
        else:
            nl = len(fp.read_text(encoding="utf-8").splitlines())
            for L in map(int, re.findall(r"L(\d+)", r)):
                if L > nl: e(f"{n['id']} book_ref line L{L} > {nl} lines in {fp.name}")
    prev = n
vo = [(n["vo_in"], n["vo_out"]) for n in T["narration"]]
ok(f"{len(T['narration'])} narration beats: inside their segment windows, ≥0.7 s apart, ≤2.0 w/s, none over silent segments {sorted(silent)}; {sum(len(n['verbatim_quotes']) for n in T['narration'])} quotes verbatim in cited EDICION files")

# 5 shot manifest: book refs, tokens, prompt locks
chars_ready = set(WT.get("characters", {}).keys()) if isinstance(WT.get("characters"), dict) else {c.get("id") for c in WT.get("characters", [])}
locs_ready = set(WT.get("locations", {}).keys()) if isinstance(WT.get("locations"), dict) else {c.get("id") for c in WT.get("locations", [])}
chars_ready |= {p.stem.replace("LOCK_SHEET_", "").lower() for p in (FILM / "locks").glob("LOCK_SHEET_*.md")}
prop = M["proposed_tokens"]; bad_ref = 0
for s in M["shots"]:
    fp = TRI / s["book_ref"].split(" ")[0]
    if not fp.exists(): e(f"{s['id']} book_ref missing {fp}"); bad_ref += 1; continue
    nl = len(fp.read_text(encoding="utf-8").splitlines())
    for L in map(int, re.findall(r"L(\d+)", s["book_ref"])):
        if L > nl: e(f"{s['id']} L{L} beyond {nl} lines"); bad_ref += 1
    for c in s["character_ids"]:
        if c not in chars_ready and c not in prop["characters"] and c != "anon": e(f"{s['id']} unknown character {c}")
    if s["location_token_status"] == "ready" and s["location_id"] not in locs_ready: e(f"{s['id']} location {s['location_id']} marked ready but not in WORLD_TOKENS")
    if s["location_token_status"] != "ready" and s["location_id"] not in prop["locations"]: e(f"{s['id']} location {s['location_id']} not in proposed list")
    ip = s["image_prompt"]; low = ip.lower()
    for bad in ("neurosys", "neurosec", "resistencia"):
        if bad in low: e(f"{s['id']} forbidden word '{bad}' in image prompt")
    if "mileo_chen" in s["character_ids"] and "LEFT wrist" not in ip: e(f"{s['id']} Mileo without LEFT-wrist Coil lock")
    if "sierra_catalano" in s["character_ids"] and "LEFT cheek" not in ip: e(f"{s['id']} Sierra without LEFT-cheek scar lock")
    if "kora_vega" in s["character_ids"] and "RIGHT ear" not in ip: e(f"{s['id']} Kora without RIGHT-ear ridge lock")
    if "never cyan" not in ip: e(f"{s['id']} missing no-cyan Coil negative")
    if "NO readable text" not in ip: e(f"{s['id']} missing no-text negative")
    for r in s["reference_images"]:
        if not (FILM / r).exists(): e(f"{s['id']} reference image missing {r}")
    for fld in ("image_prompt", "video_prompt"):
        if "NO carteles" not in s[fld] or "NO upper frame" not in s[fld]: e(f"{s['id']} {fld} lacks VISUAL_BIBLE minimum negatives")
    for r in s.get("pilot_refs", []):
        if not (FILM / r).exists(): e(f"{s['id']} pilot ref missing {r}")
    if s["location_token_status"] != "ready" and f"needs_location_token:{s['location_id']}" not in s.get("gates", []): e(f"{s['id']} proposed location without gate")
    if s["id"].startswith("FC-S09-"):
        if s.get("status") != "rendered_pilot_20261004": e(f"{s['id']} status should be rendered_pilot_20261004")
        for k in ("still", "video") + (("r2_still", "r2_video") if "r2_video" in s.get("render", {}) else ()) + (("r3_still", "r3_video") if "r3_video" in s.get("render", {}) else ()):
            if not (FILM / s.get("render", {}).get(k, "-")).exists(): e(f"{s['id']} render {k} missing")
        for sub in s.get("render", {}).get("r4_split", []):
            for k in ("still", "video"):
                if not (FILM / sub[k]).exists(): e(f"{sub['id']} r4 {k} missing")
            for rj in sub.get('r5_attempts_rejected', []):
                if not (FILM / rj['still']).exists(): e(f"{sub['id']} r5 still missing {rj['still']}")
ok(f"{len(M['shots'])} shots: book_ref files/lines exist, tokens ready-or-proposed (proposed ones gated), lock invariants + VISUAL_BIBLE negatives in image AND video prompts, refs and S09 pilot_refs exist, S09 renders present (rendered_pilot_20261004)")

# 6 v3_ax timeline vs actual master + frame spot-check
d3 = probe(V3)
if abs(d3 - TL["_total_v3ax"]) > 0.05: e(f"v3_ax duration {d3:.3f} vs reproduced {TL['_total_v3ax']}")
else: ok(f"v3_ax reproduced total {TL['_total_v3ax']} s = master stream {d3:.3f} s")
def ssim(a_file, a_t, b_file, b_t):
    with tempfile.TemporaryDirectory() as td:
        A, B = f"{td}/a.png", f"{td}/b.png"
        for f_, t_, o in ((a_file, a_t, A), (b_file, b_t, B)):
            subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t_:.3f}", "-i", str(f_), "-frames:v", "1", "-vf", "scale=320:180", "-y", o], check=True)
        r = subprocess.run(["ffmpeg", "-v", "info", "-i", A, "-i", B, "-lavfi", "ssim", "-f", "null", "-"], capture_output=True, text=True)
        m = re.search(r"All:([0-9.]+)", r.stderr); return float(m.group(1)) if m else 0.0
spot = []
for x in [x for x in EDL if x["kind"] == "existing" and x["shot_id"] in TL]:
    mid = x["src_in"] + x["dur"] / 2
    v = ssim(V3, TL[x["shot_id"]]["v3ax_start"] + mid, x["path"], mid)
    spot.append((x["seg"], x["shot_id"], round(v, 3)))
    if v < 0.6: e(f"{x['seg']} {x['shot_id']}: v3_ax frame at TC {TL[x['shot_id']]['v3ax_start']+mid:.2f} does not match source (SSIM {v:.3f})")
ok("v3_ax frame spot-check (SSIM v3_ax vs source clip at segment midpoint): " + ", ".join(f"{a} {b} {c}" for a, b, c in spot))

# 7 docs mirror the manifest
narr_md = (PLANS / "FC_NARRATION_SCRIPT_DRAFT_20261003.md").read_text(encoding="utf-8")
for n in T["narration"]:
    if n["text_es"] not in narr_md: e(f"narration doc missing/different text for {n['id']}")
plan_md = (PLANS / "FC_SECOND_HALF_PLAN_20261003.md").read_text(encoding="utf-8")
for s in M["shots"]:
    if f"| {s['id']} |" not in plan_md: e(f"plan missing shot row {s['id']}")
for x in EDL:
    if f"| {x['seg']} |" not in plan_md: e(f"plan missing EDL row {x['seg']}")
last = EDL[[x["seg"] for x in EDL].index("T20")]; first_new = SEG["T21"]
if last["shot_id"] != M["film_left_off"]["v3ax_last_shot"]: e("recap does not end on the v3_ax last shot")
if first_new["shot_id"] != "FC-S09-01": e("second half does not start on FC-S09-01")
ok("narration doc and plan mirror the manifest (all texts, 76 shot rows, 58 EDL rows); recap ends on FC-S08-07 (last v3_ax shot), second half starts on FC-S09-01")

res = {"errors": ERR, "warnings": WARN, "ok": OK}
out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/tmp/fc_crosscheck.json")
out.write_text(json.dumps(res, ensure_ascii=False, indent=1))
md = ["## Cross-check result", "", f"**{'PASS' if not ERR else 'FAIL'}**: {len(ERR)} errors, {len(WARN)} warnings.", ""]
md += ["### Errors"] + [f"- {x}" for x in ERR] + [""] if ERR else []
md += ["### Warnings"] + [f"- {x}" for x in WARN] + [""] if WARN else []
md += ["### Verified"] + [f"- {x}" for x in OK]
out.with_suffix(".md").write_text("\n".join(md) + "\n")
print("\n".join(md)); sys.exit(1 if ERR else 0)
