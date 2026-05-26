"""Bilingual strings for Hermes Discord outbound messages."""

from __future__ import annotations

import os

MESSAGES: dict[str, dict[str, str]] = {
    "research_header": {
        "es": "📡 **GoalChain Research** — nuevo informe",
        "en": "📡 **GoalChain Research** — new report",
    },
    "research_footer": {
        "es": "_Publicado por OA/Hermes_",
        "en": "_Published by OA/Hermes_",
    },
    "health_stale_title": {
        "es": "⚠️ OA research publisher sin publicaciones recientes",
        "en": "⚠️ OA research publisher has no recent posts",
    },
    "health_stale_body": {
        "es": "Revisá `oa-worker`, credenciales Discord y cron de research.",
        "en": "Check `oa-worker`, Discord credentials, and research cron.",
    },
    "health_lag_line": {
        "es": "- Retraso desde última publicación: {minutes} min",
        "en": "- Last published timestamp lag: {minutes} min",
    },
    "health_pending_line": {
        "es": "- Hay informes de research pendientes de publicar.",
        "en": "- New research files are pending publish.",
    },
    "publisher_disabled": {
        "es": "research_publisher: DESACTIVADO (canal oa-research-live deprecado)",
        "en": "research_publisher: DISABLED (oa-research-live channel deprecated)",
    },
    "xscout_default_thesis": {
        "es": "Ciclo de radar sin candidatos accionables con repo OSS y señal en X.",
        "en": "Radar cycle without actionable candidates with OSS repo and X signal.",
    },
    "xscout_field_candidates": {
        "es": "Candidatos",
        "en": "Candidates",
    },
    "xscout_field_why_now": {
        "es": "Por qué ahora",
        "en": "Why now",
    },
    "xscout_field_poc": {
        "es": "PoC 48h",
        "en": "48h PoC",
    },
    "xscout_field_links": {
        "es": "Enlaces",
        "en": "Links",
    },
    "xscout_footer": {
        "es": "X-Scout · Hermes · {ts}",
        "en": "X-Scout · Hermes · {ts}",
    },
}


def lang() -> str:
    value = (os.getenv("DISCORD_MESSAGE_LANG") or os.getenv("OA_DISCORD_LANG") or "en").strip().lower()
    return "en" if value.startswith("en") else "es"


def t(key: str, **kwargs: str) -> str:
    bucket = MESSAGES.get(key, {})
    template = bucket.get(lang()) or bucket.get("es") or key
    if kwargs:
        return template.format(**kwargs)
    return template
