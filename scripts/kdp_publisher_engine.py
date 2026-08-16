"""
GoalWorld KDP & Solana Web3 Dual-Publishing Engine
Generates print-ready specifications, EPUB structure, Amazon KDP metadata, and Solana Metaplex IP Schemas.
"""

import json
import math
import os

def calculate_kdp_spine_width(page_count: int, paper_type: str = "white") -> dict:
    """
    Calculates Amazon KDP spine width and full cover dimensions (inches and pixels at 300 DPI).
    Paper types: 'white' (0.002252 in/page), 'cream' (0.0025 in/page).
    Trim size standard: 6.0 x 9.0 inches. Bleed: 0.125 inches.
    """
    multiplier = 0.0025 if paper_type == "cream" else 0.002252
    spine_width_in = page_count * multiplier
    trim_w_in = 6.0
    trim_h_in = 9.0
    bleed_in = 0.125
    
    total_w_in = (bleed_in + trim_w_in + spine_width_in + trim_w_in + bleed_in)
    total_h_in = (bleed_in + trim_h_in + bleed_in)
    
    dpi = 300
    total_w_px = math.ceil(total_w_in * dpi)
    total_h_px = math.ceil(total_h_in * dpi)
    spine_w_px = math.ceil(spine_width_in * dpi)
    
    return {
        "page_count": page_count,
        "paper_type": paper_type,
        "spine_width_inches": round(spine_width_in, 4),
        "spine_width_px_300dpi": spine_w_px,
        "total_cover_width_inches": round(total_w_in, 4),
        "total_cover_height_inches": round(total_h_in, 4),
        "full_cover_px_300dpi": f"{total_w_px} x {total_h_px}",
        "bleed_inches": bleed_in
    }

def generate_isbn13_check_digit(isbn_prefix12: str) -> str:
    """Calculates valid ISBN-13 checksum digit."""
    digits = [int(d) for d in isbn_prefix12 if d.isdigit()]
    if len(digits) != 12:
        return "0"
    total = sum(d * (1 if i % 2 == 0 else 3) for i, d in enumerate(digits))
    remainder = total % 10
    check_digit = (10 - remainder) % 10
    return str(check_digit)

def build_solana_ip_metadata(
    title: str,
    author: str,
    author_wallet: str,
    isbn: str,
    genre: str,
    royalty_basis_points: int = 850,
    cover_image_uri: str = "https://goalworld.fun/assets/img/aethelgard_cover.jpg",
    content_hash: str = "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
) -> dict:
    """Builds standard Metaplex / Solana IP token metadata schema."""
    return {
        "name": f"GoalWorld IP: {title}",
        "symbol": "GWIP",
        "description": f"Official Tokenized IP Rights for '{title}' by {author}. Registered via GoalWorld Dual-Publish Engine.",
        "seller_fee_basis_points": royalty_basis_points,
        "image": cover_image_uri,
        "attributes": [
            {"trait_type": "Author", "value": author},
            {"trait_type": "ISBN-13", "value": isbn},
            {"trait_type": "Genre", "value": genre},
            {"trait_type": "Content Hash", "value": content_hash},
            {"trait_type": "Dual-Publish Standard", "value": "Amazon KDP + Solana Metaplex v2"},
            {"trait_type": "Author Royalty Share", "value": f"{royalty_basis_points / 10}%"}
        ],
        "properties": {
            "category": "literature_ip",
            "creators": [
                {"address": author_wallet, "share": 85},
                {"address": "GWVault11111111111111111111111111111111111", "share": 10},
                {"address": "HermesAgent1111111111111111111111111111111", "share": 5}
            ]
        }
    }

def generate_amazon_kdp_listing_pack(
    title: str,
    subtitle: str,
    author: str,
    description_text: str,
    genre: str
) -> dict:
    """Generates KDP formatted description with compliant HTML tags, keywords and BISAC categories."""
    formatted_html_desc = (
        f"<h3><b>{title}</b></h3>\n"
        f"<h4><i>{subtitle}</i></h4>\n"
        f"<p>{description_text}</p>\n"
        f"<p><b>¿Por qué leer esta saga?</b></p>\n"
        f"<ul>\n"
        f"  <li>Construcción de mundo inmersiva y lore verificado por IA.</li>\n"
        f"  <li>Sistema de magia y personajes con profundidad psicológica.</li>\n"
        f"  <li>Edición optimizada para Kindle y tapa blanda.</li>\n"
        f"</ul>"
    )
    
    keywords = [
        "novela de fantasia epica",
        "dark fantasy litrpg",
        "runas y caballeros magicos",
        "audiolibro kindle unlimited",
        "sagas de fantasia 2026",
        "novela de aventuras y reinos",
        "libros juveniles recomendados"
    ]
    
    categories = [
        "FIC009020 FICTION / Fantasy / Dark Fantasy",
        "FIC009010 FICTION / Fantasy / Epic"
    ]
    
    return {
        "title": title,
        "subtitle": subtitle,
        "author": author,
        "kdp_html_description": formatted_html_desc,
        "seven_search_keywords": keywords,
        "bisac_categories": categories
    }

if __name__ == "__main__":
    spine = calculate_kdp_spine_width(280, "cream")
    print("=== KDP Spine Spec ===")
    print(json.dumps(spine, indent=2))
    
    meta = build_solana_ip_metadata(
        "El Reino de Aethelgard: Runas de Sangre",
        "Nico Pez (@nicopez)",
        "7xKXtg2CW87d97TXJSDpbD5jBkheTjkA6wAhXodGy7ao",
        "978-3-16-148410-0",
        "Alta Fantasía / Grimdark"
    )
    print("\n=== Solana IP Metadata Schema ===")
    print(json.dumps(meta, indent=2))
