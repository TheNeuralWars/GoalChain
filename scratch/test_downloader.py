from duckduckgo_search import DDGS
import urllib.request
import os
import ssl

def search_and_download_image(query, filepath):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
    
    print(f"Searching for: '{query}'")
    try:
        with DDGS() as ddgs:
            # Get up to 5 results to have fallbacks
            results = list(ddgs.images(query, max_results=5))
            
        if not results:
            print(f"❌ No results returned from DDG for: {query}")
            return False
            
        for r in results:
            img_url = r.get('image')
            if img_url:
                print(f"Trying to download: {img_url}")
                try:
                    img_req = urllib.request.Request(img_url, headers=headers)
                    with urllib.request.urlopen(img_req, context=ctx, timeout=10) as img_res:
                        with open(filepath, 'wb') as f:
                            f.write(img_res.read())
                    print(f"✅ Downloaded successfully to {filepath}")
                    return True
                except Exception as dl_err:
                    print(f"⚠️ Failed to download from {img_url}: {dl_err}. Trying next result...")
                    continue
        print(f"❌ Could not download any images for: {query}")
        return False
    except Exception as e:
        print(f"❌ Error during search/download: {e}")
        return False

if __name__ == "__main__":
    os.makedirs("scratch/test_images", exist_ok=True)
    print("Testing DDGS downloader with Lionel Messi...")
    search_and_download_image("Lionel Messi face portrait", "scratch/test_images/messi_face.jpg")
    search_and_download_image("Lionel Messi full body match action", "scratch/test_images/messi_body.jpg")
