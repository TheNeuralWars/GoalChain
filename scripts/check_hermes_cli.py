import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True)
    return res.stdout, res.stderr

remote_code = """
import subprocess

# Run hermes --help and hermes honcho
print("=== HERMES HELP ===")
res1 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes --help"], capture_output=True, text=True)
print(res1.stdout)
print(res1.stderr)

print("=== HERMES HONCHO HELP ===")
res2 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes honcho --help"], capture_output=True, text=True)
print(res2.stdout)
print(res2.stderr)

print("=== HERMES BRAIN HELP ===")
res3 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes-brain --help"], capture_output=True, text=True)
print(res3.stdout)
print(res3.stderr)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout)
