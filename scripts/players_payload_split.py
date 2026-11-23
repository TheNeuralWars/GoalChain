#!/usr/bin/env python3
"""players_payload_split.py — keep the served players.json runtime-only.

players.json is fetched at runtime by every gallery/marketplace consumer on
both public surfaces (docs pages via data_loader.js; play.goalworld.fun React
panels and classic-dashboard legacy tabs). Two field groups are consumed ONLY
by generation pipelines (image batch downloads, provenance records) and by
no runtime page, verified repo-wide (docs pages, docs/assets/js consumers,
goalchain_webapp/src panels, classic-dashboard public js, goalchain_api,
ops tooling):

  tm_url   transfermarkt profile URL per player (provenance of the art
           download batch)
  tm_data  scrape provenance notes ("auto-resolved during image batch DL")

This tool moves those fields out of the served payload into a sibling
pipeline file, docs/assets/data/players.pipeline.json (map: player id ->
{"tm_url", "tm_data"}), preserving every value verbatim. Nothing is deleted:
the data simply stops riding along on every page load.

It also keeps the duplicated webapp copy
(goalchain_webapp/public/assets/data/players.json) byte-identical to the
docs copy — the two are served from different origins and must not drift.

Serialization is byte-stable: players.json is rewritten with
json.dumps(indent=2, ensure_ascii=False), which round-trips the existing
file byte-for-byte (verified), so a diff against git shows ONLY the removed
fields.

Usage:
  python3 scripts/players_payload_split.py            # split (idempotent)
  python3 scripts/players_payload_split.py --check    # assert invariants

--check exits 1 when:
  * the served players.json still contains any split field,
  * the two players.json copies differ,
  * players.pipeline.json is missing, holds orphan ids, or holds entries
    without any split field,
  * any player lost a core runtime key (id, name, rarity, stats).

If players.json is ever regenerated wholesale (e.g. a new player batch adds
the fields back), re-run this tool without --check and bump the pinned
?v=YYYYMMDD data refs (data_loader.js, pre-nft.html, classic-dashboard
legacy js, webapp panel fetches) plus the sw.js cache name.
"""
from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DOCS_PLAYERS = REPO / "docs" / "assets" / "data" / "players.json"
PIPELINE_FILE = REPO / "docs" / "assets" / "data" / "players.pipeline.json"
WEBAPP_PLAYERS = REPO / "goalchain_webapp" / "public" / "assets" / "data" / "players.json"

SPLIT_FIELDS = ("tm_url", "tm_data")
CORE_KEYS = ("id", "name", "rarity", "stats")


def _atomic_write(path: Path, text: str) -> None:
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=path.name + ".", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def split() -> int:
    players = json.loads(DOCS_PLAYERS.read_text(encoding="utf-8"))

    pipeline: dict = {}
    if PIPELINE_FILE.is_file():
        existing = json.loads(PIPELINE_FILE.read_text(encoding="utf-8"))
        pipeline = {str(k): v for k, v in existing.get("players", {}).items()}

    extracted = 0
    for player in players:
        pid = str(player["id"])
        moved = {}
        for field in SPLIT_FIELDS:
            if field in player:
                moved[field] = player.pop(field)
                extracted += 1
        if moved:
            entry = pipeline.setdefault(pid, {})
            entry.update(moved)

    if extracted:
        # Same serializer the file already uses — round-trips byte-identical.
        slim = json.dumps(players, indent=2, ensure_ascii=False)
        _atomic_write(DOCS_PLAYERS, slim)
        _atomic_write(WEBAPP_PLAYERS, slim)
        pipeline_doc = {
            "extracted_fields": list(SPLIT_FIELDS),
            "players": {pid: pipeline[pid] for pid in sorted(pipeline, key=int)},
        }
        _atomic_write(PIPELINE_FILE, json.dumps(pipeline_doc, indent=2, ensure_ascii=False) + "\n")
        print(f"split: moved {extracted} field values for {len(pipeline)} players")
    else:
        print("split: nothing to extract (players.json already runtime-only)")

    # Always enforce copy parity, even on a no-op run.
    webapp_text = WEBAPP_PLAYERS.read_text(encoding="utf-8")
    docs_text = DOCS_PLAYERS.read_text(encoding="utf-8")
    if webapp_text != docs_text:
        _atomic_write(WEBAPP_PLAYERS, docs_text)
        print("split: re-synced webapp copy to docs copy")

    return check()


def check() -> int:
    errors: list[str] = []

    docs_text = DOCS_PLAYERS.read_text(encoding="utf-8")
    webapp_text = WEBAPP_PLAYERS.read_text(encoding="utf-8")

    for field in SPLIT_FIELDS:
        if f'"{field}"' in docs_text:
            errors.append(f"served players.json still contains split field {field!r}")
    if docs_text != webapp_text:
        errors.append("docs and webapp players.json copies differ")

    try:
        players = json.loads(docs_text)
    except json.JSONDecodeError as exc:
        print(f"check: FAIL — players.json is not valid JSON: {exc}")
        return 1

    ids = set()
    for player in players:
        missing = [k for k in CORE_KEYS if k not in player]
        if missing:
            errors.append(f"player {player.get('id', '?')} lost core keys {missing}")
        ids.add(str(player.get("id")))

    if not PIPELINE_FILE.is_file():
        errors.append("players.pipeline.json is missing")
    else:
        pipeline = json.loads(PIPELINE_FILE.read_text(encoding="utf-8"))
        entries = pipeline.get("players", {})
        orphans = sorted(set(entries) - ids, key=lambda i: int(i) if i.isdigit() else 0)
        if orphans:
            errors.append(f"players.pipeline.json has {len(orphans)} orphan ids: {orphans[:5]}...")
        for pid, entry in entries.items():
            extra = [k for k in entry if k not in SPLIT_FIELDS]
            if extra:
                errors.append(f"pipeline entry {pid} has unexpected keys {extra}")
            if not any(k in entry for k in SPLIT_FIELDS):
                errors.append(f"pipeline entry {pid} holds no split field")

    if errors:
        print("check: FAIL")
        for err in errors:
            print(f"  - {err}")
        return 1

    size = DOCS_PLAYERS.stat().st_size
    print(f"check: OK — {len(players)} players, served payload {size / 1024:.0f} KB, "
          f"copies identical, split fields in pipeline file only")
    return 0


if __name__ == "__main__":
    sys.exit(split() if "--check" not in sys.argv else check())
