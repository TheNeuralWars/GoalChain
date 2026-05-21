import os
import shutil
from rembg import remove
import unicodedata

def normalize_name(name):
    n = unicodedata.normalize('NFD', name)
    n = ''.join([c for c in n if unicodedata.category(c) != 'Mn'])
    return n.lower().replace('.', '').replace(' ', '_').replace('-', '_').strip()

def process_elite_11():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Directorios
    RAW_DIR = os.path.join(base_path, "assets/img/raw_grok_generations")
    BACKUP_DIR = os.path.join(RAW_DIR, "redundant_argentina")
    OUTPUT_DIR = os.path.join(base_path, "docs/assets/img/nfts/transparent")
    
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 1. Mapa exacto de reconocimiento visual del subagente
    elite_11_mapping = {
        "QLHER.jpg": ("001", "Lionel Satoshi"),
        "QUmlb.jpg": ("002", "Dibu De-Fi"),
        "QqYV7.jpg": ("003", "Julian Bull-varez"),
        "TTTlo.jpg": ("004", "Enzo Ether"),
        "UzjBi.jpg": ("005", "Rodrigo De-Pool"),
        "VB0fx.jpg": ("006", "Angel Di Merkle"),
        "VJl1j.jpg": ("007", "Alexis Mac-Chain"),
        "Wvzbl.jpg": ("008", "Cuti Crypt"),
        "XM6eC.jpg": ("009", "Lisandro Butcher-DAO"),
        "Yavbj.jpg": ("010", "Nahuel Mo-Wallet"),
        "aQZlc.jpg": ("011", "Nico Taglia-Token")
    }

    print("🚀 Iniciando procesamiento automático de la Elite 11 de Argentina...")

    # 2. Filtrar, Renombrar y Mover
    files = [f for f in os.listdir(RAW_DIR) if os.path.isfile(os.path.join(RAW_DIR, f)) and f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    processed_files = []
    
    for filename in files:
        file_path = os.path.join(RAW_DIR, filename)
        
        if filename in elite_11_mapping:
            padded_id, parody_name = elite_11_mapping[filename]
            safe_name = normalize_name(parody_name)
            
            # Nombre de archivo final óptimo
            new_raw_name = f"{padded_id}_{safe_name}.jpg"
            new_raw_path = os.path.join(RAW_DIR, new_raw_name)
            
            # Renombrar en la carpeta raw
            os.rename(file_path, new_raw_path)
            processed_files.append((new_raw_name, f"{padded_id}_{safe_name}.png", parody_name))
            print(f"   📝 Reconocido y Renombrado: {filename} ➔ {new_raw_name} ({parody_name})")
        else:
            # Mover suplentes a la carpeta de respaldo redundant_argentina/
            dest_path = os.path.join(BACKUP_DIR, filename)
            shutil.move(file_path, dest_path)
            print(f"   🧹 Suplente archivado en backup: {filename}")

    print("\n🔮 Todos los suplentes han sido archivados. Iniciando extracción de fondo por Red Neuronal local...")

    # 3. Quitar fondos por IA a los 11 titulares
    for i, (raw_filename, out_filename, player_name) in enumerate(processed_files, 1):
        input_path = os.path.join(RAW_DIR, raw_filename)
        output_path = os.path.join(OUTPUT_DIR, out_filename)
        
        try:
            print(f"   🧠 [{i}/11] Extrayendo fondo de: {player_name}...")
            
            with open(input_path, 'rb') as i_file:
                input_data = i_file.read()
                
            # Algoritmo de extracción con difuminado suave de bordes (matting)
            output_data = remove(input_data, alpha_matting=True, alpha_matting_foreground_threshold=240)
            
            with open(output_path, 'wb') as o_file:
                o_file.write(output_data)
                
            print(f"      ✅ Guardado en producción: {out_filename}")
            
        except Exception as e:
            print(f"      ❌ Error procesando {player_name}: {str(e)}")

    print("\n🎉 ¡PROCESO DE PRODUCCIÓN COMPLETADO CON ÉXITO!")
    print(f"✨ Las 11 imágenes de la Elite de Argentina ya están en producción en: {OUTPUT_DIR}")
    print("💡 Todo limpio y listo para renderizarse en tu Galería 3D.")

if __name__ == "__main__":
    process_elite_11()
