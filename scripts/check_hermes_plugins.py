import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding="utf-8")
    return res.stdout, res.stderr

remote_code = """
import subprocess

print("=== HERMES PLUGINS LIST ===")
res1 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes plugins list"], capture_output=True, text=True, encoding="utf-8")
print(res1.stdout)
print(res1.stderr)

print("=== HERMES PLUGINS HELP ===")
res2 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes plugins --help"], capture_output=True, text=True, encoding="utf-8")
print(res2.stdout)
print(res2.stderr)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout.encode("ascii", errors="replace").decode("ascii"))
