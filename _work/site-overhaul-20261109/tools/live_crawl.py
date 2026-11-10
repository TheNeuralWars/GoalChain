#!/usr/bin/env python3
"""
Polite read-only live crawler for https://goalworld.fun/ and https://play.goalworld.fun/.
Checks HTTP status codes, redirect chains, meta/OG/canonical/hreflang tags,
mixed content, internal/external links, and banned claims on live responses.
"""
import json
import re
import time
import urllib.parse
import urllib.request
import urllib.error
from html.parser import HTMLParser
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "evidence" / "audit"
OUT_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "GoalWorld-AuditCrawler/1.0 (+https://goalworld.fun)"

SEED_URLS = [
    # Canonical goalworld_site routes
    "https://goalworld.fun/",
    "https://goalworld.fun/index.html",
    "https://goalworld.fun/book.html",
    "https://goalworld.fun/book/",
    "https://goalworld.fun/cinema.html",
    "https://goalworld.fun/cinema/",
    "https://goalworld.fun/studio.html",
    "https://goalworld.fun/studio/",
    "https://goalworld.fun/collect.html",
    "https://goalworld.fun/collect/",
    "https://goalworld.fun/live.html",
    "https://goalworld.fun/live/",
    "https://goalworld.fun/roadmap.html",
    "https://goalworld.fun/roadmap/",
    "https://goalworld.fun/about.html",
    "https://goalworld.fun/about/",
    "https://goalworld.fun/faq.html",
    "https://goalworld.fun/faq/",
    "https://goalworld.fun/press.html",
    "https://goalworld.fun/press/",
    "https://goalworld.fun/privacy.html",
    "https://goalworld.fun/privacy/",
    "https://goalworld.fun/terms.html",
    "https://goalworld.fun/terms/",
    "https://goalworld.fun/404.html",
    # Machine-readable & feeds
    "https://goalworld.fun/robots.txt",
    "https://goalworld.fun/sitemap.xml",
    "https://goalworld.fun/llms.txt",
    "https://goalworld.fun/site.webmanifest",
    "https://goalworld.fun/data/live-feed.json",
    "https://goalworld.fun/.well-known/ard.json",
    "https://goalworld.fun/.well-known/ai-catalog.json",
    "https://goalworld.fun/.well-known/agent-skills/goalworld-site/SKILL.md",
    # Sub-sites & i18n checks
    "https://goalworld.fun/blast-radius/",
    "https://goalworld.fun/hermes-demo/",
    "https://goalworld.fun/go/reader/",
    "https://goalworld.fun/go/",
    "https://goalworld.fun/go/club/",
    "https://goalworld.fun/go/defi/",
    "https://goalworld.fun/go/estadio/",
    "https://goalworld.fun/go/goalworld/",
    "https://goalworld.fun/go/studio/",
    "https://goalworld.fun/es/",
    "https://goalworld.fun/it/",
    # Legacy docs/ pages
    "https://goalworld.fun/goalworld.html",
    "https://goalworld.fun/goalchain.html",
    "https://goalworld.fun/arcade.html",
    "https://goalworld.fun/pitch.html",
    "https://goalworld.fun/mega-guide.html",
    "https://goalworld.fun/mega-guide-v1.html",
    "https://goalworld.fun/agents.html",
    "https://goalworld.fun/app.html",
    "https://goalworld.fun/ceo.html",
    "https://goalworld.fun/colabs.html",
    "https://goalworld.fun/legal.html",
    "https://goalworld.fun/map.html",
    "https://goalworld.fun/pre-nft.html",
    "https://goalworld.fun/protocol.html",
    "https://goalworld.fun/reader.html",
    "https://goalworld.fun/tokenomics.html",
    "https://goalworld.fun/play/",
    "https://goalworld.fun/play/pack.html",
    "https://goalworld.fun/play/penalty.html",
    "https://goalworld.fun/architecture/archify/goalchain.architecture.html",
    # Media & assets check
    "https://goalworld.fun/assets/img/neuralwars/05_Clips/Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4",
    "https://goalworld.fun/assets/img/neuralwars/05_Clips/Clip_08_Kora_Vega_Harmonic_Rings.mp4",
    # Play app routes
    "https://play.goalworld.fun/",
    "https://play.goalworld.fun/dashboard",
    "https://play.goalworld.fun/estadio",
    "https://play.goalworld.fun/defi",
    "https://play.goalworld.fun/club",
    "https://play.goalworld.fun/goalworld",
    "https://play.goalworld.fun/staking",
    "https://play.goalworld.fun/marketing-control",
    "https://play.goalworld.fun/autopilot",
    "https://play.goalworld.fun/agents",
    "https://play.goalworld.fun/presskit",
    "https://play.goalworld.fun/coleccion",
    "https://play.goalworld.fun/hub",
    "https://play.goalworld.fun/crear-usuario",
    "https://play.goalworld.fun/reader",
    "https://play.goalworld.fun/studio",
    "https://play.goalworld.fun/llms.txt",
    "https://play.goalworld.fun/.well-known/ard.json",
    "https://play.goalworld.fun/.well-known/ai-catalog.json",
    "https://play.goalworld.fun/.well-known/agent-skills/goalworld-play/SKILL.md",
]

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
]


class PageInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""
        self.html_lang = None
        self.meta = {}
        self.og = {}
        self.canonical = None
        self.hreflangs = []
        self.links = []
        self.assets = []
        self.headings = []
        self._cur_heading = None
        self._cur_heading_text = []
        self.imgs_missing_alt = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.html_lang = a.get("lang")
        elif tag == "title":
            self.in_title = True
        elif tag == "meta":
            name = (a.get("name") or "").lower()
            prop = (a.get("property") or "").lower()
            content = a.get("content", "")
            if name:
                self.meta[name] = content
            if prop.startswith("og:"):
                self.og[prop] = content
        elif tag == "link":
            rel = (a.get("rel") or "").lower()
            href = a.get("href", "")
            if rel == "canonical":
                self.canonical = href
            elif rel == "alternate" and a.get("hreflang"):
                self.hreflangs.append((a.get("hreflang"), href))
            elif href:
                self.assets.append(("link:" + rel, href))
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag in ("img", "script", "video", "source", "iframe"):
            src = a.get("src")
            if src:
                self.assets.append((tag, src))
            if tag == "img" and "alt" not in a:
                self.imgs_missing_alt.append(a.get("src", "<unknown>"))
        elif tag in ("h1", "h2", "h3", "h4"):
            self._cur_heading = tag
            self._cur_heading_text = []

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == self._cur_heading:
            self.headings.append((tag, "".join(self._cur_heading_text).strip()))
            self._cur_heading = None

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self._cur_heading:
            self._cur_heading_text.append(data)


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


opener = urllib.request.build_opener(NoRedirect)


def fetch_url(url, method="GET"):
    chain = []
    cur = url
    for _ in range(6):
        req = urllib.request.Request(cur, method=method, headers={"User-Agent": USER_AGENT})
        try:
            with opener.open(req, timeout=12) as resp:
                code = resp.getcode()
                ctype = resp.headers.get("Content-Type", "")
                body = b""
                if method == "GET" and ("text/" in ctype or "json" in ctype or "xml" in ctype or "javascript" in ctype):
                    body = resp.read(500_000)
                return {
                    "url": url,
                    "final_url": cur,
                    "status": code,
                    "redirects": chain,
                    "content_type": ctype,
                    "last_modified": resp.headers.get("Last-Modified"),
                    "body": body.decode("utf-8", errors="replace") if body else "",
                }
        except urllib.error.HTTPError as e:
            if e.code in (301, 302, 303, 307, 308):
                loc = e.headers.get("Location", "")
                nxt = urllib.parse.urljoin(cur, loc)
                chain.append({"from": cur, "status": e.code, "to": nxt})
                cur = nxt
                continue
            body = b""
            try:
                body = e.read(100_000)
            except Exception:
                pass
            return {
                "url": url,
                "final_url": cur,
                "status": e.code,
                "redirects": chain,
                "content_type": e.headers.get("Content-Type", "") if e.headers else "",
                "last_modified": e.headers.get("Last-Modified") if e.headers else None,
                "body": body.decode("utf-8", errors="replace") if body else "",
            }
        except Exception as e:
            return {
                "url": url,
                "final_url": cur,
                "status": f"ERR:{type(e).__name__}:{e}",
                "redirects": chain,
                "content_type": "",
                "last_modified": None,
                "body": "",
            }
    return {
        "url": url,
        "final_url": cur,
        "status": "ERR:TooManyRedirects",
        "redirects": chain,
        "content_type": "",
        "last_modified": None,
        "body": "",
    }


def main():
    results = []
    discovered_internal = set()

    for u in SEED_URLS:
        method = "HEAD" if u.endswith(".mp4") else "GET"
        r = fetch_url(u, method=method)
        info = {
            "url": r["url"],
            "final_url": r["final_url"],
            "status": r["status"],
            "redirects": r["redirects"],
            "content_type": r["content_type"],
            "last_modified": r["last_modified"],
        }
        body = r["body"]
        if body and "text/html" in r["content_type"]:
            p = PageInspector()
            try:
                p.feed(body)
            except Exception:
                pass
            info["title"] = p.title.strip()
            info["html_lang"] = p.html_lang
            info["description"] = p.meta.get("description")
            info["canonical"] = p.canonical
            info["og_title"] = p.og.get("og:title")
            info["og_desc"] = p.og.get("og:description")
            info["og_image"] = p.og.get("og:image")
            info["og_url"] = p.og.get("og:url")
            info["hreflangs"] = p.hreflangs
            info["h1_count"] = sum(1 for t, _ in p.headings if t == "h1")
            info["headings"] = p.headings[:12]
            info["imgs_missing_alt"] = p.imgs_missing_alt
            mixed = [src for _, src in p.assets if src.startswith("http://")]
            info["mixed_content"] = mixed
            info["link_count"] = len(p.links)
            # Check banned claims in visible/raw HTML
            hits = []
            for label, rx in BANNED_CLAIMS:
                m = rx.search(body)
                if m:
                    hits.append(f"{label} ({m.group(0)})")
            info["banned_claims"] = hits

            # Collect internal goalworld.fun links
            if "goalworld.fun" in r["final_url"] and not "play.goalworld.fun" in r["final_url"]:
                for href in p.links:
                    if href.startswith(("mailto:", "tel:", "javascript:", "#")):
                        continue
                    full = urllib.parse.urljoin(r["final_url"], href.split("#")[0])
                    parsed = urllib.parse.urlparse(full)
                    if parsed.hostname == "goalworld.fun":
                        discovered_internal.add(full)
        elif body:
            hits = []
            for label, rx in BANNED_CLAIMS:
                m = rx.search(body)
                if m:
                    hits.append(f"{label} ({m.group(0)})")
            info["banned_claims"] = hits
            info["body_len"] = len(body)

        results.append(info)
        print(f"[{info['status']}] {u} -> {info.get('title', '')[:50]} (banned: {len(info.get('banned_claims', []))})")
        time.sleep(0.05)

    # Check any newly discovered internal links not in SEED_URLS
    known = set(SEED_URLS)
    extra = sorted(discovered_internal - known)
    print(f"\nDiscovered {len(extra)} additional internal links on goalworld.fun:")
    for u in extra[:40]:
        method = "HEAD" if any(u.endswith(ext) for ext in (".mp4", ".zip", ".webp", ".jpg", ".png", ".svg", ".pdf")) else "GET"
        r = fetch_url(u, method=method)
        info = {
            "url": r["url"],
            "final_url": r["final_url"],
            "status": r["status"],
            "redirects": r["redirects"],
            "content_type": r["content_type"],
            "last_modified": r["last_modified"],
            "discovered": True,
        }
        results.append(info)
        print(f"  [{info['status']}] {u}")
        time.sleep(0.05)

    out_file = OUT_DIR / "live_crawl.json"
    out_file.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nSaved {len(results)} crawl records to {out_file}")


if __name__ == "__main__":
    main()
