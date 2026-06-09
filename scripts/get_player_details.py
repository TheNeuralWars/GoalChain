import json

with open('/data/apps/GoalChain/docs/assets/data/players.json', 'r') as f:
    players = json.load(f)

for p in players:
    if p['name'] == 'Trent Cross-Arnold':
        with open('/data/apps/GoalChain/scratch/trent_details.json', 'w') as out:
            json.dump(p, out, indent=2)
        print(json.dumps(p, indent=2))
        break
