import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = r"""
import os, re

wrapper_dir = "/home/ubuntu/.local/bin"
profiles_dir = "/home/ubuntu/.hermes/profiles"

existing_profiles = set(os.listdir(profiles_dir)) if os.path.exists(profiles_dir) else set()

removed = []
if os.path.exists(wrapper_dir):
    for fname in os.listdir(wrapper_dir):
        fpath = os.path.join(wrapper_dir, fname)
        if os.path.isfile(fpath):
            try:
                with open(fpath, encoding='utf-8', errors='replace') as fh:
                    content = fh.read()
                    if "hermes -p" in content:
                        m = re.search(r"hermes -p (\S+)", content)
                        if m:
                            profile_name = m.group(1).strip("'\"")
                            if profile_name not in existing_profiles:
                                os.remove(fpath)
                                removed.append(f"{fname} (pointed to '{profile_name}')")
            except Exception as e:
                pass

print(f"=== REMOVED {len(removed)} ORPHAN WRAPPERS ===")
for r in removed:
    print(f" - Deleted: {r}")
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/orphan_clean_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/orphan_clean_result.txt")
