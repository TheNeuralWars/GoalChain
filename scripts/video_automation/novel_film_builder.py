#!/usr/bin/env python3
"""
novel_film_builder.py — Film pipeline builder for The Neural Wars (and similar).

CLI:
  --storyboard PATH   Storyboard JSON (required)
  --outdir PATH       FILM root or renders target (required)
  --shots IDS         Optional comma list of shot ids (e.g. FC-S01-01,FC-S01-02)
  --skip-existing     Skip shot if render file already exists
  --dry-run           Print planned shots; do not generate
  --max-shots N       Default 8, hard cap

Reuses Grok CLI pattern from grok_super_pipeline.py (local VPS execution).
No Buffer/X posting. Horizontal 16:9 for film.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import shlex
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

GROK_BIN = "/home/ubuntu/.local/bin/grok"
SCRATCH_DIR = Path("/home/ubuntu/scratch")
SESSION_LOCK_DIR = Path("/home/ubuntu/.grok/sessions") / ".hermes_locks"
HUNT_ROOTS = [
    Path("/home/ubuntu/.grok/sessions"),
    Path("/home/ubuntu/scratch/generated_images"),
    Path("/data/apps/GoalChain/scratch/generated_images"),
]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("novel_film_builder")


def run_grok_with_prompt_file(grok_prompt: str) -> str:
    """Write prompt to scratch temp file and run Grok CLI with --prompt-file."""
    SCRATCH_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = SCRATCH_DIR / f"temp_prompt_{uuid.uuid4().hex[:12]}.txt"
    temp_path.write_text(grok_prompt, encoding="utf-8")
    cmd = f"{GROK_BIN} --prompt-file {temp_path}"
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, encoding="utf-8")
        if res.returncode != 0:
            raise RuntimeError(
                f"Grok failed code={res.returncode}\nCMD: {cmd}\n"
                f"STDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}"
            )
        return (res.stdout or "").strip()
    finally:
        try:
            temp_path.unlink(missing_ok=True)
        except Exception:
            pass


def _acquire_lock(prefix: str) -> Path:
    SESSION_LOCK_DIR.mkdir(parents=True, exist_ok=True)
    lock = SESSION_LOCK_DIR / f"{prefix}_{os.getpid()}_{uuid.uuid4().hex[:8]}.lock"
    lock.write_text(
        datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        encoding="utf-8",
    )
    return lock


def _clear_old_media(patterns: List[str], lock: Path) -> None:
    """Remove media under sessions older than our lock (preserve concurrent newer files)."""
    for pat in patterns:
        clear_cmd = (
            f"find /home/ubuntu/.grok/sessions/ -maxdepth 8 -name {shlex.quote(pat)} "
            f"! -newer {shlex.quote(str(lock))} "
            f"2>/dev/null -exec rm -f {{}} + 2>/dev/null || true"
        )
        subprocess.run(clear_cmd, shell=True, capture_output=True, encoding="utf-8")


def _hunt_newest(extensions: List[str]) -> Optional[Path]:
    best: Optional[Path] = None
    best_mtime = -1.0
    for root in HUNT_ROOTS:
        if not root.exists():
            continue
        for ext in extensions:
            for p in root.rglob(f"*{ext}"):
                if not p.is_file():
                    continue
                try:
                    m = p.stat().st_mtime
                except OSError:
                    continue
                if m > best_mtime:
                    best_mtime = m
                    best = p
    return best


def get_xai_token() -> Optional[str]:
    auth_file = Path("/home/ubuntu/.grok/auth.json")
    if not auth_file.exists():
        auth_file = Path(os.path.expanduser("~/.grok/auth.json"))
    if auth_file.exists():
        try:
            d = json.loads(auth_file.read_text(encoding="utf-8"))
            k = list(d.keys())[0]
            return d[k].get("key")
        except Exception:
            pass
    return None


def generate_image_api(image_prompt: str, dest: Path) -> Path:
    import urllib.request
    import urllib.error

    token = get_xai_token()
    if not token:
        raise RuntimeError("No xAI token found in ~/.grok/auth.json")

    payload = json.dumps({
        "model": "grok-imagine-image",
        "prompt": f"{image_prompt}, cinematic lighting, 16:9 aspect ratio, 8k detail"
    }).encode("utf-8")

    req = urllib.request.Request("https://api.x.ai/v1/images/generations", data=payload, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })

    log.info("Generating image via xAI API directly (grok-imagine-image)...")
    with urllib.request.urlopen(req, timeout=45) as resp:
        res = json.loads(resp.read().decode())
        url = res["data"][0]["url"]

    # Download image to dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    img_dl_req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(img_dl_req, timeout=30) as r:
        dest.write_bytes(r.read())

    log.info("Image saved successfully: %s", dest)
    return dest



def generate_video_api(video_prompt: str, image_path: Path, dest: Path) -> Path:
    import urllib.request
    import urllib.error

    token = get_xai_token()
    if not token:
        raise RuntimeError("No xAI token found in ~/.grok/auth.json")

    # For image-to-video, upload or encode image, or start text-to-video with high-context scene description
    payload_dict = {
        "model": "grok-imagine-video",
        "prompt": f"{video_prompt}, cinematic 16:9, volumetric lighting, photorealistic 8k"
    }

    payload = json.dumps(payload_dict).encode("utf-8")
    req = urllib.request.Request("https://api.x.ai/v1/videos/generations", data=payload, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })

    log.info("Submitting video generation to xAI API (grok-imagine-video)...")
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode())
        request_id = res.get("request_id") or res.get("id")

    if not request_id:
        raise RuntimeError(f"No request_id returned from video submit: {res}")

    log.info("Waiting for video render (request_id=%s)...", request_id)
    status_url = f"https://api.x.ai/v1/videos/{request_id}"
    video_url = None
    for _ in range(40):
        time.sleep(3)
        poll_req = urllib.request.Request(status_url, headers={"Authorization": f"Bearer {token}"})
        try:
            with urllib.request.urlopen(poll_req, timeout=10) as poll_resp:
                poll_data = json.loads(poll_resp.read().decode())
                st = poll_data.get("status")
                prog = poll_data.get("progress", 0)
                log.info("  Video progress: status=%s (%s%%)", st, prog)
                if st == "done" or st == "completed":
                    video_url = poll_data.get("video", {}).get("url") or poll_data.get("url")
                    break
        except Exception as e:
            log.warning("Polling warning: %s", e)

    if not video_url:
        raise RuntimeError(f"Video render timed out or failed for request_id {request_id}")

    # Download video to dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    vid_dl_req = urllib.request.Request(video_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(vid_dl_req, timeout=45) as r:
        dest.write_bytes(r.read())

    log.info("Video saved successfully: %s", dest)
    return dest


def generate_image(image_prompt: str, dest: Path) -> Path:
    if not image_prompt or not image_prompt.strip():
        raise RuntimeError("image_prompt is empty — refusing Grok call.")

    # Try direct xAI API first (robust, no terminal/TUI hang)
    try:
        return generate_image_api(image_prompt, dest)
    except Exception as e:
        log.warning("Direct xAI API failed (%s); falling back to Grok CLI...", e)

    lock = _acquire_lock("img")
    try:
        log.info("Clearing stale session images (preserving newer than lock)...")
        _clear_old_media(["*.jpg", "*.png"], lock)
    finally:
        try:
            lock.unlink(missing_ok=True)
        except Exception:
            pass

    wrap = (
        "Genera una imagen con el modelo de alta calidad "
        f"(grok-imagine-image-quality): {image_prompt}"
    )
    log.info("Generating image via Grok CLI...")
    run_grok_with_prompt_file(wrap)
    time.sleep(1)

    found = _hunt_newest([".jpg", ".png", ".jpeg", ".webp"])
    if not found:
        raise RuntimeError("No image found under hunt roots after Grok generation.")

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(found.read_bytes())
    log.info("Image saved: %s (from %s)", dest, found)
    return dest


def generate_video(video_prompt: str, image_path: Path, dest: Path) -> Path:
    if not video_prompt or not video_prompt.strip():
        raise RuntimeError("video_prompt is empty — refusing Grok call.")
    if not image_path.is_file():
        raise RuntimeError(f"Source image missing for video: {image_path}")

    # Try direct xAI API first
    try:
        return generate_video_api(video_prompt, image_path, dest)
    except Exception as e:
        log.warning("Direct xAI API video failed (%s); falling back to Grok CLI...", e)

    lock = _acquire_lock("vid")
    try:
        log.info("Clearing stale session videos (preserving newer than lock)...")
        _clear_old_media(["*.mp4"], lock)
    finally:
        try:
            lock.unlink(missing_ok=True)
        except Exception:
            pass

    wrap = (
        "Genera un video horizontal 16:9 (grok-imagine-video) a partir de la imagen "
        f"'{image_path}' usando este prompt de animación: {video_prompt}"
    )
    log.info("Generating video via Grok CLI (16:9)...")
    run_grok_with_prompt_file(wrap)
    time.sleep(1)

    found = _hunt_newest([".mp4", ".webm"])
    if not found:
        raise RuntimeError("No video found under hunt roots after Grok generation.")

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(found.read_bytes())
    log.info("Video saved: %s (from %s)", dest, found)
    return dest



def load_storyboard(path: Path) -> Dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if "shots" not in data or not isinstance(data["shots"], list):
        raise ValueError(f"Storyboard missing shots[]: {path}")
    return data


def resolve_renders_dir(outdir: Path, storyboard: Dict[str, Any]) -> Path:
    """Prefer outdir/renders/<scene_id> when outdir looks like FILM root."""
    scene_id = storyboard.get("scene_id") or "scene"
    candidate = outdir / "renders" / scene_id
    if (
        (outdir / "renders").is_dir()
        or (outdir / "scenes").is_dir()
        or (outdir / "ledger.json").exists()
    ):
        candidate.mkdir(parents=True, exist_ok=True)
        return candidate
    outdir.mkdir(parents=True, exist_ok=True)
    return outdir


def resolve_reports_dir(outdir: Path) -> Path:
    if (
        (outdir / "renders").is_dir()
        or (outdir / "scenes").is_dir()
        or (outdir / "ledger.json").exists()
    ):
        reports = outdir / "reports"
        reports.mkdir(parents=True, exist_ok=True)
        return reports
    # If outdir is .../renders/FC-S01, reports is .../FILM/reports
    if outdir.parent.name == "renders":
        reports = outdir.parent.parent / "reports"
        reports.mkdir(parents=True, exist_ok=True)
        return reports
    reports = outdir / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    return reports


def shot_paths(renders_dir: Path, shot_id: str) -> Dict[str, Path]:
    return {
        "image": renders_dir / f"{shot_id}.png",
        "video": renders_dir / f"{shot_id}.mp4",
        "meta": renders_dir / f"{shot_id}.meta.json",
    }


def filter_shots(
    shots: List[Dict[str, Any]],
    shot_ids: Optional[List[str]],
    max_shots: int,
) -> List[Dict[str, Any]]:
    ordered = sorted(shots, key=lambda s: int(s.get("order", 0)))
    if shot_ids:
        wanted = set(shot_ids)
        ordered = [s for s in ordered if s.get("id") in wanted]
        missing = wanted - {s.get("id") for s in ordered}
        if missing:
            log.warning("Requested shot ids not in storyboard: %s", sorted(missing))
    if len(ordered) > max_shots:
        log.info("Truncating to max-shots=%d (had %d)", max_shots, len(ordered))
        ordered = ordered[:max_shots]
    return ordered


def write_report_sidecar(
    reports_dir: Path,
    storyboard_path: Path,
    storyboard: Dict[str, Any],
    results: List[Dict[str, Any]],
) -> Path:
    scene_id = storyboard.get("scene_id") or storyboard_path.stem
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    report = {
        "scene_id": scene_id,
        "storyboard": str(storyboard_path),
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "results": results,
        "shots_snapshot": storyboard.get("shots", []),
    }
    path = reports_dir / f"{scene_id}_run_{ts}.json"
    path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    status_by_id = {r["id"]: r for r in results}
    shots_copy = []
    for s in storyboard.get("shots", []):
        sc = dict(s)
        if sc.get("id") in status_by_id:
            r = status_by_id[sc["id"]]
            if r.get("status"):
                sc["status"] = r["status"]
            if r.get("image"):
                sc["image_path"] = r["image"]
            if r.get("video"):
                sc["video_path"] = r["video"]
            if r.get("error"):
                sc["last_error"] = r["error"]
        shots_copy.append(sc)
    latest = reports_dir / f"{scene_id}_status.json"
    latest_payload = {
        "scene_id": scene_id,
        "updated_at": report["generated_at"],
        "shots": shots_copy,
        "last_run": str(path),
    }
    latest.write_text(
        json.dumps(latest_payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    log.info("Report sidecar: %s", path)
    log.info("Status sidecar: %s", latest)
    return path


def plan_line(shot: Dict[str, Any], paths: Dict[str, Path]) -> str:
    action = str(shot.get("action") or "")
    snippet = action[:72] + ("..." if len(action) > 72 else "")
    return (
        f"  [{shot.get('order')}] {shot.get('id')}  "
        f"{shot.get('duration_s')}s  | {shot.get('framing')} | "
        f"{snippet}"
        f"\n       image -> {paths['image']}"
        f"\n       video -> {paths['video']}"
    )


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Neural Wars novel film builder (Grok image to video)"
    )
    parser.add_argument("--storyboard", required=True, help="Path to storyboard JSON")
    parser.add_argument(
        "--outdir", required=True, help="FILM root or renders target directory"
    )
    parser.add_argument(
        "--shots", default="", help="Comma-separated shot ids to process"
    )
    parser.add_argument(
        "--skip-existing", action="store_true", help="Skip if render file exists"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Print plan only; no generation"
    )
    parser.add_argument(
        "--max-shots", type=int, default=8, help="Hard cap on shots (default 8)"
    )
    args = parser.parse_args(argv)

    max_shots = args.max_shots
    if max_shots < 1:
        log.error("--max-shots must be >= 1")
        return 2

    storyboard_path = Path(args.storyboard).resolve()
    outdir = Path(args.outdir).resolve()

    if not storyboard_path.is_file():
        log.error("Storyboard not found: %s", storyboard_path)
        return 2

    storyboard = load_storyboard(storyboard_path)
    renders_dir = resolve_renders_dir(outdir, storyboard)
    reports_dir = resolve_reports_dir(outdir)

    shot_id_list = [s.strip() for s in args.shots.split(",") if s.strip()] or None
    selected = filter_shots(storyboard["shots"], shot_id_list, max_shots)

    log.info("Storyboard: %s", storyboard_path)
    log.info("Outdir: %s", outdir)
    log.info("Renders dir: %s", renders_dir)
    log.info("Reports dir: %s", reports_dir)
    log.info(
        "Shots selected: %d (max=%d) dry_run=%s skip_existing=%s",
        len(selected),
        max_shots,
        args.dry_run,
        args.skip_existing,
    )

    print("\n=== PLANNED SHOTS ===")
    for shot in selected:
        paths = shot_paths(renders_dir, shot["id"])
        print(plan_line(shot, paths))
    print("=== END PLAN ===\n")

    if args.dry_run:
        log.info("Dry-run complete — no generation.")
        return 0

    results: List[Dict[str, Any]] = []
    for shot in selected:
        sid = shot["id"]
        paths = shot_paths(renders_dir, sid)
        entry: Dict[str, Any] = {"id": sid, "order": shot.get("order")}

        image_exists = paths["image"].is_file()
        jpg = paths["image"].with_suffix(".jpg")
        if not image_exists and jpg.is_file():
            paths["image"] = jpg
            image_exists = True
        video_exists = paths["video"].is_file()

        if args.skip_existing and image_exists and video_exists:
            log.info("SKIP existing %s", sid)
            entry["status"] = "skipped_existing"
            entry["image"] = str(paths["image"])
            entry["video"] = str(paths["video"])
            results.append(entry)
            continue

        try:
            if args.skip_existing and image_exists:
                log.info("Reuse existing image for %s", sid)
                img_path = paths["image"]
            else:
                img_path = generate_image(shot.get("image_prompt", ""), paths["image"])

            entry["image"] = str(img_path)

            if args.skip_existing and video_exists:
                log.info("Reuse existing video for %s", sid)
                vid_path = paths["video"]
            else:
                vid_path = generate_video(
                    shot.get("video_prompt", ""), img_path, paths["video"]
                )

            entry["video"] = str(vid_path)
            if img_path.is_file() and vid_path.is_file():
                entry["status"] = "rendered"
                meta = {
                    "id": sid,
                    "status": "rendered",
                    "image": str(img_path),
                    "video": str(vid_path),
                    "rendered_at": datetime.now(timezone.utc)
                    .isoformat()
                    .replace("+00:00", "Z"),
                    "duration_s": shot.get("duration_s"),
                }
                paths["meta"].write_text(
                    json.dumps(meta, indent=2) + "\n", encoding="utf-8"
                )
            else:
                entry["status"] = "incomplete"
                entry["error"] = "Expected render files missing after generation"
            results.append(entry)
        except Exception as e:
            log.exception("Failed shot %s", sid)
            entry["status"] = "failed"
            entry["error"] = str(e)
            results.append(entry)

    write_report_sidecar(reports_dir, storyboard_path, storyboard, results)

    ok = sum(1 for r in results if r.get("status") in ("rendered", "skipped_existing"))
    fail = sum(1 for r in results if r.get("status") == "failed")
    log.info("Done. ok=%d fail=%d total=%d", ok, fail, len(results))
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
