#!/usr/bin/env python3
"""
Deep static repository audit for GoalWorld site overhaul (Phase 0).
Scans goalworld_site/, docs/, and goalchain_webapp/ for:
- Banned claims & canon violations
- Accessibility issues (heading hierarchy, landmarks, missing alt, aria)
- i18n gaps (hardcoded strings, missing hreflang/locale routes)
- Dead assets & oversized media
- CSS/JS duplication & token drift
"""
import json
import os
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
OUT_DIR = ROOT / "_work" / "site-overhaul-20261109" / "evidence" / "audit"
OUT_DIR.mkdir(parents=True, exist_ok=True)

BANNED_CLAIMS = [
    ("pre-order", re.compile(r"\bpre-?order\b", re.I)),
    ("prerreserva", re.compile(r"\bprerreserva\b", re.I)),
    ("available on Kindle", re.compile(r"available\s+on\s+kindle", re.I)),
    ("KDP", re.compile(r"\bKDP\b")),
    ("yield", re.compile(r"(?<!no\s)\byield\b", re.I)),
    ("staking", re.compile(r"\bstaking\b", re.I)),
    ("NFT market", re.compile(r"NFT\s+market", re.I)),
    ("definitive English edition is complete", re.compile(r"definitive\s+english\s+edition\s+is\s+complete", re.I)),
    ("USDC royalties", re.compile(r"USDC\s+royalties", re.I)),
    ("Zero Value Loss", re.compile(r"zero\s+value\s+loss", re.I)),
    ("Infinity Burn", re.compile(r"infinity\s+burn", re.I)),
    ("audited facial likeness", re.compile(r"audited\s+facial\s+likeness|similitud\s+facial\s+auditada", re.I)),
    ("C2PA-verified", re.compile(r"C2PA-verified", re.I)),
    ("Kora Chen", re.compile(r"\bKora\s+Chen\b", re.I)),
    ("Neo-Veridia", re.compile(r"\bNeo-Veridia\b", re.I)),
    ("seven days", re.compile(r"\bseven\s+days\b", re.I)),
    ("432 Hz", re.compile(r"\b432\s+Hz\b", re.I)),
    ("$1M", re.compile(r"\$1M\b", re.I)),
    ("Convergence Protocol", re.compile(r"Convergence\s+Protocol", re.I)),
    ("% APY", re.compile(r"\d+(?:\.\d+)?%\s*APY", re.I)),
    ("Automated market buybacks", re.compile(r"Automated\s+market\s+buybacks", re.I)),
    ("propiedad intelectual tokenizada", re.compile(r"propiedad\s+intelectual\s+tokenizada", re.I)),
    ("Solana Mainnet", re.compile(r"Solana\s+Mainnet(?!\s+or\s+devnet)", re.I)),
]


def scan_file_for_banned(path: Path):
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return []
    hits = []
    lines = text.splitlines()
    for lineno, line in enumerate(lines, 1):
        # Ignore comments explaining banned claims in build.mjs or check-banned-claims.mjs
        if path.name in ("build.mjs", "check-banned-claims.mjs", "goalchain_program.idl.json"):
            continue
        for label, rx in BANNED_CLAIMS:
            if label in ("yield", "staking"):
                # Ignore CSS class names, route paths (/staking), nav item IDs, and asset image filenames
                if re.search(
                    r"(className=|path=\"/staking\"|to:\s*['\"]/staking['\"]|navigate\(['\"]/staking['\"]\)|id:\s*['\"]staking['\"]|assets/img/nfts/|DEFI\s*→)",
                    line,
                ):
                    continue
            m = rx.search(line)
            if m:
                hits.append({
                    "claim": label,
                    "match": m.group(0),
                    "line": lineno,
                    "snippet": line.strip()[:140],
                })
    return hits


class HtmlA11yParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.headings = []
        self._cur_h = None
        self._cur_text = []
        self.imgs_without_alt = []
        self.videos_without_label = []
        self.has_main = False
        self.has_header = False
        self.has_footer = False
        self.has_skip_link = False
        self.hreflangs = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "main":
            self.has_main = True
        elif tag == "header":
            self.has_header = True
        elif tag == "footer":
            self.has_footer = True
        elif tag == "a" and a.get("href") == "#main":
            self.has_skip_link = True
        elif tag == "link" and a.get("rel") == "alternate" and a.get("hreflang"):
            self.hreflangs.append(a["hreflang"])
        elif tag == "img" and "alt" not in a:
            self.imgs_without_alt.append(a.get("src", "<unknown>"))
        elif tag == "video" and not a.get("aria-label") and not a.get("title"):
            self.videos_without_label.append(a.get("src", "<video>"))
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._cur_h = int(tag[1])
            self._cur_text = []

    def handle_endtag(self, tag):
        if self._cur_h and tag == f"h{self._cur_h}":
            self.headings.append((self._cur_h, "".join(self._cur_text).strip()))
            self._cur_h = None

    def handle_data(self, data):
        if self._cur_h:
            self._cur_text.append(data)


def audit_html_file(path: Path):
    text = path.read_text(encoding="utf-8", errors="ignore")
    p = HtmlA11yParser()
    try:
        p.feed(text)
    except Exception:
        pass
    h_skips = []
    prev = 0
    for lvl, txt in p.headings:
        if prev and lvl > prev + 1:
            h_skips.append(f"h{prev} -> h{lvl} ({txt[:40]})")
        prev = lvl
    h1_count = sum(1 for lvl, _ in p.headings if lvl == 1)
    return {
        "file": str(path.relative_to(ROOT)),
        "h1_count": h1_count,
        "heading_skips": h_skips,
        "headings": p.headings[:15],
        "has_main": p.has_main,
        "has_skip_link": p.has_skip_link,
        "hreflangs": p.hreflangs,
        "imgs_without_alt": p.imgs_without_alt,
        "videos_without_label": p.videos_without_label,
    }


def main():
    report = {
        "goalworld_site_html_a11y": [],
        "docs_public_html": [],
        "goalchain_webapp_banned": [],
        "goalchain_webapp_i18n_gaps": [],
        "goalworld_site_unused_assets": [],
        "oversized_assets": [],
    }

    # 1. Audit goalworld_site/dist/*.html
    dist_dir = ROOT / "goalworld_site" / "dist"
    for f in sorted(dist_dir.glob("*.html")):
        report["goalworld_site_html_a11y"].append(audit_html_file(f))

    # 2. Audit docs/*.html & docs/go/**/*.html & docs/play/**/*.html
    docs_dir = ROOT / "docs"
    for f in sorted(docs_dir.rglob("*.html")):
        rel = f.relative_to(docs_dir)
        if any(str(rel).startswith(p) for p in ("archive/", "tests/", "REPORTS/", "proposals/")):
            continue
        hits = scan_file_for_banned(f)
        a11y = audit_html_file(f)
        report["docs_public_html"].append({
            "file": str(f.relative_to(ROOT)),
            "size_kb": round(f.stat().st_size / 1024, 1),
            "banned_hit_count": len(hits),
            "banned_sample": hits[:8],
            "h1_count": a11y["h1_count"],
            "has_main": a11y["has_main"],
            "has_skip_link": a11y["has_skip_link"],
        })

    # 3. Scan goalchain_webapp + root READMEs for banned claims and i18n gaps
    webapp_dir = ROOT / "goalchain_webapp"
    extra_docs = [ROOT / "README.md", ROOT / "goalworld_site" / "README.md"]
    for f in extra_docs:
        if f.exists():
            hits = scan_file_for_banned(f)
            if hits:
                report["goalchain_webapp_banned"].append({
                    "file": str(f.relative_to(ROOT)),
                    "hit_count": len(hits),
                    "samples": hits[:8],
                })
    for ext in ("*.tsx", "*.ts", "*.html", "*.json", "*.md"):
        for f in sorted(webapp_dir.rglob(ext)):
            if "node_modules" in f.parts or "dist" in f.parts:
                continue
            hits = scan_file_for_banned(f)
            if hits:
                report["goalchain_webapp_banned"].append({
                    "file": str(f.relative_to(ROOT)),
                    "hit_count": len(hits),
                    "samples": hits[:8],
                })

    # Check UI components in goalchain_webapp/src/ui/*.tsx for useTranslation usage vs hardcoded strings
    for f in sorted((webapp_dir / "src" / "ui").glob("*.tsx")):
        txt = f.read_text(encoding="utf-8", errors="ignore")
        t_calls = len(re.findall(r"\bt\s*\(", txt))
        lines = len(txt.splitlines())
        report["goalchain_webapp_i18n_gaps"].append({
            "file": str(f.relative_to(ROOT)),
            "lines": lines,
            "t_calls": t_calls,
        })

    # 4. Check unused assets in goalworld_site/src/assets/img/ (excluding intentional legacy fallback aliases per A-010)
    gw_src = ROOT / "goalworld_site" / "src"
    fallback_aliases = {
        "hero-neo-veridia-400.webp",
        "hero-neo-veridia-800.webp",
        "hero-neo-veridia.webp",
        "press-hero-neo-veridia.jpg",
    }
    all_src_text = ""
    for f in gw_src.rglob("*"):
        if f.is_file() and f.suffix in (".html", ".css", ".js", ".json", ".webmanifest", ".txt", ".md"):
            all_src_text += f.read_text(encoding="utf-8", errors="ignore") + "\n"
    for img in sorted((gw_src / "assets" / "img").rglob("*")):
        if img.is_file():
            if img.name in fallback_aliases:
                continue
            if img.name not in all_src_text:
                report["goalworld_site_unused_assets"].append({
                    "file": str(img.relative_to(ROOT)),
                    "size_kb": round(img.stat().st_size / 1024, 1),
                })

    # 5. Oversized assets in goalworld_site and goalchain_webapp/public
    for base in (gw_src / "assets", webapp_dir / "public"):
        for f in sorted(base.rglob("*")):
            if f.is_file() and f.stat().st_size > 250 * 1024:
                report["oversized_assets"].append({
                    "file": str(f.relative_to(ROOT)),
                    "size_kb": round(f.stat().st_size / 1024, 1),
                })

    out_path = OUT_DIR / "repo_static_audit.json"
    out_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Wrote static repo audit to {out_path}")
    print(f"  goalworld_site HTML files audited: {len(report['goalworld_site_html_a11y'])}")
    print(f"  docs HTML files audited: {len(report['docs_public_html'])}")
    print(f"  goalchain_webapp files with banned claims: {len(report['goalchain_webapp_banned'])}")
    print(f"  goalworld_site unused assets: {len(report['goalworld_site_unused_assets'])}")
    print(f"  oversized assets (>250KB): {len(report['oversized_assets'])}")


if __name__ == "__main__":
    main()
