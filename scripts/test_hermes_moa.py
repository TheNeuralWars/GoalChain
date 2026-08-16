import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """import subprocess

print("=== TESTING HERMES DOCTOR AFTER MOA REPAIR ===")
res = subprocess.run(["su", "-", "ubuntu", "-c", "hermes profile use hermes-ceo && hermes doctor"], capture_output=True, text=True, encoding='utf-8', errors='replace')
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/moa_verify_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/moa_verify_result.txt")
