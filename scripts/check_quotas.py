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
    
    # Check quota_allocations
    print("--- quota_allocations ---")
    cursor.execute("SELECT * FROM quota_allocations")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        print(dict(zip(cols, r)))
        
    # Check quota_pools
    print("\\n--- quota_pools ---")
    cursor.execute("SELECT * FROM quota_pools")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        print(dict(zip(cols, r)))
        
    # Check quota_groups
    print("\\n--- quota_groups ---")
    cursor.execute("SELECT * FROM quota_groups")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        print(dict(zip(cols, r)))
        
    # Check model_combo_mappings
    print("\\n--- model_combo_mappings ---")
    cursor.execute("SELECT * FROM model_combo_mappings")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        print(dict(zip(cols, r)))

except Exception as e:
    print("Error:", e)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout)
