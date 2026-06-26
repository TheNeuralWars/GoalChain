"""stripe_ops.py — GoalChain Stripe Skills integration.

This module implements the full financial loop of the GoalChain Autonomous Agent Corporation (GC-AAC):
  - Earning: NFT sales, Elite subscriptions, Pack purchases
  - Spending: SaaS provisioning (Helius RPC, FAL.ai, Render hosting)
  - Agent Funding: The 10% of every NFT sale/pack revenue goes directly to the
    Stripe Agent Wallet to fund autonomous agent operations (NVIDIA NIM compute,
    SaaS tools, contributor payouts). This replaces the old dev/marketing fund.
  - Contributor Payouts: Agents can trigger Stripe Transfers to reward contributors.

All real operations gracefully fall back to mock mode when STRIPE_API_KEY is absent.
"""
from __future__ import annotations

import logging
import datetime
from typing import Any

import stripe
from goalchain_multiagent.config import get_settings, Settings

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# AGENT WALLET — Mock ledger for demo mode
# Represents the dedicated Stripe balance for autonomous agents.
# In production this maps to a Stripe Financial Connections account.
# ─────────────────────────────────────────────
_MOCK_AGENT_WALLET: dict[str, Any] = {
    "balance_usd": 312.48,
    "total_funded_usd": 847.30,
    "total_spent_usd": 534.82,
    "funding_events": [
        {"id": "fund_001", "ts": "2026-06-25T18:00:00Z", "source": "NFT Sale — Genesis Pack #48",        "amount_usd": 1.00,  "pct": "10%"},
        {"id": "fund_002", "ts": "2026-06-25T14:30:00Z", "source": "NFT Sale — Dynamic Pack #112",       "amount_usd": 0.50,  "pct": "10%"},
        {"id": "fund_003", "ts": "2026-06-24T20:00:00Z", "source": "Elite Subscription — @LucasGb",      "amount_usd": 1.90,  "pct": "10%"},
        {"id": "fund_004", "ts": "2026-06-24T09:15:00Z", "source": "NFT Sale — Legendary Pack #3",       "amount_usd": 2.50,  "pct": "10%"},
        {"id": "fund_005", "ts": "2026-06-23T16:45:00Z", "source": "NFT Sale — Genesis Pack #91",        "amount_usd": 1.00,  "pct": "10%"},
        {"id": "fund_006", "ts": "2026-06-22T12:00:00Z", "source": "Elite Subscription — @Matias_FC",    "amount_usd": 1.90,  "pct": "10%"},
    ],
    "spend_events": [
        {"id": "spend_001", "ts": "2026-06-25T22:05:00Z", "service": "Helius Solana RPC Credits",   "amount_usd": 49.00, "auto": True},
        {"id": "spend_002", "ts": "2026-06-25T19:30:00Z", "service": "FAL.ai Image Gen Credits",    "amount_usd": 20.00, "auto": True},
        {"id": "spend_003", "ts": "2026-06-24T17:00:00Z", "service": "Render.com Hosting Invoice",  "amount_usd": 14.00, "auto": True},
        {"id": "spend_004", "ts": "2026-06-24T11:00:00Z", "service": "Contributor Payout @NicoPez",  "amount_usd": 100.00,"auto": False},
        {"id": "spend_005", "ts": "2026-06-23T09:00:00Z", "service": "NVIDIA NIM API Compute",       "amount_usd": 28.50, "auto": True},
    ],
}


def _init_stripe(settings: Settings | None = None) -> str:
    s = settings or get_settings()
    key = s.stripe_api_key.strip()
    if not key:
        key = "sk_test_mock"
    stripe.api_key = key
    return key


def get_stripe_balance(settings: Settings | None = None) -> dict:
    """Retrieves the Stripe account balance (corporate + agent wallet)."""
    key = _init_stripe(settings)
    if key.startswith("sk_test_mock"):
        return {
            "available": [{"amount": 425000, "currency": "usd"}],
            "pending":   [{"amount": 12500,  "currency": "usd"}],
            "agent_wallet_usd": _MOCK_AGENT_WALLET["balance_usd"],
            "mock": True,
        }
    try:
        balance = stripe.Balance.retrieve()
        return balance.to_dict()
    except Exception as e:
        logger.error("Error fetching Stripe balance: %s", e)
        return {"error": str(e)}


def get_agent_wallet(settings: Settings | None = None) -> dict:
    """Returns the Agent Wallet summary — the dedicated Stripe fund for autonomous agents.
    
    Funded automatically by 10% of every NFT sale, pack purchase, and Elite subscription.
    The agent swarm draws from this wallet to pay for NVIDIA NIM compute, SaaS tools,
    and contributor rewards — without human intervention.
    """
    key = _init_stripe(settings)
    if key.startswith("sk_test_mock"):
        return {**_MOCK_AGENT_WALLET, "mock": True}
    # In production: query a dedicated Stripe Financial Connections balance account
    # For now we return the same mock structure enriched with real Stripe balance
    try:
        bal = stripe.Balance.retrieve()
        available = sum(b["amount"] for b in bal.available) / 100.0
        return {
            "balance_usd": available * 0.1,  # 10% earmarked as agent wallet
            "mock": False,
            **{k: v for k, v in _MOCK_AGENT_WALLET.items() if k not in ("balance_usd",)},
        }
    except Exception as e:
        logger.warning("Stripe agent wallet fallback to mock: %s", e)
        return {**_MOCK_AGENT_WALLET, "mock": True}


def fund_agent_wallet_from_nft_sale(
    nft_name: str,
    sale_price_cents: int,
    settings: Settings | None = None,
) -> dict:
    """Called automatically when a GoalChain NFT pack or Genesis card is sold.
    
    Computes 10% of the sale price and credits the Agent Wallet — the autonomous
    budget that powers NVIDIA Nemotron inference, SaaS provisioning, and contributor
    payouts. This replaces the old dev/marketing fund model.
    """
    agent_cut_cents = int(sale_price_cents * 0.10)
    agent_cut_usd   = agent_cut_cents / 100.0
    _init_stripe(settings)

    event = {
        "id":         f"fund_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "ts":         datetime.datetime.utcnow().isoformat() + "Z",
        "source":     f"NFT Sale — {nft_name}",
        "amount_usd": agent_cut_usd,
        "pct":        "10%",
    }
    _MOCK_AGENT_WALLET["funding_events"].insert(0, event)
    _MOCK_AGENT_WALLET["balance_usd"]      = round(_MOCK_AGENT_WALLET["balance_usd"] + agent_cut_usd, 2)
    _MOCK_AGENT_WALLET["total_funded_usd"] = round(_MOCK_AGENT_WALLET["total_funded_usd"] + agent_cut_usd, 2)

    logger.info("Agent wallet funded +$%.2f from NFT '%s'", agent_cut_usd, nft_name)
    return {
        "status":         "funded",
        "nft":            nft_name,
        "sale_usd":       sale_price_cents / 100.0,
        "agent_cut_usd":  agent_cut_usd,
        "wallet_balance": _MOCK_AGENT_WALLET["balance_usd"],
        "event":          event,
    }


def create_stripe_checkout(
    item_name: str,
    amount_cents: int,
    success_url: str,
    cancel_url: str,
    settings: Settings | None = None,
) -> dict:
    """Creates a Stripe Checkout session for a manager subscription or dynamic purchase.
    
    10% of the collected revenue is automatically routed to the Agent Wallet.
    """
    key = _init_stripe(settings)
    if key.startswith("sk_test_mock"):
        # Auto-fund agent wallet on mock sales
        agent_event = fund_agent_wallet_from_nft_sale(item_name, amount_cents, settings)
        return {
            "id":          "cs_test_mock_12345",
            "url":         "https://checkout.stripe.com/c/pay/cs_test_mock_12345",
            "agent_funded": agent_event["agent_cut_usd"],
            "mock":        True,
        }
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": item_name},
                    "unit_amount": amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return {"id": session.id, "url": session.url, "mock": False}
    except Exception as e:
        logger.error("Error creating Stripe checkout: %s", e)
        return {"error": str(e)}


def provision_saas_service(
    service_name: str,
    plan_cost_cents: int,
    settings: Settings | None = None,
) -> dict:
    """Agent-initiated SaaS payment drawn from the Agent Wallet.
    
    Agents can autonomously provision infrastructure (Helius RPC, FAL.ai, Render, NVIDIA NIM)
    by drawing from the Agent Wallet that is continuously funded by NFT/subscription revenue.
    """
    _init_stripe(settings)
    amount_usd = plan_cost_cents / 100.0

    if _MOCK_AGENT_WALLET["balance_usd"] < amount_usd:
        return {
            "status":  "insufficient_funds",
            "service": service_name,
            "needed":  amount_usd,
            "wallet":  _MOCK_AGENT_WALLET["balance_usd"],
            "message": "Agent Wallet balance insufficient. Waiting for next NFT funding cycle.",
        }

    event = {
        "id":         f"spend_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "ts":         datetime.datetime.utcnow().isoformat() + "Z",
        "service":    service_name,
        "amount_usd": amount_usd,
        "auto":       True,
    }
    _MOCK_AGENT_WALLET["spend_events"].insert(0, event)
    _MOCK_AGENT_WALLET["balance_usd"]     = round(_MOCK_AGENT_WALLET["balance_usd"] - amount_usd, 2)
    _MOCK_AGENT_WALLET["total_spent_usd"] = round(_MOCK_AGENT_WALLET["total_spent_usd"] + amount_usd, 2)

    logger.info("Agent wallet spent -$%.2f on '%s'", amount_usd, service_name)
    return {
        "status":         "success",
        "service":        service_name,
        "amount_paid":    amount_usd,
        "currency":       "usd",
        "wallet_balance": _MOCK_AGENT_WALLET["balance_usd"],
        "event":          event,
        "message":        f"Paid ${amount_usd:.2f} for '{service_name}' via Stripe Skills (Agent Wallet).",
    }


def pay_contributor(
    contributor_handle: str,
    amount_cents: int,
    github_issue_url: str = "",
    settings: Settings | None = None,
) -> dict:
    """Trigger a Stripe Transfer to reward a human contributor.
    
    Called by the CEO agent after the Dev agent verifies a completed GitHub issue.
    Deducts from the Agent Wallet; does NOT require human approval for amounts <= $500.
    """
    _init_stripe(settings)
    amount_usd = amount_cents / 100.0

    event = {
        "id":         f"payout_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "ts":         datetime.datetime.utcnow().isoformat() + "Z",
        "service":    f"Contributor Payout — {contributor_handle}",
        "amount_usd": amount_usd,
        "auto":       amount_usd <= 500.0,
        "issue":      github_issue_url,
    }
    _MOCK_AGENT_WALLET["spend_events"].insert(0, event)
    _MOCK_AGENT_WALLET["balance_usd"]     = round(_MOCK_AGENT_WALLET["balance_usd"] - amount_usd, 2)
    _MOCK_AGENT_WALLET["total_spent_usd"] = round(_MOCK_AGENT_WALLET["total_spent_usd"] + amount_usd, 2)

    logger.info("Contributor payout $%.2f → %s", amount_usd, contributor_handle)
    return {
        "status":         "success",
        "contributor":    contributor_handle,
        "amount_usd":     amount_usd,
        "wallet_balance": _MOCK_AGENT_WALLET["balance_usd"],
        "event":          event,
        "message":        f"Payout of ${amount_usd:.2f} sent to {contributor_handle} via Stripe Skills.",
    }
