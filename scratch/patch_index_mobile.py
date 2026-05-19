import re

with open('docs/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add classes to the launch app and collabs button so we can target them
content = content.replace('onclick="openAlphaModal()" class="btn-glow"', 'onclick="openAlphaModal()" class="btn-glow desktop-only-btn"')
content = content.replace('<div class="nav-dropdown" style="position:relative; display:inline-block; flex-shrink: 0;">', '<div class="nav-dropdown desktop-only-btn" style="position:relative; display:inline-block; flex-shrink: 0;">')

# 2. Add them to the mobile menu
mobile_btns = """
        <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
        <button onclick="openAlphaModal(); toggleMenu()" class="btn-glow" style="color:var(--primary); background: transparent; font-weight:900; border: 1px solid var(--primary); padding: 10px 15px; border-radius: 20px; font-size: 1rem; width: 100%;">LAUNCH APP</button>
        <a href="colabs.html" style="color:var(--secondary); font-weight:900; text-align:center; border: 1px solid var(--secondary); padding: 10px; border-radius: 20px; margin-top: 10px;" data-i18n="nav_colabs">COLABS</a>
        <a href="mega-guide.html" style="color:var(--primary); font-weight:900; text-align:center; margin-top: 10px;" data-i18n="nav_guide_v2">⚡ Mega Guía v2.0</a>
"""

if "LAUNCH APP" not in content.split('id="mobileMenu"')[1]:
    content = content.replace('<a href="#social" data-i18n="nav_social" onclick="toggleMenu()">Social</a>', '<a href="#social" data-i18n="nav_social" onclick="toggleMenu()">Social</a>' + mobile_btns)

with open('docs/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Update style.css
with open('docs/assets/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

if '.desktop-only-btn { display: none !important; }' not in css:
    css = css.replace('@media (max-width: 900px) {', '@media (max-width: 900px) {\n    .desktop-only-btn { display: none !important; }\n')

with open('docs/assets/css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("index.html patched")
