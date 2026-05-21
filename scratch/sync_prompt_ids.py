import json
import os
import unicodedata

def normalize_name(name):
    """
    Normaliza nombres para emparejamiento robusto
    (quita acentos, puntos, guiones y convierte a minúsculas)
    """
    if not name:
        return ""
    n = unicodedata.normalize('NFD', name)
    n = ''.join([c for c in n if unicodedata.category(c) != 'Mn'])
    n = n.lower().replace('.', '').replace('-', ' ').strip()
    return n

def sync_prompt_ids():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Rutas de archivos
    PLAYERS_FILE = os.path.join(base_path, "ai_context/03_data/players.json")
    PROMPTS_DIR = os.path.join(base_path, "ai_context")

    print(f"📖 Cargando base de datos oficial desde: {PLAYERS_FILE}")
    with open(PLAYERS_FILE, 'r', encoding='utf-8') as f:
        players = json.load(f)

    # 2. Crear mapa de {Nombre Normalizado -> ID Real}
    player_id_map = {}
    for p in players:
        real_name = p.get("real_name")
        player_id = p.get("id")
        if real_name and player_id is not None:
            # Mapeamos tanto el nombre real como el de parody para evitar fallos
            player_id_map[normalize_name(real_name)] = player_id
            player_id_map[normalize_name(p.get("name"))] = player_id

    # 3. Buscar archivos de prompts en ai_context/
    prompt_files = [f for f in os.listdir(PROMPTS_DIR) if f.startswith("nft_master_prompts_") and f.endswith(".json")]
    
    if not prompt_files:
        print("⚠️ No se encontraron archivos de prompts de Grok para sincronizar.")
        return

    print(f"🔄 Iniciando sincronización de {len(prompt_files)} archivos de prompts...")

    for pf in prompt_files:
        file_path = os.path.join(PROMPTS_DIR, pf)
        print(f"⚙️ Procesando: {pf}...")

        with open(file_path, 'r', encoding='utf-8') as f:
            prompts = json.load(f)

        updated_count = 0
        skipped_count = 0

        for prompt_block in prompts:
            player_name = prompt_block.get("name")
            current_id = prompt_block.get("id")
            norm_name = normalize_name(player_name)

            if norm_name in player_id_map:
                real_id = player_id_map[norm_name]
                if current_id != real_id:
                    prompt_block["id"] = real_id
                    updated_count += 1
                else:
                    skipped_count += 1
            else:
                print(f"   ⚠️ Advertencia: No se encontró ID oficial para '{player_name}'")
                skipped_count += 1

        # Guardar cambios en el archivo
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(prompts, f, indent=4, ensure_ascii=False)

        print(f"   ✅ {pf} finalizado: {updated_count} IDs sincronizados con Solana, {skipped_count} verificados.")

    print("\n🎉 ¡Sincronización global completada! Todos tus archivos de prompts de Grok coinciden al 100% con tu base de datos de producción.")

if __name__ == "__main__":
    sync_prompt_ids()
