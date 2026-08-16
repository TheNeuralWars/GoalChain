import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """
import os, json, re

print("=== CHECKING HERMES GATEWAY / DASHBOARD TOKENS ===")

auth_path = "/home/ubuntu/.hermes/auth.json"
if os.path.exists(auth_path):
    print("--- ~/.hermes/auth.json ---")
    with open(auth_path) as f:
        print(f.read())

env_path = "/home/ubuntu/.hermes/profiles/hermes-ceo/.env"
if os.path.exists(env_path):
    print("--- hermes-ceo/.env GATEWAY / TOKEN VARS ---")
    with open(env_path) as f:
        for line in f:
            if "TOKEN" in line or "KEY" in line or "GATEWAY" in line or "PORT" in line:
                print(line.strip())

# Check running hermes gateway process or ports
res = subprocess.run(["ps", "aux"], capture_output=True, text=True)
for line in res.stdout.splitlines():
    if "hermes" in line and ("gateway" in line or "dashboard" in line):
        print("RUNNING:", line)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/gateway_token_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/gateway_token_result.txt")
