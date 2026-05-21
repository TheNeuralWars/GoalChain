import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_wiki_images(player_name):
    # Step 1: Search Wikipedia to find exact page title
    search_query = urllib.parse.quote(player_name)
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={search_query}&format=json"
    headers = {'User-Agent': 'GoalChainImageDownloader/1.0 (contact@goalchain.com)'}
    
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
        search_results = data.get('query', {}).get('search', [])
        if not search_results:
            return None
        page_title = search_results[0]['title']
        print(f"Player: {player_name} -> Page: {page_title}")
        
        # Step 2: Get all images on the page
        page_title_encoded = urllib.parse.quote(page_title)
        images_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={page_title_encoded}&generator=images&gimlimit=30&prop=imageinfo&iiprop=url&format=json"
        
        req = urllib.request.Request(images_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            img_data = json.loads(response.read().decode('utf-8'))
            
        pages = img_data.get('query', {}).get('pages', {})
        urls = []
        for page_id in pages:
            page = pages[page_id]
            title = page.get('title', '')
            # Filter out commons icons, flags, edit icons, etc.
            if any(term in title.lower() for term in ['commons-logo', 'flag of', 'decrease', 'increase', 'wiktionary', 'steady', 'edit-cut', 'sound-icon', 'question book', 'padlock', 'red-info']):
                continue
            imageinfo = page.get('imageinfo', [])
            if imageinfo:
                url = imageinfo[0].get('url')
                if url:
                    urls.append((title, url))
                    
        return urls
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    for name in ["Lionel Messi", "Jude Bellingham"]:
        images = get_wiki_images(name)
        if images:
            print(f"Found {len(images)} images for {name}:")
            for idx, (title, url) in enumerate(images[:10]):
                print(f"  [{idx+1}] {title} -> {url}")
            print()
