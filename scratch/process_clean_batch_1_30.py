import os
import shutil
from rembg import remove
import unicodedata

def normalize_name(name):
    n = unicodedata.normalize('NFD', name)
    n = ''.join([c for c in n if unicodedata.category(c) != 'Mn'])
    return n.lower().replace('.', '').replace(' ', '_').replace('-', '_').strip()

def process_batch():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    RAW_DIR = os.path.join(base_path, "assets/img/raw_grok_generations")
    OUTPUT_DIR = os.path.join(base_path, "docs/assets/img/nfts/transparent")
    
    if not os.path.exists(RAW_DIR):
        os.makedirs(RAW_DIR)
        print(f"📁 Creada carpeta raw en: {RAW_DIR}. Suelta las 30 imágenes ahí.")
        return
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 1. Obtener todas las imágenes válidas y ordenarlas cronológicamente
    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    files = [f for f in os.listdir(RAW_DIR) if os.path.isfile(os.path.join(RAW_DIR, f)) and f.lower().endswith(valid_extensions)]
    
    if not files:
        print(f"⚠️ No se encontraron imágenes en: {RAW_DIR}")
        print("💡 Descarga tus 30 imágenes de Grok, colócalas en esa carpeta y vuelve a ejecutar este script.")
        return

    # Ordenar por tiempo de modificación (descarga)
    files_with_time = []
    for f in files:
        path = os.path.join(RAW_DIR, f)
        files_with_time.append((f, os.path.getmtime(path)))
    files_with_time.sort(key=lambda x: x[1])
    sorted_files = [x[0] for x in files_with_time]

    print(f"🔍 Encontradas {len(sorted_files)} imágenes raw en orden de descarga.")

    # 2. Definir la secuencia exacta de los primeros 30 jugadores de tu sesión limpia
    clean_sequence = [
        # --- ARGENTINA (1-11) ---
        ("001", "Lionel Satoshi"),
        ("002", "Dibu De-Fi"),
        ("003", "Julian Bull-varez"),
        ("004", "Enzo Ether"),
        ("005", "Rodrigo De-Pool"),
        ("006", "Angel Di Merkle"),
        ("007", "Alexis Mac-Chain"),
        ("008", "Cuti Crypt"),
        ("009", "Lisandro Butcher-DAO"),
        ("010", "Nahuel Mo-Wallet"),
        ("011", "Nico Taglia-Token"),
        
        # --- INGLATERRA (12-21 en Grok -> 24-33 en DB oficial) ---
        ("024", "Jude Belling-Swap"),
        ("023", "Harry Stake"),
        ("025", "Phil Fod-Phantom"),
        ("027", "Declan Rice-Validator"),
        ("026", "Bukayo Solana"),
        ("028", "Kyle Gas-Walker"),
        ("030", "John Stone-Base"),
        ("031", "Trent Cross-Arnold"),
        ("032", "Luke Vector"),
        ("033", "Cole Cold-Coin"),
        
        # --- BRASIL (22-30 en Grok -> 34-42 en DB oficial) ---
        ("034", "Neymar-NFT"),
        ("035", "Vinicius Jpeg Jr"),
        ("036", "Alisson Vault-son"),
        ("037", "Rodrygo-Yield"),
        ("038", "Bruno Guima-Liquid"),
        ("039", "Casemiro-Mint"),
        ("040", "Marquinhos-Server"),
        ("041", "Eder Mili-Pixel"),
        ("042", "Danilo-Legacy")
    ]

    # Mapear archivos con la secuencia
    mapping = []
    for i, filename in enumerate(sorted_files):
        if i >= len(clean_sequence):
            print(f"⚠️ Advertencia: Hay más imágenes ({len(sorted_files)}) que jugadores en la secuencia ({len(clean_sequence)}). Se omitirán las sobrantes.")
            break
            
        padded_id, parody_name = clean_sequence[i]
        safe_name = normalize_name(parody_name)
        
        new_raw_name = f"{padded_id}_{safe_name}.jpg"
        new_out_name = f"{padded_id}_{safe_name}.png"
        
        mapping.append((filename, new_raw_name, new_out_name, parody_name))

    print("\n📋 Plan de Procesamiento Planificado:")
    for old, new_raw, _, player in mapping:
        print(f"   🕒 {old}  ➔  {new_raw} ({player})")

    confirm = input("\n¿Confirmas que el orden cronológico es correcto y deseas procesar en masa? (s/n): ").strip().lower()
    if confirm not in ('s', 'si', 'y', 'yes'):
        print("❌ Operación cancelada. No se modificó ningún archivo.")
        return

    # 3. Renombrar y quitar fondos
    print("\n🚀 Renombrando archivos en masa...")
    renamed_items = []
    for old, new_raw, new_out, player in mapping:
        old_path = os.path.join(RAW_DIR, old)
        new_raw_path = os.path.join(RAW_DIR, new_raw)
        os.rename(old_path, new_raw_path)
        renamed_items.append((new_raw_path, new_out, player))

    print("\n🧠 Iniciando extracción de fondos por IA local...")
    for i, (input_path, out_filename, player_name) in enumerate(renamed_items, 1):
        output_path = os.path.join(OUTPUT_DIR, out_filename)
        try:
            print(f"   🧠 [{i}/{len(renamed_items)}] Procesando silueta: {player_name}...")
            with open(input_path, 'rb') as i_file:
                input_data = i_file.read()
                
            # Extracción con bordes suaves de calidad de estudio
            output_data = remove(input_data, alpha_matting=True, alpha_matting_foreground_threshold=240)
            
            with open(output_path, 'wb') as o_file:
                o_file.write(output_data)
                
            print(f"      ✅ Guardado en galería: {out_filename}")
        except Exception as e:
            print(f"      ❌ Error procesando {player_name}: {str(e)}")

    print("\n🎉 ¡PROCESO AUTOMÁTICO COMPLETO!")
    print(f"✨ Todas tus imágenes finales están listas en: {OUTPUT_DIR}")

if __name__ == "__main__":
    process_batch()
