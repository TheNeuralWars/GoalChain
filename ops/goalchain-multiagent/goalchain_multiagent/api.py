from __future__ import annotations

from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from goalchain_multiagent import __version__
from goalchain_multiagent.config import Settings, get_settings
from goalchain_multiagent import llm
from goalchain_multiagent.graph import run_objective

app = FastAPI(
    title="GoalChain Multi-Agent",
    description="LangGraph orchestration API for Hermes CEO (loopback only).",
    version=__version__,
)


class RunRequest(BaseModel):
    objective: str = Field(..., min_length=1, max_length=8000)
    source: str = "api"
    actor: str = "unknown"
    context: dict[str, Any] = Field(default_factory=dict)


class RunResponse(BaseModel):
    status: str
    summary: str
    route_trace: list[str]
    artifacts: list[dict[str, Any]]
    messages: list[dict[str, str]]


def _auth(
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.goalchain_ma_token:
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.removeprefix("Bearer ").strip()
    if token != settings.goalchain_ma_token:
        raise HTTPException(status_code=403, detail="Invalid token")


@app.get("/health")
def health(settings: Settings = Depends(get_settings)) -> dict[str, Any]:
    provider = llm.resolve_provider(settings)
    return {
        "ok": True,
        "version": __version__,
        "enabled": settings.goalchain_multiagent_enabled,
        "mock_llm": settings.goalchain_ma_mock_llm,
        "llm_ready": llm.llm_available(settings),
        "llm_provider": provider,
        "fcc_keys": settings.goalchain_ma_use_fcc_keys,
    }


@app.post("/v1/run", response_model=RunResponse)
def v1_run(
    body: RunRequest,
    _: None = Depends(_auth),
    settings: Settings = Depends(get_settings),
) -> RunResponse:
    if not settings.goalchain_multiagent_enabled:
        raise HTTPException(
            status_code=503,
            detail="GOALCHAIN_MULTIAGENT_ENABLED=0 — enable in ~/.config/goalchain-multiagent.env",
        )
    result = run_objective(
        body.objective,
        source=body.source,
        actor=body.actor,
        context=body.context,
    )
    summary = (result.get("summary") or "").strip()
    if not summary:
        trace = " → ".join(result.get("route_trace") or [])
        summary = f"Completed route {trace}. See artifacts."
    return RunResponse(
        status="ok",
        summary=summary,
        route_trace=list(result.get("route_trace") or []),
        artifacts=list(result.get("artifacts") or []),
        messages=list(result.get("messages") or []),
    )


def main() -> None:
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "goalchain_multiagent.api:app",
        host=settings.goalchain_ma_host,
        port=settings.goalchain_ma_port,
        reload=False,
    )


if __name__ == "__main__":
    main()
