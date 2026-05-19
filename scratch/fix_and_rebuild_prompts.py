import json
import os

def rebuild_all():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    players_path = os.path.join(base_path, "docs/assets/data/players.json")
    context_dir = os.path.join(base_path, "ai_context")
    
    print("🚀 Iniciando Reconstrucción de la Base de Prompts...")

    with open(players_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    # 1. FIX BIOMETRIC ANOMALIES
    fixes_applied = 0
    for p in players:
        if p['id'] == 8: # Cuti Romero
            if "clean shaven" in p['physical']['t']:
                p['physical']['t'] = p['physical']['t'].replace("clean shaven", "short well-groomed beard")
                fixes_applied += 1
        elif p['id'] == 45: # Lamine Yamal
            if "Full blonde-dyed" in p['physical']['t']:
                p['physical']['t'] = p['physical']['t'].replace("Full blonde-dyed", "Natural dark")
                fixes_applied += 1
            
    # Save fixed players.json
    with open(players_path, 'w', encoding='utf-8') as f:
        json.dump(players, f, indent=4, ensure_ascii=False)
    print(f"✅ Anomalías biométricas corregidas en players.json: {fixes_applied}")
        
    # 2. REBUILD STRICT PROMPTS (V6.0 - DYNAMIC BAREFOOT & COMPRESSION)
    prompts = []
    for p in players:
        name = p.get('real_name', p.get('name', 'Player'))
        
        # Fórmula Maestra de Copia y Búsqueda Dinámica (V6.0)
        prompt_str = (
            f"Subject: {name}. Dynamic Pose: Research and replicate their iconic real-life football celebration, signature action pose, or dynamic in-game stance. "
            "KIT: Wearing a premium tight-fitting solid black athletic compression short-sleeve shirt and tight black athletic shorts. "
            "FEET: Strictly barefoot, bare feet, toes and heels fully visible standing on the white floor. "
            "BACKGROUND: High-key studio photography, shot on a seamless, FLAT SOLID #FFFFFF WHITE BACKGROUND. "
            "The floor is a purely blank, solid white plane, perfectly uniform, seamless and flat. "
            "TECHNICAL: 85mm lens, f/2.8, extreme realism, highly detailed face, professional photography, professionally isolated, 8k resolution --ar 2:3"
        )
        
        prompts.append({
            "id": p["id"],
            "name": p["name"],
            "real_name": name,
            "prompt": prompt_str
        })
        
    # 3. EXPORT TO CHUNKS OF 50
    chunk_size = 50
    for i in range(0, len(prompts), chunk_size):
        chunk = prompts[i:i + chunk_size]
        start_id = chunk[0]['id']
        end_id = chunk[-1]['id']
        filename = f"nft_master_prompts_{start_id}_{end_id}.json"
        
        with open(os.path.join(context_dir, filename), 'w', encoding='utf-8') as f:
            json.dump(chunk, f, indent=4, ensure_ascii=False)
            
    print(f"✅ {len(prompts)} prompts reconstruidos bajo la doctrina de Ejecución Estricta.")

if __name__ == "__main__":
    rebuild_all()
