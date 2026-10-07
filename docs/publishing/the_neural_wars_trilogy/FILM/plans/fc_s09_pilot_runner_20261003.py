#!/usr/bin/env python3
"""FC-S09 pilot runner (2026-10-03, Grok Bot). NEW file; writes only into a NEW render dir.
Single attempt per call, no retry loops. Stops at the first HTTP 402/403 (or any credit/auth error)
and records the exact error. Never overwrites an existing output. Token via the pipeline's
get_xai_token() (never printed).
  --test            one minimal call: the FC-S09-01 still (anchored)  -> TEST_RESULT.json
  --stills          remaining S09 stills (one call each)
  --videos          i2v for every still that exists (one submit each; polling is not a retry)
"""
import argparse, base64, json, sys, time, urllib.request, urllib.error
from datetime import datetime
from pathlib import Path
sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation")
from novel_film_builder import get_xai_token, _image_payload  # noqa: E402

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
OUT = FILM / "renders/FC-S09_pilot_20261003"
MANIFEST = FILM / "plans/FC_SECOND_HALF_SHOTS_20261003.json"
LOG = OUT / "pilot_log.jsonl"
# one anchor per shot (single `image` field). None = text-only (no faces / tiny figures)
ANCHOR = {
 "FC-S09-01": "renders/FC-S08/FC-S08-07.png",   # same hatch, continuity from the last v3_ax frame
 "FC-S09-02": None,                              # tiny figures in a vast hall
 "FC-S09-03": "locks/refs/mileo_chen/front.png",
 "FC-S09-04": None,                              # object only
 "FC-S09-05": "renders/FC-S08/FC-S08-03.png",   # Mileo + Riv in sanitation jumpsuits
 "FC-S09-06": "locks/refs/mileo_chen/front.png",
 "FC-S09-07": None,                              # abstract vision
 "FC-S09-08": "locks/refs/sierra_catalano/front.png",
}

class Stop(Exception):
    pass

def log(rec):
    rec["ts"] = datetime.now().astimezone().isoformat(timespec="seconds")
    OUT.mkdir(parents=True, exist_ok=True)
    with LOG.open("a") as f: f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(json.dumps(rec, ensure_ascii=False)[:600], flush=True)

def post(url, token, payload, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={
        "Authorization": f"Bearer {token}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:800]
        return e.code, {"_error_body": body}

def fatal(code, body):
    s = json.dumps(body).lower()
    return code in (401, 402, 403, 429) or any(k in s for k in ("credit", "balance", "exhausted", "quota", "billing", "insufficient"))

def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        dest.write_bytes(r.read())

def still(shot, token):
    dest = OUT / f"{shot['id']}.png"
    if dest.exists():
        log({"shot": shot["id"], "kind": "still", "result": "skip_exists"}); return True
    payload = {"model": "grok-imagine-image", "prompt": shot["image_prompt"]}
    anc = ANCHOR.get(shot["id"])
    if anc:
        payload["image"] = _image_payload(FILM / anc)["url"]
    t0 = time.time(); code, res = post("https://api.x.ai/v1/images/generations", token, payload)
    rec = {"shot": shot["id"], "kind": "still", "endpoint": "POST /v1/images/generations", "model": "grok-imagine-image",
           "anchor": anc, "http": code, "secs": round(time.time() - t0, 1)}
    if code == 200 and res.get("data"):
        download(res["data"][0]["url"], dest); rec.update(result="ok", path=str(dest), bytes=dest.stat().st_size); log(rec); return True
    rec.update(result="error", error=res.get("_error_body", res)); log(rec)
    if fatal(code, res): raise Stop(rec)
    return False

def video(shot, token):
    src = OUT / f"{shot['id']}.png"; dest = OUT / f"{shot['id']}.mp4"
    if dest.exists():
        log({"shot": shot["id"], "kind": "video", "result": "skip_exists"}); return True
    if not src.exists():
        log({"shot": shot["id"], "kind": "video", "result": "skip_no_still"}); return False
    payload = {"model": "grok-imagine-video-1.5", "prompt": shot["video_prompt"], "image": _image_payload(src),
               "duration": int(shot.get("duration_s", 6)), "resolution": "720p", "aspect_ratio": "16:9"}
    t0 = time.time(); code, res = post("https://api.x.ai/v1/videos/generations", token, payload, timeout=60)
    rec = {"shot": shot["id"], "kind": "video", "endpoint": "POST /v1/videos/generations", "model": "grok-imagine-video-1.5", "http": code}
    rid = res.get("request_id") or res.get("id") if code == 200 else None
    if not rid:
        rec.update(result="error", error=res.get("_error_body", res)); log(rec)
        if fatal(code, res): raise Stop(rec)
        return False
    url = None; st = None
    for _ in range(240):  # poll ≤ 12 min (status checks of ONE job, not retries)
        time.sleep(3)
        req = urllib.request.Request(f"https://api.x.ai/v1/videos/{rid}", headers={"Authorization": f"Bearer {token}", "User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=20) as r: pd = json.loads(r.read().decode())
        except Exception as e:  # noqa: BLE001
            pd = {"status": f"poll_warn {e}"}
        st = pd.get("status")
        if st in ("done", "completed"):
            url = (pd.get("video") or {}).get("url") or pd.get("url"); break
        if st in ("failed", "error", "expired"):
            break
    rec["secs"] = round(time.time() - t0, 1); rec["final_status"] = st
    if url:
        download(url, dest); rec.update(result="ok", path=str(dest), bytes=dest.stat().st_size); log(rec); return True
    rec.update(result="error", error=f"no video url (status={st})"); log(rec); return False

def main():
    ap = argparse.ArgumentParser(); g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--test", action="store_true"); g.add_argument("--stills", action="store_true"); g.add_argument("--videos", action="store_true")
    a = ap.parse_args()
    shots = [s for s in json.load(open(MANIFEST))["shots"] if s["id"].startswith("FC-S09-")]
    token = get_xai_token()
    if not token:
        log({"kind": "auth", "result": "error", "error": "no token in ~/.grok/auth.json"}); return 2
    try:
        if a.test:
            ok = still(shots[0], token)
            (OUT / "TEST_RESULT.json").write_text(json.dumps({"ok": ok, "see": str(LOG)}, indent=1)); return 0 if ok else 1
        for s in shots:
            (still if a.stills else video)(s, token)
    except Stop as e:
        (OUT / "STOPPED.json").write_text(json.dumps({"stopped_on": e.args[0]}, ensure_ascii=False, indent=1))
        print("STOPPED on credit/auth error; no further calls.", flush=True); return 3
    return 0

if __name__ == "__main__":
    sys.exit(main())
