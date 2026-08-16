"""
Deep Literary & Market Analysis of The Neural Wars: Fractured Code (Book 1)
"""

import os
import re
import json

MANUSCRIPT_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "publishing", "the_neural_wars_trilogy", "BOOK_01_FRACTURED_CODE", "MANUSCRIPT")

def analyze():
    files = sorted(os.listdir(MANUSCRIPT_DIR))
    report = []
    
    total_words = 0
    total_dialogues = 0
    cliche_matches = []
    
    cliche_regex = re.compile(r'\b(a chill ran down|palpable tension|air was thick with|little did (?:she|he) know|could not help but feel|suddenly,|without warning|time seemed to stand still)\b', re.IGNORECASE)
    
    characters_regex = {
        "Kora": re.compile(r'\bKora\b'),
        "Sierra": re.compile(r'\bSierra\b'),
        "Martin": re.compile(r'\bMartin\b'),
        "Marcus": re.compile(r'\bMarcus\b'),
        "The Architect": re.compile(r'\b(?:The )?Architect\b'),
        "Elena": re.compile(r'\bElena\b'),
        "The Gardeners": re.compile(r'\bGardeners?\b')
    }
    
    chapter_stats = []
    
    for f in files:
        path = os.path.join(MANUSCRIPT_DIR, f)
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()
            words = len(content.split())
            total_words += words
            
            # Count dialogue lines
            dialogue_matches = re.findall(r'["“][^"”]+["”]', content)
            total_dialogues += len(dialogue_matches)
            
            cliches_found = cliche_regex.findall(content)
            
            # Character mentions
            char_counts = {char: len(rx.findall(content)) for char, rx in characters_regex.items()}
            
            chapter_stats.append({
                "file": f,
                "words": words,
                "dialogue_count": len(dialogue_matches),
                "dialogue_ratio": round((len(dialogue_matches) / (words / 100)), 2) if words else 0,
                "cliches_count": len(cliches_found),
                "characters": {k: v for k, v in char_counts.items() if v > 0}
            })
            
    print(f"TOTAL WORDS: {total_words:,}")
    print(f"TOTAL DIALOGUE EXCHANGES: {total_dialogues:,}")
    
    for cs in chapter_stats:
        top_chars = sorted(cs['characters'].items(), key=lambda x: x[1], reverse=True)[:3]
        chars_str = ", ".join([f"{k} ({v})" for k, v in top_chars])
        print(f"{cs['file']:18} | {cs['words']:5}w | Dial: {cs['dialogue_count']:3} | Cliches: {cs['cliches_count']:2} | Top: {chars_str}")

if __name__ == "__main__":
    analyze()
