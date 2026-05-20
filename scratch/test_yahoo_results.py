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
search_url = f"https://images.search.yahoo.com/search/images?p={url_query}"

req = urllib.request.Request(search_url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as response:
    html = response.read().decode('utf-8', errors='ignore')

print("Yahoo HTML Length:", len(html))

# Let's see all occurrences of '"iurl"' in the HTML
all_iurls = re.findall(r'"iurl"\s*:\s*"([^"]+)"', html)
print(f"Found {len(all_iurls)} occurrences of 'iurl'")
for idx, val in enumerate(all_iurls[:15]):
    print(f"[{idx+1}] {val}")
