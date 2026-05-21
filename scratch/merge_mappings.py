import os
import json

BASE_DIR = "/Users/NicoPez/GoalChain"
PLAYERS_JSON = os.path.join(BASE_DIR, "docs/assets/data/players.json")
PLAYERS_FOLDER = os.path.join(BASE_DIR, "assets/final_renders/players")

# Mappings from user
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

second_mapping = {
  "OYRRU.jpg": 1,
  "xbQ7X.jpg": 3,
  "Xe7eB.jpg": 15,
  "v7dSE.jpg": 16,
  "suDeW.jpg": 2,
  "YFhoE.jpg": 6,
  "vIqWX.jpg": 4,
  "hBGll.jpg": 49,
  "qc1gX.jpg": 90,
  "KPnuU.jpg": 7,
  "mspm6.jpg": 8,
  "ryzG4.jpg": 36,
  "SJTt2.jpg": 35,
  "OBw9D.jpg": 12,
  "yZzgF.jpg": 37,
  "zfItP.jpg": 38,
  "zqyKm.jpg": 39,
  "KOXrZ.jpg": 40,
  "Y6efy.jpg": 41,
  "tAyKc.jpg": 5,
  "TY3Ck.jpg": 9,
  "ZWtiS.jpg": 10,
  "UQLef.jpg": 11,
  "t50Ye.jpg": 13,
  "t4uPK.jpg": 14,
  "tRJVF.jpg": 17,
  "Fq5bx.jpg": 18,
  "hpyIm.jpg": 19,
  "QDJSS.jpg": 20,
  "mgWOC.jpg": 21,
  "RLqjT.jpg": 22,
  "NjE3G.jpg": 23,
  "n2J38.jpg": 24,
  "NvnBu.jpg": 25,
  "K6Fd8.jpg": 26,
  "LROxo.jpg": 27,
  "JPaQf.jpg": 28,
  "l8CRI.jpg": 29,
  "lmLFx.jpg": 30,
  "VJLYi.jpg": 31,
  "SM6kf.jpg": 32,
  "goB4I.jpg": 33,
  "fPrj9.jpg": 34,
  "WQ9lT.jpg": 42,
  "kNPyw.jpg": 43,
  "hRD93.jpg": 45,
  "onyib.jpg": 46,
  "zPJ5K.jpg": 47,
  "pbGcR.jpg": 48,
  "aZL29.jpg": 50
}

def merge():
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)
    players_dict = {p["id"]: p for p in players}

    folder_files = set(os.listdir(PLAYERS_FOLDER))

    # We will build a final merged mapping: player_id -> filename
    merged_id_to_file = {}

    # 1. Load second mapping (which overrides existing mappings)
    for filename, p_id in second_mapping.items():
        if filename in folder_files:
            merged_id_to_file[p_id] = filename

    # 2. Check missing IDs from 1 to 50 in our merged list
    for p_id in range(1, 51):
        if p_id not in merged_id_to_file:
            # Look up in first mapping
            matching_items = [item for item in first_mapping if item["id"] == p_id]
            if matching_items:
                filename = matching_items[0]["archivo"]
                if filename in folder_files:
                    merged_id_to_file[p_id] = filename
                    print(f"🔄 Recovered missing ID {p_id} ({players_dict[p_id]['name']}) using {filename} from first mapping.")
                else:
                    print(f"❌ ID {p_id} file {filename} not in folder!")
            else:
                print(f"⚠️ ID {p_id} has no entry in either mapping!")

    # Add ID 90
    if 90 not in merged_id_to_file and "qc1gX.jpg" in folder_files:
        merged_id_to_file[90] = "qc1gX.jpg"
        print("🔄 Added ID 90 (Weston McKennie) using qc1gX.jpg.")

    print(f"\n✅ Merged mapping contains {len(merged_id_to_file)} players.")
    for p_id in sorted(merged_id_to_file.keys()):
        player = players_dict.get(p_id)
        name = player["name"] if player else "UNKNOWN"
        real_name = player["real_name"] if player else "UNKNOWN"
        print(f"ID {p_id:03d} -> {merged_id_to_file[p_id]} ({name} / {real_name})")

if __name__ == "__main__":
    merge()
