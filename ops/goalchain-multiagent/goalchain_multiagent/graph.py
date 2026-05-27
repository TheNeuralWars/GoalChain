from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from goalchain_multiagent.agents import (
    ceo_node,
    dev_node,
    growth_node,
    ops_node,
    route_after_ceo,
)
from goalchain_multiagent.config import get_settings
from goalchain_multiagent.state import GraphState


def build_graph():
    g = StateGraph(GraphState)
    g.add_node("ceo", ceo_node)
    g.add_node("dev", dev_node)
    g.add_node("growth", growth_node)
    g.add_node("ops", ops_node)

    g.add_edge(START, "ceo")
    g.add_conditional_edges(
        "ceo",
        route_after_ceo,
        {
            "dev": "dev",
            "growth": "growth",
            "ops": "ops",
            "finish": END,
        },
    )
    g.add_edge("dev", "ceo")
    g.add_edge("growth", "ceo")
    g.add_edge("ops", "ceo")
    return g.compile()


_compiled = None


def get_compiled_graph():
    global _compiled
    if _compiled is None:
        _compiled = build_graph()
    return _compiled


def run_objective(
    objective: str,
    *,
    source: str = "api",
    actor: str = "unknown",
    context: dict | None = None,
) -> GraphState:
    settings = get_settings()
    initial: GraphState = {
        "objective": objective.strip(),
        "source": source,
        "actor": actor,
        "context": context or {},
        "hop": 0,
        "max_hops": settings.goalchain_ma_max_hops,
        "route_trace": [],
        "messages": [],
        "artifacts": [],
        "finished": False,
    }
    graph = get_compiled_graph()
    return graph.invoke(initial)
