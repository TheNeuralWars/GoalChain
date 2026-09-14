#!/usr/bin/env python3
"""
ContinuityGuard face-crop staging helper (GoalChain FILM QC).

WHY THIS EXISTS
---------------
ContinuityGuard's CG02 ("character consistency") embeds the *whole* decoded
frame (224x224, aspect-distorted) with MobileNetV2 -- there is no face crop
inside the tool. On a cinematic frame (wide alley, fog, dark palette) that
means CG02 mostly measures scene similarity, not character similarity.

So we pre-crop the character region ourselves and hand the tool clips that
contain *only faces*. This turns CG02 into a real cross-scene face-drift
check for the scene's primary cast member.

METHOD (documented limitations at the bottom)
---------------------------------------------
1. Sample frames from a scene cut at N fps (ffmpeg).
2. Detect faces with OpenCV Haar cascades (frontal + profile), keep the
   LARGEST face box per frame.
3. Crop with a margin, resize to 224x224.
4. Encode the surviving crops as one short clip per (character, scene),
   named `<character>_<scene>.mp4` so ContinuityGuard's
   `<character>_<shot-id>` filename convention buckets them together.

Output clips: <stage_dir>/<slug>_<SCENE>.mp4
Sidecar stats: <stage_dir>/_face_stage_stats.json
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

import cv2


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def extract_frames(video: str, outdir: str, fps: float) -> int:
    """Decode `video` to jpg frames at `fps` into outdir. Returns frame count."""
    pattern = os.path.join(outdir, "f_%05d.jpg")
    cp = run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", video,
        "-vf", f"fps={fps}",
        "-q:v", "3",
        pattern,
    ])
    if cp.returncode != 0:
        raise RuntimeError(f"ffmpeg frame extract failed for {video}: {cp.stderr.strip()[:400]}")
    return len([f for f in os.listdir(outdir) if f.startswith("f_") and f.endswith(".jpg")])


def build_detector():
    """Prefer YuNet (ONNX, far better on dark/cinematic frames than Haar);
    fall back to bundled Haar cascades if the model or API is unavailable."""
    model = os.environ.get("CG_YUNET_MODEL",
                           "/data/apps/tools/models/face_detection_yunet_2023mar.onnx")
    if os.path.exists(model) and hasattr(cv2, "FaceDetectorYN"):
        try:
            det = cv2.FaceDetectorYN.create(model, "", (320, 320), 0.6, 0.3, 5000)
            return {"kind": "yunet", "model": model, "detector": det, "cascades": []}
        except Exception:  # noqa: BLE001
            pass

    base = cv2.data.haarcascades
    names = [
        "haarcascade_frontalface_default.xml",
        "haarcascade_frontalface_alt2.xml",
        "haarcascade_profileface.xml",
    ]
    cascades = []
    for n in names:
        full = os.path.join(base, n)
        if os.path.exists(full):
            c = cv2.CascadeClassifier(full)
            if not c.empty():
                cascades.append((n, c))
    return {"kind": "haar", "model": None, "detector": None, "cascades": cascades}


def build_cascades():
    """Back-compat shim: returns the detector bundle."""
    return build_detector()


def _largest_haar(img, cascades):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    best, best_area = None, 0
    for _name, casc in cascades:
        faces = casc.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(28, 28))
        for (x, y, w, h) in faces:
            area = int(w) * int(h)
            if area > best_area:
                best_area = area
                best = (int(x), int(y), int(w), int(h))
    return best


def largest_face(img, bundle) -> tuple[int, int, int, int] | None:
    """Largest detected face box (x, y, w, h), or None."""
    if bundle.get("kind") == "yunet":
        H, W = img.shape[:2]
        det = bundle["detector"]
        det.setInputSize((W, H))
        _rc, faces = det.detect(img)
        if faces is None or len(faces) == 0:
            return None
        best, best_area = None, 0
        for row in faces:
            x, y, w, h = (int(v) for v in row[:4])
            w, h = max(w, 1), max(h, 1)
            if w * h > best_area:
                best_area = w * h
                best = (x, y, w, h)
        return best
    return _largest_haar(img, bundle.get("cascades") or [])


def crop_with_margin(img, box, margin: float):
    x, y, w, h = box
    mx = int(w * margin)
    my = int(h * margin)
    H, W = img.shape[:2]
    x0 = max(0, x - mx)
    y0 = max(0, y - my)
    x1 = min(W, x + w + mx)
    y1 = min(H, y + h + my)
    crop = img[y0:y1, x0:x1]
    if crop.size == 0:
        return None
    return cv2.resize(crop, (224, 224), interpolation=cv2.INTER_AREA)


def encode_clip(png_dir: str, out_path: str, fps: float) -> bool:
    """Encode numbered PNGs in png_dir to an mp4 ContinuityGuard can decode."""
    cp = run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-framerate", str(fps),
        "-i", os.path.join(png_dir, "c_%05d.png"),
        "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
        "-vf", "scale=224:224:flags=lanczos",
        out_path,
    ])
    return cp.returncode == 0 and os.path.exists(out_path) and os.path.getsize(out_path) > 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--film-root", required=True, help="FILM/ directory")
    ap.add_argument("--stage-dir", required=True, help="where to write <char>_<SCENE>.mp4")
    ap.add_argument("--scenes", nargs="*", default=None, help="scene ids; default = all with a cut")
    ap.add_argument("--fps", type=float, default=1.0, help="face sampling fps (default 1.0)")
    ap.add_argument("--margin", type=float, default=0.45)
    ap.add_argument("--min-frames", type=int, default=3,
                    help="minimum detected face frames required to emit a clip")
    args = ap.parse_args()

    film_root = os.path.abspath(args.film_root)
    stage = os.path.abspath(args.stage_dir)
    os.makedirs(stage, exist_ok=True)

    cascades = build_detector()
    if cascades["kind"] == "haar" and not cascades["cascades"]:
        print("ERROR: no YuNet model and no Haar cascades available in this OpenCV build",
              file=sys.stderr)
        return 2

    if args.scenes:
        scenes = list(args.scenes)
    else:
        scenes = sorted(d for d in os.listdir(os.path.join(film_root, "renders"))
                        if d.startswith("FC-S0"))

    stats = {
        "fps": args.fps,
        "margin": args.margin,
        "detector": cascades["kind"],
        "detector_model": cascades["model"],
        "scenes": {},
        "clips_written": [],
        "clips_skipped": [],
    }

    for scene in scenes:
        scene_json = os.path.join(film_root, "scenes", f"{scene}.json")
        cut = os.path.join(film_root, "renders", scene, f"{scene}_cut_v1.mp4")
        entry = {"primary": None, "frames_sampled": 0, "faces_detected": 0, "note": None}
        stats["scenes"][scene] = entry

        if not os.path.exists(cut):
            entry["note"] = "no_cut_file"
            stats["clips_skipped"].append({"scene": scene, "reason": "no_cut_file"})
            continue

        primary = None
        if os.path.exists(scene_json):
            try:
                with open(scene_json) as fh:
                    lock = (json.load(fh) or {}).get("character_lock") or {}
                primary = lock.get("primary")
            except Exception as exc:  # noqa: BLE001
                entry["note"] = f"scene_json_unreadable: {exc}"
        if not primary:
            entry["note"] = "no_primary_character"
            stats["clips_skipped"].append({"scene": scene, "reason": "no_primary_character"})
            continue

        slug = "".join(ch for ch in primary.lower() if ch.isalnum())
        entry["primary"] = primary

        with tempfile.TemporaryDirectory() as tmp:
            frames_dir = os.path.join(tmp, "frames")
            crops_dir = os.path.join(tmp, "crops")
            os.makedirs(frames_dir)
            os.makedirs(crops_dir)

            n = extract_frames(cut, frames_dir, args.fps)
            entry["frames_sampled"] = n

            kept = 0
            for name in sorted(os.listdir(frames_dir)):
                img = cv2.imread(os.path.join(frames_dir, name))
                if img is None:
                    continue
                box = largest_face(img, cascades)
                if box is None:
                    continue
                crop = crop_with_margin(img, box, args.margin)
                if crop is None:
                    continue
                kept += 1
                cv2.imwrite(os.path.join(crops_dir, f"c_{kept:05d}.png"), crop)
            entry["faces_detected"] = kept

            if kept < args.min_frames:
                entry["note"] = f"insufficient_face_frames ({kept} < {args.min_frames})"
                stats["clips_skipped"].append(
                    {"scene": scene, "reason": "insufficient_face_frames", "faces": kept})
                continue

            out_clip = os.path.join(stage, f"{slug}_{scene}.mp4")
            if not encode_clip(crops_dir, out_clip, args.fps):
                entry["note"] = "encode_failed"
                stats["clips_skipped"].append({"scene": scene, "reason": "encode_failed"})
                continue

            entry["note"] = "ok"
            stats["clips_written"].append(
                {"scene": scene, "character": primary, "slug": slug,
                 "clip": os.path.basename(out_clip), "face_frames": kept})

    with open(os.path.join(stage, "_face_stage_stats.json"), "w") as fh:
        json.dump(stats, fh, indent=2)

    print(json.dumps({
        "clips_written": len(stats["clips_written"]),
        "clips_skipped": len(stats["clips_skipped"]),
        "by_scene": stats["clips_written"],
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
