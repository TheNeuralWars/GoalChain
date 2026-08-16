import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """
with open("/data/ubuntu/.hermes/hermes-agent/hermes_cli/config.py", encoding="utf-8", errors="replace") as f:
    lines = f.readlines()

print("=== LINES 4370-4395 in config.py ===")
for i in range(4370, min(4395, len(lines))):
    print(f"{i+1}: {lines[i]}", end="")
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/fix_output.txt", "w", encoding="utf-8") as f:
    f.write(stdout)
print("WRITTEN_TO_scripts/fix_output.txt")
