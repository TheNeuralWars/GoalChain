from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger("goalchain_multiagent.api")

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from goalchain_multiagent import __version__
from goalchain_multiagent.config import Settings, get_settings
from goalchain_multiagent import llm
from goalchain_multiagent.graph import run_objective
from goalchain_multiagent.fcc_dispatch import run_dispatch_cycle
from goalchain_multiagent.stripe_ops import (
    get_stripe_balance,
    get_agent_wallet,
    fund_agent_wallet_from_nft_sale,
    pay_contributor,
    create_stripe_checkout,
)
from goalchain_multiagent.player_quorum import (
    classify_risk_level,
    compute_governance_power,
    evaluate_quorum,
    PlayerStats,
    DEMO_SQUAD,
)

app = FastAPI(
    title="GoalChain Multi-Agent",
    description="LangGraph orchestration API for Hermes CEO — GoalChain Autonomous Agent Corporation (GC-AAC).",
    version=__version__,
)



@app.on_event("startup")
def startup_event() -> None:
    # Try importing and starting Slack listener defensively
    try:
        from goalchain_multiagent.slack_listener import start_slack_listener
        start_slack_listener()
    except ImportError:
        logger.warning("Slack listener module not found, skipping startup.")

    # Try importing and starting Mattermost listener defensively
    try:
        from goalchain_multiagent.mattermost_listener import start_mattermost_listener
        start_mattermost_listener()
    except ImportError:
        logger.warning("Mattermost listener module not found, skipping startup.")


@app.on_event("shutdown")
def shutdown_event() -> None:
    try:
        from goalchain_multiagent.slack_listener import stop_slack_listener
        stop_slack_listener()
    except ImportError:
        pass

    try:
        from goalchain_multiagent.mattermost_listener import stop_mattermost_listener
        stop_mattermost_listener()
    except ImportError:
        pass



class RunRequest(BaseModel):
    objective: str = Field(..., min_length=1, max_length=8000)
    source: str = "api"
    actor: str = "unknown"
    context: dict[str, Any] = Field(default_factory=dict)
    thread_id: str | None = None


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
        thread_id=body.thread_id,
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



class DispatchRequest(BaseModel):
    dry_run: bool = False
    limit: int = Field(default=3, ge=1, le=10)


class DispatchResponse(BaseModel):
    status: str
    total_ready: int
    dispatched: int
    failed: int
    results: list[dict[str, Any]]


@app.post("/v1/dispatch", response_model=DispatchResponse)
def v1_dispatch(
    body: DispatchRequest = DispatchRequest(),
    _: None = Depends(_auth),
    settings: Settings = Depends(get_settings),
) -> DispatchResponse:
    """Trigger one FCC dispatch cycle: scan status:ready issues and send to OpenCode."""
    if not settings.goalchain_multiagent_enabled:
        raise HTTPException(
            status_code=503,
            detail="GOALCHAIN_MULTIAGENT_ENABLED=0",
        )
    repo = settings.github_repo or "TheNeuralWars/GoalChain"
    summary = run_dispatch_cycle(repo=repo, limit=body.limit, dry_run=body.dry_run)
    return DispatchResponse(
        status="ok",
        total_ready=summary["total_ready"],
        dispatched=summary["dispatched"],
        failed=summary["failed"],
        results=summary["results"],
    )


# ─────────────────────────────────────────────────────────────────────────────
# STRIPE SKILLS API — Financial layer for the Autonomous Agent Corporation
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/ops/stripe/balance")
def stripe_balance_endpoint(settings: Settings = Depends(get_settings)) -> dict:
    """Returns live Stripe corporate balance + agent wallet balance."""
    return get_stripe_balance(settings)


@app.get("/api/ops/agent-wallet")
def agent_wallet_endpoint(settings: Settings = Depends(get_settings)) -> dict:
    """Returns the Agent Wallet state: balance, funding history (NFT 10%), spend history."""
    return get_agent_wallet(settings)


class NFTFundRequest(BaseModel):
    nft_name: str
    sale_price_cents: int


@app.post("/api/ops/stripe/fund-agent")
def fund_agent_endpoint(
    body: NFTFundRequest,
    settings: Settings = Depends(get_settings),
) -> dict:
    """Called when an NFT is sold — routes 10% to the Agent Wallet automatically."""
    return fund_agent_wallet_from_nft_sale(body.nft_name, body.sale_price_cents, settings)


class CheckoutRequest(BaseModel):
    item: str
    amount: int  # cents


@app.post("/api/ops/stripe/checkout")
def checkout_endpoint(
    body: CheckoutRequest,
    settings: Settings = Depends(get_settings),
) -> dict:
    """Creates a Stripe Checkout session for manager subscriptions or NFT packs."""
    return create_stripe_checkout(
        item_name=body.item,
        amount_cents=body.amount,
        success_url="https://play.goalchain.fun/success",
        cancel_url="https://play.goalchain.fun/cancel",
        settings=settings,
    )


class PayoutRequest(BaseModel):
    contributor: str
    amount_cents: int
    issue_url: str = ""


@app.post("/api/ops/stripe/pay-contributor")
def pay_contributor_endpoint(
    body: PayoutRequest,
    _: None = Depends(_auth),
    settings: Settings = Depends(get_settings),
) -> dict:
    """CEO agent → Stripe payout to a verified contributor (<=\$500 auto-approved)."""
    return pay_contributor(body.contributor, body.amount_cents, body.issue_url, settings)


# ─────────────────────────────────────────────────────────────────────────────
# PLAYER-GATED COMMANDS — NemoClaw × Genesis Squad Quorum System
# ─────────────────────────────────────────────────────────────────────────────

class QuorumRequest(BaseModel):
    operation: str  # The agent's intended action (natural language or command string)
    player_ids: list[int] = []  # Optional: subset of player IDs from squad to use


@app.post("/api/ops/quorum/evaluate")
def quorum_evaluate_endpoint(body: QuorumRequest) -> dict:
    """Evaluate whether a squad meets quorum for a given operation.

    NemoClaw classifies the operation risk (LOW/MEDIUM/HIGH/CRITICAL) and
    checks if the combined Governance Power of the provided squad meets
    the required threshold. If no player_ids provided, uses the full demo squad.
    """
    squad = DEMO_SQUAD
    if body.player_ids:
        squad = [p for p in DEMO_SQUAD if p.id in body.player_ids]

    result = evaluate_quorum(body.operation, squad)
    return {
        "risk_level":     result.risk_level,
        "gp_threshold":   result.gp_threshold,
        "min_players":    result.min_players,
        "quorum_label":   result.quorum_label,
        "squad_gp":       result.squad_gp,
        "squad_players":  result.squad_players,
        "quorum_reached": result.quorum_reached,
        "gp_deficit":     result.gp_deficit,
        "players_deficit":result.players_deficit,
        "message":        result.message,
    }


@app.get("/api/ops/quorum/demo-squad")
def quorum_demo_squad_endpoint() -> dict:
    """Returns the demo squad with pre-computed Governance Power for the frontend."""
    players = [
        {
            "id":       p.id,
            "name":     p.name,
            "rarity":   p.rarity,
            "country":  p.country,
            "position": p.position,
            "stats":    {"atk": p.atk, "def": p.def_, "hype": p.hype},
            "gp":       compute_governance_power(p),
        }
        for p in DEMO_SQUAD
    ]
    players.sort(key=lambda x: x["gp"], reverse=True)
    return {"squad": players, "total_gp": round(sum(p["gp"] for p in players), 2)}


# ─────────────────────────────────────────────────────────────────────────────

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
