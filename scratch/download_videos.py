import os
import requests

def download_videos():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    video_dir = os.path.join(base_path, "docs/assets/video/stadiums")
    os.makedirs(video_dir, exist_ok=True)

    videos = {
        "neo_olympus.mp4": "https://imagine-public.x.ai/imagine-public/share-videos/2840a222-8360-4ea3-b7fb-9972e24678b6.mp4",
        "dome_kronos.mp4": "https://imagine-public.x.ai/imagine-public/share-videos/c5f355bd-f8dd-4a21-8a43-bb33a933e357.mp4",
        "titanium_coliseum.mp4": "https://imagine-public.x.ai/imagine-public/share-videos/91d5bd2a-fa1e-4f0e-870e-13e442f893af.mp4",
        "obsidian_arena.mp4": "https://imagine-public.x.ai/imagine-public/share-videos/15b32875-a5c0-4c9a-a285-58549bb64ed9.mp4",
        "aether_dome.mp4": "https://imagine-public.x.ai/imagine-public/share-videos/a9c6d1ab-dde3-4410-add4-4be165813801.mp4"
    }

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://grok.com/"
    }

    print("🚀 Iniciando descarga de videos de estadios en producción...")

    for name, url in videos.items():
        try:
            print(f"   📥 Descargando {name} desde {url}...")
            r = requests.get(url, headers=headers, timeout=60)
            r.raise_for_status()
            
            # Verificar si realmente se descargó un archivo de video y no un HTML
            content_type = r.headers.get('Content-Type', '')
            if 'html' in content_type.lower() or b'<!DOCTYPE html>' in r.content[:200]:
                print(f"      ❌ Error: Se recibió HTML en lugar de video para {name}. Probablemente Cloudflare bloqueó el User Agent.")
                continue

            dest_path = os.path.join(video_dir, name)
            with open(dest_path, 'wb') as f:
                f.write(r.content)
            print(f"      ✅ Video guardado con éxito: {dest_path} ({len(r.content)} bytes)")
        except Exception as e:
            print(f"      ❌ Error descargando {name}: {str(e)}")

if __name__ == "__main__":
    download_videos()
