import os

service_path = "/etc/systemd/system/hermes-mmwebhook.service"

with open(service_path, "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if "Environment=HM_PORT=8088" in line:
        new_lines.append("Environment=PYTHONUNBUFFERED=1\n")

with open(service_path, "w") as f:
    f.writelines(new_lines)

print("Service file patched successfully.")
