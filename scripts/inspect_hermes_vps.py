import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """
import os, subprocess

def check_file(path):
    print(f"=== FILE: {path} ===")
    if os.path.exists(path):
        with open(path, encoding='utf-8', errors='replace') as f:
            print(f.read())
    else:
        print("NOT FOUND")

check_file("/home/ubuntu/.hermes/config.yaml")
check_file("/home/ubuntu/.hermes/profiles/hermes-ceo/config.yaml")

print("=== HERMES CONFIG SHOW ===")
res1 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes profile use hermes-ceo && hermes config show"], capture_output=True, text=True, encoding='utf-8', errors='replace')
print("STDOUT:", res1.stdout)
print("STDERR:", res1.stderr)

print("=== HERMES DOCTOR ===")
res2 = subprocess.run(["su", "-", "ubuntu", "-c", "hermes profile use hermes-ceo && hermes doctor"], capture_output=True, text=True, encoding='utf-8', errors='replace')
print("STDOUT:", res2.stdout)
print("STDERR:", res2.stderr)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/hermes_vps_output.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n=== STDERR ===\n" + (stderr or ""))
print("SUCCESSFULLY_WRITTEN_TO_scripts/hermes_vps_output.txt")
