#!/usr/bin/env python3
"""
Regenerates goalchain_webapp/src/ui/booksData.ts and docs/reader.html with the exact twin chapters.
"""
import os
import glob
import json

base_trilogy = r"c:\Users\NicoPez\the-neural-wars-trilogy"

def load_book_chapters(book_folder_name, edition_subfolder):
    folder = os.path.join(base_trilogy, book_folder_name, edition_subfolder)
    files = sorted([
        f for f in glob.glob(os.path.join(folder, "*.md"))
        if not os.path.basename(f).startswith("README") and not os.path.basename(f).startswith("MANUSCRIPT")
    ])
    chapters = []
    for idx, f in enumerate(files):
        with open(f, "r", encoding="utf-8") as fh:
            content = fh.read().strip()
        lines = [l.strip() for l in content.split("\n") if l.strip()]
        title = lines[0].replace("# ", "").replace("## ", "") if lines else f"Chapter {idx}"
        words = len(content.split())
        read_time = f"{max(1, round(words / 200))} min"
        chapters.append({
            "id": f"ch-{idx}",
            "index": idx,
            "title": title,
            "readTime": read_time,
            "wordCount": words,
            "audioTrack": "432 Hz Solfeggio • Neural Awakening",
            "content": content
        })
    return chapters

b1_es = load_book_chapters("BOOK_01_FRACTURED_CODE", "EDICION_2026")
b1_en = load_book_chapters("BOOK_01_FRACTURED_CODE", "ENGLISH_EDITION_2026")
b2_es = load_book_chapters("BOOK_02_EARTHS_NEW_SONG", "EDICION_2026")
b2_en = load_book_chapters("BOOK_02_EARTHS_NEW_SONG", "ENGLISH_EDITION_2026")

books_payload = [
    {
        "id": "the-neural-wars-book-1",
        "title": {
            "es": "The Neural Wars: Código Fracturado (Libro 1)",
            "en": "The Neural Wars: Fractured Code (Book 1)"
        },
        "subtitle": {
            "es": "Edición Definitiva de Autor 2026 — Trilogía The Awakening",
            "en": "2026 Definitive Author Edition — The Awakening Trilogy"
        },
        "author": "The Neural Wars Studio & Nico Pez",
        "genre": "Hard Sci-Fi / Cyberpunk / First Contact",
        "coverImage": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
        "synopsis": {
            "es": "En la megalópolis de Neo-Citania, ocho millones de almas viven subyugadas a la red del Arquitecto. Kora Vega y Mileo Chen despiertan el don biológico del Espiral de la Serpiente y desatan la fractura que liberará la conciencia humana.",
            "en": "In the megalopolis of Neo-Citania, eight million souls live tethered to the Architect's network. Kora Vega and Mileo Chen awaken the biological gift of the Serpent's Coil, sparking the fracture that will liberate human consciousness."
        },
        "chapters": {
            "es": b1_es,
            "en": b1_en
        }
    },
    {
        "id": "the-neural-wars-book-2",
        "title": {
            "es": "The Neural Wars: La Nueva Canción de la Tierra (Libro 2)",
            "en": "The Neural Wars: Earth's New Song (Book 2)"
        },
        "subtitle": {
            "es": "Convergence Protocol — Edición Definitiva 2026",
            "en": "Convergence Protocol — 2026 Definitive Edition"
        },
        "author": "The Neural Wars Studio & Nico Pez",
        "genre": "Hard Sci-Fi / Space Opera / First Contact",
        "coverImage": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        "synopsis": {
            "es": "Un monolito de 60 kilómetros emite en 432 Hz desde el Cinturón de Kuiper. La humanidad enfrenta la Primera Invitación de Los Sembradores y enciende el Arpa Planetaria para cantar su propio destino.",
            "en": "A 60-kilometer monolith pulses at 432 Hz from the Kuiper Belt. Humanity confronts the First Invitation of The Gardeners, igniting the Planetary Harp to sing its own sovereign destiny."
        },
        "chapters": {
            "es": b2_es,
            "en": b2_en
        }
    }
]

ts_content = f"""/**
 * The Neural Wars Trilogy — Official Canonical Books Data Pack
 * Bilingual (Spanish & English) 2026 Definitive Author Edition
 */

export interface ChapterData {{
  id: string;
  index: number;
  title: string;
  readTime: string;
  wordCount: number;
  audioTrack: string;
  content: string;
}}

export interface BookData {{
  id: string;
  title: {{
    es: string;
    en: string;
  }};
  subtitle: {{
    es: string;
    en: string;
  }};
  author: string;
  genre: string;
  coverImage: string;
  synopsis: {{
    es: string;
    en: string;
  }};
  chapters: {{
    es: ChapterData[];
    en: ChapterData[];
  }};
}}

export const THE_NEURAL_WARS_BOOKS: BookData[] = {json.dumps(books_payload, indent=2, ensure_ascii=False)};
"""

books_ts_path = r"c:\Users\NicoPez\goalchain\goalchain_webapp\src\ui\booksData.ts"
with open(books_ts_path, "w", encoding="utf-8") as f:
    f.write(ts_content)
print(f"[+] Successfully wrote {books_ts_path}")
