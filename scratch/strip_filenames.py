import json

file_path = "docs/assets/data/players.json"

with open(file_path, "r", encoding="utf-8") as f:
    players = json.load(f)

for player in players:
    if "filename" in player:
        del player["filename"]

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(players, f, ensure_ascii=False, indent=2)

print("Successfully removed 'filename' from all players.")
