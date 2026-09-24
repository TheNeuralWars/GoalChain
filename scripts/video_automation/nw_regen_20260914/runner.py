#!/usr/bin/env python3
"""Parallel job runner for the Neural Wars FILM regen.

usage: python3 runner.py jobs.json [--workers 6] [--kind image|video|all] [--force]
Job: {"id","kind":"image"|"video","dest","prompt","model"?,"refs"?[],"src"?,"duration"?}
Results appended to results.jsonl in the cwd.
"""
from __future__ import annotations

import argparse
import json
import sys
import threading
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import xai_client as X  # noqa: E402

_result_lock = threading.Lock()


def run_job(job: dict, force: bool) -> dict:
    dest = Path(job["dest"])
    t0 = time.time()
    out = {"id": job["id"], "kind": job["kind"], "dest": str(dest)}
    if dest.exists() and dest.stat().st_size > 0 and not force:
        out.update(status="skipped_existing", bytes=dest.stat().st_size, seconds=0.0)
        return out
    try:
        if job["kind"] == "image":
            X.generate_image(job["prompt"], dest,
                             refs=job.get("refs") or [],
                             model=job.get("model", "grok-imagine-image-quality"),
                             aspect=job.get("aspect", "16:9"))
        else:
            X.generate_video(job["prompt"], Path(job["src"]), dest,
                             duration=int(job.get("duration", 6)),
                             model=job.get("model", "grok-imagine-video-1.5"))
        out.update(status="ok", bytes=dest.stat().st_size, seconds=round(time.time() - t0, 1))
    except Exception as e:  # noqa: BLE001
        out.update(status="failed", error=f"{type(e).__name__}: {e}",
                   seconds=round(time.time() - t0, 1))
        traceback.print_exc()
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("jobs")
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--kind", default="all")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    jobs = json.loads(Path(args.jobs).read_text())
    if args.kind != "all":
        jobs = [j for j in jobs if j["kind"] == args.kind]
    if args.limit:
        jobs = jobs[: args.limit]

    X.get_token()  # refresh once up-front, before the pool
    print(f"[runner] {len(jobs)} jobs, workers={args.workers}", flush=True)

    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(run_job, j, args.force): j for j in jobs}
        for f in as_completed(futs):
            r = f.result()
            results.append(r)
            print(f"[{r['status']:>16}] {r['id']} {r.get('seconds')}s "
                  f"{r.get('error','') or r.get('bytes','')}", flush=True)
            with _result_lock, open("results.jsonl", "a") as fh:
                fh.write(json.dumps(r) + "\n")

    ok = sum(1 for r in results if r["status"] == "ok")
    skip = sum(1 for r in results if r["status"] == "skipped_existing")
    bad = sum(1 for r in results if r["status"] == "failed")
    print(f"\n[runner] ok={ok} skipped={skip} failed={bad} total={len(results)}")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())