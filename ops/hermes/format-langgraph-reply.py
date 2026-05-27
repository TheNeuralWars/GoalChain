#!/usr/bin/env python3
"""Format LangGraph /v1/run JSON for Discord (stdout only — no edits by Hermes)."""

from __future__ import annotations

import json
import sys


def format_reply(data: dict) -> str:
    trace = " → ".join(data.get("route_trace") or [])
    summary = (data.get("summary") or "").strip()
    lines = [
        "[Empresa] LangGraph",
        f"Ruta: {trace or 'n/a'}",
        "",
        summary or "(sin summary)",
    ]
    artifacts = data.get("artifacts") or []
    if artifacts:
        lines.append("")
        lines.append("Artifacts:")
        for art in artifacts[:4]:
            title = art.get("title") or art.get("type") or "artifact"
            lines.append(f"- {title}")
            body = (art.get("body") or "").strip()
            if body and art.get("type") == "ops_checklist":
                # Include live ops tail (issue numbers) — max 1200 chars
                lines.append("")
                lines.append(body[:1200])
                if len(body) > 1200:
                    lines.append("…")
    lines.append("")
    lines.append(
        "— Fin salida grafo. No añadir tablas ni cifras fuera de este texto."
    )
    return "\n".join(lines)


def main() -> None:
    raw = sys.stdin.read()
    data = json.loads(raw)
    sys.stdout.write(format_reply(data))


if __name__ == "__main__":
    main()
