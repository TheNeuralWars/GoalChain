import os
import re

docs_dir = 'docs'
for filename in os.listdir(docs_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(docs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace stylesheet link version
        new_content = re.sub(
            r'href="assets/css/style\.css\?v=3\.2"',
            'href="assets/css/style.css?v=3.3"',
            content
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Incremented cache buster to v=3.3 in {filename}")
