#!/usr/bin/env python3
"""FC S10+ runner v1b (2026-10-06, Grok Bot). v1b: per-second rate-limit 429s ('Requests per Second') are paced, not treated as quota: a global submit gap of 0.7 s and up to 6 paced re-sends of the SAME request (2-8 s backoff); any other 429/quota body still STOPs.
Original header: NEW file; derived from fc_s09_pilot_runner_v2_20261003.py (v2.2).
Differences vs v2.2:
- generic: any shot id, output dir per queue (`out_dir` in the queue JSON, relative to FILM), never overwrites.
- token: nw_regen_20260914/xai_client.get_token() (refreshes when <15 min left). On a 401/403 bad-credentials
  it forces ONE keepalive refresh (get_token(force=True)) and re-sends the same request once; second failure = stop.
- quota: any 429 / quota / credit / balance / exhausted / rate-limit body = global STOP (no further calls).
- small thread pool (--workers, default 3). One generation per item; no retry loops on content.
- Grok Imagine only (images: grok-imagine-image-quality, video: grok-imagine-video-1.5). No text models.
Usage: --queue FILE.json --stills|--videos [--workers 3] [--only ID_SUFFIX,...]
"""
import argparse, base64, json, sys, time, threading, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
sys.path.insert(0, "/data/apps/GoalChain/scripts/video_automation/nw_regen_20260914")
import xai_client  # noqa: E402

FILM = Path("/data/apps/GoalChain/docs/publishing/the_neural_wars_trilogy/FILM")
IMG_MODEL = "grok-imagine-image-quality"
VID_MODEL = "grok-imagine-video-1.5"
STOP = threading.Event(); LOCK = threading.Lock(); OUT = None; LOG = None

def log(rec):
    rec["ts"] = datetime.now().astimezone().isoformat(timespec="seconds"); rec["runner"] = "s10plus_v1b"
    with LOCK:
        with LOG.open("a") as f: f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(json.dumps(rec, ensure_ascii=False)[:500], flush=True)

def data_uri(p):
    raw = Path(p).read_bytes()
    mime = "image/png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg" if raw[:3] == b"\xff\xd8\xff" else \
           "image/webp" if raw[:4] == b"RIFF" and raw[8:12] == b"WEBP" else None
    if not mime: raise RuntimeError(f"unsupported image bytes: {p}")
    return f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")

def _req(url, payload, timeout, force=False):
    tok = xai_client.get_token(force=force)
    req = urllib.request.Request(url, data=json.dumps(payload).encode() if payload is not None else None, headers={
        "Authorization": f"Bearer {tok}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r: return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e: return e.code, {"_error_body": e.read().decode(errors="replace")[:800]}
    except Exception as e: return -1, {"_error_body": f"network error: {type(e).__name__}: {e}"}

SUBMIT = threading.Lock(); _last = [0.0]
def _paced(url, payload, timeout, force=False):
    for i in range(7):
        with SUBMIT:
            gap = 0.7 - (time.time() - _last[0])
            if gap > 0: time.sleep(gap)
            _last[0] = time.time()
        code, res = _req(url, payload, timeout, force)
        if code == 429 and "requests per second" in json.dumps(res).lower() and i < 6:
            log({"kind": "ratelimit", "result": "paced_resend", "n": i + 1}); time.sleep(2 + i); continue
        return code, res
    return code, res

def call(url, payload, timeout=180):
    code, res = _paced(url, payload, timeout)
    if code in (401, 403) and "credential" in json.dumps(res).lower() or code == 401:
        log({"kind": "auth", "result": "refresh", "http": code, "note": "forcing keepalive get_token(force=True) once"})
        code, res = _paced(url, payload, timeout, force=True)
    return code, res

def quota_or_fatal(code, res):
    s = json.dumps(res).lower()
    return code in (-1, 401, 402, 403, 429) or any(k in s for k in ("credit", "balance", "exhausted", "quota", "billing", "insufficient", "unauthenticated", "rate limit", "rate-limit", "too many"))

def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r: dest.write_bytes(r.read())

def still(shot):
    if STOP.is_set(): return
    dest = OUT / f"{shot['id']}{shot.get('out_suffix', '')}.png"
    if dest.exists(): log({"shot": shot["id"] + shot.get("out_suffix", ""), "kind": "still", "result": "skip_exists"}); return
    refs = [FILM / r for r in shot.get("pilot_refs", [])]
    if refs:
        if len(refs) == 1: refs = refs * 2
        url = "https://api.x.ai/v1/images/edits"
        payload = {"model": IMG_MODEL, "prompt": shot["image_prompt"], "aspect_ratio": shot.get("aspect", "16:9"), "image": [data_uri(r) for r in refs[:2]]}
    else:
        url = "https://api.x.ai/v1/images/generations"
        payload = {"model": IMG_MODEL, "prompt": shot["image_prompt"], "aspect_ratio": shot.get("aspect", "16:9")}
    t0 = time.time(); code, res = call(url, payload)
    rec = {"shot": shot["id"] + shot.get("out_suffix", ""), "kind": "still", "endpoint": url.split("x.ai")[1], "refs": shot.get("pilot_refs", [])[:2], "http": code, "secs": round(time.time() - t0, 1)}
    if code == 200 and res.get("data") and res["data"][0].get("url"):
        try: download(res["data"][0]["url"], dest)
        except Exception as e: rec.update(result="error", error=f"download {e}"); log(rec); return
        rec.update(result="ok", path=str(dest.relative_to(FILM)), bytes=dest.stat().st_size); log(rec); return
    rec.update(result="error", error=res.get("_error_body", str(res)[:400])); log(rec)
    if quota_or_fatal(code, res): STOP.set(); log({"kind": "stop", "reason": rec["error"][:300], "http": code})

def video(shot):
    if STOP.is_set(): return
    sfx = shot.get("out_suffix", ""); vs = shot.get("video_suffix", sfx)
    src, dest = OUT / f"{shot['id']}{sfx}.png", OUT / f"{shot['id']}{vs}.mp4"
    if dest.exists(): log({"shot": shot["id"] + vs, "kind": "video", "result": "skip_exists"}); return
    if not src.exists(): log({"shot": shot["id"] + sfx, "kind": "video", "result": "skip_no_still"}); return
    payload = {"model": VID_MODEL, "prompt": shot["video_prompt"], "image": {"url": data_uri(src)},
               "duration": int(shot.get("duration_s", 6)), "resolution": "720p", "aspect_ratio": "16:9"}
    t0 = time.time(); code, res = call("https://api.x.ai/v1/videos/generations", payload, timeout=90)
    rec = {"shot": shot["id"] + vs, "kind": "video", "http": code}
    rid = (res.get("request_id") or res.get("id")) if code == 200 else None
    if not rid:
        rec.update(result="error", error=res.get("_error_body", str(res)[:400])); log(rec)
        if quota_or_fatal(code, res): STOP.set(); log({"kind": "stop", "reason": rec["error"][:300], "http": code})
        return
    url = st = None
    for _ in range(240):
        time.sleep(4)
        c2, pd = _req(f"https://api.x.ai/v1/videos/{rid}", None, 20)
        st = pd.get("status") if isinstance(pd, dict) else None
        if st in ("done", "completed"): url = (pd.get("video") or {}).get("url") or pd.get("url"); break
        if st in ("failed", "error", "expired"): rec["poll_body"] = str(pd)[:300]; break
    rec.update(secs=round(time.time() - t0, 1), final_status=st)
    if url:
        try: download(url, dest)
        except Exception as e: rec.update(result="error", error=f"download {e}"); log(rec); return
        rec.update(result="ok", path=str(dest.relative_to(FILM)), bytes=dest.stat().st_size); log(rec); return
    rec.update(result="error", error=f"no video url (status={st})"); log(rec)
    if quota_or_fatal(0, pd if isinstance(pd, dict) else {}): STOP.set(); log({"kind": "stop", "reason": "video poll quota/credit", "http": c2})

def main():
    global OUT, LOG
    ap = argparse.ArgumentParser(); g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--stills", action="store_true"); g.add_argument("--videos", action="store_true")
    ap.add_argument("--queue", required=True); ap.add_argument("--workers", type=int, default=3); ap.add_argument("--only", default="")
    a = ap.parse_args()
    q = json.load(open(FILM / "plans" / a.queue))
    OUT = FILM / q["out_dir"]; OUT.mkdir(parents=True, exist_ok=True); LOG = OUT / "run_log.jsonl"
    only = {x.strip() for x in a.only.split(",") if x.strip()}
    shots = [s for s in q["shots"] if not only or (s["id"] + s.get("out_suffix", "")) in only or s["id"] in only]
    log({"kind": "start", "queue": a.queue, "mode": "videos" if a.videos else "stills", "n": len(shots)})
    with ThreadPoolExecutor(a.workers) as ex: list(ex.map(video if a.videos else still, shots))
    log({"kind": "end", "stopped": STOP.is_set()})
    return 3 if STOP.is_set() else 0

if __name__ == "__main__":
    sys.exit(main())
