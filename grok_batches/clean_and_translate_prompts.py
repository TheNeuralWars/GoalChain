#!/usr/bin/env python3
import os
import json
import glob
import re
from pathlib import Path

# Paths
PRIMARY_ROOT = Path("/Users/NicoPez/GoalChain")
if not PRIMARY_ROOT.exists():
    if Path("/data/apps/GoalChain").exists():
        PRIMARY_ROOT = Path("/data/apps/GoalChain")
    else:
        PRIMARY_ROOT = Path(os.getcwd())

PLAYERS_JSON = PRIMARY_ROOT / "docs/assets/data/players.json"

# Translation mappings
COLOR_MAP = {
    "celeste / blanco": "sky blue / white",
    "celeste": "sky blue",
    "blanco": "white",
    "verde": "green",
    "amarillo": "yellow",
    "rojo": "red",
    "azul": "blue",
    "negro": "black",
    "marino": "navy",
    "naranja": "orange",
    "gris": "grey",
    "rosa": "pink",
    "morado": "purple",
    "púrpura": "purple",
    "crema": "cream",
    "oro": "gold",
    "plata": "silver",
    "turquesa": "turquoise",
    "granate": "maroon",
    "azul marino": "navy blue",
    "verde neón": "neon green",
    "verde claro": "light green",
    "damero": "checkered",
    "rojo/blanco": "red/white",
    "azul azzurro": "azzurro blue",
    "amarillo / verde": "yellow / green",
    "rojo / amarillo": "red / yellow",
    "rojo / verde": "red / green",
    "blanco / negro": "white / black",
    "blanco / marino": "white / navy",
    "naranja vibrante": "vibrant orange",
    "damero rojo/blanco": "red/white checkered pattern",
    "azul de la saboya": "savoy blue",
    "blanco / rojo / azul": "white / red / blue",
    "blanco / azul / rojo": "white / blue / red",
    "verde / blanco": "green / white",
    "rojo / negro": "red / black",
    "azul samurai": "samurai blue",
    "azul / blanco": "blue / white",
    "rojo / azul": "red / blue",
    "verde / amarillo": "green / yellow",
    "blanco / rojo": "white / red",
    "oro / negro": "gold / black",
    "violeta": "violet",
    "púrpura / blanco": "purple / white",
    "amarillo / azul": "yellow / blue",
    "blanco / verde": "white / green",
    "morado / blanco": "purple / white"
}

POSE_MAP = {
    "dedos al cielo": "pointing fingers to the sky",
    "estirada acrobática": "acrobatic diving save",
    "brazos en cruz": "arms crossed in celebration",
    "postura de pase": "passing pose",
    "postura agresiva": "aggressive pose",
    "corazón con manos": "heart sign with hands",
    "control de balón": "ball control pose",
    "entrada fuerte": "strong slide tackle pose",
    "salto defensivo": "defensive leap",
    "sprint por banda": "sprinting down the wing",
    "deslizarse (tackle)": "sliding tackle",
    "brazos cruzados": "arms crossed",
    "baile teléfono": "telephone dance celebration",
    "regate rápido": "fast dribbling pose",
    "carrera veloz": "fast sprint",
    "brazos abiertos": "arms wide open",
    "celebración icónica": "iconic goal celebration",
    "control orientado": "directional ball control",
    "sprint eléctrico": "electric sprint",
    "corte de balón": "ball interception",
    "gesto técnico": "technical skill pose",
    "baile de samba": "samba dance celebration",
    "gesto de mando": "commanding gesture",
    "celebración gol": "goal celebration",
    "señalando táctica": "pointing tactical instructions",
    "grito de gol intenso": "intense goal scream",
    "salto siuuu": "SIUUU jump celebration",
    "disparo lejano": "long-range shot pose",
    "exterior del pie": "trivela / outside of the foot shot",
    "parada de reflejos": "reflex save",
    "beso al escudo": "kissing the badge",
    "parada legendaria": "legendary save",
    "sprint luz": "lightning-fast sprint",
    "grito de garra": "intense passion scream",
    "regate eléctrico": "electric dribble",
    "señalando grada": "pointing to the stands",
    "cabezazo defensa": "defensive header",
    "pose yoga": "yoga pose celebration",
    "salto con máscara": "jumping with mask",
    "intercepción": "interception pose",
    "cámara fotos": "camera photo celebration"
}

def translate_colors(color_str: str) -> str:
    color_lower = color_str.strip().lower()
    if color_lower in COLOR_MAP:
        return COLOR_MAP[color_lower].title()
    # Attempt partial replacements
    res = color_str
    for sp, en in COLOR_MAP.items():
        res = re.sub(r'\b' + re.escape(sp) + r'\b', en, res, flags=re.IGNORECASE)
    return res

def translate_pose(pose_str: str) -> str:
    pose_lower = pose_str.strip().lower()
    if pose_lower in POSE_MAP:
        return POSE_MAP[pose_lower]
    # Check if prefixed with "Iconic football celebration: "
    prefix = "Iconic football celebration: "
    if pose_str.startswith(prefix):
        subpose = pose_str[len(prefix):].strip()
        subpose_lower = subpose.lower()
        if subpose_lower in POSE_MAP:
            return prefix + POSE_MAP[subpose_lower]
    # General replacements
    res = pose_str
    for sp, en in POSE_MAP.items():
        res = re.sub(r'\b' + re.escape(sp) + r'\b', en, res, flags=re.IGNORECASE)
    return res

def main():
    if not PLAYERS_JSON.exists():
        print(f"Error: {PLAYERS_JSON} not found.")
        return

    print("Loading players database...")
    with open(PLAYERS_JSON, "r", encoding="utf-8") as f:
        players = json.load(f)
    
    player_dict = {p["id"]: p for p in players}

    batch_files = glob.glob(str(PRIMARY_ROOT / "grok_batches/batch_*/prompts_batch_*.json"))
    print(f"Found {len(batch_files)} batch prompt files to process.")

    total_updated = 0

    for path in sorted(batch_files):
        print(f"Processing {os.path.basename(path)}...")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        modified = False
        for entry in data:
            pid = entry.get("id")
            if not pid or pid not in player_dict:
                continue

            player = player_dict[pid]
            physical_desc = player["physical"]["t"]
            height = player["physical"]["h"]
            
            prompt = entry.get("prompt", "")

            # Rebuild [SUBJECT_DETAILS]
            # Pattern matching [SUBJECT_DETAILS]: ... [KIT_DESIGN]
            # Replace whatever is inside with clean English version
            match_sub = re.search(r"(\[SUBJECT_DETAILS\]: )(.*?) (\[KIT_DESIGN\])", prompt)
            if match_sub:
                clean_details = f"Precise facial features matching the reference portrait exactly. {physical_desc} Height {height}."
                prompt = prompt.replace(match_sub.group(0), f"[SUBJECT_DETAILS]: {clean_details} [KIT_DESIGN]")
                modified = True

            # Translate colors in [KIT_DESIGN]
            match_kit = re.search(r"(Colors: )(.*?)(\. NO brand)", prompt)
            if match_kit:
                orig_colors = match_kit.group(2)
                trans_colors = translate_colors(orig_colors)
                if orig_colors != trans_colors:
                    prompt = prompt.replace(match_kit.group(0), f"Colors: {trans_colors}. NO brand")
                    modified = True

            # Translate poses in [POSE]
            match_pose = re.search(r"(\[POSE\]: )(.*?)(\. Dynamic)", prompt)
            if match_pose:
                orig_pose = match_pose.group(2)
                trans_pose = translate_pose(orig_pose)
                if orig_pose != trans_pose:
                    prompt = prompt.replace(match_pose.group(0), f"[POSE]: {trans_pose}. Dynamic")
                    modified = True

            if entry["prompt"] != prompt:
                entry["prompt"] = prompt
                modified = True

        if modified:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Saved changes to {os.path.basename(path)}")
            total_updated += 1

    print(f"Done! Updated {total_updated} files.")

if __name__ == "__main__":
    main()
