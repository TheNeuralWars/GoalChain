import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """
import os, glob, yaml

hermes_dir = "/home/ubuntu/.hermes"
print("=== LOCATING ALIASES FILES IN ~/.hermes ===")
for root, dirs, files in os.walk(hermes_dir):
    for f in files:
        if "alias" in f.lower() or f.endswith(".yaml") or f.endswith(".json"):
            p = os.path.join(root, f)
            try:
                with open(p, encoding='utf-8', errors='replace') as fh:
                    content = fh.read()
                    if "alias" in content.lower() or "eta" in content.lower():
                        print(f"Found match in {p}")
            except Exception as e:
                pass
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/alias_search_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/alias_search_result.txt")
