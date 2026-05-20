import urllib.request
import urllib.parse
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
}
query = "Jude Bellingham face portrait"
url_query = urllib.parse.quote(query)
search_url = f"https://www.google.com/search?q={url_query}&tbm=isch"

req = urllib.request.Request(search_url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    print("Google HTML Length:", len(html))
    
    # Google Images embeds thumbnails as "https://encrypted-tbn0.gstatic.com/images?q=tbn:..."
    matches = re.findall(r'https://encrypted-tbn0\.gstatic\.com/images\?q=tbn:[^"\']+', html)
    print(f"Found {len(matches)} matches for gstatic thumbnails")
    for idx, m in enumerate(list(set(matches))[:10]):
        print(f"[{idx+1}] {m}")
        
except Exception as e:
    print("Error:", e)
