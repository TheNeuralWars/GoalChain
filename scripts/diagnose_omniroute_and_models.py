import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """import urllib.request, json, os, glob

print("=== OMNIROUTE TEST ===")
try:
    req = urllib.request.Request("http://127.0.0.1:20128/v1/models")
    with urllib.request.urlopen(req) as resp:
        models = json.loads(resp.read().decode('utf-8'))
        print("Omniroute count:", len(models.get('data', [])))
        for m in models.get('data', []):
            print("  Model:", m.get('id'))
except Exception as e:
    print("Omniroute error:", e)

models_to_test = ["tooling", "coding", "writing", "parameters", "context-1m", "small", "infalible"]
for m in models_to_test:
    try:
        payload = json.dumps({"model": m, "messages": [{"role": "user", "content": "hi"}], "max_tokens": 5}).encode('utf-8')
        req = urllib.request.Request("http://127.0.0.1:20128/v1/chat/completions", data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            print("Model OK:", m)
    except Exception as e:
        print("Model FAIL:", m, e)
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/omniroute_diag_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/omniroute_diag_result.txt")
