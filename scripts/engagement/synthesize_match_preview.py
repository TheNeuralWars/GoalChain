#!/usr/bin/env python3
"""
GoalChain Match Preview Synthesizer
Takes enriched match data and generates tactical keys, player watch, betting angle, haiku.
"""

import json
import hashlib
import random
from pathlib import Path
from datetime import datetime

CACHE_DIR = Path("/home/ubuntu/hermes/workspace/GoalChain/data/engagement/cache")
SELECTED_FILE = CACHE_DIR / "selected_match.json"
HAIKU_USED_FILE = Path("/home/ubuntu/hermes/workspace/GoalChain/data/engagement/haiku_used.json")
OUTPUT_FILE = CACHE_DIR / "match_preview_final.json"


def load_haiku_used() -> list:
    if HAIKU_USED_FILE.exists():
        return json.loads(HAIKU_USED_FILE.read_text())
    return []


def save_haiku_used(haiku_list: list):
    HAIKU_USED_FILE.write_text(json.dumps(haiku_list, indent=2))


def generate_tactical_keys(match: dict) -> list:
    """Generate 3 tactical insights from enriched data."""
    enriched = match.get("enriched", {})
    home = match["home_team"]
    away = match["away_team"]
    home_form = enriched.get("home_form", "")
    away_form = enriched.get("away_form", "")
    home_xg = enriched.get("home_xg", 1.5)
    away_xg = enriched.get("away_xg", 1.5)
    home_xga = enriched.get("home_xga", 1.0)
    away_xga = enriched.get("away_xga", 1.0)
    home_form_str = "".join(home_form)
    away_form_str = "".join(away_form)
    home_formation = enriched.get("home_formation", "4-3-3")
    away_formation = enriched.get("away_formation", "4-3-3")
    press = enriched.get("press_trigger", "Mid-block counter")
    set_piece = enriched.get("set_piece_pattern", "Near-post flick-ons")
    injuries = enriched.get("injuries", [])
    
    keys = []
    
    # Key 1: Formation/structure matchup
    if home_formation.startswith("3") and away_formation.startswith("4"):
        keys.append(f"{home} back-three vs {away} front-two creates 3v2 overload in build-up")
    elif home_formation.startswith("4") and away_formation.startswith("3"):
        keys.append(f"{away} wing-backs vs {home} wide forwards — battle for half-space dominance")
    elif "4-2-3-1" in home_formation and "4-3-3" in away_formation:
        keys.append(f"{home} double pivot screens {away} midfield three — control tempo through {home.split()[-1]}")
    else:
        keys.append(f"{home} {home_formation} vs {away} {away_formation} — {press.lower()} dictates first-half rhythm")
    
    # Key 2: Key player battle (based on xG/xGA)
    if home_xg > away_xg + 0.3:
        keys.append(f"{home} attack ({home_xg:.2f} xG/90) targets {away} vulnerable wide channels ({away_xga:.2f} xGA)")
    elif away_xg > home_xg + 0.3:
        keys.append(f"{away} counter-threat ({away_xg:.2f} xG) exploits {home} high line ({home_xga:.2f} xGA conceded)")
    else:
        keys.append(f"Balanced xG battle ({home_xg:.2f} vs {away_xg:.2f}) — first goal likely from {set_piece.lower()}")
    
    # Key 3: Manager adjustment / transition / injuries
    if injuries:
        inj = injuries[0]
        team = inj.split(":")[0]
        role = inj.split(":")[1].strip().split()[0]
        opp = away if team == home else home
        keys.append(f"{team} missing {role} forces {opp} to shift press trigger — expect {press.lower()} adjustment at HT")
    else:
        keys.append(f"Zero key absences — {press.lower()} vs transition duel decides; {set_piece.lower()} wildcard for set-piece xG")
    
    return keys[:3]


def generate_player_watch(match: dict) -> dict:
    """Select best player to watch with prop recommendation."""
    enriched = match.get("enriched", {})
    player_props = enriched.get("player_props", {})
    home = match["home_team"]
    away = match["away_team"]
    home_xg = enriched.get("home_xg", 1.5)
    away_xg = enriched.get("away_xg", 1.5)
    
    # Score each player: higher xG team + better prop odds
    best_player = None
    best_score = -1
    
    for player, props in player_props.items():
        is_home = player.startswith(home)
        team_xg = home_xg if is_home else away_xg
        scorer_odds = props.get("anytime_scorer", 4.0)
        shots_odds = props.get("shots_on_target", 2.0)
        # Lower odds = higher probability, but we want value
        score = team_xg * (4.0 / scorer_odds) * (2.5 / shots_odds)
        if score > best_score:
            best_score = score
            best_player = {
                "name": player,
                "team": home if is_home else away,
                "scorer_odds": scorer_odds,
                "shots_odds": shots_odds,
                "card_odds": props.get("to_be_card", 4.0)
            }
    
    if not best_player and player_props:
        # Fallback
        p = list(player_props.items())[0]
        best_player = {
            "name": p[0], "team": home,
            "scorer_odds": p[1]["anytime_scorer"],
            "shots_odds": p[1]["shots_on_target"],
            "card_odds": p[1]["to_be_card"]
        }
    
    return best_player


def generate_betting_angle(match: dict, player_watch: dict) -> dict:
    """Generate single best betting angle with Kelly stake."""
    enriched = match.get("enriched", {})
    odds = enriched.get("odds", {})
    home = match["home_team"]
    away = match["away_team"]
    home_xg = enriched.get("home_xg", 1.5)
    away_xg = enriched.get("away_xg", 1.5)
    home_form = enriched.get("home_form", "")
    away_form = enriched.get("away_form", "")
    injuries = enriched.get("injuries", [])
    
    home_odds = odds.get("home", 2.0)
    draw_odds = odds.get("draw", 3.5)
    away_odds = odds.get("away", 3.5)
    
    # Simple model: compare implied prob vs xG-based fair odds
    total_xg = home_xg + away_xg
    home_win_prob = home_xg / total_xg * 0.55 + 0.2  # rough mapping
    draw_prob = 0.25
    away_win_prob = away_xg / total_xg * 0.55 + 0.2
    # Normalize
    s = home_win_prob + draw_prob + away_win_prob
    home_win_prob /= s
    draw_prob /= s
    away_win_prob /= s
    
    home_implied = 1 / home_odds
    draw_implied = 1 / draw_odds
    away_implied = 1 / away_odds
    s2 = home_implied + draw_implied + away_implied
    home_implied /= s2
    draw_implied /= s2
    away_implied /= s2
    
    # Find best edge
    edges = {
        f"{home} ML": home_win_prob - home_implied,
        "Draw": draw_prob - draw_implied,
        f"{away} ML": away_win_prob - away_implied,
    }
    
    # Player prop edge
    scorer_odds = player_watch["scorer_odds"]
    scorer_implied = 1 / scorer_odds
    # Assume model gives 35% for good striker
    scorer_edge = 0.35 - scorer_implied
    edges[f"{player_watch['name']} Anytime Scorer"] = scorer_edge
    
    best_market = max(edges, key=edges.get)
    best_edge = edges[best_market]
    
    # Kelly stake (fractional Kelly 0.25 for safety)
    if "Scorer" in best_market:
        kelly_odds = scorer_odds
        kelly_prob = 0.35
    elif "Draw" in best_market:
        kelly_odds = draw_odds
        kelly_prob = draw_prob
    elif home in best_market:
        kelly_odds = home_odds
        kelly_prob = home_win_prob
    else:
        kelly_odds = away_odds
        kelly_prob = away_win_prob
    
    kelly_fraction = (kelly_prob * kelly_odds - 1) / (kelly_odds - 1) if kelly_odds > 1 else 0
    kelly_stake = max(0, min(kelly_fraction * 0.25, 0.05)) * 100  # cap at 5%
    
    # Rationale
    form_note = f"{home} {home_form} vs {away} {away_form}"
    injury_note = f", {injuries[0]}" if injuries else ""
    rationale = f"xG edge ({home_xg:.2f}-{away_xg:.2f}) + {form_note}{injury_note} → {best_market} @ {kelly_odds:.2f}"
    
    return {
        "market": best_market,
        "odds": round(kelly_odds, 2),
        "rationale": rationale,
        "kelly_stake_pct": round(kelly_stake, 1)
    }


HAIKU_TEMPLATES = [
    # Structure: 5-7-5 syllables (approx)
    "{home} hosts {away}\nEl Clasico writes new chapter\nHistory awaits",
    "White shirts, blue stripes clash\nBernabeu holds its breath now\nGlory finds a way",
    "Midfield generals dance\nPossession meets counter-press\nOne touch decides all",
    "Striker hunts the net\nDefender reads every run\nClean sheet or breakthrough",
    "Set piece routine works\nNear post flick finds head unmarked\nCorner kicks are gold",
    "First half cages match\nSecond half explodes wide open\nLate winner arrives",
    "Injury reshapes plan\nManager earns his money now\nTactical masterclass",
    "Odds shift sharp money\nModel sees what bookies miss\nValue in the lines",
]

def generate_haiku(match: dict) -> str:
    """Generate unique haiku not used before."""
    used = load_haiku_used()
    home = match["home_team"]
    away = match["away_team"]
    league = match["league"]
    
    # Try templates
    for template in HAIKU_TEMPLATES:
        haiku = template.format(home=home, away=away, league=league)
        if haiku not in used:
            used.append(haiku)
            save_haiku_used(used)
            return haiku
    
    # Fallback: generate deterministic unique haiku
    import time
    seed = f"{home}{away}{league}{int(time.time() // 86400)}"
    h = hashlib.md5(seed.encode()).hexdigest()
    
    lines_5 = [
        f"{home} rise at dawn",
        f"{away} hunt the win",
        "Midfield war begins",
        "Striker finds the net",
        "Keeper makes the save",
        "Fans roar loud and proud",
    ]
    lines_7 = [
        "Ball dances on sacred grass",
        "Tactics clash in formation",
        "Momentum swings both ways now",
        "Glory written in ninety",
        "History turns on one touch",
        "Champions rise from the dust",
    ]
    
    haiku = f"{lines_5[int(h[0], 16) % len(lines_5)]}\n{lines_7[int(h[1], 16) % len(lines_7)]}\n{lines_5[int(h[2], 16) % len(lines_5)]}"
    
    if haiku not in used:
        used.append(haiku)
        save_haiku_used(used)
    
    return haiku


def main():
    if not SELECTED_FILE.exists():
        print("[SYNTH] No selected match found")
        return 1
    
    match = json.loads(SELECTED_FILE.read_text())
    
    # Generate components
    tactical_keys = generate_tactical_keys(match)
    player_watch = generate_player_watch(match)
    betting_angle = generate_betting_angle(match, player_watch)
    haiku = generate_haiku(match)
    
    # Format player watch string
    player_str = f"{player_watch['name']} ({player_watch['team']}) — Scorer @ {player_watch['scorer_odds']:.2f} | Shots @ {player_watch['shots_odds']:.2f}"
    
    # Format betting angle
    ba = betting_angle
    angle_str = f"{ba['market']} @ {ba['odds']:.2f} — {ba['rationale']} — Kelly: {ba['kelly_stake_pct']:.1f}%"
    
    # Prepare final output
    final = {
        "match": {
            "id": match["id"],
            "home": match["home_team"],
            "away": match["away_team"],
            "league": match["league"],
            "kickoff_utc": match["kickoff_utc"],
            "venue": match["venue"],
            "date": datetime.fromisoformat(match["kickoff_utc"]).strftime("%d/%m"),
            "kickoff": datetime.fromisoformat(match["kickoff_utc"]).strftime("%H:%M"),
        },
        "tactical_keys": tactical_keys,
        "player_watch": player_str,
        "betting_angle": angle_str,
        "haiku": haiku,
        "enriched": match.get("enriched", {}),
        "generated_at": datetime.now().isoformat()
    }
    
    OUTPUT_FILE.write_text(json.dumps(final, indent=2))
    print(f"[SYNTH] Match preview synthesized → {OUTPUT_FILE}")
    print(f"  Tactical keys: {tactical_keys}")
    print(f"  Player watch: {player_str}")
    print(f"  Betting angle: {angle_str}")
    print(f"  Haiku: {haiku}")
    
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
