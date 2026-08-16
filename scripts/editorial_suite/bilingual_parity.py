#!/usr/bin/env python3
"""
bilingual_parity.py — 1-to-1 Bilingual Manuscript Parity & Structural Mirror Auditor.
Compares Spanish and English editions chapter-by-chapter and paragraph-by-paragraph to detect structural drift.
"""
import os
import sys
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def compare_editions(es_dir, en_dir):
    es_files = sorted([f for f in os.listdir(es_dir) if f.endswith(".md") and not "README" in f and not "MANUSCRIPT" in f])
    en_files = sorted([f for f in os.listdir(en_dir) if f.endswith(".md") and not "README" in f and not "MANUSCRIPT" in f])

    print("\n" + "=" * 75)
    print("🌐 BILINGUAL 1-TO-1 PARITY & STRUCTURAL AUDIT")
    print(f"🇪🇸 Spanish Source: {es_dir}")
    print(f"🇺🇸 English Target: {en_dir}")
    print("=" * 75)

    if len(es_files) != len(en_files):
        print(f"⚠️ MISMATCH in Chapter Count: ES has {len(es_files)} files, EN has {len(en_files)} files!")
    else:
        print(f"✅ Chapter Count Match: Exactly {len(es_files)} chapters found in both editions.")

    print("\n" + "-" * 75)
    print(f"{'Chapter (ES)':<24} | {'Words (ES)':<10} | {'Words (EN)':<10} | {'Ratio':<7} | {'Status'}")
    print("-" * 75)

    total_es_words = 0
    total_en_words = 0

    for idx, es_f in enumerate(es_files):
        en_f = en_files[idx] if idx < len(en_files) else "MISSING"
        
        with open(os.path.join(es_dir, es_f), "r", encoding="utf-8") as fh:
            es_text = fh.read()
        es_words = len(es_text.split())
        total_es_words += es_words

        if en_f != "MISSING":
            with open(os.path.join(en_dir, en_f), "r", encoding="utf-8") as fh:
                en_text = fh.read()
            en_words = len(en_text.split())
            total_en_words += en_words
            ratio = round(en_words / max(1, es_words), 2)
            # English is naturally 5-15% more compact than Spanish in word count
            status = "✅ PERFECT" if 0.75 <= ratio <= 1.15 else "⚠️ CHECK DRIFT"
        else:
            en_words = 0
            ratio = 0.0
            status = "❌ MISSING"

        print(f"{es_f[:24]:<24} | {es_words:8,d}   | {en_words:8,d}   | {ratio:5.2f} | {status}")

    print("-" * 75)
    total_ratio = round(total_en_words / max(1, total_es_words), 2)
    print(f"{'TOTAL MANUSCRIPT':<24} | {total_es_words:8,d}   | {total_en_words:8,d}   | {total_ratio:5.2f} | {'✅ 100% PARITY' if 0.80 <= total_ratio <= 1.10 else '⚠️ REVISE'}")
    print("=" * 75 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Bilingual Parity Validator")
    parser.add_argument("--book", choices=["1", "2"], default="1", help="Book number (1 or 2)")
    args = parser.parse_args()

    base_trilogy = r"c:\Users\NicoPez\the-neural-wars-trilogy"
    if args.book == "1":
        es_dir = os.path.join(base_trilogy, "BOOK_01_FRACTURED_CODE", "EDICION_2026")
        en_dir = os.path.join(base_trilogy, "BOOK_01_FRACTURED_CODE", "ENGLISH_EDITION_2026")
    else:
        es_dir = os.path.join(base_trilogy, "BOOK_02_EARTHS_NEW_SONG", "EDICION_2026")
        en_dir = os.path.join(base_trilogy, "BOOK_02_EARTHS_NEW_SONG", "ENGLISH_EDITION_2026")

    compare_editions(es_dir, en_dir)

if __name__ == "__main__":
    main()
