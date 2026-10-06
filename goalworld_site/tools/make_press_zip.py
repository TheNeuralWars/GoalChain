#!/usr/bin/env python3
"""Bundle goalworld_site/dist/assets/img/press/* into press-kit.zip (best-effort)."""
import os
import sys
import zipfile

d = sys.argv[1]
out = os.path.join(d, "press-kit.zip")
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(os.listdir(d)):
        if f == "press-kit.zip":
            continue
        z.write(os.path.join(d, f), "press-kit/" + f)
print(out)
