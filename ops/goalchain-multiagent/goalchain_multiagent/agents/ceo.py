from __future__ import annotations

import re

from goalchain_multiagent.config import get_settings
from goalchain_multiagent import llm
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

    messages = list(state.get("messages") or [])
    if hop == 1:
        messages.append({"role": "user", "content": state.get("objective") or ""})

    if state.get("finished"):
        return {"hop": hop, "route_trace": trace, "next_agent": "finish", "messages": messages}

    max_hops = int(state.get("max_hops") or 6)
    if hop >= max_hops:
        summary = state.get("summary") or _default_summary(state)
        return {
            "hop": hop,
            "route_trace": trace,
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
            "messages": messages,
        }

    # Second CEO pass: synthesize and finish after a worker spoke.
    if len(trace) >= 2 and trace[-2] in ("dev", "growth", "ops"):
        summary = _synthesize_summary(state)
        return {
            "hop": hop,
            "route_trace": trace,
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
            "messages": messages,
        }

    delegate = _pick_delegate(state.get("objective") or "")
    msg = f"Delegating to {delegate}."
    settings = get_settings()
    if llm.llm_available(settings):
        try:
            delegate = llm.ceo_delegate_llm(state, settings)
            msg = f"LLM delegating to {delegate}."
        except Exception as exc:  # noqa: BLE001 — fall back to rules
            msg = f"LLM routing failed ({exc}); rule-based delegate to {delegate}."

    return {
        "hop": hop,
        "route_trace": trace,
        "next_agent": delegate,
        "messages": messages + [{"role": "ceo", "content": msg}],
    }


def route_after_ceo(state: GraphState) -> str:
    nxt = state.get("next_agent") or "finish"
    if nxt == "finish" or state.get("finished"):
        return "finish"
    return str(nxt)


def _synthesize_summary(state: GraphState) -> str:
    settings = get_settings()
    if llm.llm_available(settings):
        try:
            return llm.ceo_synthesize_llm(state, settings)
        except Exception:  # noqa: BLE001
            pass
    return _default_summary(state)


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
