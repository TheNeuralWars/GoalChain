import urllib.request
import urllib.parse
import json
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def search_wikipedia(player_name, lang='en'):
    search_query = urllib.parse.quote(player_name)
    search_url = f"https://{lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch={search_query}&format=json"
    headers = {'User-Agent': 'GoalChainImageDownloader/1.0 (contact@goalchain.com)'}
    
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
        search_results = data.get('query', {}).get('search', [])
        if search_results:
            return search_results[0]['title']
    except Exception as e:
        print(f"  [Wiki {lang}] search error for {player_name}: {e}")
    return None

def get_wikipedia_images(page_title, lang='en'):
    headers = {'User-Agent': 'GoalChainImageDownloader/1.0 (contact@goalchain.com)'}
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
        print(f"  [Wiki {lang}] error getting pageimage for {page_title}: {e}")
        
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
            # We take the first image that is not the main one as the body shot
            body_url = other_urls[0]
    except Exception as e:
        pass
        
    return portrait_url, body_url

def download_image(url, filepath):
    headers = {'User-Agent': 'GoalChainImageDownloader/1.0 (contact@goalchain.com)'}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            content = response.read()
            if len(content) > 5000:
                with open(filepath, 'wb') as f:
                    f.write(content)
                return True
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
    return False

def process_player(player_name, p_id):
    print(f"👤 Processing {player_name} (ID: {p_id})")
    
    # 1. Search in English Wikipedia
    page_title = search_wikipedia(player_name, 'en')
    lang = 'en'
    
    # 2. Fallback to Spanish Wikipedia
    if not page_title:
        page_title = search_wikipedia(player_name, 'es')
        lang = 'es'
        
    if not page_title:
        print(f"  ❌ No Wikipedia page found in EN or ES.")
        return False
        
    portrait_url, body_url = get_wikipedia_images(page_title, lang)
    
    if not portrait_url:
        print(f"  ❌ No images found on Wikipedia page '{page_title}'")
        return False
        
    if not body_url:
        print(f"  ⚠️ No separate body image found, falling back to using portrait image for both.")
        body_url = portrait_url
        
    print(f"  Portrait URL: {portrait_url}")
    print(f"  Body URL: {body_url}")
    
    os.makedirs("scratch/test_wiki_dl", exist_ok=True)
    portrait_file = f"scratch/test_wiki_dl/{p_id}_portrait.jpg"
    body_file = f"scratch/test_wiki_dl/{p_id}_body.jpg"
    
    p_ok = download_image(portrait_url, portrait_file)
    b_ok = download_image(body_url, body_file)
    
    if p_ok and b_ok:
        print(f"  ✅ Successfully downloaded both images!")
        return True
    return False

if __name__ == "__main__":
    players = [
        "Lionel Messi",
        "Jude Bellingham",
        "Alexis Mac Allister",
        "Cristian Romero",
        "Enzo Fernández",
        "Nahuel Molina"
    ]
    for idx, p in enumerate(players):
        process_player(p, f"{idx+1:03d}")
