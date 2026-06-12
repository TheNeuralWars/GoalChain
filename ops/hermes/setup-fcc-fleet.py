import os
import subprocess
from pathlib import Path

# All 25 greek letter workers
workers = [
    ("alpha", 8082),
    ("beta", 8088),
    ("gamma", 8089),
    ("delta", 8090),
    ("epsilon", 8091),
    ("zeta", 8101),
    ("eta", 8102),
    ("theta", 8103),
    ("iota", 8104),
    ("kappa", 8105),
    ("lambda", 8083),
    ("mu", 8084),
    ("nu", 8085),
    ("xi", 8086),
    ("omicron", 8087),
    ("pi", 8100),
    ("rho", 8099),
    ("sigma", 8098),
    ("tau", 8097),
    ("upsilon", 8096),
    ("phi", 8095),
    ("chi", 8094),
    ("psi", 8093),
    ("omega", 8092),
    ("stigma", 8106),
]

systemd_dir = Path("/home/ubuntu/.config/systemd/user")
systemd_dir.mkdir(parents=True, exist_ok=True)

print("Generating systemd units...")

for worker, port in workers:
    # Generate/Update oa-worker-autonomous-<worker>.service (running Hermes Oneshot)
    oa_service_content = f"""[Unit]
Description=GoalChain OA Autonomous Worker {worker.capitalize()} (Hermes Oneshot)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=HOME=/home/ubuntu
Environment=HERMES_HOME=/home/ubuntu/hermes
Environment=PATH=/home/ubuntu/.local/bin:/home/ubuntu/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
Environment=OA_CODE_ENGINE=hermes
WorkingDirectory=/home/ubuntu/hermes/workspace/GoalChain
ExecStart=/usr/bin/env bash -lc "touch \\"/home/ubuntu/hermes/oa/{worker}/RUNNING\\"; exec \\"/home/ubuntu/hermes/scripts/oa-worker-autonomous-wrapper.sh\\" {worker} >> \\"/home/ubuntu/hermes/oa/{worker}/logs/worker.log\\" 2>&1"
Restart=on-failure
RestartSec=300
ExecStopPost=/usr/bin/env bash -lc "rm -f \\"/home/ubuntu/hermes/oa/{worker}/RUNNING\\""

[Install]
WantedBy=default.target
"""
    oa_service_path = systemd_dir / f"oa-worker-autonomous-{worker}.service"
    oa_service_path.write_text(oa_service_content)
    print(f"Created/Updated {oa_service_path.name}")

print("Daemon reload...")
subprocess.run(["systemctl", "--user", "daemon-reload"], check=True)
print("Done!")
