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
        
    # 2. REBUILD STRICT PROMPTS (V4.0 - ANTI-CROP & BLACK JERSEY CONTRAST)
    prompts = []
    for p in players:
        phys = p.get('physical', {}).get('t', '')
        name = p.get('real_name', p.get('name', 'Player'))
        
        # Fórmula Maestra de Ejecución Estricta (V4.0)
        prompt_str = (
            f"Subject: {name}. {phys} ::3 "
            f"An ultra-wide, ground-level full-body action photograph of {name}, head to toe fully visible. "
            f"The camera is pulled far back, capturing a wide field of view. The player is standing in an epic football pose. "
            f"Both of their legs, knees, shins, socks, and athletic cleats (soccer shoes) are completely visible inside the frame. "
            f"There is a wide, clear border of empty white floor visible below their shoes. "
            f"Absolutely no cropping or cutting off of the legs, shoes, or feet at the bottom of the frame. "
            "KIT: Wearing a completely blank, plain solid pitch-black athletic jersey. "
            "The chest of the jersey is smooth, solid, and completely plain pitch-black, showing only pure solid clean black fabric with zero logos, zero graphics, and zero markings. "
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
