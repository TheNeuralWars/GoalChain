import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True)
    return res.stdout, res.stderr

remote_code = """
import sqlite3

db_path = '/data/docker/volumes/omniroute-data/_data/storage.sqlite'
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT DISTINCT model_id FROM model_capabilities WHERE provider = 'kilocode'")
    print("Available Kilocode Models:")
    for r in cursor.fetchall():
        print(f"  {r[0]}")
        
except Exception as e:
    print("Error:", e)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout)
