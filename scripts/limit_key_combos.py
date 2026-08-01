import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True)
    return res.stdout, res.stderr

remote_code = """
import sqlite3
import json

db_path = '/data/docker/volumes/omniroute-data/_data/storage.sqlite'
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Define allowed combos JSON list
    allowed = [
        "coding-best", 
        "coding-fast", 
        "deep-reasoning", 
        "agy-gemini-3.5-flash-low", 
        "agy-gemini-3.5-flash-medium", 
        "agy-gemini-3.5-flash-high", 
        "agy-sonnet-opus",
        "combo bigpromax",
        "Nemo3Ultra"
    ]
    allowed_str = json.dumps(allowed)
    
    # Update the key record
    cursor.execute(
        "UPDATE api_keys SET allowed_combos = ?, allowed_quotas = '[]' WHERE id = '2347bfce-d2b3-4dfc-901e-36693bf88b5e'",
        (allowed_str,)
    )
    conn.commit()
    conn.close()
    print("API key 'OmniRoute' restricted to specific combos:")
    print(allowed_str)
except Exception as e:
    print("Error:", e)
"""

stdout, stderr = run_remote_python(remote_code)
print("STDOUT:")
print(stdout)
print("STDERR:")
print(stderr)
