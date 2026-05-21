with open('docs/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the button with an <a> tag that has relative z-indexed span
old_btn = '<button onclick="openAlphaModal(); closeMobile()" class="btn-glow" style="color:var(--primary); background: transparent; font-weight:900; border: 1px solid var(--primary); display: inline-flex; align-items: center; justify-content: center; height: 48px; border-radius: 24px; font-size: 1rem; width: 80%; cursor: pointer; font-family: inherit; line-height: 1;">LAUNCH APP</button>'

new_btn = '<a href="#" onclick="openAlphaModal(); closeMobile(); return false;" class="btn-glow" style="color:var(--primary); background: transparent; font-weight:900; border: 1px solid var(--primary); display: inline-flex; align-items: center; justify-content: center; height: 48px; border-radius: 24px; font-size: 1rem; width: 80%; cursor: pointer; text-decoration: none; font-family: inherit;"><span style="position: relative; z-index: 10;">LAUNCH APP</span></a>'

content = content.replace(old_btn, new_btn)

# Increment cache buster to v=3.5
content = content.replace('href="assets/css/style.css?v=3.4"', 'href="assets/css/style.css?v=3.5"')

with open('docs/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Increment other files cache busters to v=3.5
import os
docs_dir = 'docs'
for filename in os.listdir(docs_dir):
    if filename.endswith('.html') and filename != 'index.html':
        filepath = os.path.join(docs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        new_c = c.replace('href="assets/css/style.css?v=3.4"', 'href="assets/css/style.css?v=3.5"')
        if new_c != c:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_c)

print("Button structure fixed with <a> and <span>")
