import os
import sys
import json
import time
import urllib.request
import urllib.parse
import re
import ssl
import random
from duckduckgo_search import DDGS

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
]

def download_file(url, filepath, headers, ctx):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
            content_type = response.headers.get('Content-Type', '')
            # Verify it's an image
            if 'image' not in content_type.lower() and not any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                print(f"  ⚠️ Warning: URL might not be a valid image (Content-Type: {content_type})")
            
            content = response.read()
            if len(content) < 5000: # Files under 5KB are likely error pages or tiny icons
                print(f"  ⚠️ File too small ({len(content)} bytes), skipping.")
                return False
                
            with open(filepath, 'wb') as f:
                f.write(content)
        return True
    except Exception as e:
        print(f"  ⚠️ Error downloading {url}: {e}")
        return False

def search_ddg_with_backoff(query, max_retries=4):
    backoff = 10
    for attempt in range(max_retries):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.images(query, max_results=5))
                if results:
                    return results
                else:
                    print(f"  ⚠️ No results returned from DDG. Retrying...")
        except Exception as e:
            print(f"  ⚠️ DDG search failed (Attempt {attempt+1}/{max_retries}): {e}")
            if "Ratelimit" in str(e) or "403" in str(e) or "429" in str(e):
                sleep_time = backoff + random.uniform(2, 5)
                print(f"  ⏳ Rate limited. Sleeping for {sleep_time:.1f}s...")
                time.sleep(sleep_time)
                backoff *= 2 # Exponential backoff
            else:
                time.sleep(3)
    return None

def fallback_yahoo_search(query, ctx):
    print("  🔄 Falling back to Yahoo Images scraper...")
    headers = {'User-Agent': random.choice(USER_AGENTS)}
    url_query = urllib.parse.quote(query)
    search_url = f"https://images.search.yahoo.com/search/images?p={url_query}"
    
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
        # Yahoo stores image URLs inside a JSON string or "iurl":"(http...)"
        matches = re.findall(r'"iurl"\s*:\s*"([^"]+)"', html)
        urls = []
        for url in matches:
            url = url.replace('\\/', '/')
            if url.startswith('http') and any(ext in url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                urls.append(url)
                
        return urls
    except Exception as e:
        print(f"  ❌ Yahoo fallback failed: {e}")
        return []

def get_images_for_player(player_name, portrait_file, fullbody_file, ctx):
    headers = {'User-Agent': random.choice(USER_AGENTS)}
    
    # 1. DOWNLOAD PORTRAIT
    portrait_ok = False
    if os.path.exists(portrait_file) and os.path.getsize(portrait_file) > 5000:
        print(f"  Portrait ya existe. Saltando.")
        portrait_ok = True
    else:
        # Search queries
        portrait_query = f"{player_name} face portrait close up headshot"
        print(f"  Buscando retrato: '{portrait_query}'...")
        
        results = search_ddg_with_backoff(portrait_query)
        urls = []
        if results:
            urls = [r.get('image') for r in results if r.get('image')]
            
        if not urls:
            urls = fallback_yahoo_search(portrait_query, ctx)
            
        if urls:
            for idx, img_url in enumerate(urls[:3]):
                print(f"  Trying option {idx+1}: {img_url}")
                time.sleep(random.uniform(1.0, 2.0))
                if download_file(img_url, portrait_file, headers, ctx):
                    portrait_ok = True
                    break
        else:
            print("  ❌ No URLs found for portrait.")

    # Delay between searches
    time.sleep(random.uniform(3.0, 6.0))

    # 2. DOWNLOAD FULLBODY
    fullbody_ok = False
    if os.path.exists(fullbody_file) and os.path.getsize(fullbody_file) > 5000:
        print(f"  Fullbody ya existe. Saltando.")
        fullbody_ok = True
    else:
        fullbody_query = f"{player_name} full body match action celebration"
        print(f"  Buscando cuerpo completo: '{fullbody_query}'...")
        
        results = search_ddg_with_backoff(fullbody_query)
        urls = []
        if results:
            urls = [r.get('image') for r in results if r.get('image')]
            
        if not urls:
            urls = fallback_yahoo_search(fullbody_query, ctx)
            
        if urls:
            for idx, img_url in enumerate(urls[:3]):
                print(f"  Trying option {idx+1}: {img_url}")
                time.sleep(random.uniform(1.0, 2.0))
                if download_file(img_url, fullbody_file, headers, ctx):
                    fullbody_ok = True
                    break
        else:
            print("  ❌ No URLs found for fullbody.")

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
        
    print(f"🚀 Iniciando descargas para el Batch {batch_num:02d}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    success_count = 0
    total_players = len(players)
    
    for i, p in enumerate(players):
        player_name = p['real_name']
        padded_id = p['padded_id']
        print(f"\n👤 [{i+1}/{total_players}] {player_name} (ID: {padded_id})")
        
        portrait_file = os.path.join(batch_path, f"{padded_id}_portrait.jpg")
        fullbody_file = os.path.join(batch_path, f"{padded_id}_fullbody.jpg")
        
        success = get_images_for_player(player_name, portrait_file, fullbody_file, ctx)
        if success:
            success_count += 1
            print(f"  ✅ {player_name} descargado completamente.")
        else:
            print(f"  ❌ Falló la descarga de {player_name}.")
            
        # Sleep between players to keep rate limits low
        time.sleep(random.uniform(4.0, 8.0))
        
    print(f"\n✨ Batch {batch_num:02d} finalizado.")
    print(f"📊 Jugadores exitosos: {success_count}/{total_players}")

if __name__ == "__main__":
    main()
