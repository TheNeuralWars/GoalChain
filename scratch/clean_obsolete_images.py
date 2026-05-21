import os
import re

directory = "docs/assets/img/nfts"
pattern = re.compile(r"^[a-zA-Z0-9]{5}\.(jpg|png|webp)$")

deleted_count = 0

for filename in os.listdir(directory):
    if pattern.match(filename):
        filepath = os.path.join(directory, filename)
        os.remove(filepath)
        print(f"Deleted: {filename}")
        deleted_count += 1

print(f"Total deleted: {deleted_count}")
