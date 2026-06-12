#!/usr/bin/env python3
"""
Download player portrait + fullbody images exclusively from transfermarkt.it
for the current players.json (528 players, id-padded filenames, batch_XX folders).
- Forces target to primary GoalChain only (never .gemini mirror).
- Deletes old/non-matching images first (call with --clean).
- Uses real tm_url when present; otherwise resolves via TM search using real_name.
- Scrapes profile page (or guesses CDN) to get high quality tmssl.akamaized urls.
- Retries with browser-like headers. Falls back to alternative crops if needed.
- Keeps perfect sync: {id:03d}_portrait.jpg and {id:03d}_fullbody.jpg
Usage:
  python download_from_tm.py --clean          # remove all old jpgs then download all
  python download_from_tm.py --limit 20       # download first N only (for testing)
  python download_from_tm.py --start 100 --limit 10
"""
import os
import sys
import json
import time
import argparse
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
from pathlib import Path

# Manual overrides for players where search resolver struggles (accents, Hangul, "Jr.", etc.)
# These guarantee we get images from TM.it for the Genesis squad.
OVERRIDES = {
    34: "https://www.transfermarkt.it/neymar/profil/spieler/68290",          # Neymar Jr.
    51: "https://www.transfermarkt.it/daniel-carvajal/profil/spieler/138927", # Dani Carvajal
    155: "https://www.transfermarkt.it/heung-min-son/profil/spieler/91845",   # Son Heung-min
    156: "https://www.transfermarkt.it/min-jae-kim/profil/spieler/503482",    # Kim Min-jae
    157: "https://www.transfermarkt.it/kang-in-lee/profil/spieler/557149",    # Lee Kang-in
    158: "https://www.transfermarkt.it/hee-chan-hwang/profil/spieler/292246", # Hwang Hee-chan
    159: "https://www.transfermarkt.it/gue-sung-cho/profil/spieler/652537",   # Cho Gue-sung
    183: "https://www.transfermarkt.it/ali-al-bulayhi/profil/spieler/229877", # Ali Al-Bulaihi
    368: "https://www.transfermarkt.it/lawrence-ati-zigi/profil/spieler/254285", # Lawrence Ati-Zigi
    273: "https://www.transfermarkt.it/bendeguz-bolla/profil/spieler/439351",     # Bendegúz Bolla (spelling in json "Bóla")
    452: "https://www.transfermarkt.it/aymen-hussein/profil/spieler/401054",      # Ayman / Aymen Hussein
    187: "https://www.transfermarkt.it/mohamed-kanno/profil/spieler/308120",      # Mohammed Kanno
    395: "https://www.transfermarkt.it/nicolas-moumi-ngamaleu/profil/spieler/266768", # Nicolas Ngamaleu
    233: "https://www.transfermarkt.it/mykhaylo-mudryk/profil/spieler/537860",       # Mykhailo Mudryk (note spelling Mykhaylo on TM)
    418: "https://www.transfermarkt.it/seifeddine-jaziri/profil/spieler/209304",     # Seifeddine Jaziri (Túnez)
    431: "https://www.transfermarkt.it/adalberto-carrasquilla/profil/spieler/375300", # Adalberto Carrasquilla (Panamá; json lists as Cristian)
    466: "https://www.transfermarkt.it/hasan-al-haydos/profil/spieler/86286",       # Hasan Al-Haydos (Qatar)
    494: "https://www.transfermarkt.it/hamdy-fathy/profil/spieler/340303",          # Hamdy Fathy (Egipto)
    # Add more here if new ones appear (e.g. after more research)
}

# ========= HARDENED PATHS - CROSS-PLATFORM RESOLUTION =========
import platform

if platform.system() == "Windows":
    PRIMARY_ROOT = r"C:\Users\lucas\GoalChain"
    PLAYERS_JSON = os.path.join(PRIMARY_ROOT, r"ai_context\03_data\players.json")
    BATCHES_ROOT = os.path.join(PRIMARY_ROOT, r"scratch\grok_batches")
    GEMINI_MIRROR = r"\\?\C:\Users\lucas\.gemini\antigravity\scratch\GoalChain\scratch\grok_batches"
else:
    # Mac / Linux local paths
    PRIMARY_ROOT = "/Users/NicoPez/GoalChain"
    if not os.path.exists(PRIMARY_ROOT):
        PRIMARY_ROOT = os.getcwd()
    PLAYERS_JSON = os.path.join(PRIMARY_ROOT, "docs/assets/data/players.json")
    BATCHES_ROOT = os.path.join(PRIMARY_ROOT, "grok_batches")
    GEMINI_MIRROR = ""

# Browser-like headers to avoid 0-byte / bot blocks
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7,it;q=0.6",
    "Referer": "https://www.transfermarkt.it/",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Upgrade-Insecure-Requests": "1",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

def is_gemini_path(p: str) -> bool:
    return ".gemini" in p or "antigravity" in p

def assert_primary_only():
    if platform.system() == "Windows":
        if is_gemini_path(BATCHES_ROOT) or is_gemini_path(os.getcwd()):
            print("FATAL: Refusing to run from/into gemini mirror path. Aborting.")
            sys.exit(1)
    print(f"[OK] Primary root locked: {PRIMARY_ROOT}")
    print(f"[OK] Batches target: {BATCHES_ROOT}")

def clean_all_jpgs():
    print("=== CLEAN: removing all *.jpg under primary batches ===")
    removed = 0
    for batch_dir in sorted(Path(BATCHES_ROOT).glob("batch_*")):
        for jpg in batch_dir.glob("*.jpg"):
            jpg.unlink(missing_ok=True)
            removed += 1
    print(f"Removed {removed} jpgs from primary.")
    # Also ensure mirror has none (best effort)
    try:
        gpath = Path(GEMINI_MIRROR)
        if gpath.exists():
            gcount = 0
            for jpg in gpath.rglob("*.jpg"):
                jpg.unlink(missing_ok=True)
                gcount += 1
            print(f"Also cleaned {gcount} from gemini mirror (if any).")
    except Exception as e:
        print(f"(gemini clean skipped: {e})")

def get_batch_dir(pid: int) -> Path:
    batch_num = ((pid - 1) // 29) + 1
    d = Path(BATCHES_ROOT) / f"batch_{batch_num:02d}"
    d.mkdir(parents=True, exist_ok=True)
    return d

def extract_tmid(tm_url: str) -> str | None:
    if not tm_url:
        return None
    m = re.search(r"/spieler/(\d+)", tm_url)
    return m.group(1) if m else None

def try_direct_cdn(tmid: str, kind: str = "portrait") -> str | None:
    """Try common direct patterns (legacy akamaized often 0-byte now; new .technology needs exact versioned name from scrape)."""
    bases = [
        f"https://img.a.transfermarkt.technology/portrait/{kind}/{tmid}.jpg?lm=1",
        f"https://tmssl.akamaized.net/images/portrait/{kind}/{tmid}.jpg",
        f"https://tmssl.akamaized.net/images/{kind}/header/{tmid}.jpg",
    ]
    for u in bases:
        try:
            r = SESSION.head(u, timeout=8, allow_redirects=True)
            cl = int(r.headers.get("Content-Length", "0"))
            if r.status_code == 200 and cl > 3000:
                return u
        except Exception:
            pass
    return None

def _normalize_img_url(u: str) -> str:
    if not u:
        return u
    if u.startswith("//"):
        u = "https:" + u
    # Prefer the .technology CDN when present (current official)
    return u

def scrape_profile_for_images(tm_url: str, tmid: str) -> dict:
    """Scrape profile page. Extract current versioned portrait urls from og:image + data-header profile img.
    og:image / big is usually the richer shot; header/ is the classic card portrait.
    Returns normalized full https urls.
    """
    result = {"portrait": None, "fullbody": None}
    if not tm_url:
        return result
    try:
        resp = SESSION.get(tm_url, timeout=15, allow_redirects=True)
        if resp.status_code != 200:
            print(f"  profile HTTP {resp.status_code}")
            return result
        html = resp.text
        soup = BeautifulSoup(html, "lxml")

        # 1. Best signals: og:image and twitter:image (usually the /big/ high quality)
        og = None
        for m in soup.find_all("meta"):
            prop = (m.get("property") or m.get("name") or "").lower()
            if "og:image" in prop or "twitter:image" in prop:
                c = m.get("content")
                if c and ("transfermarkt" in c.lower() and ("portrait" in c.lower() or tmid in c)):
                    og = _normalize_img_url(c)
                    break

        # Broad search for any .technology portrait url containing tmid (catches more page structures)
        if not og:
            for m in soup.find_all("meta"):
                c = m.get("content") or ""
                if "transfermarkt.technology" in c and tmid in c and "portrait" in c.lower():
                    og = _normalize_img_url(c)
                    break

        # 2. The visible profile photo in the header (usually the /header/ smaller crop)
        header_port = None
        # Look in known containers
        for container in soup.find_all(["div", "header"], class_=re.compile(r"data-header|profil|player|spielerfoto", re.I)):
            for img in container.find_all("img"):
                for k in ("src", "data-src"):
                    s = img.get(k) or ""
                    if tmid in s and ("portrait" in s.lower() or "header" in s.lower() or "big" in s.lower() or "technology" in s.lower()):
                        header_port = _normalize_img_url(s)
                        break
                if header_port:
                    break
            if header_port:
                break

        # If not found in container, broader search for the header portrait pattern or any technology + tmid
        if not header_port:
            for img in soup.find_all("img"):
                for k in ("src", "data-src"):
                    s = img.get(k) or ""
                    if tmid in s and ("/portrait/" in s.lower() or "technology" in s.lower()):
                        header_port = _normalize_img_url(s)
                        break
                if header_port:
                    break

        # Ultimate fallback: any .technology url with the tmid anywhere in page
        if not og and not header_port:
            for tag in soup.find_all(True):
                for a in ("content", "src", "data-src", "href"):
                    s = tag.get(a) or ""
                    if "transfermarkt.technology" in s and tmid in s and "portrait" in s.lower():
                        header_port = _normalize_img_url(s)
                        break
                if header_port:
                    break

        # Assign:
        # portrait prefers the classic header crop
        # fullbody prefers the richer og/big when available
        if header_port:
            result["portrait"] = header_port
        if og:
            result["fullbody"] = og
            if not result["portrait"]:
                result["portrait"] = og  # fallback
        elif header_port:
            result["fullbody"] = header_port  # no better, duplicate

        # If we only got one, and it is big, also synthesize a header variant (best effort, may 404 but rare)
        if result.get("fullbody") and "/big/" in result["fullbody"] and not result.get("portrait"):
            result["portrait"] = result["fullbody"].replace("/big/", "/header/")
        if result.get("portrait") and "/header/" in result["portrait"] and not result.get("fullbody"):
            result["fullbody"] = result["portrait"].replace("/header/", "/big/")

    except Exception as ex:
        print(f"  scrape error for {tm_url}: {ex}")
    return result

def resolve_tm_url_via_search(real_name: str, country: str | None = None) -> str | None:
    """Use TM quick search. Stricter: only accept clean /.../profil/spieler/NNNN urls."""
    # Try query variants
    queries = [real_name]
    if "Jr" in real_name or "Jr." in real_name:
        queries.append(real_name.replace(" Jr.", "").replace(" Jr", "").strip())

    real_words = set(re.findall(r'\w+', real_name.lower()))

    for q in queries:
        search_url = f"https://www.transfermarkt.it/schnellsuche/ergebnis/schnellsuche?query={requests.utils.quote(q)}"
        try:
            r = SESSION.get(search_url, timeout=12)
            if r.status_code != 200:
                continue
            soup = BeautifulSoup(r.text, "lxml")
            candidates = []
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "/profil/spieler/" in href:
                    m = re.search(r"/spieler/(\d+)(?:/|$)", href)
                    if m:
                        full = urljoin("https://www.transfermarkt.it", href)
                        link_text = (a.get_text() or "").strip().lower()
                        link_words = set(re.findall(r'\w+', link_text))
                        
                        # Calculate intersection of words
                        overlap = real_words.intersection(link_words)
                        if not overlap:
                            continue
                            
                        score = len(overlap) * 20
                        # Exact match bonus
                        if real_name.lower() in link_text:
                            score += 50
                        # Length penalty to avoid matching longer unrelated names
                        score -= abs(len(real_words) - len(link_words)) * 2
                        
                        candidates.append((score, full))
            if candidates:
                candidates.sort(key=lambda x: x[0], reverse=True)
                # Ensure the best candidate has a decent score (at least one matching word)
                if candidates[0][0] > 10:
                    return candidates[0][1]
        except Exception as e:
            print(f"  search resolve failed for {q}: {e}")
    return None

def download_image(url: str, dest: Path, referer: str | None = None) -> bool:
    """Download with verification that we got real bytes (not 0 or tiny anti-bot placeholder)."""
    try:
        h = dict(HEADERS)
        if referer:
            h["Referer"] = referer
        r = SESSION.get(url, headers=h, timeout=20, stream=True)
        if r.status_code != 200:
            return False
        content = r.content
        if len(content) < 3000:  # too small = probably blocked or 1x1 gif
            return False
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as f:
            f.write(content)
        print(f"    saved {dest.name} ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"    DL error {url}: {e}")
        return False

def process_player(p: dict, force_resolve: bool = False) -> tuple[int, int]:
    """Return (portrait_ok, fullbody_ok) counts. Mutates p['tm_url'] when newly resolved (for --update-json)."""
    pid = int(p["id"])
    real_name = p.get("real_name") or p.get("name") or ""
    country = p.get("country")
    tm_url = p.get("tm_url")
    resolved_now = False

    # 1. Hard overrides for difficult names (Hangul, accents, Jr., etc.)
    if pid in OVERRIDES:
        tm_url = OVERRIDES[pid]
        p["tm_url"] = tm_url
        print(f"  using OVERRIDE TM url for #{pid} {real_name}: {tm_url}")

    # 2. Resolve if still needed
    if not tm_url or force_resolve:
        tm_url = resolve_tm_url_via_search(real_name, country)
        if tm_url:
            print(f"  resolved TM url for #{pid} {real_name}: {tm_url}")
            p["tm_url"] = tm_url
            resolved_now = True
        else:
            print(f"  [SKIP] no tm_url and could not resolve for #{pid} {real_name}")
            return (0, 0)

    tmid = extract_tmid(tm_url)
    if not tmid:
        print(f"  [SKIP] bad tm_url for #{pid}: {tm_url}")
        return (0, 0)

    batch_dir = get_batch_dir(pid)
    pad = f"{pid:03d}"
    port_dest = batch_dir / f"{pad}_portrait.jpg"
    full_dest = batch_dir / f"{pad}_fullbody.jpg"

    port_ok = full_ok = 0

    # Always scrape once to get current versioned .technology CDN urls (legacy direct is 0-byte)
    scraped = scrape_profile_for_images(tm_url, tmid)

    # Portrait
    port_url = scraped.get("portrait") or try_direct_cdn(tmid, "portrait")
    if port_url:
        if download_image(port_url, port_dest, referer=tm_url):
            port_ok = 1
    else:
        print(f"  no portrait url found for #{pid}")

    # Fullbody (prefer richer big/ from scrape)
    full_url = scraped.get("fullbody") or try_direct_cdn(tmid, "foto")
    if full_url and full_url != port_url:
        if download_image(full_url, full_dest, referer=tm_url):
            full_ok = 1
    else:
        # Fallback: duplicate portrait as fullbody (guarantees the asset pipeline has matching pair named by id)
        if port_ok and not full_dest.exists():
            try:
                import shutil
                shutil.copy2(port_dest, full_dest)
                print(f"    (fullbody fallback = portrait copy for #{pid})")
                full_ok = 1
            except Exception:
                pass

    time.sleep(0.55)  # polite to TM
    return (port_ok, full_ok, resolved_now)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--clean", action="store_true", help="Delete all existing jpgs first")
    parser.add_argument("--limit", type=int, default=0, help="Max players to process (0=all)")
    parser.add_argument("--start", type=int, default=1, help="Start from this player id (1-based)")
    parser.add_argument("--update-json", action="store_true", help="Persist newly resolved tm_url back into players.json (both copies)")
    parser.add_argument("--only-ids", type=str, default="", help="Comma/range list of specific player ids to process, e.g. '34,51,155-160,273'")
    args = parser.parse_args()

    assert_primary_only()

    if args.clean:
        clean_all_jpgs()

    print("Loading players from", PLAYERS_JSON)
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)

    # Sort by id just in case
    players = sorted(players, key=lambda x: int(x["id"]))

    total = len(players)
    print(f"Total players in json: {total}")

    # Support targeted re-processing for previously skipped players
    if args.only_ids:
        wanted = set()
        for part in args.only_ids.split(","):
            part = part.strip()
            if not part:
                continue
            if "-" in part:
                a, b = part.split("-", 1)
                wanted.update(range(int(a), int(b) + 1))
            else:
                wanted.add(int(part))
        to_process = [p for p in players if int(p["id"]) in wanted]
        print(f"Processing ONLY specific ids ({len(to_process)}): {sorted([int(p['id']) for p in to_process])[:20]}...")
    else:
        start_idx = args.start - 1
        end_idx = len(players) if args.limit == 0 else min(len(players), start_idx + args.limit)
        to_process = players[start_idx:end_idx]
        print(f"Processing players {args.start}..{to_process[-1]['id']} ({len(to_process)} items)")

    stats = {"port": 0, "full": 0, "skipped": 0, "resolved_urls": 0}
    resolved_updates = []  # for --update-json

    for i, p in enumerate(to_process):
        pid = p["id"]
        print(f"[{i+1}/{len(to_process)}] #{pid} {p.get('real_name') or p.get('name')}")
        res = process_player(p)
        if len(res) == 3:
            po, fo, did_resolve = res
        else:
            po, fo, did_resolve = res[0], res[1], False
        stats["port"] += po
        stats["full"] += fo
        if po == 0 and fo == 0:
            stats["skipped"] += 1
        if did_resolve:
            stats["resolved_urls"] += 1
            resolved_updates.append(p)

    print("\n=== SUMMARY ===")
    print(f"Portraits downloaded: {stats['port']}")
    print(f"Fullbodies (or fallbacks): {stats['full']}")
    print(f"Players with 0 images: {stats['skipped']}")
    print(f"New tm_urls resolved this run: {stats['resolved_urls']}")

    # Final count verification
    total_jpg = sum(1 for b in Path(BATCHES_ROOT).glob("batch_*") for _ in b.glob("*.jpg"))
    print(f"Total jpgs now in {BATCHES_ROOT}: {total_jpg}")

    if args.update_json and resolved_updates:
        print("Persisting newly resolved tm_url values to both players.json copies...")
        # Reload fresh, update by id, write back
        second_json = os.path.join(PRIMARY_ROOT, "docs", "assets", "data", "players.json")
        for jpath in [PLAYERS_JSON, second_json]:
            try:
                with open(jpath, "r", encoding="utf-8") as f:
                    allp = json.load(f)
                id_to_url = {int(p["id"]): p.get("tm_url") for p in resolved_updates if p.get("tm_url")}
                changed = 0
                for pp in allp:
                    iid = int(pp["id"])
                    if iid in id_to_url and not pp.get("tm_url"):
                        pp["tm_url"] = id_to_url[iid]
                        # also stamp tm_data lightly if missing
                        if not pp.get("tm_data"):
                            pp["tm_data"] = {"source": "transfermarkt.it", "last_updated": "2026-06", "note": "auto-resolved during image batch DL"}
                        changed += 1
                with open(jpath, "w", encoding="utf-8") as f:
                    json.dump(allp, f, ensure_ascii=False, indent=2)
                print(f"  updated {changed} entries in {jpath}")
            except Exception as ex:
                print(f"  WARN could not update {jpath}: {ex}")
        print("Note: you should git add + commit the players.json changes if desired.")

if __name__ == "__main__":
    main()
