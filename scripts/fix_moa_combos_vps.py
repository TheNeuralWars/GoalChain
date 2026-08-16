import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """import os, yaml

profiles_dir = "/home/ubuntu/.hermes/profiles"
main_cfg = "/home/ubuntu/.hermes/config.yaml"

all_configs = [main_cfg]
if os.path.exists(profiles_dir):
    for p in os.listdir(profiles_dir):
        all_configs.append(os.path.join(profiles_dir, p, "config.yaml"))

fixed_count = 0
for cfg_path in all_configs:
    if not os.path.exists(cfg_path):
        continue
    with open(cfg_path, encoding='utf-8', errors='replace') as f:
        data = yaml.safe_load(f) or {}

    changed = False

    # Ensure model provider is omniroute or nous
    if "model" in data and isinstance(data["model"], dict):
        if data["model"].get("provider") == "openrouter":
            data["model"]["provider"] = "omniroute"
            changed = True

    # Standardize MOA presets to solid Omniroute combos
    if "moa" in data and isinstance(data["moa"], dict):
        moa = data["moa"]
        moa["enabled"] = True
        moa["presets"] = {
            "default": {
                "enabled": True,
                "reference_models": [
                    {"provider": "omniroute", "model": "coding"},
                    {"provider": "omniroute", "model": "writing"}
                ],
                "aggregator": {"provider": "omniroute", "model": "parameters"},
                "reference_temperature": 0.6,
                "aggregator_temperature": 0.4,
                "max_tokens": 4096
            },
            "MAX": {
                "enabled": True,
                "reference_models": [
                    {"provider": "omniroute", "model": "coding"},
                    {"provider": "omniroute", "model": "parameters"},
                    {"provider": "omniroute", "model": "writing"}
                ],
                "aggregator": {"provider": "omniroute", "model": "context-1m"},
                "reference_temperature": 0.5,
                "aggregator_temperature": 0.3,
                "fanout": "user_turn",
                "reference_max_tokens": 800
            },
            "FAST": {
                "enabled": True,
                "reference_models": [
                    {"provider": "omniroute", "model": "small"},
                    {"provider": "omniroute", "model": "infalible"}
                ],
                "aggregator": {"provider": "omniroute", "model": "small"},
                "reference_temperature": 0.4,
                "aggregator_temperature": 0.3,
                "max_tokens": 2048
            },
            "PRO": {
                "enabled": True,
                "reference_models": [
                    {"provider": "omniroute", "model": "tooling"},
                    {"provider": "omniroute", "model": "coding"}
                ],
                "aggregator": {"provider": "omniroute", "model": "context-1m"},
                "reference_temperature": 0.5,
                "aggregator_temperature": 0.4,
                "fanout": "user_turn",
                "reference_max_tokens": 800
            }
        }
        changed = True

    if changed:
        with open(cfg_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, default_flow_style=False)
        print(f"Fixed MOA combos & provider in {cfg_path}")
        fixed_count += 1

print(f"=== COMPLETED REPAIR ON {fixed_count} CONFIG FILES ===")
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/moa_fix_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/moa_fix_result.txt")
