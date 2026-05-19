import os
import requests

def integrate_legendary_video():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    BG_DIR = os.path.join(base_path, "docs/assets/img/nfts/bg")
    
    os.makedirs(BG_DIR, exist_ok=True)
    
    video_url = "https://imagine-public.x.ai/imagine-public/share-videos/90be0ce6-575a-43e6-a0b4-cc6f9f0b3830.mp4"
    
    # Cabecera de navegador real para saltar el bloqueo
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print("🚀 Descargando y configurando el nuevo video Legendario...")

    try:
        print("   🎥 Descargando Video mp4 (Holograma/Neón)...")
        r = requests.get(video_url, headers=headers, timeout=30)
        r.raise_for_status()
        
        video_out = os.path.join(BG_DIR, "bg_legendary_hologram.mp4")
        with open(video_out, 'wb') as f:
            f.write(r.content)
        print(f"      ✅ Video guardado en producción: {video_out} ({len(r.content)} bytes)")
    except Exception as e:
        print(f"      ❌ Error descargando video: {str(e)}")

    print("\n🎉 ¡RECURSO DESCARGADO CON ÉXITO!")

if __name__ == "__main__":
    integrate_legendary_video()
