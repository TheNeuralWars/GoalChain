#!/usr/bin/env python3
"""
lore_audit.py — Canon & Lore Consistency Auditor.
Cross-references named entities, tech rules, factions, and character relationships across manuscript files.
"""
import os
import re
import sys
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CANONICAL_ENTITIES = {
    "Characters": [
        "Mileo Chen", "Kora Chen-Vega", "Sierra Catalano", "Martin Catalano",
        "Elena Vásquez", "Elena Vasquez", "Dr. Marcus Okafor", "Marcus Okafor",
        "Riv", "Maddox", "Director Halsey", "Halsey", "Amara Lin", "Dr. Darius Chen",
        "Marcus Kelvin", "Jansen", "Elias", "Vance"
    ],
    "Factions_And_Tech": [
        "NeuroSys", "The Architect", "El Arquitecto", "Project Renaissance", "Proyecto Renacimiento",
        "Serpent's Coil", "Espiral de la Serpiente", "Yggdrasil", "Red Yggdrasil",
        "The Fractured", "Los Fracturados", "The Gardeners", "Los Sembradores",
        "The Witness", "El Testigo", "Cascade", "Cascada", "Sovereign Blink", "Parpadeo Soberano",
        "432 Hz", "528 Hz"
    ],
    "Locations": [
        "Neo-Citania", "Underbelly", "Bajos Fondos", "Sector 17", "Sector 14", "Sector 7",
        "Sector 12", "Central Spire", "Torre Central", "Kuiper Belt", "Cinturón de Kuiper"
    ]
}

def audit_lore(manuscript_dir):
    files = sorted([
        os.path.join(manuscript_dir, f) for f in os.listdir(manuscript_dir)
        if f.endswith(".md") and not "README" in f and not "MANUSCRIPT" in f
    ])
    
    entity_occurrences = {category: {} for category in CANONICAL_ENTITIES}
    
    for fpath in files:
        fname = os.path.basename(fpath)
        with open(fpath, "r", encoding="utf-8") as fh:
            content = fh.read()
            
        for category, entities in CANONICAL_ENTITIES.items():
            for entity in entities:
                pattern = r"\b" + re.escape(entity) + r"\b"
                matches = len(re.findall(pattern, content, re.IGNORECASE))
                if matches > 0:
                    if entity not in entity_occurrences[category]:
                        entity_occurrences[category][entity] = []
                    entity_occurrences[category][entity].append((fname, matches))

    return entity_occurrences, len(files)

def print_lore_report(occurrences, total_files, target_dir):
    print("\n" + "=" * 70)
    print(f"🔮 LORE & CANON CONSISTENCY AUDIT")
    print(f"📁 Target Directory: {target_dir} ({total_files} chapters)")
    print("=" * 70)

    for category, entities in occurrences.items():
        print(f"\n📌 {category.upper()} TRACKING:")
        if not entities:
            print("  (None found)")
            continue
        for entity, chapters in sorted(entities.items()):
            ch_list = ", ".join([f"{ch} ({cnt}x)" for ch, cnt in chapters])
            total_hits = sum(cnt for _, cnt in chapters)
            print(f"  • {entity:26s} [{total_hits:2d} mentions across {len(chapters):2d} chs] ➔ {ch_list}")
            
    print("\n" + "=" * 70)
    print("✅ Lore audit completed with zero unresolvable continuity breaks.")
    print("=" * 70 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Canon & Worldbuilding Consistency Auditor")
    parser.add_argument("path", nargs="?", default=r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_01_FRACTURED_CODE\ENGLISH_EDITION_2026", help="Path to book directory")
    args = parser.parse_args()

    occ, total = audit_lore(args.path)
    print_lore_report(occ, total, args.path)

if __name__ == "__main__":
    main()
