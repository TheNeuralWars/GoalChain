"""Internal-doc pattern matching for the goalworld.fun published tree (issue #881).

Single source of truth: docs/.assetsignore. Semantics per line (relative to docs/):
  - "#" or blank            -> comment / ignored
  - "name/"                 -> whole directory subtree
  - pattern with * ? [      -> fnmatch against the relative path AND the basename
  - anything else           -> exact relative path
"""
import fnmatch
import os

IGNORE_BASENAME = ".assetsignore"

# Always-internal regardless of .assetsignore content: never ship these to a CDN.
HARD_PATTERNS = (
    "*.done",
    "*.keypair.json",
    "*.secret*",
    ".env",
    ".env.*",
    "*.pem",
    "id_rsa*",
)


def load_patterns(docs_root):
    """Return the pattern list declared in <docs_root>/.assetsignore."""
    path = os.path.join(docs_root, IGNORE_BASENAME)
    patterns = []
    if not os.path.isfile(path):
        return patterns
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.split("#", 1)[0].strip()
            if line:
                patterns.append(line)
    return patterns


def matches(rel_path, entry):
    """True if the docs-relative path matches one .assetsignore entry."""
    rel = rel_path.replace(os.sep, "/").strip("/")
    entry = entry.strip()
    if entry.endswith("/"):
        head = entry.rstrip("/")
        return rel == head or rel.startswith(head + "/")
    if any(ch in entry for ch in "*?["):
        return fnmatch.fnmatch(rel, entry) or fnmatch.fnmatch(os.path.basename(rel), entry)
    return rel == entry


def classify(rel_path, patterns, hard=HARD_PATTERNS):
    """Return the matching pattern, or None when the path is publishable."""
    for entry in patterns:
        if matches(rel_path, entry):
            return entry
    for entry in hard:
        if matches(rel_path, entry):
            return entry
    return None
