with open('docs/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's clean up any previous failed additions to avoid duplicate text
# (Though there shouldn't be any, as the replace failed)

# Insert LAUNCH APP button into mobile menu
launch_app_mobile = """
        <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0; width: 80%;">
        <button onclick="openAlphaModal(); closeMobile()" class="btn-glow" style="color:var(--primary); background: transparent; font-weight:900; border: 1px solid var(--primary); padding: 12px 25px; border-radius: 20px; font-size: 1rem; width: 80%; cursor: pointer; font-family: inherit;">LAUNCH APP</button>
"""

# We'll place it right after the main nav links (after Social)
if "openAlphaModal(); closeMobile()" not in content:
    content = content.replace(
        '<a href="#social" data-i18n="nav_social" onclick="closeMobile()">Social</a>',
        '<a href="#social" data-i18n="nav_social" onclick="closeMobile()">Social</a>' + launch_app_mobile
    )

# Remove the temporary lang_toggle_mobile if we added it (since it's going back to header)
content = content.replace('<!-- lang-toggle-mobile -->', '')
# Ensure we clean up any custom flex container for ES/EN inside the mobile menu
if "setLang('es'); toggleMenu()" in content or "setLang('es'); closeMobile()" in content:
    # Just in case, let's do a regex replace to clean it up
    import re
    content = re.sub(r'<hr style="border-color: rgba\(255,255,255,0\.1\); margin: 15px 0;">\s*<div style="display: flex; justify-content: center; gap: 20px; padding: 10px;">.*?</div>', '', content, flags=re.DOTALL)

with open('docs/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Update style.css to show .lang-toggle on mobile (remove display: none !important)
with open('docs/assets/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('    .lang-toggle { display: none !important; }\n', '')
css = css.replace('    .lang-toggle { display: none !important; }', '')

with open('docs/assets/css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Menu improvements successfully patched!")
