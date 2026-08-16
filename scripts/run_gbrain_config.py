import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True)
    return res.stdout, res.stderr

remote_code = """
import subprocess
import os

env = os.environ.copy()
env["PATH"] = "/home/ubuntu/.bun/bin:" + env.get("PATH", "")

# Run gbrain config show
cmd = ["/home/ubuntu/.bun/bin/gbrain", "config", "show"]
res = subprocess.run(cmd, capture_output=True, text=True, env=env)
print("CONFIG SHOW:")
print(res.stdout)
print(res.stderr)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout)
