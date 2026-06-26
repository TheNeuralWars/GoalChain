"""player_quorum.py — NemoClaw Player-Gated Commands.

When NemoClaw classifies an agent operation as HIGH or CRITICAL risk,
the swarm enters Quorum Mode: it needs 'signatures' from Genesis Squad
players whose combined Governance Power meets the required threshold.

Governance Power is derived from each player's existing stats:
  GP = (def × 0.5) + (atk × 0.3) + (hype × 0.2)
  Multiplied by rarity: Common 1.0× | Rare 1.2× | Epic 1.5× | Legendary 2.0× | Mythic 3.0×

This creates a direct, meaningful link between NFT ownership and
the autonomous corporation's ability to take high-stakes actions.
"""
from __future__ import annotations

import re
import math
from dataclasses import dataclass, field
from typing import Literal


# ─────────────────────────────────────────────────────────────────────────────
# Risk Classification
# ─────────────────────────────────────────────────────────────────────────────

RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

# Patterns → risk levels (checked in order, first match wins)
_RISK_PATTERNS: list[tuple[re.Pattern, RiskLevel]] = [
    # CRITICAL — irreversible or very expensive
    (re.compile(r"(stripe.*pay|payout|transfer).*\$[5-9]\d{2,}|>\$500", re.I), "CRITICAL"),
    (re.compile(r"smart.?contract|anchor.deploy|mainnet|solana.*upgrade", re.I),   "CRITICAL"),
    (re.compile(r"\bgit push --force\b|\bgit rebase.*main\b",              re.I), "CRITICAL"),
    (re.compile(r"drop.table|delete.*from.*where|truncate",                re.I), "CRITICAL"),

    # HIGH — significant money or system changes
    (re.compile(r"stripe.*(pay|checkout|fund).*(50|[6-9]\d|\d{3})",       re.I), "HIGH"),
    (re.compile(r"\$([5-9]\d|[1-4]\d{2})\b",                              re.I), "HIGH"),
    (re.compile(r"deploy|systemctl (start|stop|restart)|npm run build",    re.I), "HIGH"),
    (re.compile(r"github.*(merge|close|label.*critical)",                  re.I), "HIGH"),

    # MEDIUM — reversible but meaningful
    (re.compile(r"stripe.*(pay|checkout).*\$([1-4]\d|[5-9])\b",           re.I), "MEDIUM"),
    (re.compile(r"\$(1\d|[2-4]\d)\b",                                     re.I), "MEDIUM"),
    (re.compile(r"gh issue (create|edit|delete)",                          re.I), "MEDIUM"),
    (re.compile(r"slack.*(send|notify|post)",                              re.I), "MEDIUM"),
]

_QUORUM_CONFIG: dict[RiskLevel, dict] = {
    "LOW":      {"gp_threshold": 0,    "min_players": 0, "label": "✅ No quorum required"},
    "MEDIUM":   {"gp_threshold": 150,  "min_players": 1, "label": "🟡 1 squad signer needed"},
    "HIGH":     {"gp_threshold": 400,  "min_players": 2, "label": "🟠 2 squad signers needed"},
    "CRITICAL": {"gp_threshold": 1000, "min_players": 3, "label": "🔴 3 squad signers needed"},
}

_RARITY_MULTIPLIER: dict[str, float] = {
    "mythic":    3.0,
    "legendary": 2.0,
    "epic":      1.5,
    "rare":      1.2,
    "common":    1.0,
}


# ─────────────────────────────────────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class PlayerStats:
    id: int
    name: str
    rarity: str
    atk: int
    def_: int
    hype: int
    country: str = ""
    position: str = ""


@dataclass
class QuorumResult:
    risk_level: RiskLevel
    gp_threshold: int
    min_players: int
    quorum_label: str

    # Squad evaluation
    squad_gp: float = 0.0
    squad_players: list[dict] = field(default_factory=list)
    quorum_reached: bool = False
    gp_deficit: float = 0.0
    players_deficit: int = 0

    # Narrative
    message: str = ""


# ─────────────────────────────────────────────────────────────────────────────
# Core functions
# ─────────────────────────────────────────────────────────────────────────────

def classify_risk_level(operation: str) -> RiskLevel:
    """Classify an operation string into LOW / MEDIUM / HIGH / CRITICAL."""
    op = operation.strip()
    for pattern, level in _RISK_PATTERNS:
        if pattern.search(op):
            return level
    return "LOW"


def compute_governance_power(player: PlayerStats) -> float:
    """Compute a player's Governance Power from their existing stats + rarity.

    GP = (def × 0.5 + atk × 0.3 + hype × 0.2) × rarity_multiplier
    Max theoretical (Mythic, all stats 99): ≈ 99 × 3 = 297 GP per player.
    """
    base = (player.def_ * 0.5) + (player.atk * 0.3) + (player.hype * 0.2)
    multiplier = _RARITY_MULTIPLIER.get(player.rarity.lower(), 1.0)
    return round(base * multiplier, 2)


def evaluate_quorum(operation: str, squad: list[PlayerStats]) -> QuorumResult:
    """Evaluate whether the manager's squad meets the quorum for this operation.

    Args:
        operation: The text of the agent's intended action / command.
        squad: The manager's available Genesis Squad players (as PlayerStats).

    Returns:
        QuorumResult with all relevant quorum data for the frontend to render.
    """
    risk = classify_risk_level(operation)
    cfg  = _QUORUM_CONFIG[risk]

    # Compute GP per player and sort descending (best signers first)
    players_with_gp = [
        {
            "id":      p.id,
            "name":    p.name,
            "rarity":  p.rarity,
            "country": p.country,
            "position": p.position,
            "stats":   {"atk": p.atk, "def": p.def_, "hype": p.hype},
            "gp":      compute_governance_power(p),
        }
        for p in squad
    ]
    players_with_gp.sort(key=lambda x: x["gp"], reverse=True)

    # Take optimal subset (fewest players to meet threshold)
    total_gp     = 0.0
    active_squad: list[dict] = []
    for p in players_with_gp:
        if (total_gp >= cfg["gp_threshold"] and len(active_squad) >= cfg["min_players"]):
            break
        active_squad.append(p)
        total_gp += p["gp"]
        total_gp  = round(total_gp, 2)

    quorum_reached = (
        total_gp >= cfg["gp_threshold"]
        and len(active_squad) >= cfg["min_players"]
    ) if cfg["gp_threshold"] > 0 else True

    gp_deficit       = max(0.0, round(cfg["gp_threshold"] - total_gp, 2))
    players_deficit  = max(0, cfg["min_players"] - len(active_squad))

    # Human-readable message
    if risk == "LOW":
        message = "Operation classified LOW risk — executing directly. No squad signature required."
    elif quorum_reached:
        signer_names = ", ".join(p["name"] for p in active_squad[:cfg["min_players"]])
        message = (
            f"⚡ Quorum REACHED — {risk} operation approved by {len(active_squad)} player(s): "
            f"{signer_names}. Total GP: {total_gp:.1f} / {cfg['gp_threshold']} required. "
            f"Agent swarm authorized to proceed."
        )
    else:
        deficit_str = f"{gp_deficit:.1f} GP" if gp_deficit > 0 else f"{players_deficit} more player(s)"
        message = (
            f"❌ Quorum NOT REACHED — {risk} operation blocked. "
            f"Need {deficit_str} more from your squad to authorize this action. "
            f"Current squad GP: {total_gp:.1f} / {cfg['gp_threshold']} required."
        )

    return QuorumResult(
        risk_level     = risk,
        gp_threshold   = cfg["gp_threshold"],
        min_players    = cfg["min_players"],
        quorum_label   = cfg["label"],
        squad_gp       = total_gp,
        squad_players  = active_squad,
        quorum_reached = quorum_reached,
        gp_deficit     = gp_deficit,
        players_deficit= players_deficit,
        message        = message,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Demo squad — based on real GoalChain Genesis Squad player IDs
# ─────────────────────────────────────────────────────────────────────────────

DEMO_SQUAD = [
    PlayerStats(id=1,   name="Lionel Messi",    rarity="mythic",    atk=98, def_=52, hype=99, country="Argentina", position="FWD"),
    PlayerStats(id=7,   name="Kylian Mbappé",   rarity="legendary", atk=96, def_=45, hype=94, country="Francia",   position="FWD"),
    PlayerStats(id=9,   name="R. Lewandowski",  rarity="epic",      atk=91, def_=60, hype=80, country="Polonia",   position="FWD"),
    PlayerStats(id=11,  name="Mohamed Salah",   rarity="rare",      atk=88, def_=58, hype=78, country="Egipto",    position="MID"),
    PlayerStats(id=10,  name="Luka Modrić",     rarity="epic",      atk=80, def_=79, hype=87, country="Croacia",   position="MID"),
    PlayerStats(id=6,   name="Virgil van Dijk", rarity="rare",      atk=55, def_=94, hype=75, country="Países Bajos", position="DEF"),
    PlayerStats(id=20,  name="Son Heung-min",   rarity="rare",      atk=84, def_=62, hype=80, country="Corea del Sur", position="MID"),
]
