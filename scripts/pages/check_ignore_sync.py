#!/usr/bin/env python3
"""Keep docs/_config.yml (what the live GitHub Pages Jekyll build excludes) in sync with
docs/.assetsignore (what the CI publish guard enforces). Issue #881: the live site is
built from main:/docs with build_type=legacy, so _config.yml is the file that actually
protects goalworld.fun; drift between the two lists is a silent re-exposure.

  python3 scripts/pages/check_ignore_sync.py docs     # exit 1 on drift
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages_patterns import load_patterns  # noqa: E402

# Paths that only the CI guard can enforce: Jekyll `exclude` has no glob support.
GUARD_ONLY_OK = ("*", "?")

# Listed in .assetsignore for the asset-upload pipeline, but intentionally served by the
# site: goalworld.html embeds both trailer videos, and the press kit is a public download
# (verified 206 on goalworld.fun, 2026-09-10). Excluding them from Jekyll would break
# published pages, so they are exempt from this sync check.
SITE_PUBLIC_OVERRIDES = (
    "assets/PressKit_GoalChain.zip",
    "assets/img/neuralwars/The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4",
    "assets/img/neuralwars/trailer_cinematic_teaser.mp4",
    "assets/img/neuralwars/05_Clips/",
    "assets/img/neuralwars/trailer/",
)


def jekyll_excludes(config_path):
    if not os.path.isfile(config_path):
        return None
    entries, in_block = [], False
    with open(config_path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if line.startswith("exclude:"):
                in_block = True
                continue
            if in_block:
                if not line.startswith((" ", "-")):
                    break
                item = line.strip().lstrip("-").strip().strip('"').strip("'")
                if item:
                    entries.append(item)
    return entries


def main():
    docs = sys.argv[1] if len(sys.argv) > 1 else "docs"
    patterns = load_patterns(docs)
    excludes = jekyll_excludes(os.path.join(docs, "_config.yml"))
    if excludes is None:
        sys.exit("FATAL: %s/_config.yml missing - the legacy Pages build excludes nothing" % docs)

    missing = []
    for entry in patterns:
        if any(ch in entry for ch in GUARD_ONLY_OK):
            continue  # glob: CI guard only
        if any(entry == o or entry.startswith(o) for o in SITE_PUBLIC_OVERRIDES):
            continue  # intentionally public on the site
        if entry.rstrip("/") not in [e.rstrip("/") for e in excludes]:
            missing.append(entry)

    print("checked %d .assetsignore entries against %d _config.yml excludes"
          % (len(patterns), len(excludes)))
    if missing:
        print("DRIFT: %d entry(ies) are ignored by the CI guard but still published by the"
              " live Jekyll build:" % len(missing))
        for entry in missing:
            print("  - %s" % entry)
        print("Fix: add the path to docs/_config.yml `exclude:` (literal paths only).")
        return 1
    print("OK: every literal .assetsignore entry is excluded from the deployed site")
    return 0


if __name__ == "__main__":
    sys.exit(main())
