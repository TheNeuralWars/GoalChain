#!/usr/bin/env python3
"""
Faceless Viral Video Engine (TikTok, YouTube Shorts, Instagram Reels)
GoalChain Attention Flywheel & Multi-Channel Distribution

Generates high-retention 9:16 scripts, visual shot descriptions, and Kokoro TTS cues
leveraging the sports-commentator and bestseller-novelist archetypes.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


def generate_faceless_queue(repo_root: Path) -> list[dict]:
    out_dir = repo_root / "data" / "marketing"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "faceless_runs.json"

    runs = [
        {
            "id": "faceless-001-worldcup-ai",
            "account": "NicoPezDorado",
            "platform": "tiktok",
            "title": "¿Puede una IA predecir quién gana el Mundial 2026?",
            "hook_3s": "Si creías que el Mundial 2026 lo definen solo los jugadores... mira lo que detectó este algoritmo cuántico en 5.000 simulaciones.",
            "duration_seconds": 45,
            "format": "9:16 vertical (1080x1920)",
            "archetype": "sports-commentator",
            "voice_settings": {
                "engine": "kokoro-tts",
                "voice": "es_m_dario",
                "speed": 1.08,
            },
            "visual_prompts": [
                "00-03s: Cybernetic holographic soccer pitch at night with neon green telemetry lines, low angle stadium perspective",
                "03-15s: Fast glitch montage of World Cup stadiums with HUD data overlay and glowing ball physics",
                "15-35s: Neural brain map interlaced with tactical formations, dramatic stadium mist and Phantom Purple bokeh",
                "35-45s: GoalWorld terminal interface showing live odds and Amazon Kindle book cover 'The Neural Wars: Fractured Code'"
            ],
            "captions": [
                {"start": 0.0, "end": 3.2, "text": "LA IA YA SABE QUIÉN GANA EL MUNDIAL"},
                {"start": 3.2, "end": 7.5, "text": "5.000 simulaciones cuánticas en tiempo real"},
                {"start": 7.5, "end": 14.0, "text": "Los oráculos de Drift detectaron una anomalía táctica"},
                {"start": 14.0, "end": 28.0, "text": "No es fútbol tradicional: es SportsFi descentralizado"},
                {"start": 28.0, "end": 45.0, "text": "Descubre la historia completa en 'The Neural Wars' en Amazon Kindle"}
            ],
            "cta": "Disponible en Amazon Kindle y GoalWorld.fun",
            "status": "ready_for_buffer",
            "scheduled_slot": "18:00 ART"
        },
        {
            "id": "faceless-002-neural-awakening",
            "account": "GoalChainSol",
            "platform": "youtube_shorts",
            "title": "The Yggdrasil Frequency: When Code Meets Biology",
            "hook_3s": "What if ancient DNA isn't junk... but a dormant biological quantum antenna designed to interface with the universe?",
            "duration_seconds": 52,
            "format": "9:16 vertical (1080x1920)",
            "archetype": "bestseller-novelist",
            "voice_settings": {
                "engine": "kokoro-tts",
                "voice": "en_m_michael",
                "speed": 1.05,
            },
            "visual_prompts": [
                "00-04s: Macro shot of iridescent indigo neural synapses firing along a double helix spiral in a dark void",
                "04-20s: Megacity Neo-Citania at night under sweeping biometric surveillance grids and rain-slicked glass towers",
                "20-38s: Dr. Marcus Okafor projecting holographic brain lattice of the Serpent's Coil in subterranean lab",
                "38-52s: Book teaser banner for 'The Neural Wars: Fractured Code' Definitive Edition on Amazon Kindle"
            ],
            "captions": [
                {"start": 0.0, "end": 4.0, "text": "WHAT IF HUMAN DNA IS AN ANTENNA?"},
                {"start": 4.0, "end": 18.0, "text": "In Neo-Citania, eight million minds were tethered to the Architect"},
                {"start": 18.0, "end": 35.0, "text": "Until Kora Vega and Mileo Chen unlocked the ancient frequency"},
                {"start": 35.0, "end": 52.0, "text": "Read the #1 Sci-Fi epic 'The Neural Wars' now on Kindle Unlimited"}
            ],
            "cta": "Read on Amazon Kindle & Listen on GoalChain",
            "status": "ready_for_buffer",
            "scheduled_slot": "21:30 ART"
        }
    ]

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({"updated_at": datetime.now(timezone.utc).isoformat(), "queue": runs}, f, indent=2)

    print(f"[FacelessGenerator] Generated {len(runs)} viral video runs at {out_file}.")
    return runs


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent.parent
    generate_faceless_queue(repo_root)


if __name__ == "__main__":
    main()
