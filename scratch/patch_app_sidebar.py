import re

with open('docs/app.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find the end of <nav> and move it AFTER the exit button.
# Right now it's:
# </nav>
# <div style="margin-top: auto; ..."> ... </div>
# <!-- EXIT BUTTON -->
# <a href="index.html" ...> ... </a>
# </aside>

# We can just remove </nav> from its current location, and put it right before </aside>
content = content.replace('        </nav>\n        <div style="margin-top: auto;', '        <div style="margin-top: auto;')
content = content.replace('        </a>\n    </aside>', '        </a>\n        </nav>\n    </aside>')

with open('docs/app.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("sidebar patched")
