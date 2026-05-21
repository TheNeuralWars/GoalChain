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
search_url = f"https://www.bing.com/images/search?q={url_query}"

req = urllib.request.Request(search_url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    print("Bing HTML Length:", len(html))
    
    # 1. Search for mediaurl=
    mediaurl_matches = re.findall(r'mediaurl=([^&"\']+)', html)
    print(f"Found {len(mediaurl_matches)} matches for 'mediaurl='")
    for idx, m in enumerate(mediaurl_matches[:10]):
        decoded = urllib.parse.unquote(m)
        print(f"  [{idx+1}] {decoded}")
        
    # 2. Search for any http/https URL inside the page that ends with jpg/png/jpeg/webp
    img_urls = re.findall(r'https?://[^"\']+\.(?:jpg|png|jpeg|webp)', html, re.IGNORECASE)
    print(f"Found {len(img_urls)} direct image URL matches")
    for idx, u in enumerate(list(set(img_urls))[:10]):
        print(f"  [{idx+1}] {u}")
        
except Exception as e:
    print("Error:", e)
