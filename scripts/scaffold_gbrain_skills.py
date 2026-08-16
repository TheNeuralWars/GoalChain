import subprocess

for ws in ["/data/apps/GoalChain", "/data/hermes-home"]:
    cmd = [
        "ssh", "ubuntu@100.101.211.44",
        f"export PATH=/home/ubuntu/.bun/bin:$PATH && /home/ubuntu/.bun/bin/gbrain skillpack scaffold --all --workspace {ws}"
    ]
    print(f"Scaffolding to {ws}...")
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print("STDOUT:", res.stdout.strip())
    print("RETURN CODE:", res.returncode)
