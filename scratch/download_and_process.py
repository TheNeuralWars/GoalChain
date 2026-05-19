import os
import requests
from io import BytesIO
from PIL import Image
from rembg import remove
import unicodedata

def normalize_name(name):
    n = unicodedata.normalize('NFD', name)
    n = ''.join([c for c in n if unicodedata.category(c) != 'Mn'])
    return n.lower().replace('.', '').replace(' ', '_').replace('-', '_').strip()

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Directorios de Destino
    BG_DIR = os.path.join(base_path, "docs/assets/img/nfts/bg")
    RAW_DIR = os.path.join(base_path, "assets/img/raw_grok_generations")
    TRANSPARENT_DIR = os.path.join(base_path, "docs/assets/img/nfts/transparent")
    
    # Crear carpetas si no existen
    os.makedirs(BG_DIR, exist_ok=True)
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(TRANSPARENT_DIR, exist_ok=True)
    
    # Headers para simular navegador en las descargas CDN
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    # ==========================================
    # 🏁 PARTE 1: DESCARGA Y PROCESADO DE FONDOS
    # ==========================================
    backgrounds = {
        "bg_mythic_lunar.png": "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/3ed12569-41c3-4676-b0ca-64a296f3727b/image.jpg",
        "bg_epic_aurora.png": "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/ec8c72b2-cdcc-4518-8356-47f58c4ea5be/image.jpg"
    }
    
    print("🌅 Iniciando descarga y optimización de Fondos de Estadio...")
    for filename, url in backgrounds.items():
        try:
            print(f"   📥 Descargando fondo: {filename}...")
            r = requests.get(url, headers=headers, timeout=30)
            r.raise_for_status()
            
            # Abrir JPG con Pillow y convertir a PNG
            img = Image.open(BytesIO(r.content))
            out_path = os.path.join(BG_DIR, filename)
            img.save(out_path, format="PNG", optimize=True)
            print(f"      ✅ Guardado y convertido a PNG en producción: {out_path}")
        except Exception as e:
            print(f"      ❌ Error descargando fondo {filename}: {str(e)}")

    # ==========================================
    # 🏃 PARTE 2: DESCARGA Y EXTRACCIÓN DE JUGADORES
    # ==========================================
    players = [
        ("006", "Angel Di Merkle", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/7deea341-01b0-4b8d-9a34-9165197ef509/image.jpg"),
        ("011", "Nico Taglia-Token", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/c81d9688-6305-4c8b-8bb6-d8511dd2dc2f/image.jpg"),
        ("026", "Bukayo Solana", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/25318ffd-653b-443f-b20b-9230129971d0/image.jpg"),
        ("032", "Luke Vector", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/7af58dca-b8e5-416c-bc21-0a04af3966fd/image.jpg"),
        ("034", "Neymar-NFT", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/7d02893a-9e46-4d96-bec8-0b7e10142c69/image.jpg"),
        ("039", "Casemiro-Mint", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/15d10ed6-332f-40bc-bc3e-3c5c78dccd81/image.jpg"),
        ("040", "Marquinhos-Server", "https://assets.grok.com/users/4817809c-c9cb-4c86-bb7b-841cd2a563b9/generated/ce783073-4de4-442b-80f7-91004fd0a749/image.jpg")
    ]
    
    print("\n🏃 Iniciando descarga y extracción de los 7 Jugadores Aprobados...")
    
    for i, (padded_id, parody_name, url) in enumerate(players, 1):
        safe_name = normalize_name(parody_name)
        raw_filename = f"{padded_id}_{safe_name}.jpg"
        out_filename = f"{padded_id}_{safe_name}.png"
        
        raw_path = os.path.join(RAW_DIR, raw_filename)
        output_path = os.path.join(TRANSPARENT_DIR, out_filename)
        
        # 1. Descargar imagen Raw
        try:
            print(f"   📥 [{i}/7] Descargando foto raw de: {parody_name}...")
            r = requests.get(url, headers=headers, timeout=30)
            r.raise_for_status()
            
            with open(raw_path, 'wb') as f:
                f.write(r.content)
            print(f"      📝 Guardada en raw: {raw_filename}")
            
            # 2. Quitar fondo por IA local
            print(f"      🧠 [{i}/7] Removiendo fondo por Red Neuronal local...")
            with open(raw_path, 'rb') as i_file:
                input_data = i_file.read()
            
            # Aplicar extracción con difuminado fino de siluetas
            output_data = remove(input_data, alpha_matting=True, alpha_matting_foreground_threshold=240)
            
            with open(output_path, 'wb') as o_file:
                o_file.write(output_data)
            print(f"      ✅ Guardado transparente en producción: {out_filename}")
            
        except Exception as e:
            print(f"      ❌ Error procesando {parody_name}: {str(e)}")

    print("\n🎉 ¡PROCESAMIENTO DE PRODUCCIÓN INTEGRADO COMPLETO!")
    print(f"✨ Estadios y retratos transparentes listos para la galería 3D.")

if __name__ == "__main__":
    main()
