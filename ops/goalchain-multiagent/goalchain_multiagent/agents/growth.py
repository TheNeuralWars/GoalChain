from __future__ import annotations

from goalchain_multiagent.state import GraphState


def growth_node(state: GraphState) -> GraphState:
    objective = (state.get("objective") or "").strip()
    trace = list(state.get("route_trace") or [])
    trace.append("growth")

    artifacts = list(state.get("artifacts") or [])
    artifacts.append(
        {
            "type": "growth_memo",
            "title": "Partnership / monetization angles",
            "body": (
                f"Objective: {objective}\n\n"
                "- API fee on dev integrations (post-Mundial)\n"
                "- Co-marketing with Solana gaming communities\n"
                "- NFT dynamic collections tied to oracle performance (honest SIMULACIÓN until mainnet)\n"
                "- Track deck opens via Papermark when pitch exists (Fase 2 tool)\n"
            ),
            "meta": {"crm_action": "stub_create_note"},
        }
    )

    return {
        "route_trace": trace,
        "artifacts": artifacts,
        "messages": (state.get("messages") or [])
        + [{"role": "growth", "content": "Growth memo drafted (CRM stub)."}],
        "next_agent": "ceo",
    }
