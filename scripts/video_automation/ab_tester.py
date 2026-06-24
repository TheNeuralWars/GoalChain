#!/usr/bin/env python3
"""
ab_tester.py — Hermes Hook / CTA A/B Tester

Assigns Hook and CTA variants to runs as round-robin + persistent. Records the
assignment on every plan so quality scoring (see quality_scorer.py) can later
attribute retention/CTR lift per variant.

Variants:
  Hook   3 * 3   =  A_question / A_contrarian / A_prohibition
  CTA    3 * 3   =  C_link_bio / C_urgency / C_social_proof

We round-robin assign with a salt per (account_name, day) so back-to-back runs
in the same day don't all hit the same variant.
"""
import os
import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RUNS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"

HOOK_VARIANTS = {
    "A_question":      "¿Sabías que {player} te hizo perder plata dos veces sin que te dieras cuenta?",
    "A_contrarian":    "{player} no juega este Mundial. Y eso le acaba de salvar a miles de apostadores.",
    "A_prohibition":   "Nunca más apuesto a {player} en un Mundial. Mirá por qué.",
}

CTA_VARIANTS = {
    "C_link_bio":      "👉 Link en bio. Sumate antes del primer partido.",
    "C_urgency":       "⏰ Antes del pitazo inicial: stakeá tu palabra en GoalChain.",
    "C_social_proof":  "🤝 Etiquetá al que apostó con vos. Ya somos 1.000 promesas.",
}


def _variant_seed(account_name: str, day: str) -> int:
    """Deterministic seed per (account, day) so round-robin varies across
    days without us needing a counter file."""
    h = hashlib.md5(f"{account_name}|{day}".encode()).hexdigest()
    return int(h, 16)


def pick_variants(account_name: str) -> dict:
    """Return {"hook_variant": str, "cta_variant": str} for today's run.

    We pick from the variant lists deterministically using day+account as seed
    plus the total number of published runs today for this account so the
    picks rotate across consecutive runs in the same day.
    """
    today = datetime.now(timezone.utc).date().isoformat()
    published_today = 0
    if RUNS_FILE.exists():
        try:
            d = json.loads(RUNS_FILE.read_text())
            for r in d:
                if (r.get("status") == "published"
                    and r.get("account_name") == account_name
                    and r.get("timestamp", "").startswith(today)):
                    published_today += 1
        except Exception:
            pass

    base = _variant_seed(account_name, today)
    n = base + published_today

    hook_keys = sorted(HOOK_VARIANTS.keys())
    cta_keys = sorted(CTA_VARIANTS.keys())
    return {
        "hook_variant": hook_keys[n % len(hook_keys)],
        "cta_variant":  cta_keys[(n // 3) % len(cta_keys)],
        "generated_for_run_at": today,
    }


def get_prompt_injection(account_name: str) -> str:
    """Return extra context lines to be appended to a Grok prompt so the
    generated Hook follows the A/B variant and the CTA follows the chosen
    close variant. The trend_researcher / grok_super_pipeline can call this
    when building the structured ask.
    """
    choice = pick_variants(account_name)
    h = HOOK_VARIANTS[choice["hook_variant"]]
    c = CTA_VARIANTS[choice["cta_variant"]]
    return (
        "\n\nINSTRUCCIONES DE A/B TESTING (Manager 2026-06-24):\n"
        f"- Hook elegido: {choice['hook_variant']}\n"
        f"  Patrón obligatorio: \"{h}\"\n"
        f"  (adaptar {player_token()} con el jugador del Mundial 2026 que elijas)\n"
        f"- CTA elegido: {choice['cta_variant']}\n"
        f"  Cierre obrigatório: \"{c}\"\n"
    )


def player_token() -> str:
    return "{player}"


if __name__ == "__main__":
    # Manual: assign variants for each account, display what would be assigned.
    for acc in ("GoalChainSol", "NicoPezDorado"):
        print(acc, "->", pick_variants(acc))
