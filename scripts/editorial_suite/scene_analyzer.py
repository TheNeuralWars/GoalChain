#!/usr/bin/env python3
"""
scene_analyzer.py — Dramatic Pacing, Conflict & Scene-Sequel Structure Analyzer.
Audits chapters for narrative momentum, emotional shifts, high-stakes decisions, and pacing curves.
"""
import os
import re
import sys
import argparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CONFLICT_MARKERS = [
    r"\b(?:rebel|fight|strike|shot|blade|blood|kill|death|destroy|scream|gun|weapon|fist|wound)\b",
    r"\b(?:lucha|disparo|sangre|muerte|destruir|grito|arma|puño|herida|asedio|fuego|ataque)\b",
    r"\b(?:trap|threat|danger|alarm|breach|intercept|ambush|hound|purge|lockdown)\b",
    r"\b(?:trampa|amenaza|peligro|alarma|brecha|emboscada|sabueso|purga|bloqueo)\b"
]

EMOTION_MARKERS = {
    "fear_dread": [r"fear", r"terror", r"panic", r"dread", r"horror", r"trembl", r"miedo", r"pánico", r"terror", r"temblor"],
    "determination_fury": [r"rage", r"fury", r"resolve", r"determination", r"fierce", r"furia", r"rabia", r"determinación", r"firme"],
    "sorrow_loss": [r"grief", r"wept", r"tear", r"mourn", r"loss", r"agony", r"llanto", r"lágrima", r"duelo", r"pérdida", r"dolor"],
    "wonder_transcendence": [r"awe", r"wonder", r"infinite", r"sacred", r"light", r"asombro", r"infinito", r"sagrado", r"luz", r"despertar"]
}

def analyze_scene(text, filename=""):
    words = len(text.split())
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip() and not p.startswith("#")]
    
    # Conflict score
    conflict_hits = 0
    for pattern in CONFLICT_MARKERS:
        conflict_hits += len(re.findall(pattern, text, re.IGNORECASE))
    conflict_density = round((conflict_hits / max(1, words)) * 1000, 2)  # per 1000 words
    
    # Emotional spectrum
    emotions = {}
    for emo, terms in EMOTION_MARKERS.items():
        count = sum(len(re.findall(r"\b" + t + r"\w*\b", text, re.IGNORECASE)) for t in terms)
        emotions[emo] = count

    # Determine Scene vs Sequel dominance
    # High conflict + short dialogue bursts = Action Scene
    # High emotion/sorrow/reflection + longer paragraphs = Sequel/Reaction Scene
    dominant_mode = "Action Scene (Goal/Conflict/Disaster)" if conflict_density > 15 else "Sequel (Reaction/Dilemma/Decision)"
    
    # Check for cliffhanger / closing hook
    last_paragraph = paragraphs[-1] if paragraphs else ""
    has_hook = bool(re.search(r"[!?:—]|(?:begin|start|wait|come|hunt|never|fire|awake|comienza|empieza|despertar|caza|venga)", last_paragraph, re.IGNORECASE))

    return {
        "filename": os.path.basename(filename),
        "word_count": words,
        "conflict_density_per_k": conflict_density,
        "dominant_mode": dominant_mode,
        "emotions": emotions,
        "has_closing_hook": has_hook,
        "last_line": last_paragraph.split("\n")[-1][:90] + "..." if len(last_paragraph) > 90 else last_paragraph
    }

def print_scene_report(res):
    print("\n" + "-" * 60)
    print(f"🎬 SCENE ANALYSIS: {res['filename']} ({res['word_count']:,} words)")
    print("-" * 60)
    print(f"⚡ Conflict Density: {res['conflict_density_per_k']} / 1k words")
    print(f"🎭 Dominant Structure: {res['dominant_mode']}")
    print(f"🪝 Closing Hook Present: {'✅ YES' if res['has_closing_hook'] else '⚠️ WEAK'}")
    print(f"📌 Closing Beat: \"{res['last_line']}\"")
    print("💭 Emotional Resonance:")
    for emo, count in res["emotions"].items():
        bar = "▓" * min(20, count)
        print(f"  • {emo.replace('_', ' ').capitalize():22s}: {count:2d} {bar}")
    print("-" * 60)

def main():
    parser = argparse.ArgumentParser(description="Scene Pacing & Dramatic Structure Analyzer")
    parser.add_argument("path", help="Path to markdown file or directory")
    args = parser.parse_args()

    if os.path.isfile(args.path):
        with open(args.path, "r", encoding="utf-8") as f:
            content = f.read()
        res = analyze_scene(content, args.path)
        print_scene_report(res)
    elif os.path.isdir(args.path):
        files = sorted([os.path.join(args.path, f) for f in os.listdir(args.path) if f.endswith(".md") and not "README" in f and not "MANUSCRIPT" in f])
        for fpath in files:
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            res = analyze_scene(content, fpath)
            print_scene_report(res)

if __name__ == "__main__":
    if len(sys.argv) == 1:
        default_dir = r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_01_FRACTURED_CODE\ENGLISH_EDITION_2026"
        sys.argv.append(default_dir)
    main()
