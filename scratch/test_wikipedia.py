import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_wiki_image(player_name):
    # Step 1: Search Wikipedia for the player to find the exact page title
    search_query = urllib.parse.quote(player_name)
    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={search_query}&format=json"
    
    headers = {'User-Agent': 'GoalChainImageDownloader/1.0 (contact@goalchain.com)'}
    
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        search_results = data.get('query', {}).get('search', [])
        if not search_results:
            print(f"No Wikipedia page found for '{player_name}'")
            return None
            
        page_title = search_results[0]['title']
        print(f"Found page title: '{page_title}' for player: '{player_name}'")
        
        # Step 2: Get the page image thumbnail
        page_title_encoded = urllib.parse.quote(page_title)
        image_url = f"https://en.wikipedia.org/w/api.php?action=query&titles={page_title_encoded}&prop=pageimages&format=json&pithumbsize=600"
        
        req = urllib.request.Request(image_url, headers=headers)
        with urllib.request.urlopen(req, context=ctx) as response:
            img_data = json.loads(response.read().decode('utf-8'))
            
        pages = img_data.get('query', {}).get('pages', {})
        for page_id in pages:
            page = pages[page_id]
            thumbnail = page.get('thumbnail', {})
            source_url = thumbnail.get('source')
            if source_url:
                return source_url
                
        print(f"No thumbnail found in page '{page_title}'")
        return None
    except Exception as e:
        print(f"Error fetching wiki page for {player_name}: {e}")
        return None

if __name__ == "__main__":
    for name in ["Lionel Messi", "Jude Bellingham", "Emiliano Martínez", "Enzo Fernández"]:
        img = get_wiki_image(name)
        print(f"Image for {name}: {img}\n")
