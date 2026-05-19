import os
import json
import shutil

BASE_DIR = "/Users/NicoPez/GoalChain"
PLAYERS_JSON = os.path.join(BASE_DIR, "docs/assets/data/players.json")
NFT_INDEX_JSON = os.path.join(BASE_DIR, "docs/assets/data/nft_metadata_index.json")
SOURCE_FOLDER = os.path.join(BASE_DIR, "assets/final_renders/players")
DEST_FOLDER = os.path.join(BASE_DIR, "docs/assets/img/nfts")

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

def load_renders():
    # Create destination directory if it does not exist
    if not os.path.exists(DEST_FOLDER):
        os.makedirs(DEST_FOLDER)
        print(f"📁 Created destination folder {DEST_FOLDER}")

    # 1. Copy files
    print("🚀 Copying renders from source to destination...")
    copied_count = 0
    for p_id, filename in merged_mapping.items():
        src_path = os.path.join(SOURCE_FOLDER, filename)
        dest_path = os.path.join(DEST_FOLDER, filename)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            copied_count += 1
        else:
            print(f"❌ Source file not found: {src_path}")
    print(f"✅ Successfully copied {copied_count} files to {DEST_FOLDER}")

    # 2. Update players.json
    print("\n📝 Updating players.json...")
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)

    for player in players:
        p_id = player["id"]
        if p_id in merged_mapping:
            player["filename"] = merged_mapping[p_id]

    with open(PLAYERS_JSON, "w", encoding="utf-8") as f:
        json.dump(players, f, indent=2, ensure_ascii=False)
    print("✅ players.json successfully updated!")

    # 3. Update nft_metadata_index.json
    print("\n📝 Updating nft_metadata_index.json...")
    with open(NFT_INDEX_JSON, "r", encoding="utf-8") as f:
        nft_index = json.load(f)

    updated_nfts = 0
    for nft in nft_index:
        p_id = nft["id"]
        if p_id in merged_mapping:
            filename = merged_mapping[p_id]
            nft["filename"] = filename
            
            # Update image URL
            image_url = f"https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/docs/assets/img/nfts/{filename}"
            if "metadata" in nft:
                nft["metadata"]["image"] = image_url
                if "properties" in nft["metadata"] and "files" in nft["metadata"]["properties"]:
                    for file_entry in nft["metadata"]["properties"]["files"]:
                        file_entry["uri"] = image_url
                        file_entry["type"] = "image/jpeg"
            updated_nfts += 1

    with open(NFT_INDEX_JSON, "w", encoding="utf-8") as f:
        json.dump(nft_index, f, indent=2, ensure_ascii=False)
    print(f"✅ nft_metadata_index.json successfully updated for {updated_nfts} players!")

if __name__ == "__main__":
    load_renders()
