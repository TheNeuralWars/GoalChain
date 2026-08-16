import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """
import subprocess

res = subprocess.run(["grep", "-rn", "Orphan alias", "/data/ubuntu/.hermes/hermes-agent/"], capture_output=True, text=True)
print(res.stdout)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/doctor_code_out.txt", "w", encoding="utf-8") as f:
    f.write(stdout)
print("WRITTEN_TO_scripts/doctor_code_out.txt")
