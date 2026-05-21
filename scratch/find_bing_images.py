import re

with open("scratch/bing_dump.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's count how many times "iusc" appears in the HTML as a substring
print("Total occurrences of 'iusc':", html.count("iusc"))

# Find all occurrences of the substring "murl"
print("Total occurrences of 'murl':", html.count("murl"))

# Let's find all occurrences of 'm="' or 'm ='
m_attributes = re.findall(r'\sm="([^"]+)"', html)
print(f"Found {len(m_attributes)} matches for 'm=\"...\"'")

# Let's look at the first 5 matches of 'm="'
for idx, m in enumerate(m_attributes[:5]):
    print(f"[{idx+1}] {m[:200]}")

# Let's search for any URL that contains jpg, jpeg, png or webp
# We'll look for strings starting with http or https, containing some characters, and ending with an image extension.
# Since it's inside HTML, they might be HTML-escaped or JSON-escaped.
urls = re.findall(r'https?://[^"\'\s&<>]+?\.(?:jpg|jpeg|png|webp)', html, re.IGNORECASE)
print(f"Found {len(urls)} unique image URLs directly in text")
for idx, u in enumerate(list(set(urls))[:15]):
    print(f"[{idx+1}] {u}")
