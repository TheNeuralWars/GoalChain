import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """
import yaml, os

def fix_and_clean_config(filepath):
    print(f"=== CHECKING {filepath} ===")
    if not os.path.exists(filepath):
        print("Not found")
        return
    with open(filepath) as f:
        data = yaml.safe_load(f) or {}

    changed = False

    # Fix auxiliary.vision if string
    if "auxiliary" in data and isinstance(data["auxiliary"], dict):
        if isinstance(data["auxiliary"].get("vision"), str):
            print(f"Fixing auxiliary.vision string in {filepath}")
            data["auxiliary"]["vision"] = {}
            changed = True

    # Check aliases
    if "aliases" in data and isinstance(data["aliases"], dict):
        print(f"Found {len(data['aliases'])} aliases in {filepath}: {list(data['aliases'].keys())}")

    if changed:
        with open(filepath, "w") as f:
            yaml.dump(data, f, default_flow_style=False)
        print(f"SAVED FIXES TO {filepath}")

fix_and_clean_config("/home/ubuntu/.hermes/config.yaml")
fix_and_clean_config("/home/ubuntu/.hermes/profiles/hermes-ceo/config.yaml")

# Also check all profiles
profiles_dir = "/home/ubuntu/.hermes/profiles"
if os.path.exists(profiles_dir):
    for p in os.listdir(profiles_dir):
        p_cfg = os.path.join(profiles_dir, p, "config.yaml")
        fix_and_clean_config(p_cfg)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/alias_fix_output.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/alias_fix_output.txt")
