from __future__ import annotations

import re

from goalchain_multiagent.state import AgentName, GraphState


def _pick_delegate(objective: str) -> AgentName:
    text = objective.lower()
    if re.search(r"\b(crm|partner|growth|marketing|monetiz|collab|twitter|x\.com)\b", text):
        return "growth"
    if re.search(r"\b(vps|cron|fcc|hermes|deploy|alert|ops|sync|anytype|slack)\b", text):
        return "ops"
    if re.search(r"\b(code|solana|anchor|webapp|api|pr |issue|github|devnet|oracle)\b", text):
        return "dev"
    return "ops"


def ceo_node(state: GraphState) -> GraphState:
    hop = int(state.get("hop") or 0) + 1
    trace = list(state.get("route_trace") or [])
    trace.append("ceo")

    if state.get("finished"):
        return {"hop": hop, "route_trace": trace, "next_agent": "finish"}

    max_hops = int(state.get("max_hops") or 6)
    if hop >= max_hops:
        summary = state.get("summary") or _default_summary(state)
        return {
            "hop": hop,
            "route_trace": trace,
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
        }

    # Second CEO pass: synthesize and finish after a worker spoke.
    if len(trace) >= 2 and trace[-2] in ("dev", "growth", "ops"):
        summary = _default_summary(state)
        return {
            "hop": hop,
            "route_trace": trace,
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
        }

    delegate = _pick_delegate(state.get("objective") or "")
    return {
        "hop": hop,
        "route_trace": trace,
        "next_agent": delegate,
        "messages": (state.get("messages") or [])
        + [{"role": "ceo", "content": f"Delegating to {delegate}."}],
    }


def route_after_ceo(state: GraphState) -> str:
    nxt = state.get("next_agent") or "finish"
    if nxt == "finish" or state.get("finished"):
        return "finish"
    return str(nxt)


def _default_summary(state: GraphState) -> str:
    objective = (state.get("objective") or "").strip()
    trace = " → ".join(state.get("route_trace") or [])
    artifacts = state.get("artifacts") or []
    lines = [
        f"Objetivo: {objective}",
        f"Ruta: {trace}",
    ]
    for art in artifacts[:5]:
        title = art.get("title") or art.get("type") or "artifact"
        lines.append(f"- {title}")
    lines.append(
        "Siguiente paso humano: revisar artifacts; usar Hermes `dispatch opencode` para código."
    )
    return "\n".join(lines)
