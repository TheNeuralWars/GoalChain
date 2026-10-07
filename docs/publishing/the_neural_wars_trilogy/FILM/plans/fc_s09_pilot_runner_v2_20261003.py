#!/usr/bin/env python3
"""FC-S09 pilot runner v2 (2026-10-04, Grok Bot; supersedes v1 after Hermes review R5). NEW file.
- Single attempt per call, no retry loops. Stops at the first 401/402/403/429, credit/auth error or network
  failure and records it in STOPPED.json. Never overwrites. Writes only into renders/FC-S09_pilot_20261003/.
- Gates honoured: a shot whose manifest `gates` are not all listed in --approve-gates is SKIPPED (no call).
  (S09-02..08 need `needs_location_token:node_17_server_cathedral` approved by Nico/Director.)
- Stills: shots with `pilot_refs` -> POST /v1/images/edits with 2 refs (v2.1: 3 refs gave HTTP 400) (single ref is duplicated: the edit
  endpoint rejects one ref, lock-sheet pipeline note); without refs -> POST /v1/images/generations.
  Payload shape and model follow the last working regen client (nw_regen_20260914/xai_client.py).
- Video: POST /v1/videos/generations, grok-imagine-video-1.5, image object {url: data-URI}, 6 s, 720p, 16:9.
- Token: the pipeline's get_xai_token() (~/.grok/auth.json), never printed, NOT refreshed here. If it returns
  401/403 bad-credentials, the owner must refresh the Grok/xAI login first.
Usage:  --test | --stills | --videos   [--approve-gates needs_location_token:node_17_server_cathedral] [--only FC-S09-01,...]
"""
import argparse, base64, json, sys, time, urllib.request, urllib.error
from datetime import datetime
from pathlib import Path
sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")
from novel_film_builder import get_xai_token  # noqa: E402

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
OUT = FILM / "renders/FC-S09_pilot_20261003"
MANIFEST = FILM / "plans/FC_SECOND_HALF_SHOTS_20261003.json"
LOG = OUT / "pilot_log.jsonl"
IMG_MODEL = "grok-imagine-image-quality"
VID_MODEL = "grok-imagine-video-1.5"

class Stop(Exception):
    pass

def log(rec):
    rec["ts"] = datetime.now().astimezone().isoformat(timespec="seconds"); rec["runner"] = "v2"
    OUT.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as f: f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(json.dumps(rec, ensure_ascii=False)[:600], flush=True)

def data_uri(p: Path) -> str:
    raw = p.read_bytes()
    mime = "image/png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg" if raw[:3] == b"\xff\xd8\xff" else \
           "image/webp" if raw[:4] == b"RIFF" and raw[8:12] == b"WEBP" else None
    if not mime: raise RuntimeError(f"unsupported image bytes: {p}")
    return f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")

def post(url, token, payload, timeout=180):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={
        "Authorization": f"Bearer {token}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, {"_error_body": e.read().decode(errors="replace")[:800]}
    except Exception as e:  # network / timeout -> recorded stop, no retry
        return -1, {"_error_body": f"network error: {type(e).__name__}: {e}"}

def fatal(code, body):
    s = json.dumps(body).lower()
    return code in (-1, 401, 402, 403, 429) or any(k in s for k in ("credit", "balance", "exhausted", "quota", "billing", "insufficient", "unauthenticated"))

def download(url, dest):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=120) as r: dest.write_bytes(r.read())
    except Exception as e:
        raise Stop({"kind": "download", "result": "error", "error": f"{type(e).__name__}: {e}", "dest": str(dest)})

def gated(shot, approved):
    missing = [g for g in shot.get("gates", []) if g not in approved]
    if missing: log({"shot": shot["id"], "result": "skip_gated", "missing_approval": missing})
    return bool(missing)

def still(shot, token):
    dest = OUT / f"{shot['id']}{shot.get('out_suffix', '')}.png"
    if dest.exists(): log({"shot": shot["id"], "kind": "still", "result": "skip_exists"}); return
    refs = [FILM / r for r in shot.get("pilot_refs", [])]
    if refs:
        if len(refs) == 1: refs = refs * 2
        url = "https://api.x.ai/v1/images/edits"
        payload = {"model": IMG_MODEL, "prompt": shot["image_prompt"], "aspect_ratio": "16:9", "image": [data_uri(r) for r in refs[:2]]}  # v2.1 2026-10-04: 3 refs -> HTTP 400 "Cannot set both 'url' and 'file_id'"; max 2 like nw_regen_20260914
    else:
        url = "https://api.x.ai/v1/images/generations"
        payload = {"model": IMG_MODEL, "prompt": shot["image_prompt"], "aspect_ratio": "16:9"}
    t0 = time.time(); code, res = post(url, token, payload)
    rec = {"shot": shot["id"], "kind": "still", "endpoint": "POST " + url.split("x.ai")[1], "model": IMG_MODEL,
           "refs": shot.get("pilot_refs", []), "http": code, "secs": round(time.time() - t0, 1)}
    if code == 200 and res.get("data") and res["data"][0].get("url"):
        download(res["data"][0]["url"], dest); rec.update(result="ok", path=str(dest), bytes=dest.stat().st_size); log(rec); return
    rec.update(result="error", error=res.get("_error_body", str(res)[:400])); log(rec)
    if fatal(code, res): raise Stop(rec)

def video(shot, token):
    sfx = shot.get("out_suffix", "")
    src, dest = OUT / f"{shot['id']}{sfx}.png", OUT / f"{shot['id']}{sfx}.mp4"
    if dest.exists(): log({"shot": shot["id"], "kind": "video", "result": "skip_exists"}); return
    if not src.exists(): log({"shot": shot["id"], "kind": "video", "result": "skip_no_still"}); return
    payload = {"model": VID_MODEL, "prompt": shot["video_prompt"], "image": {"url": data_uri(src)},
               "duration": int(shot.get("duration_s", 6)), "resolution": "720p", "aspect_ratio": "16:9"}
    t0 = time.time(); code, res = post("https://api.x.ai/v1/videos/generations", token, payload, timeout=90)
    rec = {"shot": shot["id"], "kind": "video", "endpoint": "POST /v1/videos/generations", "model": VID_MODEL, "http": code}
    rid = (res.get("request_id") or res.get("id")) if code == 200 else None
    if not rid:
        rec.update(result="error", error=res.get("_error_body", str(res)[:400])); log(rec)
        if fatal(code, res): raise Stop(rec)
        return
    url = st = None
    for _ in range(240):  # status checks of ONE submitted job (≤12 min), not retries
        time.sleep(3)
        req = urllib.request.Request(f"https://api.x.ai/v1/videos/{rid}", headers={"Authorization": f"Bearer {token}", "User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=20) as r: pd = json.loads(r.read().decode())
        except Exception as e:  # noqa: BLE001
            pd = {"status": f"poll_warn {type(e).__name__}"}
        st = pd.get("status")
        if st in ("done", "completed"): url = (pd.get("video") or {}).get("url") or pd.get("url"); break
        if st in ("failed", "error", "expired"): break
    rec.update(secs=round(time.time() - t0, 1), final_status=st)
    if url: download(url, dest); rec.update(result="ok", path=str(dest), bytes=dest.stat().st_size); log(rec); return
    rec.update(result="error", error=f"no video url (status={st})"); log(rec)

def main():
    ap = argparse.ArgumentParser(); g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--test", action="store_true"); g.add_argument("--stills", action="store_true"); g.add_argument("--videos", action="store_true")
    ap.add_argument("--approve-gates", default=""); ap.add_argument("--only", default="")
    ap.add_argument("--queue", default="", help="v2.2: regen queue JSON (shots with out_suffix, e.g. _r2); never overwrites")
    ap.add_argument("--dry-run", action="store_true", help="list planned calls, make none")
    a = ap.parse_args()
    approved = {x.strip() for x in a.approve_gates.split(",") if x.strip()}
    only = {x.strip() for x in a.only.split(",") if x.strip()}
    src_shots = json.load(open(FILM / "plans" / a.queue))["shots"] if a.queue else json.load(open(MANIFEST))["shots"]
    shots = [s for s in src_shots if s["id"].startswith("FC-S09-") and (not only or s["id"] in only)]
    if a.test: shots = [s for s in shots if s["id"] == "FC-S09-01"]
    if a.dry_run:
        for s in shots: print("DRY", "video" if a.videos else "still", s["id"] + s.get("out_suffix", ""), "refs", s.get("pilot_refs", [])[:2], "gates", s.get("gates", []))
        return 0
    token = get_xai_token()
    if not token: log({"kind": "auth", "result": "error", "error": "no token in ~/.grok/auth.json"}); return 2
    try:
        for s in shots:
            if gated(s, approved): continue
            (video if a.videos else still)(s, token)
    except Stop as e:
        (OUT / f"STOPPED_v2_{datetime.now().strftime('%Y%m%dT%H%M%S')}.json").write_text(json.dumps({"stopped_on": e.args[0]}, ensure_ascii=False, indent=1))
        print("STOPPED on auth/credit/network error; no further calls.", flush=True); return 3
    return 0

if __name__ == "__main__":
    sys.exit(main())
