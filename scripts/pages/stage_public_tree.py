#!/usr/bin/env python3
"""Stage the public subset of docs/ for the GitHub Pages deploy (issue #881).

docs/ is the site root, so every file under it is world-readable. Internal working docs
(agent briefs, OA proposals, audits, scratch notes) must not be published, so the deploy
no longer uploads docs/ verbatim: it uploads this filtered copy.

Also drops README.md / index.md, which Jekyll renders as a browsable directory index
(that is how https://goalworld.fun/intake/ listed every internal note).

Usage: python3 scripts/pages/stage_public_tree.py [--src docs] [--dst _site_public]
"""
import argparse
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages_patterns import classify, load_patterns  # noqa: E402

INDEX_NAMES = ("README.md", "index.md")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="docs")
    ap.add_argument("--dst", default="_site_public")
    args = ap.parse_args()

    patterns = load_patterns(args.src)
    if not patterns:
        sys.exit("FATAL: %s/.assetsignore missing or empty - refusing to publish docs/ verbatim"
                 % args.src)
    if os.path.exists(args.dst):
        shutil.rmtree(args.dst)

    excluded, dropped_index, copied = [], [], 0
    for dirpath, dirnames, filenames in os.walk(args.src):
        rel_dir = os.path.relpath(dirpath, args.src).replace(os.sep, "/")
        rel_dir = "" if rel_dir == "." else rel_dir

        keep_dirs = []
        for name in sorted(dirnames):
            rel = "%s/%s" % (rel_dir, name) if rel_dir else name
            entry = classify(rel, patterns)
            if entry:
                excluded.append((rel + "/", entry))
            else:
                keep_dirs.append(name)
        dirnames[:] = keep_dirs

        for name in sorted(filenames):
            rel = "%s/%s" % (rel_dir, name) if rel_dir else name
            entry = classify(rel, patterns)
            if entry:
                excluded.append((rel, entry))
                continue
            os.makedirs(os.path.join(args.dst, rel_dir), exist_ok=True)
            dest = os.path.join(args.dst, rel)
            if os.path.islink(os.path.join(args.src, rel)):
                shutil.copy2(os.path.realpath(os.path.join(args.src, rel)), dest)
            else:
                shutil.copy2(os.path.join(args.src, rel), dest)
            if name in INDEX_NAMES:
                os.remove(dest)
                dropped_index.append(rel)
            else:
                copied += 1

    print("Staged %d public files into %s/" % (copied, args.dst))
    print("Excluded %d internal paths (docs/.assetsignore)" % len(excluded))
    for rel, entry in excluded[:25]:
        print("  - %s  [%s]" % (rel, entry))
    if len(excluded) > 25:
        print("  ... %d more" % (len(excluded) - 25))
    print("Dropped %d directory-index files: %s" % (len(dropped_index), dropped_index))


if __name__ == "__main__":
    main()
