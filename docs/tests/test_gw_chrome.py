#!/usr/bin/env python3
"""GW-CHROME-001: shared top nav World | Matchday | Books | Lore | Play.

Marketing HTML (except pitch-mode) must load gw-shell.js. The shell injects
one top chrome using GoalChain header tokens (Outfit, #14f195, logo_3d_clean)
and absolute URLs. Pitch-mode is a no-op. Matchday is not restyled here.
"""
from __future__ import annotations

import re
import unittest
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1]
JS = DOCS / "assets" / "js" / "gw-shell.js"
CSS = DOCS / "assets" / "css" / "gw-shell.css"
LIVE = Path("/data/apps/GoalChain/docs")
NAV_ORDER = ["World", "Matchday", "Books", "Lore", "Play"]
REMOVED = ("Cinema", "Bet", "DeFi", "Map")
REDIRECT_MARKERS = (
    'http-equiv="refresh"',
    "http-equiv='refresh'",
    "location.replace(",
)


def _is_redirect(html: str) -> bool:
    """A page is a redirect if it hands off to another URL — via meta refresh
    OR via JS location.replace/assign. Requiring both markers misses
    host-aware JS-only redirect pages (go/*), which are still redirects."""
    lower = html.lower()
    has_meta_refresh = "http-equiv" in lower and "refresh" in lower
    has_js_redirect = "location.replace(" in html or "location.assign(" in html
    return has_meta_refresh or has_js_redirect


def _marketing_html() -> list[Path]:
    out: list[Path] = []
    for path in sorted(DOCS.rglob("*.html")):
        rel = path.relative_to(DOCS).as_posix()
        if "/archive/" in f"/{rel}" or rel.startswith("archive/"):
            continue
        html = path.read_text(encoding="utf-8", errors="replace")
        if _is_redirect(html):
            continue
        out.append(path)
    return out


class SharedDocsChrome(unittest.TestCase):
    def test_shell_files_exist(self) -> None:
        self.assertTrue(JS.is_file(), "gw-shell.js")
        self.assertTrue(CSS.is_file(), "gw-shell.css")

    def test_nav_is_exactly_five_top_items(self) -> None:
        js = JS.read_text(encoding="utf-8")
        labels = re.findall(r"label:\s*'([^']+)'", js)
        self.assertEqual(labels, NAV_ORDER)
        for extra in REMOVED:
            self.assertNotIn(f"label: '{extra}'", js)

    def test_pitch_mode_is_noop(self) -> None:
        js = JS.read_text(encoding="utf-8")
        self.assertIn("pitch-mode", js)
        self.assertRegex(js, r"classList\.contains\(\s*['\"]pitch-mode['\"]\s*\)")

    def test_absolute_urls_and_tokens(self) -> None:
        js = JS.read_text(encoding="utf-8")
        self.assertIn("location.origin", js)
        self.assertIn("origin + '/'", js)
        self.assertIn("origin + '/goalchain'", js)
        self.assertIn("origin + '/go/reader'", js)
        self.assertIn("origin + '/goalworld.html'", js)
        self.assertIn("play.goalworld.fun", js)
        self.assertIn("logo_3d_clean.png", js)
        self.assertNotRegex(js, r"href:\s*'assets/")
        self.assertNotRegex(js, r"href:\s*'\.\./")

    def test_css_is_top_chrome_with_goalchain_tokens(self) -> None:
        css = CSS.read_text(encoding="utf-8")
        self.assertIn("Outfit", css)
        self.assertIn("#14f195", css)
        self.assertIn("position: fixed", css)
        self.assertIn("top: 0", css)
        self.assertNotIn("bottom: max(", css)
        self.assertIn(".gw-chrome", css)

    def test_does_not_touch_matchday_markup(self) -> None:
        """Chrome lives in gw-shell.* only — goalchain.html is not restyled."""
        matchday = DOCS / "goalchain.html"
        if not matchday.is_file():
            self.skipTest("no matchday html in this tree")
        html = matchday.read_text(encoding="utf-8")
        self.assertIn("gw-shell.js", html)
        self.assertNotIn("gw-chrome-brand", html)
        self.assertIn("class=\"main-nav\"", html)

    def test_marketing_html_loads_shell(self) -> None:
        missing = []
        for path in _marketing_html():
            html = path.read_text(encoding="utf-8", errors="replace")
            if "gw-shell.js" not in html:
                missing.append(path.relative_to(DOCS).as_posix())
        self.assertEqual(missing, [], f"marketing HTML missing gw-shell.js: {missing}")

    def test_pitch_html_keeps_pitch_mode_class(self) -> None:
        pitch = DOCS / "pitch.html"
        self.assertTrue(pitch.is_file())
        html = pitch.read_text(encoding="utf-8")
        self.assertIn("pitch-mode", html)
        self.assertIn("gw-shell.js", html)

    def test_live_mirror_matches_when_present(self) -> None:
        live_js = LIVE / "assets" / "js" / "gw-shell.js"
        live_css = LIVE / "assets" / "css" / "gw-shell.css"
        if not live_js.is_file() or not live_css.is_file():
            self.skipTest("GoalChain/docs live tree not mounted")
        self.assertEqual(JS.read_text(encoding="utf-8"), live_js.read_text(encoding="utf-8"))
        self.assertEqual(CSS.read_text(encoding="utf-8"), live_css.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
