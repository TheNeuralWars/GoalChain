import os
import requests

API_KEY = os.getenv("RAPIDAPI_KEY")
BASE_URL = os.getenv("RAPIDAPI_HOST_FOOTBALL", "free-api-live-football-data.p.rapidapi.com")

print(f"API_KEY: {API_KEY[:10]}..." if API_KEY else "NOT SET")
print(f"BASE_URL: {BASE_URL}")

HEADERS = {"X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": BASE_URL} if API_KEY else {}

# Try a simple endpoint - search for leagues
resp = requests.get(f"https://{BASE_URL}/football-get-all-leagues", headers=HEADERS, timeout=15)
print(f"Leagues endpoint: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Response keys: {data.keys()}")
    if "leagues" in data:
        print(f"Total leagues: {len(data['leagues'])}")
        for l in data["leagues"][:5]:
            print(f"  - {l.get('league_name', l.get('name', 'N/A'))} (ID: {l.get('league_id', l.get('id', 'N/A'))})")
else:
    print(resp.text[:500])