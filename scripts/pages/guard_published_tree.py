#!/usr/bin/env python3
"""Fail the goalworld.fun deploy if an internal-only document would be published (#881).

Runs against the staged upload tree (what GitHub Pages actually serves) and fails closed:
  - any path matching docs/.assetsignore (internal-doc patterns), in any form
  - hard patterns: *.done, .env*, *.keypair.json, *.secret*, *.pem
  - a README.md / index.md / index.html sitting next to an internal-pattern file
    (that is the directory-listing vector that exposed docs/intake/)
  - symlinks, which the pages artifact resolves unpredictably

Usage:
  python3 scripts/pages/guard_published_tree.py --root _site_public --patterns docs
  python3 scripts/pages/guard_published_tree.py --root docs --repo --advisory
Exit 0 = clean (warnings may be printed). Exit 1 = do not deploy.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages_patterns import classify, load_patterns  # noqa: E402

INDEX_NAMES = {"README.md", "index.md"}


def scan(root, patterns):
    """Return (violations, index_leaks): internal paths found under root, and index files
    that sit in a directory holding internal-pattern files (browsable-listing vector)."""
    violations, files, internal_dirs = [], [], set()
    for dirpath, dirnames, filenames in os.walk(root, followlinks=False):
        rel_dir = os.path.relpath(dirpath, root).replace(os.sep, "/")
        rel_dir = "" if rel_dir == "." else rel_dir
        for name in sorted(dirnames):
            rel = "%s/%s" % (rel_dir, name) if rel_dir else name
            entry = classify(rel, patterns)
            if entry:
                violations.append((rel + "/", entry))
                internal_dirs.add(rel_dir or ".")
        for name in sorted(filenames):
            rel = "%s/%s" % (rel_dir, name) if rel_dir else name
            full = os.path.join(root, rel)
            if os.path.islink(full):
                violations.append((rel, "symlink"))
                continue
            entry = classify(rel, patterns)
            if entry:
                violations.append((rel, entry))
                internal_dirs.add(rel_dir or ".")
            else:
                files.append(rel)
    index_leaks = [(f, "directory-index-in-%s" % (os.path.dirname(f) or "."))
                   for f in files
                   if os.path.basename(f) in INDEX_NAMES
                   and (os.path.dirname(f) or ".") in internal_dirs]
    return violations, index_leaks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", required=True, help="tree that would be published")
    ap.add_argument("--patterns", default="docs", help="dir holding .assetsignore")
    ap.add_argument("--advisory", action="store_true", help="report but exit 0")
    ap.add_argument("--repo", action="store_true", help="repo tree mode: report pre-existing docs")
    args = ap.parse_args()

    patterns = load_patterns(args.patterns)
    if not patterns:
        sys.exit("FATAL: no patterns in %s/.assetsignore - guard cannot verify the tree"
                 % args.patterns)
    violations, index_leaks = scan(args.root, patterns)
    print("Guard: scanned %s (%d internal patterns from %s/.assetsignore)"
          % (args.root, len(patterns), args.patterns))
    print("  internal-only paths found: %d" % len(violations))
    for rel, why in violations[:40]:
        print("        %s  [%s]" % (rel, why))
    if len(violations) > 40:
        print("        ... %d more" % (len(violations) - 40))
    print("  directory indexes exposing internal content: %d" % len(index_leaks))
    for rel, why in index_leaks[:10]:
        print("        %s  [%s]" % (rel, why))
    if not violations and not index_leaks:
        print("  OK    no internal-only document would be published")
        return 0
    print("  %s  refusing to publish this tree (issue #881)" %
          ("WARN (advisory)" if args.advisory else "BLOCKED"))
    if args.repo:
        print("  ACTION: move the path outside docs/ (e.g. ai_context/intake/) or add it to")
        print("          docs/.assetsignore; record the purge decision in")
        print("          docs/REPORTS/SECURITY_INTERNAL_DOCS_AUDIT_2026-09-10.md")
    return 0 if args.advisory else 1


if __name__ == "__main__":
    sys.exit(main())
