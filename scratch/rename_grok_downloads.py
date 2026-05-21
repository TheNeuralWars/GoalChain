import os
import json
import unicodedata

def normalize_filename(name):
    """
    Normaliza el nombre para que coincida con el estándar de la galería:
    quita acentos, convierte a minúsculas, reemplaza espacios y guiones por guiones bajos.
    """
    n = unicodedata.normalize('NFD', name)
    n = ''.join([c for c in n if unicodedata.category(c) != 'Mn'])
    return n.lower().replace('.', '').replace(' ', '_').replace('-', '_').strip()

def rename_downloads():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    PROMPTS_FILE = os.path.join(base_path, "ai_context/nft_master_prompts_1_50.json")
    INPUT_FOLDER = os.path.join(base_path, "assets/img/raw_grok_generations")

    # 1. Cargar archivo de prompts maestro
    print(f"📖 Leyendo lista de prompts desde: {PROMPTS_FILE}")
    with open(PROMPTS_FILE, 'r', encoding='utf-8') as f:
        prompts = json.load(f)

    # 2. Leer imágenes del directorio de entrada
    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
        print(f"📁 Se creó la carpeta de entrada vacía. Suelta ahí tus descargas de Grok: {INPUT_FOLDER}")
        return

    files = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(valid_extensions)]
    
    if not files:
        print(f"\n⚠️ La carpeta está vacía: {INPUT_FOLDER}")
        print("💡 Descarga tus imágenes de Grok, colócalas en esa carpeta y vuelve a ejecutar este script.")
        return

    # 3. Ordenar archivos cronológicamente (el más antiguo primero = el primero generado)
    files_with_time = []
    for f in files:
        path = os.path.join(INPUT_FOLDER, f)
        # Usamos getmtime (última modificación) que corresponde al momento de descarga
        files_with_time.append((f, os.path.getmtime(path)))
    
    files_with_time.sort(key=lambda x: x[1])
    sorted_files = [x[0] for x in files_with_time]

    print(f"\n🔍 Se encontraron {len(sorted_files)} imágenes para ordenar en la carpeta.")

    # 4. Preguntar el punto de partida
    print("\n--- CONFIGURACIÓN DE RENOMBRADO ---")
    print("Como las imágenes se generaron en orden, las mapearemos cronológicamente.")
    print("Ejemplo: Si acabas de arrancar tu nuevo chat con Lucas Paquetá, él es el número 31 en la lista del JSON.")
    
    try:
        start_idx_input = input("Introduce el número del jugador en el JSON donde deseas arrancar (1-50) [Por defecto: 31]: ").strip()
        start_idx = int(start_idx_input) if start_idx_input else 31
    except ValueError:
        start_idx = 31

    start_array_idx = start_idx - 1  # Ajuste de índice 0 de Python

    # 5. Generar propuesta de mapeo
    print("\n📋 PROPUESTA DE MAPEO DE NOMBRES:")
    mapping = []
    for i, filename in enumerate(sorted_files):
        current_player_idx = start_array_idx + i
        if current_player_idx >= len(prompts):
            print(f"❌ ¡Advertencia! Hay más archivos en la carpeta ({len(sorted_files)}) que jugadores en el JSON ({len(prompts) - start_array_idx} restantes).")
            break
        
        player = prompts[current_player_idx]
        p_id = player["id"]
        p_name = player["name"]
        
        padded_id = str(p_id).zfill(3)
        safe_name = normalize_filename(p_name)
        ext = os.path.splitext(filename)[1]
        
        # Nombre de archivo final óptimo
        new_name = f"{padded_id}_{safe_name}{ext}"
        
        print(f"   🕒 {filename}   ===>   {new_name}  ({p_name})")
        mapping.append((filename, new_name))

    # 6. Ejecutar cambios con confirmación
    confirm = input("\n¿Confirmas que el orden cronológico es correcto y deseas renombrar? (s/n): ").strip().lower()
    if confirm in ('s', 'si', 'y', 'yes'):
        for old, new in mapping:
            old_path = os.path.join(INPUT_FOLDER, old)
            new_path = os.path.join(INPUT_FOLDER, new)
            os.rename(old_path, new_path)
        print("\n✅ ¡Todos los archivos han sido renombrados con éxito con sus IDs oficiales de Solana!")
        print("💡 Ahora puedes correr 'python3 scratch/remove_backgrounds.py' para quitarles el fondo en lote.")
    else:
        print("\n❌ Renombrado cancelado. Ningún archivo fue modificado.")

if __name__ == "__main__":
    rename_downloads()
