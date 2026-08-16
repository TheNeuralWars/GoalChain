#!/usr/bin/env python3
"""
fix_character_surnames.py — Disentangles and fixes all redundant "Chen" surnames.
1. Kora Vega -> Kora Vega
2. Dr. Darius Thorne -> Dr. Darius Thorne
3. Mrs. Holloway / Marcus Chen (Ch. 1 neighbor) -> Mrs. Holloway / Marcus Holloway
4. Sentry "Chen" (Ch. 3) -> Garrick
5. Riv Rivera -> Riv Rivera / Riv
"""
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

TARGET_DIRS = [
    r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_01_FRACTURED_CODE",
    r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_02_EARTHS_NEW_SONG",
    r"c:\Users\NicoPez\the-neural-wars-trilogy\00_SERIES_BIBLE_AND_CANON",
    r"c:\Users\NicoPez\the-neural-wars-trilogy\AI_AGENT_EDITORIAL_WORKBENCH",
    r"c:\Users\NicoPez\goalchain\docs\publishing\the_neural_wars_trilogy",
    r"c:\Users\NicoPez\goalchain\goalchain_webapp\src\ui",
    r"c:\Users\NicoPez\goalchain\scripts"
]

REPLACEMENTS = [
    # Kora
    ("Kora Vega", "Kora Vega"),
    ("Kora Vega", "Kora Vega"),
    ("Vega", "Vega"),
    
    # Dr. Darius
    ("Dr. Darius Thorne", "Dr. Darius Thorne"),
    ("Darius Thorne", "Darius Thorne"),
    ("Doctor Darius Thorne", "Doctor Darius Thorne"),
    
    # Riv
    ("Riv Rivera", "Riv Rivera"),
    
    # Sentry call
    ("Garrick's sentry call", "Garrick's sentry call"),
    ("la voz de guardia de Garrick", "la voz de guardia de Garrick"),
    
    # Neighbor Mrs. Holloway & her child Marcus in Chapter 1
    ("Mrs. Holloway—no relation", "Mrs. Holloway—no relation"),
    ("Mrs. Holloway's", "Mrs. Holloway's"),
    ("Mrs. Holloway", "Mrs. Holloway"),
    ("Citizen Holloway", "Citizen Holloway"),
    ("señora Holloway —sin parentesco", "señora Holloway —sin parentesco"),
    ("señora Holloway", "señora Holloway"),
    ("ciudadana Holloway", "ciudadana Holloway"),
    ("Subject 9872-C (Marcus Holloway)", "Subject 9872-C (Marcus Holloway)"),
    ("Sujeto 9872-C (Marcus Holloway)", "Sujeto 9872-C (Marcus Holloway)"),
]

def process_file(fpath):
    try:
        with open(fpath, "r", encoding="utf-8") as fh:
            content = fh.read()
    except Exception as e:
        return False, 0

    original = content
    changes_count = 0

    for old, new in REPLACEMENTS:
        if old in content:
            count = content.count(old)
            content = content.replace(old, new)
            changes_count += count

    if content != original:
        with open(fpath, "w", encoding="utf-8") as fh:
            fh.write(content)
        return True, changes_count
    return False, 0

def main():
    total_modified = 0
    total_replacements = 0
    print("[+] Auditing and fixing character surnames across codebase...")

    for d in TARGET_DIRS:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith((".md", ".ts", ".tsx", ".py", ".html", ".json")):
                    fpath = os.path.join(root, f)
                    modified, cnt = process_file(fpath)
                    if modified:
                        total_modified += 1
                        total_replacements += cnt
                        print(f"  • {os.path.relpath(fpath, r'c:\Users\NicoPez')}: {cnt} replacement(s)")

    print(f"\n[✓] Done! Modified {total_modified} files with {total_replacements} surname fixes.")

if __name__ == "__main__":
    main()
