import json

path = '/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json'

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_players = {
    34: {"name": "Gabriel Crypto-Jesus", "country": "Brasil", "rarity": "epic", "pos": "FWD", "num": 9, "stats": [84, 40, 82]},
    35: {"name": "Vinicius Burner Jr", "country": "Brasil", "rarity": "legendary", "pos": "FWD", "num": 7, "stats": [94, 35, 98]},
    36: {"name": "Rodrygo Ledger", "country": "Brasil", "rarity": "epic", "pos": "FWD", "num": 11, "stats": [88, 42, 89]},
    37: {"name": "Neymar Swap", "country": "Brasil", "rarity": "legendary", "pos": "MID", "num": 10, "stats": [91, 30, 99]},
    38: {"name": "Luka Bit-modrich", "country": "Croacia", "rarity": "mythic", "pos": "MID", "num": 10, "stats": [88, 75, 95]},
    39: {"name": "Robert Lewan-DAO-ski", "country": "Polonia", "rarity": "legendary", "pos": "FWD", "num": 9, "stats": [93, 40, 92]},
    40: {"name": "Son Heung-Mint", "country": "Corea del Sur", "rarity": "epic", "pos": "FWD", "num": 7, "stats": [89, 45, 94]},
    41: {"name": "Harry Chain", "country": "Inglaterra", "rarity": "legendary", "pos": "FWD", "num": 9, "stats": [92, 40, 88]},
    42: {"name": "Jude Whale-ingham", "country": "Inglaterra", "rarity": "mythic", "pos": "MID", "num": 5, "stats": [86, 78, 96]},
    43: {"name": "Bukayo Stock", "country": "Inglaterra", "rarity": "epic", "pos": "FWD", "num": 7, "stats": [87, 50, 93]}
}

for player in data:
    if player['id'] in new_players:
        np = new_players[player['id']]
        player['name'] = np['name']
        player['country'] = np['country']
        player['rarity'] = np['rarity']
        player['position'] = np['pos']
        player['number'] = np['num']
        player['stats'] = {"atk": np['stats'][0], "def": np['stats'][1], "hype": np['stats'][2]}
        player['oracle_sync']['last_sync'] = "2026-05-12T20:13:24Z"

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Updated players 34-43 successfully.")
