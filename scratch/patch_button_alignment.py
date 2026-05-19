with open('docs/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the button styles for perfect centering using flexbox
old_btn = '<button onclick="openAlphaModal(); closeMobile()" class="btn-glow" style="color:var(--primary); background: transparent; font-weight:900; border: 1px solid var(--primary); padding: 12px 25px; border-radius: 20px; font-size: 1rem; width: 80%; cursor: pointer; font-family: inherit;">LAUNCH APP</button>'

new_btn = '<button onclick="openAlphaModal(); closeMobile()" class="btn-glow" style="color:var(--primary); background: transparent; font-weight:900; border: 1px solid var(--primary); display: inline-flex; align-items: center; justify-content: center; height: 48px; border-radius: 24px; font-size: 1rem; width: 80%; cursor: pointer; font-family: inherit; line-height: 1;">LAUNCH APP</button>'

if old_btn in content:
    content = content.replace(old_btn, new_btn)
else:
    # If already modified or slightly different, do a robust replace
    import re
    content = re.sub(
        r'<button onclick="openAlphaModal\(\); closeMobile\(\)" class="btn-glow" style="[^"]*">LAUNCH APP</button>',
        new_btn,
        content
    )

# Increment cache buster to v=3.4
content = content.replace('href="assets/css/style.css?v=3.3"', 'href="assets/css/style.css?v=3.4"')

with open('docs/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Also update cache busters in other files to v=3.4
import os
docs_dir = 'docs'
for filename in os.listdir(docs_dir):
    if filename.endswith('.html') and filename != 'index.html':
        filepath = os.path.join(docs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        new_c = c.replace('href="assets/css/style.css?v=3.3"', 'href="assets/css/style.css?v=3.4"')
        if new_c != c:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_c)

print("Button style aligned and cache buster incremented to v=3.4")
