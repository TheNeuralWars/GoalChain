#!/usr/bin/env python3
"""xAI Imagine client for the Neural Wars FILM regen (2026-09-14).

- OAuth token from /home/ubuntu/.grok/auth.json, refreshed via auth.x.ai when
  expiring (persists the rotated refresh_token; xAI rotates on every refresh).
- Image gen: /v1/images/generations (text) and /v1/images/edits (1-3 refs).
- Video i2v: /v1/videos/generations with grok-imagine-video-1.5 + base64 image.
Never prints secrets.
"""
from __future__ import annotations

import base64
import json
import os
import shutil
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import List, Optional, Tuple

AUTH_PATH = Path("/home/ubuntu/.grok/auth.json")
IMG_URL = "https://api.x.ai/v1/images/generations"
IMG_EDIT_URL = "https://api.x.ai/v1/images/edits"
VID_URL = "https://api.x.ai/v1/videos/generations"
VID_STATUS = "https://api.x.ai/v1/videos/{rid}"

_lock = threading.Lock()
_cached: Optional[Tuple[str, float]] = None


def _read_auth():
    d = json.loads(AUTH_PATH.read_text())
    k = list(d.keys())[0]
    return d, k, d[k]


def _refresh(v: dict) -> dict:
    body = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": v["refresh_token"],
        "client_id": v["oidc_client_id"],
    }).encode()
    req = urllib.request.Request(
        "https://auth.x.ai/oauth2/token", data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def get_token(force: bool = False) -> str:
    """Return a valid access token, refreshing when < 15 min left."""
    global _cached
    with _lock:
        if _cached and not force and _cached[1] - time.time() > 900:
            return _cached[0]
        d, k, v = _read_auth()
        exp = v.get("expires_at") or ""
        try:
            exp_ts = time.mktime(time.strptime(exp[:19], "%Y-%m-%dT%H:%M:%S")) - time.timezone
        except Exception:
            exp_ts = 0
        if force or exp_ts - time.time() < 900:
            res = _refresh(v)
            shutil.copy(AUTH_PATH, str(AUTH_PATH) + ".bak")
            v["key"] = res["access_token"]
            if res.get("refresh_token"):
                v["refresh_token"] = res["refresh_token"]
            v["create_time"] = time.strftime("%Y-%m-%dT%H:%M:%S.000000000Z", time.gmtime())
            v["expires_at"] = time.strftime(
                "%Y-%m-%dT%H:%M:%S.000000000Z",
                time.gmtime(time.time() + int(res.get("expires_in", 21600))),
            )
            d[k] = v
            AUTH_PATH.write_text(json.dumps(d, indent=2))
            os.chmod(AUTH_PATH, 0o600)
            tok = res["access_token"]
            ttl = int(res.get("expires_in", 21600))
        else:
            tok = v["key"]
            ttl = max(1, int(exp_ts - time.time()))
        _cached = (tok, time.time() + ttl)
        return tok


def _post(url: str, payload: dict, timeout: int = 120):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {get_token()}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def _data_uri(p: Path) -> Tuple[str, str]:
    raw = p.read_bytes()
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif raw[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise RuntimeError(f"unsupported image bytes: {p}")
    return mime, base64.b64encode(raw).decode("ascii")


def generate_image(prompt: str, dest: Path, refs: Optional[List[Path]] = None,
                   model: str = "grok-imagine-image-quality", aspect: str = "16:9",
                   resolution: str = "2k", retries: int = 2) -> Path:
    refs = [Path(r) for r in (refs or [])]
    last = None
    for attempt in range(retries + 1):
        try:
            if refs:
                payload = {"model": model, "prompt": prompt, "aspect_ratio": aspect,
                           "image": [f"data:{m};base64,{b}"
                                     for m, b in (_data_uri(r) for r in refs[:2])]}
            else:
                payload = {"model": model, "prompt": prompt, "aspect_ratio": aspect}
                if model == "grok-imagine-image-2.0":
                    payload["resolution"] = resolution
            res = _post(IMG_EDIT_URL if refs else IMG_URL, payload)
            url = res["data"][0].get("url")
            if not url:
                raise RuntimeError(f"no url in image response: {str(res)[:200]}")
            dest.parent.mkdir(parents=True, exist_ok=True)
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=90) as r:
                dest.write_bytes(r.read())
            return dest
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(3 + 3 * attempt)
    raise RuntimeError(f"image gen failed after retries: {last}")


def generate_video(prompt: str, image: Path, dest: Path, duration: int = 6,
                   model: str = "grok-imagine-video-1.5", resolution: str = "720p",
                   retries: int = 2, poll_timeout_s: int = 300) -> Path:
    image = Path(image)
    if not image.is_file():
        raise RuntimeError(f"i2v source missing: {image}")
    last = None
    for attempt in range(retries + 1):
        try:
            mime, b64 = _data_uri(image)
            res = _post(VID_URL, {"model": model, "prompt": prompt,
                                  "image": {"url": f"data:{mime};base64,{b64}"},
                                  "duration": duration, "resolution": resolution,
                                  "aspect_ratio": "16:9"}, timeout=90)
            rid = res.get("request_id") or res.get("id")
            if not rid:
                raise RuntimeError(f"no request_id: {str(res)[:200]}")
            t0 = time.time()
            while time.time() - t0 < poll_timeout_s:
                time.sleep(4)
                try:
                    rq = urllib.request.Request(VID_STATUS.format(rid=rid),
                                                headers={"Authorization": f"Bearer {get_token()}"})
                    with urllib.request.urlopen(rq, timeout=20) as r:
                        pd = json.loads(r.read())
                except Exception:
                    continue
                st = pd.get("status")
                if st in ("done", "completed"):
                    vurl = (pd.get("video") or {}).get("url") or pd.get("url")
                    if not vurl:
                        raise RuntimeError("done but no video url")
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    req = urllib.request.Request(vurl, headers={"User-Agent": "Mozilla/5.0"})
                    with urllib.request.urlopen(req, timeout=180) as r:
                        dest.write_bytes(r.read())
                    return dest
                if st in ("failed", "expired", "moderated"):
                    raise RuntimeError(f"render status={st}: {str(pd)[:200]}")
            raise RuntimeError("video poll timeout")
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(4 + 4 * attempt)
    raise RuntimeError(f"video gen failed after retries: {last}")