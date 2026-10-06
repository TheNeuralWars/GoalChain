#!/usr/bin/env python3
"""Stage the public subset of docs/ for the GitHub Pages deploy (issue #881).

docs/ is the site root, so every file under it is world-readable. Internal working docs
(agent briefs, OA proposals, audits, scratch notes) must not be published, so the deploy
no longer uploads docs/ verbatim: it uploads this filtered copy.

Also drops README.md / index.md, which Jekyll renders as a browsable directory index
(that is how https://goalworld.fun/intake/ listed every internal note).

Usage: python3 scripts/pages/stage_public_tree.py [--src docs] [--dst _site_public]

Landing preserve (goalworld_site): the GoalWorld landing is deployed separately by
scripts/deploy_goalworld_site.sh INTO the served tree and is not part of docs/. Without
care, deploy_origin.sh's `rsync --delete` removes it again on the next restage (and
reverts /index.html to docs/index.html). The landing deploy records the paths it owns in
a manifest (default /data/work/goalworld-landing.paths); those paths are copied from the
previous served tree into the new staged tree here, so the rsync keeps them verbatim
(landing files win over same-path docs/ files). No manifest -> unchanged behaviour.
"""
import argparse
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages_patterns import classify, load_patterns  # noqa: E402

INDEX_NAMES = ("README.md", "index.md")
LANDING_MANIFEST_DEFAULT = "/data/work/goalworld-landing.paths"


def manifest_paths(path):
    """Safe relative paths declared in the landing manifest ('#' comments allowed)."""
    out = []
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.split("#", 1)[0].strip().strip("/")
            if not line:
                continue
            if os.path.isabs(line) or ".." in line.split("/"):
                continue  # never escape the tree
            out.append(line)
    return out


def preserve_landing(preserve_from, dst, manifest):
    """Copy landing-owned paths from the previous served tree into the new staged tree.

    Returns the number of paths preserved. Missing manifest/source is not an error:
    staging then behaves exactly as before this feature existed.
    """
    if not manifest or not os.path.isfile(manifest):
        return 0
    src_root = os.path.abspath(preserve_from) if preserve_from else ""
    if not src_root or not os.path.isdir(src_root):
        print("Landing preserve: source tree %r missing - skipping" % preserve_from)
        return 0
    if src_root == os.path.abspath(dst):
        print("Landing preserve: source tree is the staging target - skipping")
        return 0
    kept = 0
    for rel in manifest_paths(manifest):
        src = os.path.join(src_root, rel)
        if not os.path.isfile(src):
            print("Landing preserve: served tree lacks %s - skipping" % rel)
            continue
        dest = os.path.join(dst, rel)
        os.makedirs(os.path.dirname(dest) or dst, exist_ok=True)
        shutil.copy2(src, dest)
        kept += 1
    print("Landing preserve: %d paths kept from %s (manifest %s)" % (kept, src_root, manifest))
    return kept


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="docs")
    ap.add_argument("--dst", default="_site_public")
    ap.add_argument("--preserve-from", default=None,
                    help="previous served tree holding the deployed landing "
                         "(default: <dst>/../_site_public)")
    ap.add_argument("--landing-manifest", default=None,
                    help="manifest of landing-owned paths written by "
                         "scripts/deploy_goalworld_site.sh "
                         "(default: /data/work/goalworld-landing.paths)")
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

    # Keep the separately-deployed landing surface (and any other landing-owned paths,
    # e.g. the press-kit zip) alive across deploy_origin.sh's rsync --delete.
    preserve_from = (args.preserve_from or os.environ.get("GOALWORLD_PRESERVE_FROM")
                     or os.path.join(os.path.dirname(os.path.abspath(args.dst)), "_site_public"))
    manifest = (args.landing_manifest or os.environ.get("GOALWORLD_LANDING_MANIFEST")
                or LANDING_MANIFEST_DEFAULT)
    preserve_landing(preserve_from, args.dst, manifest)


if __name__ == "__main__":
    main()
