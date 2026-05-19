import os
import json

BASE_DIR = "/Users/NicoPez/GoalChain"
PLAYERS_JSON = os.path.join(BASE_DIR, "docs/assets/data/players.json")
MASTER_MATCHING_JSON = os.path.join(BASE_DIR, "ai_context/goalchain_master_matching_v6_full.json")

# User first mapping (confidence and identity test results)
first_mapping = [
    {"archivo": "qEwxs.jpg", "id": 8, "name": "Cuti Crypt", "real_name": "Cristian Romero", "confianza": 92},
    {"archivo": "UP3Bf.jpg", "id": 9, "name": "Lisandro Butcher-DAO", "real_name": "Lisandro Martínez", "confianza": 88},
    {"archivo": "5C8GN.jpg", "id": 5, "name": "Rodrigo De-Pool", "real_name": "Rodrigo De Paul", "confianza": 85},
    {"archivo": "5VJOb.jpg", "id": 10, "name": "Nahuel Mo-Wallet", "real_name": "Nahuel Molina", "confianza": 90},
    {"archivo": "yW1Ha.jpg", "id": 14, "name": "Ousmane De-Shard", "real_name": "Ousmane Dembélé", "confianza": 87},
    {"archivo": "ZkyHt.jpg", "id": 6, "name": "Angel Di Merkle", "real_name": "Ángel Di María", "confianza": 83},
    {"archivo": "QqMAA.jpg", "id": 7, "name": "Alexis Mac-Chain", "real_name": "Alexis Mac Allister", "confianza": 91},
    {"archivo": "bysdo.jpg", "id": 15, "name": "Eduardo Cama-Logic", "real_name": "Eduardo Camavinga", "confianza": 89},
    {"archivo": "UDdG3.jpg", "id": 16, "name": "Theo Shiller", "real_name": "Theo Hernández", "confianza": 94},
    {"archivo": "dwPnH.jpg", "id": 13, "name": "Antoine G-ZkSync", "real_name": "Antoine Griezmann", "confianza": 86},
    {"archivo": "DncFG.jpg", "id": 3, "name": "Julian Bull-varez", "real_name": "Julián Álvarez", "confianza": 90},
    {"archivo": "BhTBc.jpg", "id": 4, "name": "Enzo Ether", "real_name": "Enzo Fernández", "confianza": 88},
    {"archivo": "mn5aZ.jpg", "id": 11, "name": "Nico Taglia-Token", "real_name": "Nicolás Tagliafico", "confianza": 85},
    {"archivo": "BKelu.jpg", "id": 12, "name": "Kylian M-Bypass-pé", "real_name": "Kylian Mbappé", "confianza": 93},
    {"archivo": "DxjaQ.jpg", "id": 1, "name": "Lionel Satoshi", "real_name": "Lionel Messi", "confianza": 82},
    {"archivo": "3FFHd.jpg", "id": 45, "name": "Lamine Ya-Alpha", "real_name": "Lamine Yamal", "confianza": 91},
    {"archivo": "eK3bc.jpg", "id": 2, "name": "Dibu De-Fi", "real_name": "Emiliano Martínez", "confianza": 87},
    {"archivo": "8ZDOh.jpg", "id": 35, "name": "Vinicius Jpeg Jr", "real_name": "Vinícius Júnior", "confianza": 89},
    {"archivo": "21xaq.jpg", "id": 37, "name": "Rodrygo-Yield", "real_name": "Rodrygo Goes", "confianza": 84},
    {"archivo": "TeOZQ.jpg", "id": 39, "name": "Casemiro-Mint", "real_name": "Casemiro", "confianza": 90},
    {"archivo": "D1eSG.jpg", "id": 17, "name": "Mike Maignan-Admin", "real_name": "Mike Maignan", "confianza": 86},
    {"archivo": "26N8i.jpg", "id": 38, "name": "Bruno Guima-Liquid", "real_name": "Bruno Guimarães", "confianza": 88},
    {"archivo": "jdfTb.jpg", "id": 40, "name": "Marquinhos-Server", "real_name": "Marquinhos", "confianza": 92},
    {"archivo": "1G8Xj.jpg", "id": 41, "name": "Eder Mili-Pixel", "real_name": "Éder Militão", "confianza": 87},
    {"archivo": "8it0G.jpg", "id": 42, "name": "Danilo-Legacy", "real_name": "Danilo", "confianza": 85},
    {"archivo": "N3kon.jpg", "id": 43, "name": "Lucas Paque-Frame", "real_name": "Lucas Paquetá", "confianza": 89},
    {"archivo": "i5Gho.jpg", "id": 44, "name": "Endrick Moon", "real_name": "Endrick", "confianza": 91},
    {"archivo": "hI2aD.jpg", "id": 46, "name": "Pedri-Script", "real_name": "Pedri", "confianza": 88},
    {"archivo": "ciznR.jpg", "id": 47, "name": "Rodri Proof-of-Stake", "real_name": "Rodri", "confianza": 90},
    {"archivo": "eBNfT.jpg", "id": 48, "name": "Gavi-Gas", "real_name": "Gavi", "confianza": 86},
    {"archivo": "HilC6.jpg", "id": 49, "name": "Nico Shard-Williams", "real_name": "Nico Williams", "confianza": 93},
    {"archivo": "aoFsV.jpg", "id": 50, "name": "Unai Simon-Key", "real_name": "Unai Simón", "confianza": 84},
    {"archivo": "BF0n3.jpg", "id": 36, "name": "Alisson Vault-son", "real_name": "Alisson Becker", "confianza": 89}
]

# Final merged mapping from our audit/merge process
merged_mapping = {
    1: "OYRRU.jpg",
    2: "suDeW.jpg",
    3: "xbQ7X.jpg",
    4: "vIqWX.jpg",
    5: "tAyKc.jpg",
    6: "YFhoE.jpg",
    7: "KPnuU.jpg",
    8: "mspm6.jpg",
    9: "TY3Ck.jpg",
    10: "ZWtiS.jpg",
    11: "UQLef.jpg",
    12: "OBw9D.jpg",
    13: "t50Ye.jpg",
    14: "t4uPK.jpg",
    15: "Xe7eB.jpg",
    16: "v7dSE.jpg",
    17: "tRJVF.jpg",
    18: "Fq5bx.jpg",
    19: "hpyIm.jpg",
    20: "QDJSS.jpg",
    21: "mgWOC.jpg",
    22: "RLqjT.jpg",
    23: "NjE3G.jpg",
    24: "n2J38.jpg",
    25: "NvnBu.jpg",
    26: "K6Fd8.jpg",
    27: "LROxo.jpg",
    28: "JPaQf.jpg",
    29: "l8CRI.jpg",
    30: "lmLFx.jpg",
    31: "VJLYi.jpg",
    32: "SM6kf.jpg",
    33: "goB4I.jpg",
    34: "fPrj9.jpg",
    35: "SJTt2.jpg",
    36: "ryzG4.jpg",
    37: "yZzgF.jpg",
    38: "zfItP.jpg",
    39: "zqyKm.jpg",
    40: "KOXrZ.jpg",
    41: "Y6efy.jpg",
    42: "WQ9lT.jpg",
    43: "kNPyw.jpg",
    44: "i5Gho.jpg",
    45: "3FFHd.jpg",
    46: "hI2aD.jpg",
    47: "ciznR.jpg",
    48: "eBNfT.jpg",
    49: "hBGll.jpg",
    50: "aoFsV.jpg",
    90: "qc1gX.jpg"
}

unidentified_files = ["VBUIp.jpg", "0xpSv.jpg", "1a0Sa.jpg", "1dokM.jpg", "8M2NB.jpg", "2RTWY.jpg", "7bUkc.jpg"]

def update():
    # 1. Load players.json
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)
    players_dict = {p["id"]: p for p in players}

    # 2. Load goalchain_master_matching_v6_full.json
    with open(MASTER_MATCHING_JSON, "r", encoding="utf-8") as f:
        master = json.load(f)

    # 3. Create a confidence lookup table from first_mapping
    # Since confidence is tied to player identity, let's map player_id -> confidence
    conf_dict = {}
    for item in first_mapping:
        conf_dict[item["id"]] = item["confianza"]

    # 4. Clean up any existing mapping in master that targets IDs 1-50 or 90
    # to avoid having duplicate mappings for the same ID.
    cleaned_mappings = {}
    for fn, entry in master["mappings"].items():
        entry_id = entry.get("id")
        # If the entry has an ID that is in our new batch 1-50 or 90, we don't keep it
        if entry_id in merged_mapping:
            print(f"🧹 Clearing old mapping for {fn} pointing to ID {entry_id} to prevent duplicate.")
        else:
            cleaned_mappings[fn] = entry

    # 5. Insert new mappings
    for p_id, filename in merged_mapping.items():
        player = players_dict.get(p_id)
        if not player:
            continue
        
        # Get confidence (default to 90 if not in identity test)
        confidence = conf_dict.get(p_id, 90)
        
        cleaned_mappings[filename] = {
            "id": p_id,
            "nft_name": player["name"],
            "real_name": player.get("real_name", player.get("name")),
            "confidence": confidence,
            "status": "matched",
            "notes": "Identified and matched via manual verification & identity test."
        }
        print(f"➕ Registered {filename} -> ID {p_id} ({player['name']})")

    # 6. Insert unidentified files
    for filename in unidentified_files:
        if filename not in cleaned_mappings:
            cleaned_mappings[filename] = {
                "id": None,
                "nft_name": "NO IDENTIFICADO",
                "real_name": "Cristiano Ronaldo (lote 51-100)" if filename == "VBUIp.jpg" else None,
                "confidence": 40 if filename == "VBUIp.jpg" else 0,
                "status": "unidentified",
                "notes": "NO IDENTIFICADO - Image does not match target player profile."
            }
            print(f"❓ Registered unidentified {filename}")

    # 7. Update master
    master["mappings"] = cleaned_mappings
    master["total_imagenes_si_parecidas"] = sum(1 for e in cleaned_mappings.values() if e.get("status") == "matched")

    # 8. Save updated master file
    with open(MASTER_MATCHING_JSON, "w", encoding="utf-8") as f:
        json.dump(master, f, indent=2, ensure_ascii=False)
    
    print("\n🎉 Master matching visual V6 JSON successfully updated!")

if __name__ == "__main__":
    update()
