#!/usr/bin/env python3
"""
Reassembles MANUSCRIPT_COMPLETO_2026.md (ES) and MANUSCRIPT_COMPLETE_2026_EN.md (EN)
from all individual chapter files in order.
"""
from pathlib import Path

BASE = Path(r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_01_FRACTURED_CODE")
ES_DIR = BASE / "EDICION_2026"
EN_DIR = BASE / "ENGLISH_EDITION_2026"

def reassemble(folder: Path, out_name: str, prefix: str):
    chapters = sorted([
        f for f in folder.glob("FC-*.md")
        if not f.name.startswith("MANUSCRIPT")
    ])
    full_text = []
    for ch in chapters:
        with open(ch, "r", encoding="utf-8") as f:
            full_text.append(f.read().strip())
    
    out_path = folder / out_name
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n\n---\n\n".join(full_text) + "\n")
    print(f"Reassembled {out_path} ({len(chapters)} chapters).")

def main():
    reassemble(ES_DIR, "MANUSCRIPT_COMPLETO_2026.md", "ES")
    reassemble(EN_DIR, "MANUSCRIPT_COMPLETE_2026_EN.md", "EN")

if __name__ == "__main__":
    main()
