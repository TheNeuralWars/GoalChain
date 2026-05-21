with open('docs/assets/css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

mobile_logo_css = """@media (max-width: 600px) {
    .logo span { font-size: 1rem !important; }
    .logo img { height: 32px !important; }"""

if ".logo span { font-size: 1rem !important; }" not in css:
    css = css.replace('@media (max-width: 600px) {', mobile_logo_css)

with open('docs/assets/css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Logo styles patched")
