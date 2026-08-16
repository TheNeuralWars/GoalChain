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
    cursor.execute("SELECT id, name, key FROM api_keys")
    for r in cursor.fetchall():
        print(f"ID: {r[0]} | Name: {r[1]} | Key: {r[2]}")
except Exception as e:
    print("Error:", e)
"""

stdout, stderr = run_remote_python(remote_code)
print(stdout)
