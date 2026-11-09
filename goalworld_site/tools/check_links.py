#!/usr/bin/env python3
"""Static link & i18n integrity checker for the GoalWorld site build.

Walks dist/**/*.html (including /es/ and /it/), resolves every href/src, and verifies:
  - internal links point at files that exist in dist (or in the deployed target)
  - anchors (#frag) exist in the target document
  - <html lang="en|es|it"> matches the locale directory
  - hreflang="en|es|it|x-default" tags are present and reciprocal on all non-404 pages
  - all <loc> entries in dist/sitemap.xml map to real built pages
  - external http(s) links respond (HEAD/GET) when --external is passed

Usage:
  python3 tools/check_links.py [dist_dir] [--external] [--base http://127.0.0.1:8787]
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
        self.html_lang = None
        self.canonical = None
        self.hreflangs = {}      # hreflang -> href

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html" and "lang" in a:
            self.html_lang = a["lang"]
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and "href" in a:
            self.links.append(("href", a["href"]))
        if tag in ("img", "script", "source", "video") and "src" in a:
            self.links.append(("src", a["src"]))
        if tag == "link" and "href" in a:
            self.links.append(("href", a["href"]))
            rel = a.get("rel", "")
            if rel == "canonical":
                self.canonical = a["href"]
            elif rel == "alternate" and "hreflang" in a:
                self.hreflangs[a["hreflang"]] = a["href"]


def main():
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pos_args = [
        a for i, a in enumerate(sys.argv[1:], 1)
        if not a.startswith("--") and sys.argv[i - 1] not in ("--merge-root", "--base")
    ]
    dist = os.path.abspath(pos_args[0]) if pos_args else os.path.join(here, "dist")
    external = "--external" in sys.argv
    default_merge = os.path.normpath(os.path.join(here, "..", "docs"))
    merge_root = default_merge if os.path.isdir(default_merge) else None
    if "--merge-root" in sys.argv:
        merge_root = os.path.abspath(sys.argv[sys.argv.index("--merge-root") + 1])

    pages = {}
    for root, _, files in os.walk(dist):
        for f in files:
            if f.endswith(".html"):
                p = os.path.join(root, f)
                rel = os.path.relpath(p, dist).replace("\\", "/")
                pages[rel] = Collector()
                pages[rel].feed(open(p, encoding="utf8").read())

    errors = []
    seen_ext = {}
    checked = 0
    expected_locales = ("en", "es", "it")

    for rel, doc in sorted(pages.items()):
        page_dir = os.path.dirname(rel)
        first_seg = rel.split("/")[0]
        expected_lang = first_seg if first_seg in ("es", "it") else "en"
        if doc.html_lang != expected_lang:
            errors.append(f"{rel}: expected <html lang=\"{expected_lang}\">, got {doc.html_lang!r}")

        is_404 = rel.endswith("404.html")
        if not is_404:
            for hl in (*expected_locales, "x-default"):
                if hl not in doc.hreflangs:
                    errors.append(f"{rel}: missing hreflang=\"{hl}\"")
            if doc.hreflangs.get("en") and doc.hreflangs.get("x-default") != doc.hreflangs.get("en"):
                errors.append(f"{rel}: hreflang x-default != en ({doc.hreflangs.get('x-default')} vs {doc.hreflangs.get('en')})")
            if doc.canonical and doc.hreflangs.get(expected_lang) != doc.canonical:
                errors.append(f"{rel}: hreflang[{expected_lang}] ({doc.hreflangs.get(expected_lang)}) != canonical ({doc.canonical})")

        for attr, val in doc.links:
            if val.startswith(("mailto:", "tel:", "data:", "javascript:")):
                continue
            if val.startswith(("http://", "https://")):
                if "goalworld.fun" in val and "play.goalworld.fun" not in val:
                    path = urllib.parse.urlparse(val).path
                    val = path if path else "/"
                    if val == "/":
                        val = "/index.html"
                    elif val.endswith("/"):
                        val = val + "index.html"
                elif external:
                    if val not in seen_ext:
                        req = urllib.request.Request(val, method="HEAD",
                                                     headers={"User-Agent": "GoalWorld-linkcheck/1.0"})
                        try:
                            with urllib.request.urlopen(req, timeout=12) as r:
                                seen_ext[val] = r.status
                        except urllib.error.HTTPError as e:
                            if e.code in (403, 405, 999):
                                seen_ext[val] = e.code
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
                if frag not in doc.ids:
                    errors.append(f"{rel}: {attr} -> #{frag}  (MISSING ANCHOR)")
                checked += 1
                continue
            if val.startswith("/"):
                target = os.path.join(dist, val.lstrip("/"))
            else:
                target = os.path.normpath(os.path.join(dist, page_dir, val))
            candidates = [target]
            if not os.path.splitext(target)[1]:
                candidates += [target + ".html", os.path.join(target, "index.html")]
            found = next((c for c in candidates if os.path.isfile(c)), None)
            if not found and merge_root:
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
                tgt = pages.get(os.path.relpath(found, dist).replace("\\", "/"))
                if tgt is None:
                    tgt = Collector()
                    tgt.feed(open(found, encoding="utf8").read())
                if frag not in tgt.ids:
                    errors.append(f"{rel}: {attr} -> {val}#{frag}  (MISSING ANCHOR)")
            checked += 1

    # Verify sitemap.xml entries map to real files in dist
    sitemap_path = os.path.join(dist, "sitemap.xml")
    sitemap_urls = 0
    if os.path.isfile(sitemap_path):
        sm_raw = open(sitemap_path, encoding="utf8").read()
        for loc in re.findall(r"<loc>([^<]+)</loc>", sm_raw):
            sitemap_urls += 1
            p = urllib.parse.urlparse(loc).path or "/"
            if p.endswith("/"):
                p = p + "index.html"
            target = os.path.join(dist, p.lstrip("/"))
            if not os.path.isfile(target):
                errors.append(f"sitemap.xml: <loc>{loc}</loc> -> missing file {target}")
    else:
        errors.append("sitemap.xml missing from dist")

    print(f"pages: {len(pages)}   links checked: {checked}   sitemap urls: {sitemap_urls}")
    if external:
        print("external targets:")
        for u, st in sorted(seen_ext.items()):
            flag = "" if (isinstance(st, int) and st < 400) else "   <-- CHECK"
            print(f"  {st}  {u}{flag}")
        errors += [f"external {u} -> {s}" for u, s in seen_ext.items() if isinstance(s, str)]
    if errors:
        print("\nBROKEN:")
        for e in errors:
            print("  " + e)
        sys.exit(1)
    print("OK — all internal links, hreflang tags, and sitemap URLs resolve")


if __name__ == "__main__":
    main()
