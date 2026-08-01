import subprocess

node_code = """
const fs = require('fs');

const content = fs.readFileSync('/app/.build/next/server/chunks/73029.js', 'utf8');
const idx = content.indexOf('60021:');
if (idx !== -1) {
  console.log(content.substring(idx, idx + 10000));
}
"""

cmd = ["ssh", "ubuntu@100.101.211.44", "docker exec -i omniroute node -"]
res = subprocess.run(cmd, input=node_code, capture_output=True, text=True, encoding="utf-8")
print("STDOUT:")
print(res.stdout)
print("STDERR:")
print(res.stderr)
