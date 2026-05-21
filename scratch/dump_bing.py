import urllib.request
import urllib.parse
import ssl
import random
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
}
query = "Jude Bellingham face portrait"
url_query = urllib.parse.quote(query)
search_url = f"https://www.bing.com/images/search?q={url_query}"

req = urllib.request.Request(search_url, headers=headers)
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8', errors='ignore')
        
    print("Bing HTML Length:", len(html))
    with open("scratch/bing_dump.html", "w", encoding="utf-8") as f:
        f.write(html)
        
    # Print the title
    title = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if title:
        print("Page Title:", title.group(1))
    else:
        print("No Title tag found")
        
    # Search for any h1 tags
    h1s = re.findall(r'<h1[^>]*>([^<]+)</h1>', html, re.IGNORECASE)
    print("H1 tags:", h1s)
except Exception as e:
    print("Error:", e)
