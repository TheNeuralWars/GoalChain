import json
import random

with open('/data/apps/GoalChain/docs/assets/data/players.json', 'r') as f:
    players = json.load(f)

legendary_mythic = [p for p in players if p['rarity'] in ['legendary', 'mythic']]
print(f'Total players: {len(players)}')
print(f'Legendary/Mythic players: {len(legendary_mythic)}')

recently_posted = ['Son Heung-Star', 'William Sali-Struct', 'Robert Lewan-Goal-ski', 'Salem Al-Icon']
available = [p for p in legendary_mythic if p['name'] not in recently_posted]
print(f'Available for posting: {len(available)}')

for p in available[:20]:
    print(f'  {p["name"]} ({p["rarity"]}) - {p["position"]} - ATK:{p["stats"]["atk"]} DEF:{p["stats"]["def"]} HYPE:{p["stats"]["hype"]} - {p["real_name"]}')

selected = random.choice(available)
print()
print(f'Randomly selected: {selected["name"]} ({selected["rarity"]})')

# Save selected player to a temp file for the next script
with open('/data/apps/GoalChain/scratch/selected_player.json', 'w') as f:
    json.dump(selected, f)
