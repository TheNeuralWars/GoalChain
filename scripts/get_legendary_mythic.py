import json

with open('/data/apps/GoalChain/docs/assets/data/players.json') as f:
    players = json.load(f)

legendary_mythic = [p for p in players if p.get('rarity') in ['legendary', 'mythic']]
print(f"Total players: {len(players)}")
print(f"Legendary/Mythic players: {len(legendary_mythic)}")
for p in legendary_mythic:
    print(f"{p['name']} ({p['rarity']}) - {p['position']} - ATK:{p['stats']['atk']} DEF:{p['stats']['def']} HYPE:{p['stats']['hype']} - {p['physical']['h']}/{p['physical']['w']} - Traits: {p['traits']}")
