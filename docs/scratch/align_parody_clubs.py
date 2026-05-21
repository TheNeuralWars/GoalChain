import json
import os

# Define the paths to both players.json files in the workspace
paths = [
    '/Users/NicoPez/GoalChain/docs/assets/data/players.json',
    '/Users/NicoPez/GoalChain/ai_context/03_data/players.json'
]

# Precise mappings of real-life names to authentic, fun, lore-rich parody clubs
club_mappings = {
    "Lionel Messi": "Miami Pink Nodes",
    "Kylian Mbappé": "Madrid White Ledger",
    "Jude Bellingham": "Madrid White Ledger",
    "Vinícius Júnior": "Madrid White Ledger",
    "Luka Modrić": "Madrid White Ledger",
    "Federico Valverde": "Madrid White Ledger",
    "Cristiano Ronaldo": "Riyadh Victory Nodes",
    "Neymar Jr.": "Riyadh Crescent Chain",
    "Rodri": "Manchester Sky-Blue Hash",
    "Erling Haaland": "Manchester Sky-Blue Hash",
    "Kevin De Bruyne": "Manchester Sky-Blue Hash",
    "Bernardo Silva": "Manchester Sky-Blue Hash",
    "Harry Kane": "Bavarian Cyber-Machine",
    "Robert Lewandowski": "Barcelona Garnet Block",
    "Mohamed Salah": "Liverpool Crimson Kop",
    "Enzo Fernández": "London Blue Nodes",
    "Julián Álvarez": "Madrid Mattress DAO",
    "Rodrigo De Paul": "Madrid Mattress DAO",
    "Emiliano Martínez": "Birmingham Lion Core",
    "Lautaro Martínez": "Milan Biscione Block",
    "Alexis Mac Allister": "Liverpool Crimson Kop",
    "Cristian Romero": "London Cockerel Nodes",
    "Lisandro Martínez": "Manchester Red Devils DAO",
    "Antoine Griezmann": "Madrid Mattress DAO",
    "Nicolás Tagliafico": "Milan Devil Core",
    "Jules Koundé": "Barcelona Garnet Block",
    "Theo Hernández": "Milan Devil Core",
    "Mike Maignan": "Milan Devil Core",
    "Aurélien Tchouaméni": "Madrid White Ledger",
    "William Saliba": "London Cannon Nodes", # Arsenal parody
    "Dayot Upamecano": "Bavarian Cyber-Machine",
    "Adrien Rabiot": "Turin Zebra Grid",
    "Bukayo Saka": "London Cannon Nodes",
    "Phil Foden": "Manchester Sky-Blue Hash",
    "Declan Rice": "London Cannon Nodes",
    "Martin Ødegaard": "London Cannon Nodes"
}

def update_players_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False
        
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error reading JSON from {file_path}: {e}")
            return False

    updated_count = 0
    for player in data:
        real_name = player.get("real_name")
        if real_name in club_mappings:
            target_club = club_mappings[real_name]
            # Ensure the meta object exists
            if "meta" not in player:
                player["meta"] = {}
            
            old_club = player["meta"].get("parody_club", "None")
            player["meta"]["parody_club"] = target_club
            updated_count += 1
            print(f"Updated {real_name}: {old_club} -> {target_club}")
            
            # If the narrative is present, let's also update it to reflect the correct club
            if "narrative" in player["meta"]:
                player["meta"]["narrative"] = player["meta"]["narrative"].replace(old_club, target_club)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully updated {updated_count} players in {file_path}\n")
    return True

for path in paths:
    update_players_file(path)
