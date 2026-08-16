import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """import subprocess

# Stop custom systemd first
subprocess.run(["systemctl", "stop", "hermes-gateway"])
subprocess.run(["systemctl", "disable", "hermes-gateway"])

print("=== RUNNING HERMES GATEWAY INSTALL ===")
res1 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes gateway install"], capture_output=True, text=True)
print("STDOUT:", res1.stdout)
print("STDERR:", res1.stderr)

print("=== RUNNING HERMES GATEWAY START ===")
res2 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes gateway start"], capture_output=True, text=True)
print("STDOUT:", res2.stdout)
print("STDERR:", res2.stderr)

print("=== RUNNING HERMES GATEWAY STATUS ===")
res3 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes gateway status"], capture_output=True, text=True)
print("STDOUT:", res3.stdout)
print("STDERR:", res3.stderr)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/gateway_native_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/gateway_native_result.txt")
