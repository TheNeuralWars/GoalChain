#!/usr/bin/env python3
"""Compute OA scout throughput/quality metrics from radar reports."""

from __future__ import annotations

import argparse
import glob
import json
import pathlib
import re
import time
from statistics import mean


SCORE_RE = re.compile(r"Total:\*\*\s*(\d{1,2})/40")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--hours", type=int, default=48)
    p.add_argument("--json", action="store_true")
    p.add_argument("--output")
    return p.parse_args()


def scan_reports(hours: int) -> tuple[list[pathlib.Path], list[dict]]:
    now = time.time()
    cutoff = now - hours * 3600
    files: list[pathlib.Path] = []
    rows: list[dict] = []
    base = pathlib.Path.home() / ".openclaw/workspace/docs"
    for raw in sorted(glob.glob(str(base / "ai-radar-*.md"))):
        p = pathlib.Path(raw)
        mtime = p.stat().st_mtime
        if mtime < cutoff:
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if "GoalChain Gold Radar" not in text:
            continue
        scores = [int(x) for x in SCORE_RE.findall(text)]
        candidate_count = text.count("\n### ")
        rows.append(
            {
                "file": str(p),
                "mtime": int(mtime),
                "candidate_count": candidate_count,
                "scores": scores,
            }
        )
        files.append(p)
    return files, rows


def build_metrics(rows: list[dict], hours: int) -> dict:
    reports = len(rows)
    candidate_counts = [r["candidate_count"] for r in rows]
    all_scores = [s for r in rows for s in r["scores"]]
    hi_quality = [s for s in all_scores if s >= 32]
    return {
        "window_hours": hours,
        "reports": reports,
        "avg_candidates_per_report": round(mean(candidate_counts), 2) if candidate_counts else 0.0,
        "score_samples": len(all_scores),
        "avg_score": round(mean(all_scores), 2) if all_scores else 0.0,
        "high_quality_rate": round((len(hi_quality) / len(all_scores)), 3) if all_scores else 0.0,
        "max_score": max(all_scores) if all_scores else 0,
        "min_score": min(all_scores) if all_scores else 0,
    }


def write_markdown(path: pathlib.Path, metrics: dict, rows: list[dict]) -> None:
    lines = [
        "# OA Scout Metrics",
        "",
        f"- Window: last {metrics['window_hours']}h",
        f"- Reports: {metrics['reports']}",
        f"- Avg candidates/report: {metrics['avg_candidates_per_report']}",
        f"- Score samples: {metrics['score_samples']}",
        f"- Avg score: {metrics['avg_score']}",
        f"- High-quality rate (>=32): {metrics['high_quality_rate']}",
        f"- Score range: {metrics['min_score']}..{metrics['max_score']}",
        "",
        "## Files",
    ]
    for row in rows[-20:]:
        lines.append(f"- `{row['file']}` candidates={row['candidate_count']} scores={row['scores']}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    _, rows = scan_reports(args.hours)
    metrics = build_metrics(rows, args.hours)
    payload = {"metrics": metrics, "rows": rows}

    if args.output:
        out = pathlib.Path(args.output).expanduser()
        if out.suffix.lower() == ".json":
            out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        else:
            write_markdown(out, metrics, rows)

    if args.json:
        print(json.dumps(payload))
    else:
        print(
            f"reports={metrics['reports']} avg_candidates={metrics['avg_candidates_per_report']} "
            f"avg_score={metrics['avg_score']} high_quality_rate={metrics['high_quality_rate']}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
