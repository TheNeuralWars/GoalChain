#!/usr/bin/env python3
"""
Lightweight Agentic RSS Ingester & Filter for Obsidian Vault
Fetches feeds, evaluates relevance via heuristic scoring or LLM,
and writes distilled atomic notes to vault/wiki/news/.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

VAULT_DIR = Path(__file__).resolve().parent.parent.parent / "vault"
RAW_DIR = VAULT_DIR / "raw" / "rss"
WIKI_DIR = VAULT_DIR / "wiki" / "news"

FEEDS = [
    {
        "name": "CoinDesk Markets",
        "url": "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
        "category": "crypto-macro",
        "keywords": ["solana", "sol", "etf", "fed", "cpi", "fomc", "sec", "liquidity", "jupiter"]
    },
    {
        "name": "Cointelegraph Core",
        "url": "https://cointelegraph.com/rss",
        "category": "crypto-market",
        "keywords": ["solana", "defi", "trading", "ai", "derivatives", "surge", "crash", "whale"]
    },
    {
        "name": "Publishing Trends & Tech",
        "url": "https://www.thepassivevoice.com/feed/",
        "category": "publishing",
        "keywords": ["amazon", "kdp", "kindle", "author", "ebook", "copyright", "publishing", "royalties"]
    }
]


def fetch_feed(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    )
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            return response.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"[-] Error fetching {url}: {e}")
        return ""


def parse_items(xml_data: str):
    items = []
    try:
        root = ET.fromstring(xml_data)
        # Handle RSS 2.0
        for item in root.findall(".//item"):
            title = item.findtext("title") or ""
            link = item.findtext("link") or ""
            desc = item.findtext("description") or ""
            pub_date = item.findtext("pubDate") or ""
            items.append({"title": title, "link": link, "desc": desc, "pub_date": pub_date})
            
        # Handle Atom
        if not items:
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            for entry in root.findall(".//atom:entry", ns):
                title = entry.findtext("atom:title", namespaces=ns) or ""
                link_elem = entry.find("atom:link", namespaces=ns)
                link = link_elem.attrib.get("href", "") if link_elem is not None else ""
                desc = entry.findtext("atom:summary", namespaces=ns) or entry.findtext("atom:content", namespaces=ns) or ""
                pub_date = entry.findtext("atom:updated", namespaces=ns) or ""
                items.append({"title": title, "link": link, "desc": desc, "pub_date": pub_date})
    except Exception as e:
        print(f"[-] Parse error: {e}")
    return items


def score_item(item: dict, keywords: list[str]) -> tuple[int, list[str]]:
    text = (item["title"] + " " + item["desc"]).lower()
    score = 0
    matched = []
    for kw in keywords:
        if kw in text:
            score += 3
            matched.append(kw)
    return score, matched


def slugify(text: str) -> str:
    s = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", s).strip("-")[:60]


def run_pipeline():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    WIKI_DIR.mkdir(parents=True, exist_ok=True)
    
    print("[*] Running Agentic RSS Ingest & Filter Pipeline...")
    total_processed = 0
    saved_notes = 0
    
    for feed in FEEDS:
        print(f"[*] Ingesting {feed['name']}...")
        xml_content = fetch_feed(feed["url"])
        if not xml_content:
            continue
            
        items = parse_items(xml_content)[:15]  # top 15 items
        for it in items:
            total_processed += 1
            score, matched_kws = score_item(it, feed["keywords"])
            
            # If high signal (score >= 3), create atomic wiki note
            if score >= 3:
                slug = slugify(it["title"])
                date_str = datetime.now().strftime("%Y-%m-%d")
                filename = f"{date_str}-{slug}.md"
                out_path = WIKI_DIR / filename
                
                if not out_path.exists():
                    clean_desc = re.sub(r"<[^>]+>", "", it["desc"])[:400]
                    content = f"""---
title: "{it['title']}"
date: {date_str}
source: "{feed['name']}"
link: "{it['link']}"
category: "{feed['category']}"
relevance_score: {score}
matched_keywords: {matched_kws}
tags:
  - intelligence
  - {feed['category']}
  - signal
---

# 📰 {it['title']}

* **Fuente:** [{feed['name']}]({it['link']})
* **Fecha:** {it['pub_date'] or date_str}
* **Score de Relevancia:** {score} / 10
* **Gatillos Detectados:** `{', '.join(matched_kws)}`

---

## 📌 Resumen de Señal
{clean_desc.strip()}...

---

## 🧠 Impacto en el Ecosistema GoalChain
* **Relevancia Estratégica:** Noticia filtrada con alta afinidad hacia la operativa de GoalChain (`{matched_kws}`).
* **Acciones Asociadas:**
  * Si impacta liquidez o Solana: consultar [[SETUP_MEAN_REVERSION_SOL]] y [[RISK_CIRCUIT_BREAKERS]].
  * Si impacta royalties o algoritmos de Amazon: consultar [[KDP_2026_SHORT_READS_STRATEGY]].
"""
                    with open(out_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"  [+] Saved high-signal note: {filename} (score {score})")
                    saved_notes += 1

    print(f"[+] Done. Processed {total_processed} items. Generated {saved_notes} new atomic notes in {WIKI_DIR}.")


if __name__ == "__main__":
    run_pipeline()
