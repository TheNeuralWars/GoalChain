import subprocess

# Python code to be written to a file on the host
py_code = """
import sqlite3
db_path = "/data/docker/volumes/omniroute-data/_data/storage.sqlite"
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Update mcpEnabled
    cursor.execute("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'mcpEnabled', 'true')")
    # Update mcpTransport
    cursor.execute("INSERT OR REPLACE INTO key_value (namespace, key, value) VALUES ('settings', 'mcpTransport', '\\"sse\\"')")
    
    conn.commit()
    
    # Verify
    cursor.execute("SELECT namespace, key, value FROM key_value WHERE key IN ('mcpEnabled', 'mcpTransport')")
    for r in cursor.fetchall():
        print(f"VERIFY: {r[0]} | {r[1]} | {r[2]}")
        
    conn.close()
    print("SUCCESS")
except Exception as e:
    print("ERROR:", e)
"""

# Write it to /tmp/update_mcp.py on the host
write_cmd = ["ssh", "ubuntu@100.101.211.44", "cat > /tmp/update_mcp.py"]
subprocess.run(write_cmd, input=py_code, text=True)

# Run it with sudo python3
run_cmd = ["ssh", "ubuntu@100.101.211.44", "sudo python3 /tmp/update_mcp.py"]
res = subprocess.run(run_cmd, capture_output=True, text=True)

print("STDOUT:")
print(res.stdout)
print("STDERR:")
print(res.stderr)

# Cleanup
subprocess.run(["ssh", "ubuntu@100.101.211.44", "rm -f /tmp/update_mcp.py"])
