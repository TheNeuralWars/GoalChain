"""
Import and structure The Neural Wars Trilogy for 2026 AI Editorial Swarm.
Fetches canonical files from TheNeuralWars/Fractured-Code-Marketing and builds a professional multi-book workspace.
"""

import urllib.request
import json
import os

BASE_RAW = "https://raw.githubusercontent.com/TheNeuralWars/Fractured-Code-Marketing/main"
TARGET_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "publishing", "the_neural_wars_trilogy")

def fetch_url(url: str) -> str:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def run():
    ensure_dir(TARGET_DIR)
    
    # 1. Structure Folders
    dirs = [
        "00_SERIES_BIBLE_AND_CANON",
        "BOOK_01_FRACTURED_CODE/MANUSCRIPT",
        "BOOK_01_FRACTURED_CODE/PRODUCTION",
        "BOOK_02_EARTHS_NEW_SONG/OUTLINES",
        "BOOK_02_EARTHS_NEW_SONG/DRAFTS",
        "BOOK_03_EVOLUTION_MATRIX/OUTLINES",
        "BOOK_03_EVOLUTION_MATRIX/DRAFTS",
        "AI_AGENT_EDITORIAL_WORKBENCH"
    ]
    for d in dirs:
        ensure_dir(os.path.join(TARGET_DIR, d))
        
    print("[INFO] Folders created successfully.")

    # 2. Download Book 1 Chapters
    chapters = [
        "FC-00-Prologue.md",
        "FC-01-Chapter.md",
        "FC-02-Chapter.md",
        "FC-03-Chapter.md",
        "FC-04-Chapter.md",
        "FC-05-Chapter.md",
        "FC-06-Chapter.md",
        "FC-07-Chapter.md",
        "FC-08-Chapter.md",
        "FC-09-Chapter.md",
        "FC-10-Chapter.md",
        "FC-11-Chapter.md",
        "FC-12-Chapter.md",
        "FC-13-Chapter.md",
        "FC-14-Chapter.md",
        "FC-15-Chapter.md",
        "FC-16-Epilogue.md"
    ]
    
    for ch in chapters:
        url = f"{BASE_RAW}/A.%20Book%20Chapters/{ch.replace(' ', '%20')}"
        content = fetch_url(url)
        if content:
            target_file = os.path.join(TARGET_DIR, "BOOK_01_FRACTURED_CODE", "MANUSCRIPT", ch)
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[OK] Downloaded Book 1: {ch}")

    # 3. Download Bible & Canon Files
    bible_files = [
        ("B.%20Canon,%20World,%20and%20Style%20Resources/B-Series-Bible-&-World-Canon-Reference.md", "00_SERIES_BIBLE_AND_CANON/01_SERIES_BIBLE.md"),
        ("B.%20Canon,%20World,%20and%20Style%20Resources/B-CHARACTER-RELATIONSHIPS-MAP.md", "00_SERIES_BIBLE_AND_CANON/02_CHARACTER_RELATIONSHIPS.md"),
        ("B.%20Canon,%20World,%20and%20Style%20Resources/B-Saga-Lexicon-&-Terminology.md", "00_SERIES_BIBLE_AND_CANON/03_SAGA_LEXICON.md"),
        ("B.%20Canon,%20World,%20and%20Style%20Resources/B-Final-Formatting-&-Style-Guide.md", "00_SERIES_BIBLE_AND_CANON/04_FORMATTING_STYLE_GUIDE.md"),
        ("E.%20Franchise,%20Reader,%20and%20Future-Proofing%20Documents/E-Long-Term-Series-Outline.md", "00_SERIES_BIBLE_AND_CANON/05_LONG_TERM_TRILOGY_OUTLINE.md"),
        ("C.%20Pitch,%20Presentation,%20and%20Marketing%20Materials/C-Pitch-Packet.md", "BOOK_01_FRACTURED_CODE/PRODUCTION/PITCH_PACKET.md"),
        ("BOOK-COVER-CONCEPTS.md", "BOOK_01_FRACTURED_CODE/PRODUCTION/COVER_CONCEPTS_AND_PROMPTS.md")
    ]
    
    for src, dst in bible_files:
        url = f"{BASE_RAW}/{src}"
        content = fetch_url(url)
        if content:
            target_file = os.path.join(TARGET_DIR, dst)
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[OK] Downloaded Canon: {dst}")

    print("\n[SUCCESS] The Neural Wars Trilogy workspace successfully organized!")

if __name__ == "__main__":
    run()
