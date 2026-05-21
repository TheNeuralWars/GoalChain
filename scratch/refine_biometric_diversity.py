import json
import random

PLAYERS_FILE = "/Users/NicoPez/GoalChain/ai_context/players.json"

HAIRSTYLES = ["Buzz cut", "Low fade", "Mid fade", "High fade", "Crew cut", "Short curly hair", "Tapered sides", "Short wavy hair", "Textured crop", "Slicked back hair"]
FACIAL_HAIR = ["clean shaven", "light stubble", "defined goatee", "thin mustache", "short beard", "clean shaven"] # Repeat clean shaven as it's common
BUILDS = ["wiry athletic build", "stocky powerful build", "lithe agile build", "broad-shouldered athletic build", "lean muscular build", "strong athletic build"]
EXPRESSIONS = ["focused", "intense", "determined", "calm", "energetic", "commanding", "competitive"]

def refine_all_biometrics():
    with open(PLAYERS_FILE, 'r') as f:
        players = json.load(f)
    
    updated_count = 0
    for p in players:
        trait = p.get("physical", {}).get("t", "")
        
        # We only refine the ones that look "standard"
        if "Short dark hair, clean shaven" in trait or "Short dark hair, clean shaven" in trait:
            hair = random.choice(HAIRSTYLES)
            beard = random.choice(FACIAL_HAIR)
            build = random.choice(BUILDS)
            expr = random.choice(EXPRESSIONS)
            
            # Keep the existing skin tone if present
            skin = "tanned skin"
            if "dark skin" in trait: skin = "dark skin tone"
            elif "fair skin" in trait: skin = "fair skin tone"
            elif "olive skin" in trait: skin = "olive skin tone"
            elif "bronze skin" in trait: skin = "bronze skin tone"
            
            real_name = p.get("real_name", "the player")
            
            new_trait = f"{hair}, {beard}, {build}, {skin}, {expr} gaze of {real_name}."
            p["physical"]["t"] = new_trait
            updated_count += 1
            
    with open(PLAYERS_FILE, 'w') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Refined and diversified {updated_count} players with unique style combinations.")

if __name__ == "__main__":
    refine_all_biometrics()
