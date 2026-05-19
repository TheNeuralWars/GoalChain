import os
import json
import shutil

def prepare_batches():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    players_path = os.path.join(base_path, "docs/assets/data/players.json")
    batches_dir = os.path.join(base_path, "scratch/grok_batches")
    
    # 1. Clean previous batches if any
    if os.path.exists(batches_dir):
        shutil.rmtree(batches_dir)
    os.makedirs(batches_dir, exist_ok=True)
    
    print("📦 Cargando base de datos de jugadores...")
    with open(players_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    total_players = len(players)
    players_per_batch = 29
    
    # Calculate batches
    batches = [players[i:i + players_per_batch] for i in range(0, total_players, players_per_batch)]
    num_batches = len(batches)
    
    print(f"📊 Total jugadores: {total_players}")
    print(f"📂 Configurando {num_batches} carpetas de batches (máximo 29 jugadores por batch para no superar los 60 archivos en Grok)...")
    
    # Generate batch directories and JSONs
    for idx, batch_players in enumerate(batches):
        batch_num = idx + 1
        batch_folder_name = f"batch_{batch_num:02d}"
        batch_folder_path = os.path.join(batches_dir, batch_folder_name)
        os.makedirs(batch_folder_path, exist_ok=True)
        
        # Build prompt list for this batch
        batch_prompts = []
        for p in batch_players:
            name = p.get('real_name', p.get('name', 'Player'))
            padded_id = f"{p['id']:03d}"
            
            # Nueva fórmula V6.4 para Caricatura 3D Premium con Referencia de Imagen
            prompt_str = (
                f"Subject: {name}. "
                f"STYLE: Premium 3D digital sculpture caricature, high-end vinyl toy collector figurine render, stylized proportions with a slightly enlarged head, but preserving highly detailed facial features. "
                f"REFERENCIA_IMAGEN: You must analyze the attached images '{padded_id}_portrait.jpg' (for exact facial structure, hair, eye color, stubble) and '{padded_id}_fullbody.jpg' (for body shape and proportions). Replicate these features into the caricature. Do NOT use generic faces. "
                f"POSE: Simple, natural standing posture, facing front, hands relaxed at sides, looking directly at the camera. "
                f"KIT: Wearing a plain solid black short-sleeve athletic shirt and plain black athletic shorts. No logos, no markings. "
                f"FEET: Strictly barefoot. Bare feet with toes and heels fully visible, standing flat on the white floor. No shoes, no socks. "
                f"BACKGROUND: Pure flat solid white background (#FFFFFF). Absolutely zero shadows, zero gradients, zero reflections, zero vignette, and zero shading of any kind. The floor and background are one single uniform white plane with no depth, no shadow, no shading of any kind. "
                f"TECHNICAL: 85mm lens, f/2.8, full body head to toe, no cropping of feet or legs, professional studio isolation, 8k --ar 2:3"
            )
            
            batch_prompts.append({
                "id": p["id"],
                "padded_id": padded_id,
                "name": p["name"],
                "real_name": name,
                "prompt": prompt_str,
                "required_files": [
                    f"{padded_id}_portrait.jpg",
                    f"{padded_id}_fullbody.jpg"
                ]
            })
            
        # Write batch JSON
        json_filename = f"prompts_batch_{batch_num:02d}.json"
        with open(os.path.join(batch_folder_path, json_filename), 'w', encoding='utf-8') as f:
            json.dump(batch_prompts, f, indent=4, ensure_ascii=False)
            
        # Create an empty placeholder instructions file in each batch folder
        instructions_text = (
            f"📥 BATCH {batch_num:02d} - INSTRUCCIONES DE USO\n\n"
            f"1. Descarga para cada jugador de este batch (IDs {batch_players[0]['id']} al {batch_players[-1]['id']}) sus 2 imágenes de referencia:\n"
            f"   - [ID]_portrait.jpg (Ej: 001_portrait.jpg) -> Foto de rostro de buena calidad.\n"
            f"   - [ID]_fullbody.jpg (Ej: 001_fullbody.jpg) -> Foto de cuerpo entero.\n"
            f"2. Guarda las imágenes dentro de esta carpeta.\n"
            f"3. Cuando tengas las imágenes de los {len(batch_players)} jugadores de este batch:\n"
            f"   - Crea un nuevo Proyecto en Grok llamado 'GoalChain Batch {batch_num:02d}'.\n"
            f"   - Sube a ese proyecto el archivo '{json_filename}' y las {len(batch_players)*2} imágenes.\n"
            f"   - Inicializa el chat con el Bootstrap V6.4 y empieza a generar.\n"
        )
        with open(os.path.join(batch_folder_path, "LEEME.txt"), 'w', encoding='utf-8') as f:
            f.write(instructions_text)

    print(f"✅ Carpetas de batches creadas exitosamente en: scratch/grok_batches/")
    print(f"💡 Cada carpeta contiene su LEEME.txt y prompts_batch_XX.json correspondiente.")

if __name__ == "__main__":
    prepare_batches()
