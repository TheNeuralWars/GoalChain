#!/usr/bin/env python3
"""Post-merge acceptance check for issue #881: prove the live site no longer serves
internal working docs, and that the public pages are still up.

  python3 scripts/pages/verify_live_site.py                # default site
  python3 scripts/pages/verify_live_site.py --base https://goalworld.fun

MUST-404  internal docs that used to be public
MUST-200  public pages (a filter that takes the site down is not a fix)
Exit 1 if any expectation is violated; Cloudflare caches for max-age=600, so re-run a
minute after the deploy if a 404 looks stale.
"""
import argparse
import sys
import urllib.error
import urllib.request

MUST_404 = [
    "/intake/",
    "/intake/README.md",
    "/intake/2026-09-02-fractured-code-forensic-editorial-audit.md",
    "/intake/MUNDIAL-2026-MVP.html",
    "/REPORTS/GOALCHAIN_ACTION_PLAN.md",
    # Unpublished manuscript + series canon (never downloadable before publication)
    "/publishing/the_neural_wars_trilogy/BOOK_01_FRACTURED_CODE/MANUSCRIPT/FC-01-Chapter.md",
    "/publishing/the_neural_wars_trilogy/BOOK_01_FRACTURED_CODE/EDICION_2026/FC-01-Chapter_2026.md",
    "/publishing/the_neural_wars_trilogy/BOOK_02_EARTHS_NEW_SONG/MANUSCRIPT/",
    "/publishing/the_neural_wars_trilogy/00_SERIES_BIBLE_AND_CANON/",
    "/ceo-log.txt",
    "/SECURITY_AUDIT.md",
    "/GROK_SYSTEM_PROMPT.md",
]
MUST_200 = [
    "/",
    "/go/",
    "/play/",
    "/reader.html",
    "/goalworld.html",
    "/assets/css/style.css",
    "/assets/js/i18n.js",
    "/assets/data/players.json",
    "/assets/img/neuralwars/trailer_cinematic_teaser.mp4",
]


def status(url):
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "goalworld-guard/1"})
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return resp.status
    except urllib.error.HTTPError as err:
        return err.code
    except Exception as err:  # noqa: BLE001 - report the transport failure verbatim
        return "ERR:%s" % err


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://goalworld.fun")
    args = ap.parse_args()
    base = args.base.rstrip("/")

    failures = []
    for path in MUST_404:
        code = status(base + path)
        ok = code == 404
        print("%-4s must-404 %s" % ("PASS" if ok else "FAIL", path), "->", code)
        if not ok:
            failures.append(path)
    for path in MUST_200:
        code = status(base + path)
        ok = code == 200
        print("%-4s must-200 %s" % ("PASS" if ok else "FAIL", path), "->", code)
        if not ok:
            failures.append(path)

    print("\n%d/%d checks passed" % (len(MUST_404) + len(MUST_200) - len(failures),
                                     len(MUST_404) + len(MUST_200)))
    if failures:
        print("FAILED: %s" % ", ".join(failures))
        return 1
    print("OK: internal docs are off the site and public pages still serve")
    return 0


if __name__ == "__main__":
    sys.exit(main())
