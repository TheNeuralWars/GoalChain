import urllib.request
import urllib.parse
import re
import ssl
import random

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': random.choice(USER_AGENTS)}
query = "Jude Bellingham face portrait"
url_query = urllib.parse.quote(query)
# tbm=isch means image search
search_url = f"https://www.google.com/search?q={url_query}&tbm=isch"

req = urllib.request.Request(search_url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    print("Google HTML Length:", len(html))
    
    # Google encodes image URLs in a script tag in the format: ["http://url.jpg", height, width]
    # Let's search for matches like: ["http...", height, width]
    # We can match: ["http[^"]+",\d+,\d+]
    matches = re.findall(r'\["(http[^"]+)",\d+,\d+\]', html)
    print(f"Found {len(matches)} matches using standard regex")
    for idx, m in enumerate(matches[:10]):
        print(f"[{idx+1}] {m}")
        
except Exception as e:
    print("Error:", e)
