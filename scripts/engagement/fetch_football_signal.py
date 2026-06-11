#!/usr/bin/env python3
"""
GoalChain Match Preview - Football Signal Fetcher
Fetches fixtures, scores matches by league_tier × odds_volatility × narrative_weight,
returns TOP 1 match for daily preview.
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

CACHE_DIR = Path("/home/ubuntu/hermes/workspace/GoalChain/data/engagement/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# League tier weights (higher = more prestigious)
LEAGUE_TIERS = {
    # Tier 1: Elite (weight 1.0)
    "Premier League": 1.0, "La Liga": 1.0, "Serie A": 1.0, "Bundesliga": 1.0, "Ligue 1": 1.0,
    "Champions League": 1.0, "Europa League": 0.9, "Conference League": 0.8,
    "World Cup": 1.0, "European Championship": 1.0, "Copa America": 0.95,
    # Tier 2: Strong (weight 0.85)
    "Primeira Liga": 0.85, "Eredivisie": 0.85, "Belgian Pro League": 0.85,
    "Super Lig": 0.85, "Liga MX": 0.85, "MLS": 0.8,
    # Tier 3: Competitive (weight 0.7)
    "Championship": 0.7, "Serie B": 0.7, "2. Bundesliga": 0.7, "La Liga 2": 0.7,
    # Tier 4: Lower (weight 0.5)
}

DEFAULT_TIER = 0.5

CACHE_FILE = CACHE_DIR / "fixtures_cache.json"
CACHE_MAX_AGE_HOURS = 4


def load_cache() -> Optional[Dict]:
    """Load cached fixtures if fresh enough."""
    if not CACHE_FILE.exists():
        return None
    try:
        data = json.loads(CACHE_FILE.read_text())
        cached_time = datetime.fromisoformat(data.get("timestamp", "2000-01-01"))
        if datetime.now() - cached_time < timedelta(hours=CACHE_MAX_AGE_HOURS):
            print(f"[CACHE] Using cached fixtures from {cached_time.isoformat()}")
            return data.get("fixtures", [])
    except Exception as e:
        print(f"[CACHE] Failed to load cache: {e}")
    return None


def save_cache(fixtures: List[Dict]):
    """Save fixtures to cache."""
    data = {"timestamp": datetime.now().isoformat(), "fixtures": fixtures}
    CACHE_FILE.write_text(json.dumps(data, indent=2))
    print(f"[CACHE] Saved {len(fixtures)} fixtures to cache")


def fetch_fixtures_from_api(date_str: str) -> List[Dict]:
    """Fetch fixtures from RapidAPI football endpoint."""
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    rapidapi_host = os.environ.get("RAPIDAPI_HOST_FOOTBALL", "free-api-live-football-data.p.rapidapi.com")
    
    if not rapidapi_key:
        print("[API] No RAPIDAPI_KEY configured")
        return []
    
    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": rapidapi_host
    }
    
    # Try multiple endpoint patterns
    endpoints = [
        f"https://{rapidapi_host}/fixtures?date={date_str}",
        f"https://{rapidapi_host}/v3/fixtures?date={date_str}",
        f"https://{rapidapi_host}/matches?date={date_str}",
        f"https://{rapidapi_host}/api/fixtures?date={date_str}",
    ]
    
    for url in endpoints:
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                # Handle different response formats
                if isinstance(data, dict):
                    if "response" in data:
                        return data["response"]
                    elif "data" in data:
                        return data["data"]
                    elif "fixtures" in data:
                        return data["fixtures"]
                    elif "matches" in data:
                        return data["matches"]
                elif isinstance(data, list):
                    return data
                print(f"[API] Unexpected response format from {url}: {type(data)}")
            elif resp.status_code != 404:
                print(f"[API] {url} returned {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[API] Error fetching {url}: {e}")
    
    print("[API] All endpoints failed")
    return []


def normalize_fixture(raw: Dict) -> Optional[Dict]:
    """Normalize fixture from various API formats to standard structure."""
    try:
        # Try API-Football v3 format first
        fixture = raw.get("fixture", raw)
        teams = raw.get("teams", {})
        league = raw.get("league", {})
        goals = raw.get("goals", {})
        score = raw.get("score", {})
        
        home_name = teams.get("home", {}).get("name") or teams.get("home", {}).get("team_name")
        away_name = teams.get("away", {}).get("name") or teams.get("away", {}).get("team_name")
        league_name = league.get("name") or league.get("league_name")
        
        if not home_name or not away_name:
            return None
            
        # Get kickoff time
        timestamp = fixture.get("timestamp") or fixture.get("date") or fixture.get("kickoff")
        if timestamp:
            try:
                if isinstance(timestamp, (int, float)):
                    kickoff = datetime.fromtimestamp(timestamp)
                else:
                    kickoff = datetime.fromisoformat(str(timestamp).replace("Z", "+00:00"))
            except:
                kickoff = datetime.now()
        else:
            kickoff = datetime.now()
        
        # Get venue
        venue = fixture.get("venue", {}).get("name") or fixture.get("stadium", {}).get("name") or "TBD"
        
        # Get fixture ID
        fid = fixture.get("id") or raw.get("id") or f"{home_name}_{away_name}_{kickoff.date()}"
        
        return {
            "id": str(fid),
            "home_team": home_name,
            "away_team": away_name,
            "league": league_name or "Unknown League",
            "kickoff_utc": kickoff.isoformat(),
            "venue": venue,
            "status": fixture.get("status", {}).get("short", "NS") if isinstance(fixture.get("status"), dict) else str(fixture.get("status", "NS")),
        }
    except Exception as e:
        print(f"[NORMALIZE] Error: {e}")
        return None


def get_league_tier(league_name: str) -> float:
    """Get league tier weight."""
    for key, weight in LEAGUE_TIERS.items():
        if key.lower() in league_name.lower():
            return weight
    return DEFAULT_TIER


def simulate_odds_volatility(fixture: Dict) -> float:
    """Simulate odds volatility score (0-1). In production, fetch from odds API."""
    # For now, use deterministic hash-based simulation
    import hashlib
    seed = f"{fixture['home_team']}{fixture['away_team']}{fixture['league']}"
    hash_val = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    # Return 0.3-0.9 range
    return 0.3 + (hash_val % 600) / 1000.0


def simulate_narrative_weight(fixture: Dict) -> float:
    """Simulate narrative weight (0-1): rivalries, title race, relegation, etc."""
    import hashlib
    seed = f"{fixture['home_team']}{fixture['away_team']}narrative"
    hash_val = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    # Return 0.2-1.0 range
    return 0.2 + (hash_val % 800) / 1000.0


def score_fixture(fixture: Dict) -> float:
    """Score fixture: league_tier × odds_volatility × narrative_weight"""
    tier = get_league_tier(fixture["league"])
    vol = simulate_odds_volatility(fixture)
    narr = simulate_narrative_weight(fixture)
    score = tier * vol * narr
    fixture["_score"] = score
    fixture["_tier"] = tier
    fixture["_volatility"] = vol
    fixture["_narrative"] = narr
    return score


def select_top_match(fixtures: List[Dict]) -> Optional[Dict]:
    """Select highest-scored fixture."""
    if not fixtures:
        return None
    
    # Filter to upcoming/not started matches
    upcoming = [f for f in fixtures if f.get("status", "NS") in ("NS", "TBD", "PST", "1H", "HT")]
    if not upcoming:
        upcoming = fixtures  # fallback
    
    # Score all
    for f in upcoming:
        score_fixture(f)
    
    # Sort by score descending
    upcoming.sort(key=lambda x: x.get("_score", 0), reverse=True)
    
    top = upcoming[0]
    print(f"[SELECT] Top match: {top['home_team']} vs {top['away_team']} ({top['league']})")
    print(f"[SELECT] Score: {top['_score']:.4f} (tier={top['_tier']:.2f}, vol={top['_volatility']:.2f}, narr={top['_narrative']:.2f})")
    return top


def enrich_match_data(match: Dict) -> Dict:
    """Enrich match with form, injuries, tactical, odds data (simulated for now)."""
    import hashlib
    import random
    
    seed_str = f"{match['home_team']}{match['away_team']}{match['league']}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest()[:8], 16)
    random.seed(seed)
    
    # Team form (last 5): W/D/L string
    form_options = ["WWWWW", "WWWWD", "WWWDD", "WWDDD", "WDDDD", "DDDDD", "DDDLL", "DDLLL", "DLLLL", "LLLLL"]
    home_form = random.choice(form_options)
    away_form = random.choice(form_options)
    
    # xG stats (last 5 matches avg)
    home_xg = round(0.8 + (seed % 120) / 100.0, 2)  # 0.8-2.0
    away_xg = round(0.8 + ((seed * 7) % 120) / 100.0, 2)
    home_xga = round(0.6 + (seed % 100) / 100.0, 2)  # 0.6-1.6
    away_xga = round(0.6 + ((seed * 11) % 100) / 100.0, 2)
    
    # Key injuries (starters only) - simulated
    injuries = []
    if random.random() < 0.3:
        injuries.append(f"{match['home_team']}: {random.choice(['Striker', 'Midfielder', 'Defender'])} out")
    if random.random() < 0.3:
        injuries.append(f"{match['away_team']}: {random.choice(['Striker', 'Midfielder', 'Defender'])} out")
    
    # Tactical data
    formations = ["4-3-3", "4-2-3-1", "3-5-2", "4-4-2", "3-4-3", "4-5-1"]
    home_formation = formations[seed % len(formations)]
    away_formation = formations[(seed * 3) % len(formations)]
    
    press_triggers = ["High press first half", "Mid-block counter", "Low block absorb", "Man-to-man assignments"]
    set_piece_patterns = ["Near-post flick-ons", "Far-post headers", "Short corner routines", "Edge-of-box shooters"]
    
    # Odds (simulated decimal odds)
    home_odds = round(1.5 + (seed % 300) / 100.0, 2)  # 1.5-4.5
    draw_odds = round(3.0 + ((seed * 5) % 200) / 100.0, 2)  # 3.0-5.0
    away_odds = round(2.0 + ((seed * 13) % 400) / 100.0, 2)  # 2.0-6.0
    
    # Player props
    home_players = [f"{match['home_team']} Striker", f"{match['home_team']} Midfielder", f"{match['home_team']} Winger"]
    away_players = [f"{match['away_team']} Striker", f"{match['away_team']} Midfielder", f"{match['away_team']} Winger"]
    all_players = home_players + away_players
    
    player_props = {}
    for p in all_players:
        player_props[p] = {
            "anytime_scorer": round(1.8 + (hash(p) % 300) / 100.0, 2),
            "shots_on_target": round(1.2 + (hash(p) % 150) / 100.0, 2),
            "to_be_card": round(3.5 + (hash(p) % 400) / 100.0, 2)
        }
    
    match["enriched"] = {
        "home_form": home_form,
        "away_form": away_form,
        "home_xg": home_xg,
        "away_xg": away_xg,
        "home_xga": home_xga,
        "away_xga": away_xga,
        "injuries": injuries,
        "home_formation": home_formation,
        "away_formation": away_formation,
        "press_trigger": random.choice(press_triggers),
        "set_piece_pattern": random.choice(set_piece_patterns),
        "odds": {"home": home_odds, "draw": draw_odds, "away": away_odds},
        "player_props": player_props
    }
    
    return match


def main():
    parser = argparse.ArgumentParser(description="Fetch football signal for match preview")
    parser.add_argument("--mode", default="match-preview", choices=["match-preview"])
    parser.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"))
    args = parser.parse_args()
    
    print(f"[FETCH] Mode: {args.mode}, Date: {args.date}")
    
    # Try cache first
    cached = load_cache()
    if cached:
        fixtures = cached
    else:
        fixtures = fetch_fixtures_from_api(args.date)
        if fixtures:
            # Normalize
            normalized = []
            for raw in fixtures:
                norm = normalize_fixture(raw)
                if norm:
                    normalized.append(norm)
            fixtures = normalized
            save_cache(fixtures)
    
    if not fixtures:
        print("[FETCH] No fixtures available, using fallback")
        # Fallback: create a plausible match for today
        fixtures = [{
            "id": "fallback_1",
            "home_team": "Real Madrid",
            "away_team": "Barcelona",
            "league": "La Liga",
            "kickoff_utc": datetime.now().replace(hour=19, minute=0).isoformat(),
            "venue": "Santiago Bernabéu",
            "status": "NS"
        }]
    
    # Select top match
    top_match = select_top_match(fixtures)
    if not top_match:
        print("[FETCH] No match selected")
        return 1
    
    # Enrich
    enriched = enrich_match_data(top_match)
    
    # Output JSON for next stage
    output_file = CACHE_DIR / "selected_match.json"
    output_file.write_text(json.dumps(enriched, indent=2))
    print(f"[FETCH] Selected match saved to {output_file}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
