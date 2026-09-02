#!/usr/bin/env python3
"""
Log Rotator & Stream Trimmer (OOM-Safe)
GoalChain Wealth Engine & Autonomous Fund Operations

Safely monitors and trims high-throughput trading logs without loading entire files into memory.
Enforces hard caps on file size (default: 25 MB) and maximum retained lines (default: 20,000).
"""
from __future__ import annotations

import os
import sys
import shutil
from pathlib import Path

DEFAULT_MAX_BYTES = 25 * 1024 * 1024  # 25 MB
DEFAULT_KEEP_LINES = 20000
CHUNK_SIZE = 64 * 1024  # 64 KB read blocks


def tail_lines_bytes(file_path: Path, n_lines: int) -> bytes:
    """Read the last n_lines from file_path without loading the whole file into RAM."""
    if not file_path.exists() or file_path.stat().st_size == 0:
        return b""
    
    file_size = file_path.stat().st_size
    lines_found: list[bytes] = []
    total_lines = 0
    buffer = b""

    with open(file_path, "rb") as f:
        pos = file_size
        while pos > 0 and total_lines < n_lines:
            read_size = min(CHUNK_SIZE, pos)
            pos -= read_size
            f.seek(pos)
            chunk = f.read(read_size)
            buffer = chunk + buffer
            
            # Count newline characters
            newlines = buffer.count(b"\n")
            if newlines >= n_lines:
                # Split and slice
                parts = buffer.split(b"\n")
                buffer = b"\n".join(parts[-n_lines:])
                break

    return buffer


def trim_log_file(file_path: Path, max_bytes: int = DEFAULT_MAX_BYTES, keep_lines: int = DEFAULT_KEEP_LINES) -> bool:
    """Check size and safely trim file to keep_lines if it exceeds max_bytes."""
    if not file_path.exists():
        return False

    current_size = file_path.stat().st_size
    if current_size <= max_bytes:
        return False

    print(f"[LogRotator] File {file_path.name} exceeds {max_bytes / (1024*1024):.1f}MB ({current_size / (1024*1024):.2f}MB). Trimming...")
    
    tail_content = tail_lines_bytes(file_path, keep_lines)
    temp_path = file_path.with_suffix(".tmp_trim")

    try:
        with open(temp_path, "wb") as f_out:
            f_out.write(tail_content)

        # Atomic replacement where supported
        shutil.move(str(temp_path), str(file_path))
        new_size = file_path.stat().st_size
        print(f"[LogRotator] Successfully trimmed {file_path.name}: {current_size/(1024*1024):.2f}MB -> {new_size/(1024*1024):.2f}MB (retained {keep_lines} lines).")
        return True
    except Exception as e:
        print(f"[LogRotator] Error trimming {file_path}: {e}", file=sys.stderr)
        if temp_path.exists():
            temp_path.unlink()
        return False


def main() -> None:
    targets = [
        Path("/data/hermes-home/logs/trader/paper/risk_rejects.jsonl"),
        Path("/data/hermes-home/logs/trader/agent.log"),
        Path("/data/hermes-home/logs/trader/paper/ask_sum.jsonl"),
        Path("/data/hermes-home/logs/trader/paper/bot_b_history.jsonl"),
    ]

    trimmed_count = 0
    for target in targets:
        if trim_log_file(target):
            trimmed_count += 1

    print(f"[LogRotator] Cycle completed. {trimmed_count} file(s) trimmed.")


if __name__ == "__main__":
    main()
