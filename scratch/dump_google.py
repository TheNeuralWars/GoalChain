import urllib.request
import urllib.parse
import ssl
import random

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
    with open("scratch/google_dump.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Dumped first 500 chars:")
    print(html[:500])
except Exception as e:
    print("Error:", e)
