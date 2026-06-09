#!/usr/bin/env python3
"""
GoalChain Autonomous Supervisor Daemon.
Audits systemd user services, heals port collisions, checks English Max Law compliance,
and posts status milestones to Notion. Runs autonomously 24/7 on the VPS.
"""

import os
import sys
import re
import argparse
import subprocess
import requests
from datetime import datetime, timezone
from pathlib import Path

NOTION_VERSION = "2022-06-28"

def load_env_config():
    config = {}
    possible_paths = [
        Path.home() / "hermes" / "config.env",
        Path.home() / ".hermes" / ".env",
        Path("/data/apps/hermes/config.env"),
        Path(__file__).resolve().parents[2] / "config.env",
    ]
    for path in possible_paths:
        if path.is_file():
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    config[k.strip()] = v.strip().strip('"').strip("'")
    for k, v in os.environ.items():
        config[k] = v
    return config

def check_service_status(service_name):
    try:
        res = subprocess.run(
            ["systemctl", "--user", "is-active", service_name],
            capture_output=True,
            text=True,
            check=False
        )
        return res.stdout.strip()
    except Exception as e:
        return f"failed: {e}"

def check_port_collision_and_heal(env_path):
    try:
        res = subprocess.run(
            ["journalctl", "--user", "-u", "hermes-gateway-hermes-ceo", "-n", "50", "--no-pager"],
            capture_output=True,
            text=True,
            check=False
        )
        logs = res.stdout
        if "Port already in use" in logs or "address already in use" in logs.lower():
            print("[Supervisor] Port collision detected in hermes-gateway-hermes-ceo!")
            # Read current port
            current_port = 8644
            if env_path.is_file():
                env_content = env_path.read_text(encoding="utf-8")
                match = re.search(r"WEBHOOK_PORT=(\d+)", env_content)
                if match:
                    current_port = int(match.group(1))
            
            # Select new port (alternate between 8645 and 8646)
            new_port = 8645 if current_port == 8644 else 8646
            print(f"[Supervisor] Healing: Changing WEBHOOK_PORT from {current_port} to {new_port}")
            
            # Update env file
            if env_path.is_file():
                env_content = env_path.read_text(encoding="utf-8")
                if "WEBHOOK_PORT=" in env_content:
                    env_content = re.sub(r"WEBHOOK_PORT=\d+", f"WEBHOOK_PORT={new_port}", env_content)
                else:
                    env_content += f"\nWEBHOOK_PORT={new_port}\n"
                env_path.write_text(env_content, encoding="utf-8")
                
                # Restart service
                subprocess.run(["systemctl", "--user", "daemon-reload"], check=False)
                subprocess.run(["systemctl", "--user", "restart", "hermes-gateway-hermes-ceo"], check=False)
                return f"Healed port collision (moved gateway to {new_port})"
    except Exception as e:
        return f"Error while checking/healing port: {e}"
    return None

def audit_english_max_law(proposals_dir):
    violations = []
    if not proposals_dir.is_dir():
        return violations
        
    for p_file in proposals_dir.glob("issue-*.md"):
        try:
            content = p_file.read_text(encoding="utf-8")
            if "¿" in content or "¡" in content:
                violations.append(f"{p_file.name} contains Spanish punctuation (¿ or ¡)")
        except Exception as e:
            print(f"Error checking {p_file.name}: {e}")
    return violations

def post_status_to_notion(config, title, description, category="Codebase"):
    api_key = config.get("NOTION_API_KEY")
    database_id = config.get("NOTION_MILESTONES_DATABASE_ID")
    if not api_key or not database_id:
        print("[Supervisor] Notion keys missing. Skipping Notion status post.")
        return
        
    url = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    }
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    payload = {
        "parent": {"database_id": database_id},
        "properties": {
            "Title": {"title": [{"type": "text", "text": {"content": title}}]},
            "Date": {"date": {"start": date_str}},
            "Category": {"select": {"name": category}},
            "Link": {"url": "https://github.com/TheNeuralWars/GoalChain"},
            "Description": {"rich_text": [{"type": "text", "text": {"content": description}}]}
        }
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            print(f"[Supervisor] Posted status milestone to Notion: '{title}'")
        else:
            print(f"[Supervisor] Failed to post status to Notion: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"[Supervisor] Notion posting exception: {e}")

def check_pending_opencode_work():
    try:
        res = subprocess.run(
            ["gh", "issue", "list", "--repo", "TheNeuralWars/GoalChain", "--state", "open", "--label", "status:ready", "--json", "labels"],
            capture_output=True,
            text=True,
            check=False
        )
        if res.returncode != 0:
            return False
        import json
        issues = json.loads(res.stdout)
        code_agents = {"agent:opencode", "agent:antigravity", "agent:grok"}
        for issue in issues:
            labels = {l["name"] for l in issue.get("labels", []) if "name" in l}
            if labels & code_agents:
                return True
    except Exception as e:
        print(f"[Supervisor] Error checking pending work: {e}")
    return False

def main():
    parser = argparse.ArgumentParser(description="GoalChain VPS Agent Supervisor")
    parser.add_argument("--dry-run", action="store_true", help="Audit without modifying configuration or posting status")
    args = parser.parse_args()

    config = load_env_config()
    repo_path = Path(config.get("GOALCHAIN_REPO_PATH", "/data/apps/GoalChain"))
    hermes_home = Path(config.get("GOALCHAIN_HERMES_HOME", "/home/ubuntu/.hermes"))
    
    print(f"[Supervisor] Starting System Audit at {datetime.now(timezone.utc).isoformat()}")
    
    services = [
        "hermes-gateway-hermes-ceo",
        "hermes-dashboard",
        "oa-webhook",
        "oa-worker",
        "hermes-marketing-active",
        "hermes-x-scout"
    ]
    
    daemons = {
        "hermes-gateway-hermes-ceo",
        "hermes-dashboard",
        "oa-webhook",
        "oa-worker",
        "hermes-marketing-active"
    }
    
    service_states = {}
    healed_services = []
    
    for svc in services:
        status = check_service_status(svc)
        service_states[svc] = status
        print(f"  Service '{svc}': {status}")
        
        # Self-healing logic for failed / inactive services
        if not args.dry_run:
            if "failed" in status:
                print(f"[Supervisor] Healing: Service '{svc}' is failed. Resetting and restarting...")
                subprocess.run(["systemctl", "--user", "reset-failed", svc], check=False)
                subprocess.run(["systemctl", "--user", "restart", svc], check=False)
                healed_services.append(f"{svc} (failed -> restarted)")
                # Update status
                service_states[svc] = check_service_status(svc)
            elif svc in daemons and status == "inactive":
                print(f"[Supervisor] Healing: Daemon '{svc}' is inactive. Starting...")
                subprocess.run(["systemctl", "--user", "start", svc], check=False)
                healed_services.append(f"{svc} (inactive -> started)")
                # Update status
                service_states[svc] = check_service_status(svc)
                
    # Specific queue check for oa-worker
    if not args.dry_run and service_states.get("oa-worker") == "inactive":
        if check_pending_opencode_work():
            print("[Supervisor] Healing: Pending work detected for oa-worker but service is inactive. Starting it...")
            subprocess.run(["systemctl", "--user", "start", "oa-worker"], check=False)
            healed_services.append("oa-worker (started due to pending queue)")
            service_states["oa-worker"] = check_service_status("oa-worker")
         
    # Run self-healing if not a dry-run
    heal_result = None
    if not args.dry_run:
        env_path = hermes_home / ".env"
        heal_result = check_port_collision_and_heal(env_path)
        if heal_result:
            print(f"[Supervisor] Healing event: {heal_result}")
            healed_services.append(heal_result)
            # Refresh status of gateway after healing
            service_states["hermes-gateway-hermes-ceo"] = check_service_status("hermes-gateway-hermes-ceo")
            
    # Check English Max Law
    proposals_dir = repo_path / "docs" / "proposals" / "opencode"
    violations = audit_english_max_law(proposals_dir)
    if violations:
        print("[Supervisor] WARNING: English Max Law violations detected:")
        for v in violations:
            print(f"  - {v}")
    else:
        print("[Supervisor] English Max Law check: 100% Compliant.")
        
    # Compose status report
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    status_summary = ", ".join([f"{svc}={state}" for svc, state in service_states.items()])
    
    title = "System Audit: Active"
    description = f"Audit run at {timestamp}. Service status: {status_summary}."
    
    if healed_services:
        title = "System Audit: Healed Issues"
        description += f" Actions taken: {', '.join(healed_services)}."
    if violations:
        title = "System Audit: Violations Flagged"
        description += f" WARNING: English Max Law violations found in proposals."
        
    if not args.dry_run:
        post_status_to_notion(config, title, description)
    else:
        print("\n=== DRY RUN STATUS BRIEF ===")
        print(f"Title: {title}")
        print(f"Description: {description}")
        print("============================")

if __name__ == "__main__":
    main()
