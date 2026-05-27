from __future__ import annotations

from typing import Any, Literal, TypedDict

AgentName = Literal["ceo", "dev", "growth", "ops", "finish"]


class Artifact(TypedDict, total=False):
    type: str
    title: str
    body: str
    meta: dict[str, Any]


class GraphState(TypedDict, total=False):
    objective: str
    source: str
    actor: str
    context: dict[str, Any]
    hop: int
    max_hops: int
    next_agent: AgentName
    route_trace: list[str]
    messages: list[dict[str, str]]
    artifacts: list[Artifact]
    summary: str
    finished: bool
