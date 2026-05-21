#!/usr/bin/env python3
"""
GoalChain $GCH tokenomics simulation — reproducible scenarios S0–S3, H1–H8.

Usage:
  python3 scripts/tokenomics_simulation.py
  python3 scripts/tokenomics_simulation.py --out docs/data/tokenomics_scenarios.csv

Outputs CSV rows for each scenario/hypothesis/sensitivity sweep.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from dataclasses import dataclass, asdict, fields
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parents[1]
PLAYERS_JSON = REPO_ROOT / "docs/assets/data/players.json"

GCH = 1_000_000  # 6 decimals
ARCHITECT_TAX = 0.10
FATIGUE_THRESHOLD = 30
FATIGUE_PENALTY = 0.50
STAMINA_CLAIM_COST = 5
SOL_USD = 150.0

RARITY_YIELDS = {
    "mythic": 5_000,
    "legendary": 1_000,
    "epic": 250,
    "rare": 50,
}
NFT_COUNTS = {"mythic": 10, "legendary": 50, "epic": 150, "rare": 318}


@dataclass
class SimRow:
    category: str
    scenario_id: str
    label: str
    active_users: int
    xi_size: int
    avg_base_gch: float
    manager_mult: float
    stadium_mult: float
    fatigue_rate: float
    potion_adoption: float
    potion_price_gch: float
    daily_bet_volume_gch: float
    fee_bps: int
    fee_burn_share: float
    emission_gross_gch: float
    emission_user_gch: float
    emission_architect_gch: float
    potion_burn_gch: float
    fee_treasury_gch: float
    fee_burn_gch: float
    net_pressure_gch: float
    emit_burn_ratio: float
    risk_profile: str = ""
    vault_mode: str = ""
    vault_buyback_gch: float = 0.0
    notes: str = ""


def load_players_summary() -> dict:
    if not PLAYERS_JSON.exists():
        return {"total": 528, "max_daily_gross": 153_400}
    with PLAYERS_JSON.open(encoding="utf-8") as f:
        players = json.load(f)
    by_rarity: dict[str, list[int]] = {}
    for p in players:
        by_rarity.setdefault(p.get("rarity", "rare"), []).append(
            int(p.get("match_salary_gch", 50))
        )
    max_daily = sum(sum(v) for v in by_rarity.values())
    return {"total": len(players), "max_daily_gross": max_daily, "by_rarity": by_rarity}


def daily_emission(
    active_users: int,
    xi_size: int,
    avg_base_gch: float,
    manager_mult: float = 1.0,
    stadium_mult: float = 1.2,
    fatigue_rate: float = 0.3,
) -> tuple[float, float, float]:
    gross_per = avg_base_gch * manager_mult * stadium_mult
    effective = gross_per * (1 - fatigue_rate * FATIGUE_PENALTY)
    total_gross = active_users * xi_size * effective
    architect = total_gross * ARCHITECT_TAX
    user = total_gross - architect
    return total_gross, user, architect


def potion_burn(
    active_claims: int,
    adoption: float,
    price_gch: float,
    potions_per_entity: float = 0.5,
) -> float:
    return active_claims * adoption * potions_per_entity * price_gch


def betting_fees(
    volume: float, fee_bps: int, burn_share: float = 0.0
) -> tuple[float, float]:
    """Rough parimutuel: fee ~ volume * bps/10000 * 0.5 on claims."""
    total_fee = volume * (fee_bps / 10_000) * 0.5
    burn = total_fee * burn_share
    treasury = total_fee - burn
    return treasury, burn


def vault_buyback_daily(treasury_sol: float, apy: float, gch_price_usd: float) -> float:
    yearly_usd = treasury_sol * SOL_USD * apy
    daily_usd = yearly_usd / 365
    if gch_price_usd <= 0:
        return 0.0
    return daily_usd / gch_price_usd


def tiered_potion(rarity: str) -> float:
    salary = RARITY_YIELDS.get(rarity, 50)
    return max(25.0, math.floor(salary * 0.05))


def oracle_yield_after_season(base: float, goals: int, red_cards: int) -> float:
    rate = base
    for _ in range(goals):
        rate *= 1.10
    for _ in range(red_cards):
        rate *= 0.80
    return rate


def row_from_params(
    category: str,
    scenario_id: str,
    label: str,
    *,
    active_users: int,
    xi_size: int = 11,
    avg_base_gch: float = 100.0,
    manager_mult: float = 1.0,
    stadium_mult: float = 1.2,
    fatigue_rate: float = 0.3,
    potion_adoption: float = 0.5,
    potion_price_gch: float = 100.0,
    daily_bet_volume_gch: float = 0.0,
    fee_bps: int = 1000,
    fee_burn_share: float = 0.0,
    potions_per_entity: float = 0.5,
    notes: str = "",
) -> SimRow:
    gross, user, arch = daily_emission(
        active_users, xi_size, avg_base_gch, manager_mult, stadium_mult, fatigue_rate
    )
    claims = active_users * xi_size
    p_burn = potion_burn(claims, potion_adoption, potion_price_gch, potions_per_entity)
    fee_t, fee_b = betting_fees(daily_bet_volume_gch, fee_bps, fee_burn_share)
    total_burn = p_burn + fee_b
    net = gross - total_burn
    ratio = total_burn / gross if gross > 0 else 0.0
    return SimRow(
        category=category,
        scenario_id=scenario_id,
        label=label,
        active_users=active_users,
        xi_size=xi_size,
        avg_base_gch=avg_base_gch,
        manager_mult=manager_mult,
        stadium_mult=stadium_mult,
        fatigue_rate=fatigue_rate,
        potion_adoption=potion_adoption,
        potion_price_gch=potion_price_gch,
        daily_bet_volume_gch=daily_bet_volume_gch,
        fee_bps=fee_bps,
        fee_burn_share=fee_burn_share,
        emission_gross_gch=round(gross, 2),
        emission_user_gch=round(user, 2),
        emission_architect_gch=round(arch, 2),
        potion_burn_gch=round(p_burn, 2),
        fee_treasury_gch=round(fee_t, 2),
        fee_burn_gch=round(fee_b, 2),
        net_pressure_gch=round(net, 2),
        emit_burn_ratio=round(ratio, 4),
        notes=notes,
    )


def scenarios_base(players: dict) -> list[SimRow]:
    max_daily = players["max_daily_gross"]
    avg_doc = max_daily / 528 / 11 if players["total"] else 100
    return [
        row_from_params(
            "scenario", "S0", "On-chain today: 1k users, 100 GCH base",
            active_users=1000,
            avg_base_gch=100,
            potion_price_gch=100,
            daily_bet_volume_gch=50_000,
            notes="Default init_parody_player; potion 100 GCH (P0)",
        ),
        row_from_params(
            "scenario", "S1", "Full collection players.json salaries",
            active_users=528,
            avg_base_gch=avg_doc,
            potion_adoption=0.9,
            potion_price_gch=100,
            daily_bet_volume_gch=100_000,
            notes=f"Max catalog gross {max_daily} GCH/day if all claim",
        ),
        row_from_params(
            "scenario", "S2", "Blueprint 100k users hypergrowth",
            active_users=100_000,
            avg_base_gch=1500 / 11,
            potion_price_gch=100,
            daily_bet_volume_gch=50_000_000,
            notes="docs/ECONOMIC_BLUEPRINT.md projection",
        ),
        row_from_params(
            "scenario", "S3", "Casual 10k high fatigue",
            active_users=10_000,
            avg_base_gch=100,
            fatigue_rate=0.5,
            potion_adoption=0.5,
            potion_price_gch=100,
            daily_bet_volume_gch=500_000,
        ),
        row_from_params(
            "scenario", "S4", "World Cup peak (-30 stamina/match, 3 matches/day)",
            active_users=10_000,
            avg_base_gch=100,
            potion_adoption=0.6,
            potion_price_gch=100,
            potions_per_entity=11 * math.ceil(90 / 100),  # 3 matches * 30 stamina
            notes="H4 doc stamina model at tournament peak",
        ),
    ]


def hypotheses() -> list[SimRow]:
    rows = []
    for fee_bps in (500, 800, 1000, 1500):
        for burn_share in (0.0, 0.4, 0.5):
            rows.append(
                row_from_params(
                    "hypothesis",
                    "H1",
                    f"Bet fee split fee_bps={fee_bps} burn_share={burn_share}",
                    active_users=1000,
                    daily_bet_volume_gch=1_000_000,
                    fee_bps=fee_bps,
                    fee_burn_share=burn_share,
                    potion_adoption=0.0,
                    notes="Fee-only sink; emission baseline S0",
                )
            )
    for daily_emit, daily_burn, action in [
        (500_000, 450_000, "mint_allow"),
        (2_000_000, 200_000, "mint_pause_48h"),
        (100_000, 300_000, "jackpot_subsidy"),
    ]:
        rows.append(
            SimRow(
                category="hypothesis",
                scenario_id="H2",
                label=f"Mint gate ratio emit/burn={daily_emit/daily_burn:.2f}",
                active_users=0,
                xi_size=0,
                avg_base_gch=0,
                manager_mult=1,
                stadium_mult=1,
                fatigue_rate=0,
                potion_adoption=0,
                potion_price_gch=0,
                daily_bet_volume_gch=0,
                fee_bps=0,
                fee_burn_share=0,
                emission_gross_gch=daily_emit,
                emission_user_gch=daily_emit * 0.9,
                emission_architect_gch=daily_emit * 0.1,
                potion_burn_gch=daily_burn,
                fee_treasury_gch=0,
                fee_burn_gch=0,
                net_pressure_gch=daily_emit - daily_burn,
                emit_burn_ratio=round(daily_burn / daily_emit, 4),
                notes=f"action={action}",
            )
        )
    for target_ratio in (0.5, 0.8, 1.0, 1.2):
        emit = 1_000_000
        potions = 2000
        price = (emit * target_ratio) / potions
        rows.append(
            row_from_params(
                "hypothesis",
                "H3",
                f"Dynamic potion target_ratio={target_ratio}",
                active_users=1000,
                potion_adoption=1.0,
                potion_price_gch=price,
                potions_per_entity=2.0,
                notes=f"Equilibrium potion price {price:.0f} GCH",
            )
        )
    for model, potions_season, price in [
        ("doc_-30_per_match", 20, 100),
        ("chain_-5_per_claim", 4, 100),
    ]:
        rows.append(
            SimRow(
                category="hypothesis",
                scenario_id="H4",
                label=f"Stamina model {model}",
                active_users=1,
                xi_size=11,
                avg_base_gch=100,
                manager_mult=1,
                stadium_mult=1.2,
                fatigue_rate=0,
                potion_adoption=1,
                potion_price_gch=price,
                daily_bet_volume_gch=0,
                fee_bps=0,
                fee_burn_share=0,
                emission_gross_gch=100 * 1.2 * 64,
                emission_user_gch=100 * 1.2 * 64 * 0.9,
                emission_architect_gch=100 * 1.2 * 64 * 0.1,
                potion_burn_gch=potions_season * 11 * price,
                fee_treasury_gch=0,
                fee_burn_gch=0,
                net_pressure_gch=0,
                emit_burn_ratio=round((potions_season * 11 * price) / (100 * 1.2 * 64), 4),
                notes="Per-player season burn vs emission (64 matchdays)",
            )
        )
    for goals, reds in [(0, 0), (5, 0), (5, 1), (10, 2)]:
        bug_yield = 100 + goals * 0.00001
        pct_yield = oracle_yield_after_season(100, goals, reds)
        rows.append(
            SimRow(
                category="hypothesis",
                scenario_id="H5",
                label=f"Oracle yield goals={goals} reds={reds}",
                active_users=1,
                xi_size=1,
                avg_base_gch=bug_yield,
                manager_mult=1,
                stadium_mult=1,
                fatigue_rate=0,
                potion_adoption=0,
                potion_price_gch=0,
                daily_bet_volume_gch=0,
                fee_bps=0,
                fee_burn_share=0,
                emission_gross_gch=bug_yield,
                emission_user_gch=pct_yield * 0.9,
                emission_architect_gch=pct_yield * 0.1,
                potion_burn_gch=0,
                fee_treasury_gch=0,
                fee_burn_gch=0,
                net_pressure_gch=0,
                emit_burn_ratio=0,
                notes=f"bug_yield={bug_yield:.5f} pct_yield={pct_yield:.2f} GCH/day",
            )
        )
    rent_week = 63_360
    for fee_pct in (0, 0.05):
        fee = rent_week * fee_pct
        rows.append(
            SimRow(
                category="hypothesis",
                scenario_id="H6",
                label=f"Rent volume fee={fee_pct*100:.0f}%",
                active_users=0,
                xi_size=0,
                avg_base_gch=0,
                manager_mult=1,
                stadium_mult=1,
                fatigue_rate=0,
                potion_adoption=0,
                potion_price_gch=0,
                daily_bet_volume_gch=rent_week,
                fee_bps=0,
                fee_burn_share=0.5 if fee_pct else 0,
                emission_gross_gch=0,
                emission_user_gch=0,
                emission_architect_gch=0,
                potion_burn_gch=fee * 0.5,
                fee_treasury_gch=fee * 0.5,
                fee_burn_gch=0,
                net_pressure_gch=-fee,
                emit_burn_ratio=0,
                notes="Weekly rent transfer volume estimate",
            )
        )
    for treasury_sol in (1000, 3000, 5000, 10000):
        for price in (0.001, 0.01, 0.05):
            bb = vault_buyback_daily(treasury_sol, 0.075, price)
            rows.append(
                SimRow(
                    category="hypothesis",
                    scenario_id="H7",
                    label=f"Vault buyback SOL={treasury_sol} price=${price}",
                    active_users=0,
                    xi_size=0,
                    avg_base_gch=0,
                    manager_mult=1,
                    stadium_mult=1,
                    fatigue_rate=0,
                    potion_adoption=0,
                    potion_price_gch=0,
                    daily_bet_volume_gch=0,
                    fee_bps=0,
                    fee_burn_share=0,
                    emission_gross_gch=153_400,
                    emission_user_gch=138_060,
                    emission_architect_gch=15_340,
                    potion_burn_gch=0,
                    fee_treasury_gch=0,
                    fee_burn_gch=bb,
                    net_pressure_gch=153_400 - bb,
                    emit_burn_ratio=round(bb / 153_400, 4) if bb else 0,
                    notes="vs max catalog emission 153.4k/day",
                )
            )
    for rarity, salary in RARITY_YIELDS.items():
        xi_cap = {"mythic": 1, "legendary": 5, "epic": 15, "rare": 11}.get(rarity, 11)
        gross, user, arch = daily_emission(1, xi_cap, salary)
        rows.append(
            row_from_params(
                "hypothesis",
                "H8",
                f"Rarity curve {rarity} XI cap {xi_cap}",
                active_users=1,
                xi_size=xi_cap,
                avg_base_gch=salary,
                potion_price_gch=tiered_potion(rarity),
                potion_adoption=1.0,
                potions_per_entity=1.0,
                notes=f"NFT count {NFT_COUNTS.get(rarity,0)} tiered potion {tiered_potion(rarity)}",
            )
        )
    return rows


def sensitivity_sweeps() -> list[SimRow]:
    rows = []
    for users in (100, 500, 1000, 5000, 10000, 50000, 100000):
        r = row_from_params(
            "sensitivity",
            "users",
            f"active_users={users}",
            active_users=users,
            potion_price_gch=100,
        )
        rows.append(r)
    for price in (50, 80, 100, 150, 250, 400, 500):
        r = row_from_params(
            "sensitivity",
            "potion_price",
            f"potion_price={price}",
            active_users=1000,
            potion_price_gch=price,
        )
        rows.append(r)
    for users in (1000,):
        gross, _, _ = daily_emission(users, 11, 100)
        claims = users * 11
        for adopt in (0.25, 0.5, 0.75, 1.0):
            potions = claims * adopt * 0.5
            eq_price = gross / potions if potions else 0
            rows.append(
                SimRow(
                    category="sensitivity",
                    scenario_id="equilibrium_potion",
                    label=f"break_even adopt={adopt}",
                    active_users=users,
                    xi_size=11,
                    avg_base_gch=100,
                    manager_mult=1,
                    stadium_mult=1.2,
                    fatigue_rate=0.3,
                    potion_adoption=adopt,
                    potion_price_gch=round(eq_price, 2),
                    daily_bet_volume_gch=0,
                    fee_bps=0,
                    fee_burn_share=0,
                    emission_gross_gch=gross,
                    emission_user_gch=gross * 0.9,
                    emission_architect_gch=gross * 0.1,
                    potion_burn_gch=gross,
                    fee_treasury_gch=0,
                    fee_burn_gch=0,
                    net_pressure_gch=0,
                    emit_burn_ratio=1.0,
                    notes="potion price to balance emission",
                )
            )
    return rows


# --- Player base composition profiles ---
PLAYER_BASE_PROFILES = {
    "PB_casual": {
        "label": "Casual: 100 GCH base, low betting",
        "active_users": 5_000,
        "avg_base_gch": 100,
        "xi_size": 11,
        "fatigue_rate": 0.45,
        "potion_adoption": 0.35,
        "daily_bet_volume_gch": 200_000,
        "fee_bps": 1000,
        "fee_burn_share": 0.0,
    },
    "PB_competitive": {
        "label": "Competitive: mixed rarity XI (~290 avg)",
        "active_users": 2_000,
        "avg_base_gch": 290,
        "xi_size": 11,
        "fatigue_rate": 0.35,
        "potion_adoption": 0.65,
        "daily_bet_volume_gch": 2_000_000,
        "fee_bps": 1000,
        "fee_burn_share": 0.4,
    },
    "PB_whale": {
        "label": "Whale: mythic-heavy XI (~2500 avg)",
        "active_users": 200,
        "avg_base_gch": 2_500,
        "xi_size": 11,
        "fatigue_rate": 0.2,
        "potion_adoption": 0.85,
        "daily_bet_volume_gch": 8_000_000,
        "fee_bps": 1000,
        "fee_burn_share": 0.4,
    },
    "PB_catalog_max": {
        "label": "All 528 holders claim (players.json salaries)",
        "active_users": 528,
        "avg_base_gch": 153_400 / 528 / 11,
        "xi_size": 11,
        "fatigue_rate": 0.25,
        "potion_adoption": 0.9,
        "daily_bet_volume_gch": 500_000,
        "fee_bps": 800,
        "fee_burn_share": 0.4,
    },
    "PB_onboarding": {
        "label": "Onboarding wave: 50 GCH rare-only starters",
        "active_users": 20_000,
        "avg_base_gch": 50,
        "xi_size": 11,
        "fatigue_rate": 0.5,
        "potion_adoption": 0.4,
        "daily_bet_volume_gch": 100_000,
        "fee_bps": 800,
        "fee_burn_share": 0.2,
    },
}


# --- Risk profiles (mint + sink policy multipliers) ---
RISK_PROFILES = {
    "RP_conservative": {
        "label": "Conservative: high burn, mint gate strict",
        "mint_multiplier": 0.5,
        "potion_adoption_mult": 1.1,
        "fee_burn_share": 0.5,
        "vault_buyback_share": 0.7,
        "target_emit_burn": 0.95,
    },
    "RP_balanced": {
        "label": "Balanced: target ratio ~1.0",
        "mint_multiplier": 1.0,
        "potion_adoption_mult": 1.0,
        "fee_burn_share": 0.4,
        "vault_buyback_share": 0.6,
        "target_emit_burn": 1.0,
    },
    "RP_aggressive": {
        "label": "Aggressive growth: more emit, less burn",
        "mint_multiplier": 1.5,
        "potion_adoption_mult": 0.7,
        "fee_burn_share": 0.2,
        "vault_buyback_share": 0.4,
        "target_emit_burn": 1.15,
    },
    "RP_degen": {
        "label": "Degen: hyper emit, minimal sinks",
        "mint_multiplier": 3.0,
        "potion_adoption_mult": 0.4,
        "fee_burn_share": 0.0,
        "vault_buyback_share": 0.2,
        "target_emit_burn": 1.5,
    },
}


# --- Vault administration modes ---
VAULT_MODES = {
    "V_manual": {
        "label": "Manual multisig: weekly human buyback",
        "treasury_sol": 2_000,
        "apy": 0.075,
        "buyback_share": 0.4,
        "agent_overhead_bps": 0,
        "clmm_rebalance": False,
        "perp_hedge": False,
    },
    "V_crank": {
        "label": "Deterministic crank: harvest + Jupiter burn",
        "treasury_sol": 5_000,
        "apy": 0.075,
        "buyback_share": 0.6,
        "agent_overhead_bps": 5,
        "clmm_rebalance": False,
        "perp_hedge": False,
    },
    "V_hyre_phi": {
        "label": "Hyre CLMM + Phi/Drift split (50/50 yield)",
        "treasury_sol": 5_000,
        "apy": 0.09,
        "buyback_share": 0.65,
        "agent_overhead_bps": 15,
        "clmm_rebalance": True,
        "perp_hedge": True,
    },
    "V_agentic_sentinel": {
        "label": "Sentinel agent: circuit breaker + dynamic allocation",
        "treasury_sol": 8_000,
        "apy": 0.095,
        "buyback_share": 0.7,
        "agent_overhead_bps": 25,
        "clmm_rebalance": True,
        "perp_hedge": True,
    },
    "V_agentic_orchestrator": {
        "label": "Full orchestrator: emit/burn oracle + multi-agent vault",
        "treasury_sol": 12_000,
        "apy": 0.10,
        "buyback_share": 0.75,
        "agent_overhead_bps": 35,
        "clmm_rebalance": True,
        "perp_hedge": True,
    },
}


def player_base_profiles() -> list[SimRow]:
    rows = []
    for pid, p in PLAYER_BASE_PROFILES.items():
        r = row_from_params(
            "player_base",
            pid,
            p["label"],
            active_users=p["active_users"],
            xi_size=p["xi_size"],
            avg_base_gch=p["avg_base_gch"],
            fatigue_rate=p["fatigue_rate"],
            potion_adoption=p["potion_adoption"],
            potion_price_gch=100,
            daily_bet_volume_gch=p["daily_bet_volume_gch"],
            fee_bps=p["fee_bps"],
            fee_burn_share=p["fee_burn_share"],
        )
        r.risk_profile = "baseline"
        rows.append(r)
    return rows


def risk_profile_matrix() -> list[SimRow]:
    """Cross player_base × risk_profile (reference PB_competitive)."""
    rows = []
    base = PLAYER_BASE_PROFILES["PB_competitive"]
    for rid, risk in RISK_PROFILES.items():
        adopt = min(1.0, base["potion_adoption"] * risk["potion_adoption_mult"])
        fee_burn = risk["fee_burn_share"]
        r = row_from_params(
            "risk_profile",
            rid,
            f"{risk['label']} × competitive base",
            active_users=int(base["active_users"] * risk["mint_multiplier"]),
            xi_size=base["xi_size"],
            avg_base_gch=base["avg_base_gch"] * risk["mint_multiplier"],
            fatigue_rate=base["fatigue_rate"],
            potion_adoption=adopt,
            potion_price_gch=100,
            daily_bet_volume_gch=base["daily_bet_volume_gch"],
            fee_bps=base["fee_bps"],
            fee_burn_share=fee_burn,
            notes=f"target_emit_burn={risk['target_emit_burn']}; mint_mult={risk['mint_multiplier']}",
        )
        r.risk_profile = rid
        rows.append(r)
    return rows


def vault_admin_simulations(gch_price_usd: float = 0.01) -> list[SimRow]:
    """Vault modes vs fixed catalog emission (153.4k/day)."""
    rows = []
    catalog_emit = 153_400
    for vid, v in VAULT_MODES.items():
        gross_yield_usd_yr = v["treasury_sol"] * SOL_USD * v["apy"]
        overhead = gross_yield_usd_yr * (v["agent_overhead_bps"] / 10_000)
        net_yield_usd = gross_yield_usd_yr - overhead
        buyback_usd = net_yield_usd * v["buyback_share"]
        buyback_gch_day = (buyback_usd / 365) / gch_price_usd if gch_price_usd > 0 else 0
        extra_clmm = 0.0
        if v["clmm_rebalance"]:
            extra_clmm = buyback_gch_day * 0.08  # modeled fee alpha
        if v["perp_hedge"]:
            extra_clmm *= 1.05  # hedging preserves capital; slight boost to sustained buyback
        total_sink = buyback_gch_day + extra_clmm
        net = catalog_emit - total_sink
        rows.append(
            SimRow(
                category="vault_admin",
                scenario_id=vid,
                label=v["label"],
                active_users=528,
                xi_size=11,
                avg_base_gch=catalog_emit / 528 / 11,
                manager_mult=1.0,
                stadium_mult=1.2,
                fatigue_rate=0.25,
                potion_adoption=0.0,
                potion_price_gch=0,
                daily_bet_volume_gch=0,
                fee_bps=0,
                fee_burn_share=0,
                emission_gross_gch=catalog_emit,
                emission_user_gch=catalog_emit * 0.9,
                emission_architect_gch=catalog_emit * 0.1,
                potion_burn_gch=0,
                fee_treasury_gch=0,
                fee_burn_gch=0,
                net_pressure_gch=round(net, 2),
                emit_burn_ratio=round(total_sink / catalog_emit, 4) if catalog_emit else 0,
                risk_profile="catalog_emit",
                vault_mode=vid,
                vault_buyback_gch=round(total_sink, 2),
                notes=(
                    f"sol={v['treasury_sol']}; apy={v['apy']}; overhead_bps={v['agent_overhead_bps']}; "
                    f"clmm={v['clmm_rebalance']}; hedge={v['perp_hedge']}; gch_usd={gch_price_usd}"
                ),
            )
        )
    return rows


def vault_price_sensitivity() -> list[SimRow]:
    rows = []
    for price in (0.001, 0.005, 0.01, 0.03, 0.05):
        for vid in ("V_crank", "V_agentic_orchestrator"):
            sub = vault_admin_simulations(gch_price_usd=price)
            for r in sub:
                if r.scenario_id == vid:
                    r.category = "vault_sensitivity"
                    r.label = f"{r.label} @ ${price}"
                    rows.append(r)
    return rows


def combined_equilibrium_grid() -> list[SimRow]:
    """PB × RP × V for net pressure (competitive + balanced + crank)."""
    rows = []
    pb = PLAYER_BASE_PROFILES["PB_competitive"]
    risk = RISK_PROFILES["RP_balanced"]
    vault = VAULT_MODES["V_crank"]
    gross, user, arch = daily_emission(
        int(pb["active_users"] * risk["mint_multiplier"]),
        pb["xi_size"],
        pb["avg_base_gch"],
        fatigue_rate=pb["fatigue_rate"],
    )
    claims = int(pb["active_users"] * risk["mint_multiplier"]) * pb["xi_size"]
    p_burn = potion_burn(
        claims,
        min(1.0, pb["potion_adoption"] * risk["potion_adoption_mult"]),
        100,
    )
    _, fee_b = betting_fees(pb["daily_bet_volume_gch"], pb["fee_bps"], risk["fee_burn_share"])
    buyback = vault_admin_simulations(0.01)
    v_burn = next((x.vault_buyback_gch for x in buyback if x.scenario_id == "V_crank"), 0)
    total_burn = p_burn + fee_b + v_burn
    rows.append(
        SimRow(
            category="equilibrium_grid",
            scenario_id="EQ_competitive_balanced_crank",
            label="Competitive + balanced risk + crank vault @ $0.01",
            active_users=int(pb["active_users"] * risk["mint_multiplier"]),
            xi_size=pb["xi_size"],
            avg_base_gch=pb["avg_base_gch"],
            manager_mult=1.0,
            stadium_mult=1.2,
            fatigue_rate=pb["fatigue_rate"],
            potion_adoption=pb["potion_adoption"],
            potion_price_gch=100,
            daily_bet_volume_gch=pb["daily_bet_volume_gch"],
            fee_bps=pb["fee_bps"],
            fee_burn_share=risk["fee_burn_share"],
            emission_gross_gch=round(gross, 2),
            emission_user_gch=round(user, 2),
            emission_architect_gch=round(arch, 2),
            potion_burn_gch=round(p_burn, 2),
            fee_treasury_gch=0,
            fee_burn_gch=round(fee_b, 2),
            net_pressure_gch=round(gross - total_burn, 2),
            emit_burn_ratio=round(total_burn / gross, 4) if gross else 0,
            risk_profile="RP_balanced",
            vault_mode="V_crank",
            vault_buyback_gch=v_burn,
            notes="Combined sinks: potion + fee burn + vault buyback",
        )
    )
    return rows


def write_csv(rows: Iterable[SimRow], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [f.name for f in fields(SimRow)]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow(asdict(r))


def main() -> None:
    parser = argparse.ArgumentParser(description="GoalChain tokenomics simulation")
    parser.add_argument(
        "--out",
        default=str(REPO_ROOT / "docs/data/tokenomics_scenarios.csv"),
        help="Output CSV path",
    )
    parser.add_argument(
        "--vault-csv",
        default=str(REPO_ROOT / "docs/data/tokenomics_vault_agentic.csv"),
        help="Secondary CSV for vault/agentic scenarios",
    )
    args = parser.parse_args()
    players = load_players_summary()
    all_rows = (
        scenarios_base(players)
        + hypotheses()
        + sensitivity_sweeps()
        + player_base_profiles()
        + risk_profile_matrix()
        + vault_admin_simulations()
        + vault_price_sensitivity()
        + combined_equilibrium_grid()
    )
    out = Path(args.out)
    write_csv(all_rows, out)
    vault_rows = [r for r in all_rows if r.category in ("vault_admin", "vault_sensitivity", "equilibrium_grid")]
    vault_out = Path(args.vault_csv)
    write_csv(vault_rows, vault_out)
    print(f"Wrote {len(all_rows)} rows to {out}")
    print(f"Wrote {len(vault_rows)} vault/agentic rows to {vault_out}")
    by_cat: dict[str, int] = {}
    for r in all_rows:
        by_cat[r.category] = by_cat.get(r.category, 0) + 1
    for cat, n in sorted(by_cat.items()):
        print(f"  {cat}: {n}")


if __name__ == "__main__":
    main()
