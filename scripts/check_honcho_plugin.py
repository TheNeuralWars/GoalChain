import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding="utf-8")
    return res.stdout, res.stderr

remote_code = """
import subprocess

# Run hermes plugins list --plain and search for honcho
res = subprocess.run(["su", "-", "ubuntu", "-c", "hermes plugins list --plain"], capture_output=True, text=True, encoding="utf-8")
for line in res.stdout.splitlines():
    if "honcho" in line.lower() or "memory" in line.lower():
        print(line)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout.encode("ascii", errors="replace").decode("ascii"))
