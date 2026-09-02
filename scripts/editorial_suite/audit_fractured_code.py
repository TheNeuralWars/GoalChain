#!/usr/bin/env python3
"""
Comprehensive Forensic Literary Audit for 'The Neural Wars: Fractured Code' (Book 1)
Evaluates Spanish (EDICION_2026) and English (ENGLISH_EDITION_2026) editions
against editorial-suite bestseller standards, anti-slop rules, and reader retention metrics.
"""
from __future__ import annotations

import glob
import json
import math
import os
import re
import sys
from pathlib import Path

BASE_DIR = Path(r"c:\Users\NicoPez\the-neural-wars-trilogy\BOOK_01_FRACTURED_CODE")
ES_DIR = BASE_DIR / "EDICION_2026"
EN_DIR = BASE_DIR / "ENGLISH_EDITION_2026"

AI_CLICHES_EN = [
    r"\btestament to\b",
    r"\bsymphony of\b",
    r"\btapestry of\b",
    r"\bpalpable tension\b",
    r"\bthick enough to cut\b",
    r"\bshiver (?:ran|down)\b",
    r"\bchills? down (?:his|her|their) spine\b",
    r"\bunbeknownst\b",
    r"\blittle did (?:they|he|she) know\b",
    r"\bsheer (?:magnitude|audacity)\b",
    r"\blabyrinthine\b",
    r"\bechoed hollowly\b",
    r"\bdelve into\b",
    r"\bbeacon of hope\b",
    r"\bmere shadow of\b",
    r"\bvibrant tapestry\b",
    r"\bvisceral reminder\b",
]

AI_CLICHES_ES = [
    r"\bun testimonio de\b",
    r"\buna sinfonía de\b",
    r"\bun tapiz de\b",
    r"\btensión palpable\b",
    r"\bse podía cortar con un cuchillo\b",
    r"\bun escalofrío recorrió\b",
    r"\bsin que (?:ellos|él|ella) lo supieran?\b",
    r"\bpoco sabían\b",
    r"\bla mera magnitud\b",
    r"\blaberíntic[oa]s?\b",
    r"\bresonó con hueco\b",
    r"\bahondar en\b",
    r"\bfaro de esperanza\b",
    r"\bmera sombra de\b",
    r"\brecordatorio visceral\b",
]

FILTER_WORDS_EN = [r"\bfelt\b", r"\bheard\b", r"\bsaw\b", r"\bnoticed\b", r"\bwondered\b", r"\bwatched\b", r"\bseemed\b", r"\brealized\b", r"\bappeared\b"]
FILTER_WORDS_ES = [r"\bsintió\b", r"\bsentía\b", r"\bescuchó\b", r"\bescuchaba\b", r"\bvio\b", r"\bveía\b", r"\bnotó\b", r"\bnotaba\b", r"\bse preguntó\b", r"\bpareció\b", r"\bparecía\b", r"\bse dio cuenta\b"]

SENSORY_PATTERNS_EN = {
    "tactile": r"\b(cold|warm|heat|ice|shiver|sweat|pulse|rough|smooth|frost|burn|chilled|bite|pinch|pressure|numb)\b",
    "olfactory_gustatory": r"\b(smell|stench|odor|aroma|taste|copper|blood|ozone|salt|bitter|sweet|ember|chemical|smoke)\b",
    "auditory": r"\b(whisper|roar|hum|buzz|screech|clatter|thud|shriek|silence|static|thunder|sound|voice|clink|echo)\b",
    "visual": r"\b(color|shadow|glow|dark|light|bright|gleam|crimson|indigo|violet|amber|glare|silhouette|luminescence)\b",
}

SENSORY_PATTERNS_ES = {
    "tactile": r"\b(frío|calor|cálido|hielo|escalofrío|sudor|pulso|áspero|suave|ardor|entumecido|presión|mordedura)\b",
    "olfactory_gustatory": r"\b(olor|hedor|aroma|sabor|cobre|sangre|ozono|sal|amargo|dulce|brasa|químico|humo)\b",
    "auditory": r"\b(susurro|rugido|zumbido|chirrido|estruendo|silencio|estática|trueno|sonido|voz|eco|golpe)\b",
    "visual": r"\b(color|sombra|brillo|oscuro|luz|brillante|carmesí|índigo|violeta|ámbar|silueta|luminiscencia)\b",
}


def analyze_text(text: str, lang: str = "es") -> dict:
    words = text.split()
    word_count = len(words)
    
    # Sentences
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    sent_count = max(1, len(sentences))
    lengths = [len(s.split()) for s in sentences]
    avg_length = sum(lengths) / sent_count
    variance = sum((l - avg_length) ** 2 for l in lengths) / sent_count
    std_dev = math.sqrt(variance)
    
    # Sentence buckets
    staccato = sum(1 for l in lengths if l <= 6)
    narrative = sum(1 for l in lengths if 7 <= l <= 20)
    expansive = sum(1 for l in lengths if l >= 25)
    
    # Clichés
    cliches = AI_CLICHES_ES if lang == "es" else AI_CLICHES_EN
    cliche_hits = []
    for c in cliches:
        matches = re.findall(c, text, re.IGNORECASE)
        if matches:
            cliche_hits.extend(matches)
            
    # Filters
    filter_patterns = FILTER_WORDS_ES if lang == "es" else FILTER_WORDS_EN
    filter_count = 0
    for fp in filter_patterns:
        filter_count += len(re.findall(fp, text, re.IGNORECASE))
    filter_rate_per_1k = round((filter_count / max(1, word_count)) * 1000, 2)
    
    # Sensory density
    sensory_patterns = SENSORY_PATTERNS_ES if lang == "es" else SENSORY_PATTERNS_EN
    sensory_scores = {}
    total_sensory = 0
    for sense, pat in sensory_patterns.items():
        hits = len(re.findall(pat, text, re.IGNORECASE))
        sensory_scores[sense] = hits
        total_sensory += hits
    sensory_density_per_1k = round((total_sensory / max(1, word_count)) * 1000, 2)
    
    # Dialogue count
    if lang == "es":
        dialogues = re.findall(r"(?:—|--)[^—\n]+(?:—|--)?", text)
        dialogue_words = sum(len(d.split()) for d in dialogues)
    else:
        dialogues = re.findall(r'["“][^"”\n]+["”]', text)
        dialogue_words = sum(len(d.split()) for d in dialogues)
        
    dialogue_ratio = round((dialogue_words / max(1, word_count)) * 100, 1)

    return {
        "word_count": word_count,
        "sent_count": sent_count,
        "avg_length": round(avg_length, 1),
        "std_dev": round(std_dev, 1),
        "staccato_pct": round((staccato / sent_count) * 100, 1),
        "narrative_pct": round((narrative / sent_count) * 100, 1),
        "expansive_pct": round((expansive / sent_count) * 100, 1),
        "cliches_found": list(set(cliche_hits)),
        "cliche_total_count": len(cliche_hits),
        "filter_count": filter_count,
        "filter_rate_per_1k": filter_rate_per_1k,
        "sensory_scores": sensory_scores,
        "sensory_density_per_1k": sensory_density_per_1k,
        "dialogue_ratio": dialogue_ratio,
    }


def run_audit():
    es_files = sorted([f for f in os.listdir(ES_DIR) if f.startswith("FC-") and f.endswith(".md")])
    en_files = sorted([f for f in os.listdir(EN_DIR) if f.startswith("FC-") and f.endswith(".md")])
    
    print("=" * 80)
    print("FORENSIC EDITORIAL AUDIT: THE NEURAL WARS - FRACTURED CODE (BOOK 1)")
    print("=" * 80)
    
    total_es_words = 0
    total_en_words = 0
    
    audit_results = []
    
    for es_f, en_f in zip(es_files, en_files):
        ch_id = es_f.split("-")[1]
        with open(ES_DIR / es_f, "r", encoding="utf-8") as f:
            es_text = f.read()
        with open(EN_DIR / en_f, "r", encoding="utf-8") as f:
            en_text = f.read()
            
        es_res = analyze_text(es_text, "es")
        en_res = analyze_text(en_text, "en")
        
        total_es_words += es_res["word_count"]
        total_en_words += en_res["word_count"]
        
        ratio_en_es = round((en_res["word_count"] / max(1, es_res["word_count"])) * 100, 1)
        
        audit_results.append({
            "chapter": ch_id,
            "file_es": es_f,
            "file_en": en_f,
            "es": es_res,
            "en": en_res,
            "ratio_en_es": ratio_en_es
        })
        
        print(f"[{ch_id:4}] ES: {es_res['word_count']:5}w (burst: {es_res['std_dev']:4.1f} | cliches: {es_res['cliche_total_count']} | sens: {es_res['sensory_density_per_1k']:4.1f}/k) | EN: {en_res['word_count']:5}w (burst: {en_res['std_dev']:4.1f} | cliches: {en_res['cliche_total_count']} | sens: {en_res['sensory_density_per_1k']:4.1f}/k) | Ratio EN/ES: {ratio_en_es}%")

    print("-" * 80)
    print(f"TOTAL NOVEL WORD COUNT: ES = {total_es_words:,} words | EN = {total_en_words:,} words")
    print(f"GLOBAL EN/ES RATIO: {round((total_en_words/total_es_words)*100, 1)}%")
    print("=" * 80)
    
    out_file = Path(r"c:\Users\NicoPez\goalchain\data\publishing\editorial_audit_report.json")
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_es_words": total_es_words,
            "total_en_words": total_en_words,
            "chapters": audit_results
        }, f, indent=2)
    print(f"Full audit report exported to {out_file}")


if __name__ == "__main__":
    run_audit()
