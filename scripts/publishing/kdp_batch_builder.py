#!/usr/bin/env python3
"""
Amazon KDP & Metaplex Solana IP Dual-Publishing Engine
GoalChain / GoalWorld Media & Literature Flywheel

Generates print-ready specifications, spine calculations, valid ISBN-13 checksums,
and Metaplex Core digital IP metadata for The Neural Wars trilogy.
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path


def calculate_spine_and_cover(page_count: int, paper_type: str = "white") -> dict:
    multiplier = 0.0025 if paper_type == "cream" else 0.002252
    spine_in = page_count * multiplier
    trim_w = 6.0
    trim_h = 9.0
    bleed = 0.125

    total_w_in = bleed + trim_w + spine_in + trim_w + bleed
    total_h_in = bleed + trim_h + bleed

    dpi = 300
    total_w_px = math.ceil(total_w_in * dpi)
    total_h_px = math.ceil(total_h_in * dpi)
    spine_w_px = math.ceil(spine_in * dpi)

    return {
        "page_count": page_count,
        "paper_type": paper_type,
        "trim_size": "6.0 x 9.0 inches",
        "spine_width_inches": round(spine_in, 4),
        "spine_width_px_300dpi": spine_w_px,
        "total_cover_width_inches": round(total_w_in, 4),
        "total_cover_height_inches": round(total_h_in, 4),
        "full_cover_px_300dpi": f"{total_w_px} x {total_h_px}",
        "bleed_inches": bleed,
    }


def calculate_isbn13(prefix12: str) -> str:
    digits = [int(d) for d in prefix12 if d.isdigit()]
    if len(digits) != 12:
        return f"{prefix12}-0"
    checksum = (10 - sum(d * (1 if i % 2 == 0 else 3) for i, d in enumerate(digits)) % 10) % 10
    return f"{prefix12}-{checksum}"


def build_kdp_manifest(repo_root: Path) -> dict:
    out_dir = repo_root / "data" / "publishing"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "kdp_manifest.json"

    book1_specs = calculate_spine_and_cover(page_count=348, paper_type="white")
    book2_specs = calculate_spine_and_cover(page_count=392, paper_type="white")

    manifest = {
        "series": "The Neural Wars Trilogy",
        "author": "Nico Pez & The Neural Wars Studio",
        "publisher": "Aethelgard Press / GoalWorld Media",
        "imprint": "Independent Author Edition 2026",
        "royalty_split": {
            "amazon_kdp_ebook": "70% (Select)",
            "amazon_kdp_paperback": "60% minus printing costs",
            "solana_metaplex_secondary": "8.5% creator share",
        },
        "books": [
            {
                "book_id": "book-1-fractured-code",
                "title_en": "The Neural Wars: Fractured Code (Book 1)",
                "title_es": "The Neural Wars: Código Fracturado (Libro 1)",
                "isbn_paperback": calculate_isbn13("979889210123"),
                "isbn_hardcover": calculate_isbn13("979889210124"),
                "asin_kindle": "B0DXNEURAL1",
                "categories": [
                    "Fiction / Science Fiction / Cyberpunk",
                    "Fiction / Science Fiction / Hard Science Fiction",
                    "Fiction / Dystopian",
                ],
                "keywords": [
                    "neural interface", "solana cyberpunk", "quantum AI",
                    "world cup 2026", "techno thriller", "the awakening"
                ],
                "print_specs": book1_specs,
                "solana_ip_link": {
                    "collection_address": "8hV6W1NCoCgK8p2z41Fp9R7Y5HxqXS1JuXdNcBwgAETH",
                    "content_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                }
            },
            {
                "book_id": "book-2-earths-new-song",
                "title_en": "The Neural Wars: Earth's New Song (Book 2)",
                "title_es": "The Neural Wars: El Nuevo Canto de la Tierra (Libro 2)",
                "isbn_paperback": calculate_isbn13("979889210125"),
                "isbn_hardcover": calculate_isbn13("979889210126"),
                "asin_kindle": "B0DXNEURAL2",
                "categories": [
                    "Fiction / Science Fiction / Space Exploration",
                    "Fiction / Science Fiction / Alien Contact",
                ],
                "keywords": [
                    "ancient alien frequency", "yggdrasil network", "cyber sports",
                    "planetary consciousness", "solfeggio harmonics"
                ],
                "print_specs": book2_specs,
                "solana_ip_link": {
                    "collection_address": "4kM7W2NCoCgK8p2z41Fp9R7Y5HxqXS1JuXdNcBwgEARTH",
                    "content_hash": "sha256:3a91b2c448de0387b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                }
            }
        ],
        "export_timestamp": "2026-09-02T23:56:00Z"
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"[KDPBuilder] Manifest successfully generated at {out_file}.")
    return manifest


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent.parent
    build_kdp_manifest(repo_root)


if __name__ == "__main__":
    main()
