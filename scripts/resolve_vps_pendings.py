import subprocess

def run_remote(cmd_list):
    ssh_cmd = ["ssh", "-o", "ConnectTimeout=10", "ubuntu@100.101.211.44"] + cmd_list
    res = subprocess.run(ssh_cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr, res.returncode

def run_remote_python(code):
    cmd = ["ssh", "-o", "ConnectTimeout=10", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_script = """
import os, subprocess, sys

def run(cmd_str, shell=True, user=None):
    print(f"\\n>>> RUNNING: {cmd_str}")
    if user:
        full_cmd = f"su - {user} -c '{cmd_str}'"
    else:
        full_cmd = cmd_str
    res = subprocess.run(full_cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    print("STDOUT:\\n", res.stdout)
    if res.stderr:
        print("STDERR:\\n", res.stderr)
    print("RETURN CODE:", res.returncode)
    return res

print("=== 1. POSTIZ RESTART ===")
if os.path.exists("/data/apps/postiz"):
    run("cd /data/apps/postiz && docker compose down postiz && docker compose up -d postiz")
else:
    print("Path /data/apps/postiz not found, checking /home/ubuntu/ or docker ps...")
run("docker ps --filter name=postiz")

print("\\n=== 2. GBRAIN UPGRADE ===")
run("/home/ubuntu/.bun/bin/gbrain self-upgrade", user="ubuntu")
run("/home/ubuntu/.bun/bin/gbrain --version", user="ubuntu")

print("\\n=== 3. PM2 ORCHESTRATOR STATUS ===")
run("pm2 list", user="ubuntu")

print("\\n=== 4. SYSTEMD GATEWAY SERVICES STATUS ===")
run("systemctl status hermes-gateway-hermes-ceo.service --no-pager")
run("systemctl status hermes-gateway.service --no-pager")

print("\\n=== 5. CHECK HERMES DOCTOR ===")
run("hermes doctor", user="ubuntu")
"""

print("Executing pending tasks on VPS...")
stdout, stderr = run_remote_python(remote_script)
output_path = "scripts/vps_execution_result.txt"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(stdout + "\n=== STDERR ===\n" + (stderr or ""))

print("Output written to:", output_path)
print("\n--- STDOUT SUMMARY ---")
print(stdout[:3000])
