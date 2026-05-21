import re

# 1. Update docs/index.html
with open('docs/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add language toggle to mobile menu if not present
lang_toggle_mobile = """
        <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
        <div style="display: flex; justify-content: center; gap: 20px; padding: 10px;">
            <button onclick="setLang('es'); toggleMenu()" style="background:transparent; border:1px solid #14f195; color:#14f195; padding:8px 20px; border-radius:10px; cursor:pointer;">ES</button>
            <button onclick="setLang('en'); toggleMenu()" style="background:transparent; border:1px solid #9945ff; color:#9945ff; padding:8px 20px; border-radius:10px; cursor:pointer;">EN</button>
        </div>
"""

if "lang-toggle-mobile" not in content:
    content = content.replace('<!-- MOBILE MENU -->\n    <div class="mobile-menu" id="mobileMenu">', '<!-- MOBILE MENU -->\n    <div class="mobile-menu" id="mobileMenu">\n        <!-- lang-toggle-mobile -->')
    content = content.replace('<a href="#social" data-i18n="nav_social" onclick="toggleMenu()">Social</a>', '<a href="#social" data-i18n="nav_social" onclick="toggleMenu()">Social</a>' + lang_toggle_mobile)

with open('docs/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update docs/assets/css/style.css to hide lang-toggle on mobile (under 600px)
with open('docs/assets/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_media_replacement = """@media (max-width: 600px) {
    .lang-toggle { display: none !important; }"""

if ".lang-toggle { display: none !important; }" not in css:
    css = css.replace('@media (max-width: 600px) {', mobile_media_replacement)

with open('docs/assets/css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Language toggle patched in index and CSS")
