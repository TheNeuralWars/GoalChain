import os
import requests
from io import BytesIO
from PIL import Image

try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

def main():
    url = "https://assets.grok.com/users/1489a633-dc2f-445b-8167-cb3f9285c322/generated/36ebd3e3-f56f-4e99-a1d8-aaca009d61fb/image.jpg"
    
    # Directorios de destino
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RAW_DIR = os.path.join(base_path, "assets/img/raw_grok_generations")
    IMG_NFTS_DIR = os.path.join(base_path, "docs/assets/img/nfts")
    IMAGES_NFTS_DIR = os.path.join(base_path, "docs/assets/images/nfts")

    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(IMG_NFTS_DIR, exist_ok=True)
    os.makedirs(IMAGES_NFTS_DIR, exist_ok=True)

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
    }

    try:
        print(f"📥 Descargando imagen de Cristiano Siu-toshi desde Grok CDN...")
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        img_data = r.content
        print(f"✅ ¡Descarga exitosa! ({len(img_data)} bytes)")

        # 1. Guardar copia RAW
        raw_path = os.path.join(RAW_DIR, "067_cristiano_siu_toshi.jpg")
        with open(raw_path, 'wb') as f:
            f.write(img_data)
        print(f"💾 Guardada imagen RAW en: {raw_path}")

        # 2. Guardar JPG en docs/assets/images/nfts/067_cristiano_siu-toshi.jpg (objetivo del script original)
        jpg_path = os.path.join(IMAGES_NFTS_DIR, "067_cristiano_siu-toshi.jpg")
        with open(jpg_path, 'wb') as f:
            f.write(img_data)
        print(f"💾 Guardada imagen JPG en: {jpg_path}")

        # 3. Remover fondo por IA local (rembg)
        if REMBG_AVAILABLE:
            print("🧠 Quitando fondo por Red Neuronal local (Alpha Matting activado)...")
            cleaned_data = remove(img_data, alpha_matting=True, alpha_matting_foreground_threshold=240)
            
            # Guardar en docs/assets/images/nfts/067_cristiano_siu_toshi.png
            png_path1 = os.path.join(IMAGES_NFTS_DIR, "067_cristiano_siu_toshi.png")
            with open(png_path1, 'wb') as f:
                f.write(cleaned_data)
            print(f"✅ ¡Guardado transparente de alta calidad! en: {png_path1}")

            # Guardar en docs/assets/img/nfts/067_cristiano_siu_toshi.png
            png_path2 = os.path.join(IMG_NFTS_DIR, "067_cristiano_siu_toshi.png")
            with open(png_path2, 'wb') as f:
                f.write(cleaned_data)
            print(f"✅ ¡Guardado transparente en img/nfts! en: {png_path2}")
        else:
            print("⚠️ 'rembg' no está instalado. Solo se guardaron los archivos JPG.")

    except Exception as e:
        print(f"❌ Error durante el procesamiento: {str(e)}")

if __name__ == "__main__":
    main()
