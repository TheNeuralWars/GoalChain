import os
import re

docs_dir = 'docs'
for filename in os.listdir(docs_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(docs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace stylesheet link
        new_content = re.sub(
            r'href="assets/css/style\.css(?:\?v=[\d\.]+)"',
            'href="assets/css/style.css?v=3.2"',
            content
        )
        new_content = re.sub(
            r'href="assets/css/style\.css"',
            'href="assets/css/style.css?v=3.2"',
            new_content
        )
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Added cache buster to {filename}")

