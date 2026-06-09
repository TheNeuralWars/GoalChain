#!/usr/bin/env python3
"""
Football Signal Fetcher for GoalChain Daily Engagement
Fetches ONE high-signal football stat daily for Alpha Signal fusion.

Uses API-Football (RapidAPI) — free tier: 100 requests/day.
"""

import os
import json
import sys
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Load env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_KEY = os.getenv("FOOTBALL_API_KEY") or os.getenv("RAPIDAPI_KEY")
BASE_URL = "https://api-football-v1.p.rapidapi.com/v3"
HEADERS = {"X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"} if API_KEY else {}

# Priority leagues for GoalChain niche
PRIORITY_LEAGUES = {
    39: "Premier League", 140: "La Liga", 135: "Serie A", 78: "Bundesliga",
    61: "Ligue 1", 2: "Champions League", 3: "Europa League", 848: "Conference League",
    13: "Copa Libertadores", 14: "Copa Sudamericana", 128: "Argentine Primera",
    253: "MLS", 94: "Primeira Liga", 88: "Eredivisie", 144: "Belgian Pro League"
}

STATE_FILE = Path(__file__).resolve().parent.parent / "data" / "engagement" / "football_signal_state.json"

def load_state():
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"used_signals": [], "last_fetch": None}

def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def api_get(endpoint, params=None):
    if not API_KEY:
        return {"error": "No API key configured"}
    url = f"{BASE_URL}/{endpoint}"
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def fetch_todays_fixtures():
    """Get today's + tomorrow's fixtures for priority leagues"""
    today = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    fixtures = []
    for league_id in PRIORITY_LEAGUES:
        for date in [today, tomorrow]:
            data = api_get("fixtures", {"league": league_id, "season": 2025, "date": date, "status": "NS"})  # Not Started
            if "response" in data:
                for f in data["response"]:
                    fixtures.append({
                        "fixture_id": f["fixture"]["id"],
                        "date": f["fixture"]["date"],
                        "league": f["league"]["name"],
                        "country": f["league"]["country"],
                        "home": f["teams"]["home"]["name"],
                        "away": f["teams"]["away"]["name"],
                        "home_id": f["teams"]["home"]["id"],
                        "away_id": f["teams"]["away"]["id"],
                        "venue": f["fixture"]["venue"]["name"],
                        "round": f["league"]["round"]
                    })
    return fixtures

def fetch_injuries(team_id):
    data = api_get("injuries", {"team": team_id})
    if "response" in data:
        return data["response"]
    return []

def fetch_team_form(team_id, last=5):
    data = api_get("fixtures", {"team": team_id, "last": last, "status": "FT"})
    if "response" in data:
        return data["response"]
    return []

def fetch_odds(fixture_id):
    data = api_get("odds", {"fixture": fixture_id, "bookmaker": "5"})  # Bet365
    if "response" in data and data["response"]:
        return data["response"][0]
    return None

def score_football_signal(fixture, injuries_home, injuries_away, form_home, form_away, odds):
    """Score a fixture for signal quality"""
    score = 0
    signals = []
    
    # 1. Key injury (starter missing)
    key_injuries = [i for i in injuries_home + injuries_away if i.get("type") == "Injury" and i.get("player")]
    if key_injuries:
        score += 30
        signals.append(("injury", f"{key_injuries[0]['player']['name']} ({key_injuries[0]['player']['position']}) out for {fixture['home' if key_injuries[0] in injuries_home else 'away']}"))
    
    # 2. Form streak
    def get_form_results(fixtures, team_id):
        results = []
        for f in fixtures:
            if f["teams"]["home"]["id"] == team_id:
                if f["goals"]["home"] > f["goals"]["away"]: results.append("W")
                elif f["goals"]["home"] < f["goals"]["away"]: results.append("L")
                else: results.append("D")
            elif f["teams"]["away"]["id"] == team_id:
                if f["goals"]["away"] > f["goals"]["home"]: results.append("W")
                elif f["goals"]["away"] < f["goals"]["home"]: results.append("L")
                else: results.append("D")
        return "".join(results)
    
    form_h = get_form_results(form_home, fixture["home_id"])
    form_a = get_form_results(form_away, fixture["away_id"])
    if "WWWW" in form_h or "WWWW" in form_a:
        score += 25
        signals.append(("form", f"{fixture['home' if 'WWWW' in form_h else 'away']} on 4+ win streak"))
    elif "LLLL" in form_h or "LLLL" in form_a:
        score += 20
        signals.append(("form", f"{fixture['home' if 'LLLL' in form_h else 'away']} on 4+ loss streak"))
    
    # 3. Odds movement (sharp line move)
    if odds and "bookmakers" in odds:
        for bm in odds["bookmakers"]:
            for bet in bm.get("bets", []):
                if bet["name"] == "Match Winner":
                    for outcome in bet["values"]:
                        if float(outcome["odd"]) > 3.0 and outcome["value"] in ["Home", "Away"]:
                            score += 15
                            signals.append(("odds", f"Value on {outcome['value']} @ {outcome['odd']}"))
    
    # 4. Narrative weight (derby, title race, relegation, knockout)
    round_lower = fixture.get("round", "").lower()
    if any(kw in round_lower for kw in ["derby", "clásico", "final", "knockout", "quarter", "semi"]):
        score += 20
        signals.append(("narrative", f"High-stakes: {fixture['round']}"))
    
    return score, signals

def get_best_signal():
    """Main entry: returns dict with best football signal"""
    state = load_state()
    used_fixtures = set(state.get("used_signals", []))
    
    fixtures = fetch_todays_fixtures()
    if not fixtures:
        return {"error": "No fixtures found", "fallback": True}
    
    best = None
    best_score = -1
    best_signals = []
    
    for fx in fixtures:
        if fx["fixture_id"] in used_fixtures:
            continue
        
        # Fetch enrichment (parallel-ish via sequential for simplicity)
        injuries_h = fetch_injuries(fx["home_id"])
        injuries_a = fetch_injuries(fx["away_id"])
        form_h = fetch_team_form(fx["home_id"])
        form_a = fetch_team_form(fx["away_id"])
        odds = fetch_odds(fx["fixture_id"])
        
        score, signals = score_football_signal(fx, injuries_h, injuries_a, form_h, form_a, odds)
        
        if score > best_score and signals:
            best_score = score
            best = fx
            best_signals = signals
    
    if not best:
        # Fallback: pick highest profile fixture
        best = max(fixtures, key=lambda f: list(PRIORITY_LEAGUES.values()).index(f["league"]) if f["league"] in PRIORITY_LEAGUES.values() else 999)
        best_signals = [("narrative", f"Top fixture: {best['home']} vs {best['away']} ({best['league']})")]
    
    # Mark as used
    state["used_signals"].append(best["fixture_id"])
    state["last_fetch"] = datetime.now().isoformat()
    # Keep only last 30
    state["used_signals"] = state["used_signals"][-30:]
    save_state(state)
    
    return {
        "fixture": best,
        "signals": best_signals,
        "score": best_score,
        "primary_signal": best_signals[0] if best_signals else ("narrative", "No specific signal")
    }

if __name__ == "__main__":
    result = get_best_signal()
    print(json.dumps(result, indent=2))