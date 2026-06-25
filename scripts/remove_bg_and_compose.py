#!/usr/bin/env python3
"""
remove_bg_and_compose.py
========================
Removes the pure-white background from player PNG images in
docs/assets/img/nfts/transparent/ and saves them as transparent WebP
files to docs/assets/img/nfts/composed/.

Algorithm:
  1. Load PNG as RGBA.
  2. Flood-fill (BFS) from the image border to find all connected
     near-white pixels and mark them transparent.
  3. Erode the foreground mask by HALO_ERODE_PX pixels to kill the
     1-2 px white anti-aliasing halo that typically remains.
  4. Save as WebP (quality=90) preserving alpha channel.

Usage:
  python scripts/remove_bg_and_compose.py [--dry-run] [--workers N] [--only PREFIX]

Requires:
  pip install Pillow numpy
"""

import argparse
import os
import sys
import time
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed
from collections import deque

try:
    import numpy as np
    from PIL import Image
except ImportError:
    print("ERROR: Missing dependencies.  Run:  pip install Pillow numpy")
    sys.exit(1)

# Paths
REPO_ROOT = Path(__file__).resolve().parent.parent
SRC_DIR   = REPO_ROOT / "docs" / "assets" / "img" / "nfts" / "transparent"
DST_DIR   = REPO_ROOT / "docs" / "assets" / "img" / "nfts" / "composed"

# Tuning
WHITE_THRESHOLD = 220  # R,G,B all >= this -> candidate background pixel
HALO_ERODE_PX   = 2   # shrink kept mask by N pixels to erase halo
WEBP_QUALITY    = 90


def remove_white_bg(src_path: Path, dst_path: Path) -> str:
    img = Image.open(src_path).convert("RGBA")
    arr = np.array(img, dtype=np.uint8)   # (H, W, 4)

    H, W = arr.shape[:2]
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    near_white = (r >= WHITE_THRESHOLD) & (g >= WHITE_THRESHOLD) & (b >= WHITE_THRESHOLD)

    # BFS flood-fill from border (only top, left, right to prevent bottom clothes bleed)
    visited = np.zeros((H, W), dtype=bool)
    q = deque()

    def enq(y, x):
        if 0 <= y < H and 0 <= x < W and not visited[y, x] and near_white[y, x]:
            visited[y, x] = True
            q.append((y, x))

    for x in range(W):
        enq(0, x)  # Top border
    for y in range(H):
        enq(y, 0)  # Left border
        enq(y, W - 1)  # Right border

    while q:
        cy, cx = q.popleft()
        enq(cy - 1, cx); enq(cy + 1, cx)
        enq(cy, cx - 1); enq(cy, cx + 1)

    bg_mask = visited  # True = background -> transparent

    # Erode foreground to remove halo
    if HALO_ERODE_PX > 0:
        keep = ~bg_mask
        for _ in range(HALO_ERODE_PX):
            up    = np.roll(keep, -1, 0); up[-1, :]   = False
            down  = np.roll(keep,  1, 0); down[0, :]  = False
            left  = np.roll(keep, -1, 1); left[:, -1] = False
            right = np.roll(keep,  1, 1); right[:, 0] = False
            boundary = keep & (~up | ~down | ~left | ~right)
            keep[boundary] = False
        bg_mask = ~keep

    out = arr.copy()
    out[:, :, 3] = np.where(bg_mask, 0, arr[:, :, 3])

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out, "RGBA").save(dst_path, format="WEBP", quality=WEBP_QUALITY, lossless=False)
    return f"OK  {src_path.name} -> {dst_path.name}"


def worker(args):
    src, dst = args
    try:
        return True, remove_white_bg(Path(src), Path(dst))
    except Exception as e:
        return False, f"FAIL {src}: {e}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run",  action="store_true")
    parser.add_argument("--workers",  type=int, default=4)
    parser.add_argument("--only",     type=str, default="")
    a = parser.parse_args()

    src_files = sorted(SRC_DIR.glob("*.png"))
    if a.only:
        src_files = [f for f in src_files if f.name.startswith(a.only)]

    print(f"Source : {SRC_DIR}")
    print(f"Dest   : {DST_DIR}")
    print(f"Found  : {len(src_files)} PNG files")

    if a.dry_run:
        for f in src_files:
            print(f"  {f.name} -> {f.with_suffix('.webp').name}")
        return

    tasks = [(str(s), str(DST_DIR / s.with_suffix(".webp").name)) for s in src_files]
    t0 = time.time()
    ok = err = 0

    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        futs = {pool.submit(worker, t): t for t in tasks}
        for i, fut in enumerate(as_completed(futs), 1):
            s, msg = fut.result()
            print(f"[{i:>3}/{len(tasks)}] {msg}")
            if s: ok += 1
            else: err += 1

    print(f"\nDone: {ok} OK, {err} errors in {time.time()-t0:.1f}s")


if __name__ == "__main__":
    main()
