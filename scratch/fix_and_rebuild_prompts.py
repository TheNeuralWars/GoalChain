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
        
    # 2. REBUILD STRICT PROMPTS (V6.1 - EXACT LIKENESS COPY, NO IDEALIZATION, NO SHADOW)
    prompts = []
    for p in players:
        name = p.get('real_name', p.get('name', 'Player'))
        
        # Fórmula Maestra V6.1 — Copia Exacta Real, Sin Idealización, Sin Sombra
        prompt_str = (
            f"Subject: {name}. "
            f"LIKENESS: Search the web for real photographs of {name} and replicate their EXACT real-world appearance — "
            f"copy their true face shape, skin tone, hair, beard/stubble exactly as they look in real life. "
            f"Do NOT idealize, do NOT make them more muscular, do NOT make them more handsome or perfect than they really are. "
            f"Copy their exact real body proportions including if they are stocky, lean, tall or short. "
            f"POSE: Simple, natural standing posture, facing front, hands relaxed at sides. "
            "KIT: Wearing a plain solid black short-sleeve athletic shirt and plain black athletic shorts. No logos, no markings. "
            "FEET: Strictly barefoot. Bare feet with toes and heels fully visible, standing flat on the white floor. No shoes, no socks. "
            "BACKGROUND: Pure flat solid white background (#FFFFFF). Absolutely zero shadows, zero gradients, zero reflections, zero vignette. "
            "The floor and background are one single uniform white plane with no depth, no shadow, no shading of any kind. "
            "TECHNICAL: 85mm lens, f/2.8, full body head to toe, no cropping of feet or legs, professional studio isolation, 8k --ar 2:3"
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
