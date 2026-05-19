import os
import json
import shutil

BASE_DIR = "/Users/NicoPez/GoalChain"
RENDERS_DIR = os.path.join(BASE_DIR, "assets/final_renders/players")
OUTPUT_DIR = os.path.join(BASE_DIR, "docs/assets/img/nfts")
PLAYERS_JSON = os.path.join(BASE_DIR, "docs/assets/data/players.json")
PLAYERS_BACKUP_JSON = os.path.join(BASE_DIR, "docs/assets/data/players_backup.json")
NFT_METADATA_INDEX_JSON = os.path.join(BASE_DIR, "docs/assets/data/nft_metadata_index.json")
MASTER_MATCHING_JSON = os.path.join(BASE_DIR, "ai_context/goalchain_master_matching_v6_full.json")

# Define the exact 33 similar players + Weston McKennie (ID 90)
SIMILAR_PLAYERS = {
    1: {"filename": "DxjaQ.jpg", "confianza": 82, "observaciones": "Barba espesa, mirada intensa"},
    2: {"filename": "eK3bc.jpg", "confianza": 87, "observaciones": "Tatuaje visible pierna izq."},
    3: {"filename": "DncFG.jpg", "confianza": 90, "observaciones": "Fade clásico, complexión compacta"},
    4: {"filename": "BhTBc.jpg", "confianza": 88, "observaciones": "Tatuajes visibles, fade burst"},
    5: {"filename": "5C8GN.jpg", "confianza": 85, "observaciones": "Expresión apasionada, tatuajes"},
    6: {"filename": "ZkyHt.jpg", "confianza": 83, "observaciones": "Cabello clásico, piel oliva"},
    7: {"filename": "QqMAA.jpg", "confianza": 91, "observaciones": "Buzz cut + barba rojiza"},
    8: {"filename": "qEwxs.jpg", "confianza": 92, "observaciones": "Barba corta, mirada intimidante"},
    9: {"filename": "UP3Bf.jpg", "confianza": 88, "observaciones": "Cabello shaggy, expresión agresiva"},
    10: {"filename": "5VJOb.jpg", "confianza": 90, "observaciones": "Fade limpio, complexión ágil"},
    11: {"filename": "UQLef.jpg", "confianza": 87, "observaciones": "Defensor con fade y mirada decidida"},
    12: {"filename": "OBw9D.jpg", "confianza": 95, "observaciones": "Superestrella con fade corto y mirada seria"},
    13: {"filename": "t50Ye.jpg", "confianza": 94, "observaciones": "Delantero rubio con fade peinado lateral"},
    14: {"filename": "t4uPK.jpg", "confianza": 90, "observaciones": "Extremo ágil con fade y expresión seria"},
    15: {"filename": "Xe7eB.jpg", "confianza": 91, "observaciones": "Centrocampista con trenzas/fade característico"},
    16: {"filename": "v7dSE.jpg", "confianza": 93, "observaciones": "Lateral con fade burst y mirada agresiva"},
    17: {"filename": "tRJVF.jpg", "confianza": 93, "observaciones": "Portero alto con fade limpio y guantes"},
    35: {"filename": "SJTt2.jpg", "confianza": 97, "observaciones": "Extremo con fade elegante y sonrisa de confianza"},
    36: {"filename": "ryzG4.jpg", "confianza": 92, "observaciones": "Portero imponente con barba espesa y mirada decidida"},
    37: {"filename": "yZzgF.jpg", "confianza": 91, "observaciones": "Delantero joven con fade limpio y complexión atlética"},
    38: {"filename": "zfItP.jpg", "confianza": 89, "observaciones": "Centrocampista con fade burst y mirada intensa"},
    39: {"filename": "zqyKm.jpg", "confianza": 93, "observaciones": "Centrocampista defensivo robusto con fade clásico"},
    40: {"filename": "KOXrZ.jpg", "confianza": 90, "observaciones": "Defensor con fade y expresión de liderazgo"},
    41: {"filename": "Y6efy.jpg", "confianza": 88, "observaciones": "Defensor atlético con fade e intensa mirada competitiva"},
    42: {"filename": "WQ9lT.jpg", "confianza": 89, "observaciones": "Lateral experimentado con fade y mirada seria"},
    43: {"filename": "kNPyw.jpg", "confianza": 91, "observaciones": "Centrocampista ofensivo con fade y tatuajes"},
    44: {"filename": "i5Gho.jpg", "confianza": 91, "observaciones": "Delantero adolescente con fade e inmensa proyección"},
    45: {"filename": "3FFHd.jpg", "confianza": 91, "observaciones": "Joven maravilla con fade texturizado y mirada enfocada"},
    46: {"filename": "hI2aD.jpg", "confianza": 88, "observaciones": "Centrocampista creativo con fade limpio y expresión inteligente"},
    47: {"filename": "ciznR.jpg", "confianza": 90, "observaciones": "Centrocampista defensivo alto con peinado clásico"},
    48: {"filename": "eBNfT.jpg", "confianza": 86, "observaciones": "Centrocampista dinámico con fade y expresión apasionada"},
    49: {"filename": "hBGll.jpg", "confianza": 95, "observaciones": "Extremo veloz con fade texturizado y mirada athletic"},
    50: {"filename": "aoFsV.jpg", "confianza": 84, "observaciones": "Portero vasco alto con fade y mirada concentrada"},
    90: {"filename": "qc1gX.jpg", "confianza": 90, "observaciones": "Centrocampista norteamericano con fade burst teñido y enérgica mirada"}
}

def migrate():
    # 1. Create backups first
    if os.path.exists(PLAYERS_JSON) and not os.path.exists(PLAYERS_BACKUP_JSON):
        shutil.copy(PLAYERS_JSON, PLAYERS_BACKUP_JSON)
        print("💾 Backed up players.json to players_backup.json")

    # 2. Copy the files to docs/assets/img/nfts
    print("\n🚚 Copying renders to gallery folder...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for p_id, info in SIMILAR_PLAYERS.items():
        fn = info["filename"]
        src = os.path.join(RENDERS_DIR, fn)
        dst = os.path.join(OUTPUT_DIR, fn)
        if os.path.exists(src):
            shutil.copy(src, dst)
            print(f"  ✓ Copied {fn} for ID {p_id}")
        else:
            print(f"  ❌ File NOT found in renders: {fn} for ID {p_id}")

    # 3. Update players.json
    print("\n📝 Updating players.json...")
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)

    updated_players_count = 0
    discarded_players_count = 0
    
    for player in players:
        p_id = player["id"]
        if p_id in SIMILAR_PLAYERS:
            player["filename"] = SIMILAR_PLAYERS[p_id]["filename"]
            updated_players_count += 1
        else:
            player["filename"] = None
            discarded_players_count += 1

    with open(PLAYERS_JSON, "w", encoding="utf-8") as f:
        json.dump(players, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Updated players.json: {updated_players_count} similar mapped, {discarded_players_count} set to null.")

    # 4. Update nft_metadata_index.json
    print("\n📝 Updating nft_metadata_index.json...")
    if os.path.exists(NFT_METADATA_INDEX_JSON):
        with open(NFT_METADATA_INDEX_JSON, "r", encoding="utf-8") as f:
            metadata_index = json.load(f)

        updated_meta_count = 0
        for entry in metadata_index:
            p_id = entry["id"]
            if p_id in SIMILAR_PLAYERS:
                fn = SIMILAR_PLAYERS[p_id]["filename"]
                entry["filename"] = fn
                if "metadata" in entry:
                    entry["metadata"]["image"] = f"https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/{fn}"
                    if "properties" in entry["metadata"] and "files" in entry["metadata"]["properties"]:
                        entry["metadata"]["properties"]["files"][0]["uri"] = f"https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/{fn}"
                updated_meta_count += 1
            else:
                entry["filename"] = None
                if "metadata" in entry:
                    # Clean/reset back to a fallback auto-generated image
                    safe_name = entry["metadata"]["name"].split("—")[-1].strip().lower().replace(" ", "_").replace("'", "")
                    fallback_fn = f"{p_id:03d}_{safe_name}.png"
                    entry["metadata"]["image"] = f"https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/{fallback_fn}"
                    if "properties" in entry["metadata"] and "files" in entry["metadata"]["properties"]:
                        entry["metadata"]["properties"]["files"][0]["uri"] = f"https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/{fallback_fn}"

        with open(NFT_METADATA_INDEX_JSON, "w", encoding="utf-8") as f:
            json.dump(metadata_index, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Updated nft_metadata_index.json for {updated_meta_count} similar players.")
    else:
        print("  ❌ nft_metadata_index.json not found!")

    # 5. Generate goalchain_master_matching_v6_full.json
    print("\n📝 Generating new goalchain_master_matching_v6_full.json...")
    mappings = {}
    for p_id, info in SIMILAR_PLAYERS.items():
        # Find player's real name from players list to make matching accurate
        real_name = ""
        nft_name = ""
        for player in players:
            if player["id"] == p_id:
                real_name = player.get("real_name", "")
                nft_name = player.get("name", "")
                break
                
        mappings[info["filename"]] = {
            "id": p_id,
            "nft_name": nft_name,
            "real_name": real_name,
            "confianza": info["confianza"],
            "observaciones": info["observaciones"]
        }

    master_data = {
        "lote": "1-50",
        "total_imagenes_si_parecidas": len(SIMILAR_PLAYERS),
        "mappings": mappings
    }

    with open(MASTER_MATCHING_JSON, "w", encoding="utf-8") as f:
        json.dump(master_data, f, indent=2, ensure_ascii=False)
    print(f"  ✓ Generated {MASTER_MATCHING_JSON} successfully.")

    print("\n🎉 MIGRATION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    migrate()
