import re

with open('docs/app.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a class to the header container
content = content.replace('<div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 30px;">', '<div class="sidebar-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 30px;">')

# Update the media query in app.html
mobile_css = """
            .sidebar-header { margin-bottom: 0 !important; }
            .sidebar { padding: 10px 15px !important; }
            .sidebar .logo img { height: 28px !important; }
"""

if ".sidebar-header { margin-bottom: 0 !important; }" not in content:
    content = content.replace('.sidebar .logo { margin-bottom: 0 !important; font-size: 1.1rem; }', '.sidebar .logo { margin-bottom: 0 !important; font-size: 1.1rem; }\n' + mobile_css)

# Also fix the inner content of sidebar on mobile
content = content.replace('<aside class="sidebar">', '<aside class="sidebar">\n        <!-- Fix mobile sticky clipping -->\n')

with open('docs/app.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("app.html patched")
