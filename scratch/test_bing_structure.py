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
query = "Enzo Fernández face portrait"
url_query = urllib.parse.quote(query)
search_url = f"https://www.bing.com/images/search?q={url_query}"

req = urllib.request.Request(search_url, headers=headers)
with urllib.request.urlopen(req, context=ctx) as response:
    html = response.read().decode('utf-8', errors='ignore')

print("Occurrences of 'murl':", html.count('murl'))
print("Occurrences of 'class=\"iusc\"':", html.count('class="iusc"'))
print("Occurrences of 'class=\'iusc\'':", html.count("class='iusc'"))

# Find all instances of murl
murl_matches = re.findall(r'"murl"\s*:\s*"([^"]+)"', html)
print(f"Found {len(murl_matches)} matches for '\"murl\":\"url\"'")
if murl_matches:
    for idx, url in enumerate(murl_matches[:10]):
        print(f"[{idx+1}] {url}")
