#!/usr/bin/env python3
"""Static link checker for the GoalWorld site build.

Walks dist/*.html, resolves every href/src, and verifies:
  - internal links point at files that exist in dist (or in the deployed target,
    e.g. legacy pages like /cinema.html that live only on the server)
  - anchors (#frag) exist in the target document
  - external http(s) links respond (HEAD/GET) when --external is passed

Usage:
  python3 tools/check_links.py <dist_dir> [--external] [--base http://127.0.0.1:8787]
"""
import os
import re
import sys
import urllib.request
import urllib.parse
import urllib.error
from html.parser import HTMLParser

class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []          # (attr, value)
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and "href" in a:
            self.links.append(("href", a["href"]))
        if tag in ("img", "script", "source", "video") and "src" in a:
            self.links.append(("src", a["src"]))
        if tag == "link" and "href" in a:
            self.links.append(("href", a["href"]))

def main():
    dist = os.path.abspath(sys.argv[1])
    external = "--external" in sys.argv
    merge_root = None
    if "--merge-root" in sys.argv:
        merge_root = os.path.abspath(sys.argv[sys.argv.index("--merge-root") + 1])
    base = "http://127.0.0.1:8787"
    if "--base" in sys.argv:
        base = sys.argv[sys.argv.index("--base") + 1].rstrip("/")

    pages = {}
    for root, _, files in os.walk(dist):
        for f in files:
            if f.endswith(".html"):
                p = os.path.join(root, f)
                rel = os.path.relpath(p, dist)
                pages[rel] = Collector()
                pages[rel].feed(open(p, encoding="utf8").read())

    errors = []
    seen_ext = {}
    checked = 0
    for rel, doc in sorted(pages.items()):
        page_dir = os.path.dirname(rel)
        for attr, val in doc.links:
            if val.startswith(("mailto:", "tel:", "data:", "javascript:")):
                continue
            if val.startswith(("http://", "https://")):
                if "goalworld.fun" in val:
                    # canonical-domain links must map to real local files too
                    path = urllib.parse.urlparse(val).path
                    val = path if path else "/"
                    if val == "/":
                        val = "/index.html"
                    # fall through to internal check below
                elif external:
                    if val not in seen_ext:
                        req = urllib.request.Request(val, method="HEAD",
                                                     headers={"User-Agent": "GoalWorld-linkcheck/1.0"})
                        try:
                            with urllib.request.urlopen(req, timeout=12) as r:
                                seen_ext[val] = r.status
                        except urllib.error.HTTPError as e:
                            if e.code in (403, 405, 999):
                                seen_ext[val] = e.code  # blocked but existing
                            else:
                                seen_ext[val] = e.code
                        except Exception as e:
                            seen_ext[val] = f"ERR {type(e).__name__}"
                    checked += 1
                    continue
                else:
                    continue
            frag = None
            if "#" in val:
                val, frag = val.split("#", 1)
            if frag and not val:
                # same-page fragment
                if frag not in doc.ids:
                    errors.append(f"{rel}: {attr} -> #{frag}  (MISSING ANCHOR)")
                checked += 1
                continue
            if val.startswith("/"):
                target = os.path.join(dist, val.lstrip("/"))
            else:
                target = os.path.normpath(os.path.join(dist, page_dir, val))
            # extensionless -> try .html / /index.html
            candidates = [target]
            if not os.path.splitext(target)[1]:
                candidates += [target + ".html", os.path.join(target, "index.html")]
            found = next((c for c in candidates if os.path.isfile(c)), None)
            if not found and merge_root:
                # legacy pages that live in the deployed target but not in this build
                alt = [os.path.join(merge_root, val.lstrip("/"))]
                if not os.path.splitext(val)[1]:
                    alt += [os.path.join(merge_root, val.lstrip("/") + ".html"),
                            os.path.join(merge_root, val.lstrip("/"), "index.html")]
                found = next((c for c in alt if os.path.isfile(c)), None)
                if found:
                    checked += 1
                    continue
            if not found:
                errors.append(f"{rel}: {attr} -> {val}  (MISSING)")
                continue
            if frag and found.endswith(".html"):
                tgt = pages.get(os.path.relpath(found, dist))
                if tgt is None:
                    tgt = Collector()
                    tgt.feed(open(found, encoding="utf8").read())
                if frag not in tgt.ids:
                    errors.append(f"{rel}: {attr} -> {val}#{frag}  (MISSING ANCHOR)")
            checked += 1

    print(f"pages: {len(pages)}   links checked: {checked}")
    if external:
        print("external targets:")
        for u, st in sorted(seen_ext.items()):
            flag = "" if (isinstance(st, int) and st < 400) else "   <-- CHECK"
            print(f"  {st}  {u}{flag}")
        bad_ext = [u for u, s in seen_ext.items() if isinstance(s, int) and s >= 400 and s not in (403, 999)]
        errors += [f"external {u} -> {s}" for u, s in seen_ext.items() if isinstance(s, str)]
    else:
        bad_ext = []
    if errors:
        print("\nBROKEN:")
        for e in errors:
            print("  " + e)
        sys.exit(1)
    print("OK — all internal links resolve")

if __name__ == "__main__":
    main()
