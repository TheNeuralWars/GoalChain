import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True)
    return res.stdout, res.stderr

remote_code = """
import os

print("=== SEARCHING FOR hermes-brain OR gbrain IN PATHS ===")
search_dirs = [
    "/home/ubuntu/.bun/bin",
    "/home/ubuntu/hermes",
    "/usr/local/bin",
    "/usr/bin"
]

for d in search_dirs:
    if os.path.exists(d):
        for f in os.listdir(d):
            if "brain" in f or "honcho" in f:
                print(f"Found: {os.path.join(d, f)}")
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout)
