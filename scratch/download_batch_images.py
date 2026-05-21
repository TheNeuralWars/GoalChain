import os
import sys
import json
import time
import urllib.request
import urllib.parse
import ssl

USER_AGENT = 'GoalChainImageDownloader/1.0 (contact@goalchain.com)'
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search_wikipedia(player_name, lang='en'):
    search_query = urllib.parse.quote(player_name)
    search_url = f"https://{lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch={search_query}&format=json"
    headers = {'User-Agent': USER_AGENT}
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
        search_results = data.get('query', {}).get('search', [])
        if search_results:
            return search_results[0]['title']
    except Exception as e:
        print(f"  [Wiki {lang}] Search error for {player_name}: {e}")
    return None

def get_wikipedia_images(page_title, lang='en'):
    headers = {'User-Agent': USER_AGENT}
    page_title_encoded = urllib.parse.quote(page_title)
    
    # 1. Get main page image (portrait)
    portrait_url = None
    pi_url = f"https://{lang}.wikipedia.org/w/api.php?action=query&titles={page_title_encoded}&prop=pageimages&format=json&pithumbsize=800"
    try:
        req = urllib.request.Request(pi_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        for pid in pages:
            thumbnail = pages[pid].get('thumbnail', {})
            portrait_url = thumbnail.get('source')
    except Exception as e:
        print(f"  [Wiki {lang}] Error getting pageimage for {page_title}: {e}")
        
    # 2. Get all images on page (for body fallback)
    body_url = None
    images_url = f"https://{lang}.wikipedia.org/w/api.php?action=query&titles={page_title_encoded}&generator=images&gimlimit=30&prop=imageinfo&iiprop=url&format=json"
    try:
        req = urllib.request.Request(images_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        
        other_urls = []
        for pid in pages:
            page = pages[pid]
            title = page.get('title', '')
            # Filter out commons icons, flags, metadata, etc.
            if any(term in title.lower() for term in ['commons-logo', 'flag of', 'decrease', 'increase', 'wiktionary', 'steady', 'edit-cut', 'sound-icon', 'question book', 'padlock', 'red-info', '.svg']):
                continue
            imageinfo = page.get('imageinfo', [])
            if imageinfo:
                url = imageinfo[0].get('url')
                if url and url != portrait_url:
                    other_urls.append(url)
                    
        if other_urls:
            body_url = other_urls[0]
    except Exception as e:
        pass
        
    return portrait_url, body_url

def download_image(url, filepath):
    headers = {'User-Agent': USER_AGENT}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
            content = response.read()
            if len(content) > 5000:
                with open(filepath, 'wb') as f:
                    f.write(content)
                return True
    except Exception as e:
        print(f"  ⚠️ Error downloading {url}: {e}")
    return False

def get_images_for_player(player_name, portrait_file, fullbody_file):
    # Skip if files already exist
    portrait_ok = os.path.exists(portrait_file) and os.path.getsize(portrait_file) > 5000
    fullbody_ok = os.path.exists(fullbody_file) and os.path.getsize(fullbody_file) > 5000
    
    if portrait_ok and fullbody_ok:
        print("  Portrait y Fullbody ya existen. Saltando.")
        return True
        
    # Search Wikipedia (EN)
    page_title = search_wikipedia(player_name, 'en')
    lang = 'en'
    
    # Fallback to ES Wikipedia
    if not page_title:
        page_title = search_wikipedia(player_name, 'es')
        lang = 'es'
        
    if not page_title:
        print(f"  ❌ No Wikipedia page found for '{player_name}' in EN or ES.")
        return False
        
    portrait_url, body_url = get_wikipedia_images(page_title, lang)
    
    if not portrait_url:
        print(f"  ❌ No images found on Wikipedia for '{page_title}'")
        return False
        
    if not body_url:
        print(f"  ⚠️ Only one image found on Wikipedia, using it for both portrait and body.")
        body_url = portrait_url

    # Download portrait if not exists
    if not portrait_ok:
        print(f"  Downloading portrait: {portrait_url}")
        portrait_ok = download_image(portrait_url, portrait_file)
        time.sleep(0.5) # Soft delay
        
    # Download body if not exists
    if not fullbody_ok:
        print(f"  Downloading body: {body_url}")
        fullbody_ok = download_image(body_url, fullbody_file)
        time.sleep(0.5) # Soft delay
        
    return portrait_ok and fullbody_ok

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 download_batch_images.py <batch_number>")
        sys.exit(1)
        
    try:
        batch_num = int(sys.argv[1])
    except ValueError:
        print("❌ Batch number must be an integer.")
        sys.exit(1)
        
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    batch_folder_name = f"batch_{batch_num:02d}"
    batch_path = os.path.join(base_path, f"scratch/grok_batches/{batch_folder_name}")
    json_path = os.path.join(batch_path, f"prompts_batch_{batch_num:02d}.json")
    
    if not os.path.exists(json_path):
        print(f"❌ Batch JSON not found: {json_path}")
        sys.exit(1)
        
    print(f"🚀 Iniciando descargas para el Batch {batch_num:02d} (vía Wikipedia)...")
    with open(json_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    success_count = 0
    total_players = len(players)
    
    for i, p in enumerate(players):
        player_name = p['real_name']
        padded_id = p['padded_id']
        print(f"\n👤 [{i+1}/{total_players}] {player_name} (ID: {padded_id})")
        
        portrait_file = os.path.join(batch_path, f"{padded_id}_portrait.jpg")
        fullbody_file = os.path.join(batch_path, f"{padded_id}_fullbody.jpg")
        
        success = get_images_for_player(player_name, portrait_file, fullbody_file)
        if success:
            success_count += 1
            print(f"  ✅ {player_name} descargado completamente.")
        else:
            print(f"  ❌ Falló la descarga de {player_name}.")
            
        time.sleep(0.5) # Soft delay between players
        
    print(f"\n✨ Batch {batch_num:02d} finalizado.")
    print(f"📊 Jugadores exitosos: {success_count}/{total_players}")

if __name__ == "__main__":
    main()
