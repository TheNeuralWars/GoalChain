import urllib.request
import urllib.parse
import re
import ssl
import random

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0'
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': random.choice(USER_AGENTS)}
query = "Jude Bellingham face portrait"
url_query = urllib.parse.quote(query)
# gbv=1 forces the standard HTML interface with no JS
search_url = f"https://www.google.com/search?q={url_query}&tbm=isch&gbv=1"

req = urllib.request.Request(search_url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    print("Google GBV HTML Length:", len(html))
    
    # Save the HTML to check it
    with open("scratch/google_gbv_dump.html", "w", encoding="utf-8") as f:
        f.write(html)
        
    # Search for all image tags
    img_tags = re.findall(r'<img[^>]+src="([^"]+)"', html)
    print(f"Found {len(img_tags)} img tags with src")
    for idx, img in enumerate(img_tags[:10]):
        print(f"[{idx+1}] {img[:100]}")
        
except Exception as e:
    print("Error:", e)
