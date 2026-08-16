import subprocess

def run_remote_python(code):
    cmd = ["ssh", "ubuntu@100.101.211.44", "sudo", "python3", "-"]
    res = subprocess.run(cmd, input=code, capture_output=True, text=True, encoding='utf-8', errors='replace')
    return res.stdout, res.stderr

remote_code = """import os, subprocess, yaml

print("=== CHECKING OPEN PORTS & HERMES GATEWAY SERVICES ===")
res_ports = subprocess.run(["ss", "-tuln"], capture_output=True, text=True)
print("LISTEN PORTS:")
for line in res_ports.stdout.splitlines():
    if "864" in line or "20128" in line or "3000" in line or "9119" in line:
        print(" ", line)

main_config_path = "/home/ubuntu/.hermes/config.yaml"
if os.path.exists(main_config_path):
    with open(main_config_path) as f:
        data = yaml.safe_load(f) or {}

    data["gateway"] = data.get("gateway", {})
    data["gateway"]["enabled"] = True
    data["gateway"]["port"] = 8642
    data["gateway"]["host"] = "0.0.0.0"
    data["gateway"]["token"] = "63bfdc3f3eb6e7c2fd6cb83549c1d7a8fc5d0bf979d8e200"

    with open(main_config_path, "w") as f:
        yaml.dump(data, f, default_flow_style=False)
    print("Updated main config with Gateway settings")

service_content = '''[Unit]
Description=Hermes Agent Gateway Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
Environment="PATH=/data/ubuntu/.hermes/hermes-agent/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="HERMES_GATEWAY_TOKEN=63bfdc3f3eb6e7c2fd6cb83549c1d7a8fc5d0bf979d8e200"
ExecStart=/data/ubuntu/.hermes/hermes-agent/venv/bin/hermes gateway start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
'''

svc_path = "/etc/systemd/system/hermes-gateway.service"
with open(svc_path, "w") as f:
    f.write(service_content)

subprocess.run(["systemctl", "daemon-reload"])
subprocess.run(["systemctl", "enable", "--now", "hermes-gateway"])

print("=== SYSTEMCTL STATUS HERMES-GATEWAY ===")
res_svc = subprocess.run(["systemctl", "status", "hermes-gateway", "--no-pager"], capture_output=True, text=True)
print(res_svc.stdout[:1500])
"""

stdout, stderr = run_remote_python(remote_code)
with open("scripts/gateway_setup_result.txt", "w", encoding="utf-8") as f:
    f.write(stdout + "\n" + (stderr or ""))
print("WRITTEN_TO_scripts/gateway_setup_result.txt")
