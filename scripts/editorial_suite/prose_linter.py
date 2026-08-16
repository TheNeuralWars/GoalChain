#!/usr/bin/env python3
"""
prose_linter.py — High-Performance Literary Prose Quality & Anti-Slop Linter.
Audits markdown manuscripts for AI clichés, sentence length variance, filter words, and sensory balance.
"""
import os
import re
import sys
import argparse
from collections import Counter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

AI_CLICHES = [
    r"\btestament to\b",
    r"\bsymphony of\b",
    r"\btapestry of\b",
    r"\bpalpable tension\b",
    r"\bcut with a knife\b",
    r"\bshiver down (?:his|her|their|my) spine\b",
    r"\bchills down (?:his|her|their|my) spine\b",
    r"\bunbeknownst\b",
    r"\blittle did (?:he|she|they) know\b",
    r"\blabyrinthine\b",
    r"\bechoed hollowly\b",
    r"\bdelve(?:s|d)? into\b",
    r"\bbeacon of hope\b",
    r"\bmere shadow of\b",
    r"\btestament\b",
    r"\bvibrant tapestry\b",
    r"\bvisceral reminder\b",
    r"\bpinnacle of\b",
    r"\bunwavering\b",
]

FILTER_WORDS = [
    r"\b(?:felt|feel|feeling)\b",
    r"\b(?:heard|hear|hearing)\b",
    r"\b(?:saw|see|seeing)\b",
    r"\b(?:noticed|notice|noticing)\b",
    r"\b(?:wondered|wonder|wondering)\b",
    r"\b(?:watched|watch|watching)\b",
    r"\b(?:seemed|seem|seeming)\b",
    r"\b(?:realized|realize|realizing)\b",
]

SENSORY_LEXICON = {
    "visual": [r"color", r"shadow", r"glow", r"dark", r"light", r"bright", r"gleam", r"crimson", r"indigo", r"violet", r"amber", r"prism", r"lens", r"flame", r"sombra", r"luz", r"brillo", r"destello", r"índigo", r"oscuro"],
    "auditory": [r"whisper", r"roar", r"hum", r"buzz", r"screech", r"clatter", r"thud", r"shriek", r"silence", r"static", r"thunder", r"chord", r"susurro", r"zumbido", r"estruendo", r"aullido", r"chasquido", r"eco", r"silencio"],
    "tactile": [r"cold", r"warm", r"heat", r"ice", r"shiver", r"sweat", r"pulse", r"rough", r"smooth", r"frost", r"burn", r"searing", r"frío", r"cálido", r"calor", r"sudor", r"áspero", r"escarcha", r"quemadura", r"ardor"],
    "olfactory_gustatory": [r"smell", r"stench", r"odor", r"aroma", r"taste", r"copper", r"blood", r"ozone", r"salt", r"bitter", r"sweet", r"sour", r"olor", r"hedor", r"perfume", r"sabor", r"cobre", r"sangre", r"ozono", r"amargo"]
}

def analyze_prose(text, filename=""):
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip() and not p.startswith("#")]
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 3 and not s.startswith("#")]
    
    words = text.split()
    total_words = len(words)
    total_sentences = max(1, len(sentences))
    
    # Sentence length metrics
    sent_lengths = [len(s.split()) for s in sentences]
    avg_sent_len = sum(sent_lengths) / total_sentences
    variance = sum((l - avg_sent_len) ** 2 for l in sent_lengths) / total_sentences
    std_dev = variance ** 0.5
    
    # Cliché detection
    found_cliches = []
    for pattern in AI_CLICHES:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            found_cliches.extend(matches)
            
    # Filter word count
    found_filters = []
    for pattern in FILTER_WORDS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            found_filters.extend(matches)
            
    # Sensory balance count
    sensory_scores = {}
    for sense, terms in SENSORY_LEXICON.items():
        count = 0
        for term in terms:
            count += len(re.findall(r"\b" + term + r"\w*\b", text, re.IGNORECASE))
        sensory_scores[sense] = count

    # Dialogue ratio
    dialogue_matches = re.findall(r'—[^—\n]+—|"([^"]+)"|«([^»]+)»|—[^\n]+', text)
    dialogue_words = sum(len(str(m).split()) for m in dialogue_matches)
    dialogue_ratio = round((dialogue_words / max(1, total_words)) * 100, 1)

    # Score calculation (100 is ideal)
    score = 100
    score -= len(found_cliches) * 8
    score -= max(0, (len(found_filters) / max(1, total_sentences) - 0.25) * 50)
    if std_dev < 4.0:  # Monotonous rhythm
        score -= (4.0 - std_dev) * 5
    score = max(0, min(100, round(score)))

    return {
        "filename": os.path.basename(filename),
        "total_words": total_words,
        "total_sentences": total_sentences,
        "avg_sentence_length": round(avg_sent_len, 1),
        "sentence_length_std_dev": round(std_dev, 1),
        "dialogue_ratio_percent": dialogue_ratio,
        "cliches_found": Counter([c.lower() for c in found_cliches]),
        "filter_word_count": len(found_filters),
        "sensory_distribution": sensory_scores,
        "prose_quality_score": score
    }

def print_report(res):
    print("\n" + "=" * 65)
    print(f"📖 PROSE QUALITY REPORT: {res['filename']}")
    print("=" * 65)
    print(f"📊 Words: {res['total_words']:,} | Sentences: {res['total_sentences']:,}")
    print(f"🎵 Sentence Length: {res['avg_sentence_length']} words (Std Dev: {res['sentence_length_std_dev']})")
    print(f"💬 Dialogue Ratio: {res['dialogue_ratio_percent']}%")
    print(f"🏆 Quality Score: {res['prose_quality_score']} / 100")
    
    print("\n🎨 Sensory Distribution:")
    for sense, count in res["sensory_distribution"].items():
        bar = "█" * min(25, round(count / 2))
        print(f"  • {sense.capitalize():20s}: {count:3d}  {bar}")
        
    if res["cliches_found"]:
        print("\n⚠️ AI Clichés & Overused Tropes Detected:")
        for cliché, count in res["cliches_found"].items():
            print(f"  ❌ \"{cliché}\" ({count}x)")
    else:
        print("\n✨ Clean! Zero AI clichés detected.")
        
    print(f"🔍 Filter Words Count: {res['filter_word_count']} (approx {round(res['filter_word_count']/max(1, res['total_sentences']), 2)} per sentence)")
    print("=" * 65)

def main():
    parser = argparse.ArgumentParser(description="Prose & Anti-Slop Linter for Novels")
    parser.add_argument("path", help="Path to markdown file or folder")
    args = parser.parse_args()

    if os.path.isfile(args.path):
        with open(args.path, "r", encoding="utf-8") as f:
            content = f.read()
        res = analyze_prose(content, args.path)
        print_report(res)
    elif os.path.isdir(args.path):
        files = sorted([os.path.join(args.path, f) for f in os.listdir(args.path) if f.endswith(".md")])
        print(f"\nScanning {len(files)} files in {args.path}...")
        total_score = 0
        for fpath in files:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            res = analyze_prose(content, fpath)
            print_report(res)
            total_score += res["prose_quality_score"]
        avg_score = round(total_score / max(1, len(files)), 1)
        print(f"\n🌟 Overall Directory Average Score: {avg_score} / 100\n")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        # Default run on Book 1 English
        default_dir = r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_01_FRACTURED_CODE\ENGLISH_EDITION_2026"
        sys.argv.append(default_dir)
    main()
