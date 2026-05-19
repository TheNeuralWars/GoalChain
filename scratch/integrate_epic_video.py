import os
import requests
from io import BytesIO
from PIL import Image

def integrate_epic_video():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BG_DIR = os.path.join(base_path, "docs/assets/img/nfts/bg")
    
    os.makedirs(BG_DIR, exist_ok=True)
    
    video_url = "https://imagine-public.x.ai/imagine-public/share-videos/babaafd0-bb92-4df6-8144-cc21ad43a722.mp4"
    image_url = "https://imagine-public.x.ai/imagine-public/share-images/ec8c72b2-cdcc-4518-8356-47f58c4ea5be.jpg"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print("🚀 Descargando y configurando los nuevos recursos Épicos (Video + Estático)...")

    # 1. Descargar Video
    try:
        print("   🎥 Descargando Video mp4...")
        r = requests.get(video_url, headers=headers, timeout=30)
        r.raise_for_status()
        
        video_out = os.path.join(BG_DIR, "bg_epic_aurora.mp4")
        with open(video_out, 'wb') as f:
            f.write(r.content)
        print(f"      ✅ Video guardado en producción: {video_out}")
    except Exception as e:
        print(f"      ❌ Error descargando video: {str(e)}")

    # 2. Descargar Imagen Estática de Fallback
    try:
        print("   🌅 Descargando Imagen estática de fallback...")
        r = requests.get(image_url, headers=headers, timeout=30)
        r.raise_for_status()
        
        # Abrir JPG y guardar como PNG
        img = Image.open(BytesIO(r.content))
        image_out = os.path.join(BG_DIR, "bg_epic_aurora.png")
        img.save(image_out, format="PNG", optimize=True)
        print(f"      ✅ Imagen estática guardada en producción: {image_out}")
    except Exception as e:
        print(f"      ❌ Error guardando imagen estática: {str(e)}")

    print("\n🎉 ¡RECURSOS DESCARGADOS CON ÉXITO!")

if __name__ == "__main__":
    integrate_epic_video()
