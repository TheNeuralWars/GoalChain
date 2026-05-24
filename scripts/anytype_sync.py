#!/usr/bin/env python3
"""
GoalChain Anytype Integration Script.
Syncs Git logs & briefs to Anytype, parses calendar deadlines, and triggers notifications.
"""
import os
import re
import sys
import json
import pathlib
import subprocess
import requests
from datetime import datetime, timezone, timedelta

# Default paths
HOME = pathlib.Path.home()
HERMES_HOME = os.getenv("HERMES_HOME", str(HOME / "hermes"))
CONFIG_ENV = pathlib.Path(HERMES_HOME) / "config.env"
STATE_DIR = pathlib.Path(HERMES_HOME) / "oa" / "state"
STATE_FILE = STATE_DIR / "anytype-notified-deadlines.json"

# Load config.env variables manually to bypass cron env limitations
def load_env():
    env = {}
    if CONFIG_ENV.exists():
        with open(CONFIG_ENV) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    # Strip quotes if present
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    env[k] = v
    return env

CONFIG = load_env()

# Resolve key parameters
ANYTYPE_API_KEY = CONFIG.get("ANYTYPE_API_KEY")
ANYTYPE_SPACE_ID = CONFIG.get("ANYTYPE_SPACE_ID")
WHATSAPP_TARGET = CONFIG.get("WHATSAPP_TARGET")
DISCORD_WEBHOOK = CONFIG.get("DISCORD_RESEARCH_WEBHOOK_URL")
REPO_PATH = CONFIG.get("GOALCHAIN_REPO_PATH", str(HOME / "hermes/workspace/GoalChain"))
REPO_PATH = REPO_PATH.replace("$HOME", str(HOME)).replace("~", str(HOME))
ANYTYPE_API_URL = "http://127.0.0.1:31012/v1"

if not ANYTYPE_API_KEY or not ANYTYPE_SPACE_ID:
    print("ERROR: ANYTYPE_API_KEY or ANYTYPE_SPACE_ID not found in config.env")
    sys.exit(1)

HEADERS = {
    "Authorization": f"Bearer {ANYTYPE_API_KEY}",
    "Content-Type": "application/json"
}

def run_cmd(cmd, cwd=None):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        if res.returncode == 0:
            return res.stdout.strip()
    except Exception as e:
        print(f"Command error: {e}")
    return ""

def get_git_milestones():
    """Fetches last 8 commits as list of strings."""
    git_log = run_cmd('git log -n 8 --pretty=format:"* %cd - %s (%an)" --date=short', cwd=REPO_PATH)
    if git_log:
        return git_log
    return "* No recent git commits found or repository not synchronized."

def get_intake_briefs():
    """Parses active briefs from docs/intake/."""
    intake_dir = pathlib.Path(REPO_PATH) / "docs" / "intake"
    briefs = []
    if intake_dir.exists():
        for f in intake_dir.glob("*.md"):
            try:
                content = f.read_text(encoding="utf-8")
                title = "Unknown Brief"
                status = "draft"
                priority = "P2"
                
                # Parse metadata (best effort)
                for line in content.splitlines():
                    if line.startswith("#"):
                        title = line.lstrip("#").strip()
                    elif "status:" in line.lower() or "- status:" in line.lower():
                        status = line.split(":", 1)[1].strip().strip("`")
                    elif "priority:" in line.lower() or "- priority:" in line.lower():
                        priority = line.split(":", 1)[1].strip().strip("`")
                
                briefs.append(f"- **{f.name}**: {title} (Status: `{status}`, Priority: `{priority}`)")
            except Exception as e:
                print(f"Error reading brief {f.name}: {e}")
    
    if briefs:
        return "\n".join(briefs)
    return "- No active briefs found in docs/intake/."

def get_anytype_objects():
    """Fetches all objects in the configured space."""
    url = f"{ANYTYPE_API_URL}/spaces/{ANYTYPE_SPACE_ID}/objects"
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if res.status_code == 200:
            return res.json().get("data", [])
    except Exception as e:
        print(f"Error querying Anytype objects: {e}")
    return []

def get_object_details(object_id):
    """Fetches details for a specific object."""
    url = f"{ANYTYPE_API_URL}/spaces/{ANYTYPE_SPACE_ID}/objects/{object_id}"
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if res.status_code == 200:
            return res.json().get("object", {})
    except Exception as e:
        print(f"Error getting details for object {object_id}: {e}")
    return {}

def create_anytype_object(name, markdown):
    """Creates a new Page object in Anytype."""
    url = f"{ANYTYPE_API_URL}/spaces/{ANYTYPE_SPACE_ID}/objects"
    payload = {
        "type_key": "page",
        "name": name,
        "body": markdown
    }
    try:
        res = requests.post(url, headers=HEADERS, json=payload, timeout=10)
        if res.status_code == 200:
            obj_id = res.json().get("object", {}).get("id")
            print(f"Created new Anytype object: {obj_id}")
            return obj_id
    except Exception as e:
        print(f"Error creating Anytype object: {e}")
    return None

def update_anytype_object(object_id, name, markdown):
    """Updates an existing Page object in Anytype."""
    url = f"{ANYTYPE_API_URL}/spaces/{ANYTYPE_SPACE_ID}/objects/{object_id}"
    payload = {
        "name": name,
        "markdown": markdown
    }
    try:
        res = requests.patch(url, headers=HEADERS, json=payload, timeout=10)
        if res.status_code == 200:
            print(f"Successfully updated Anytype object: {object_id}")
            return True
    except Exception as e:
        print(f"Error updating Anytype object: {e}")
    return False

def check_calendar_deadlines(objects):
    """Looks for deadlines in Anytype objects and triggers alerts."""
    print("Checking Anytype objects for upcoming deadlines...")
    deadlines = []
    
    # Load previously notified deadlines
    notified = {}
    if STATE_FILE.exists():
        try:
            notified = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
            
    now = datetime.now(timezone.utc)
    limit = now + timedelta(hours=48)
    
    for obj in objects:
        obj_id = obj.get("id")
        obj_name = obj.get("name", "Untitled")
        
        # Get full object markdown body to parse dates
        details = get_object_details(obj_id)
        markdown = details.get("markdown", "")
        
        # Parse patterns like "Deadline: YYYY-MM-DD" or "Due: YYYY-MM-DD"
        matches = re.findall(r'(?:deadline|due|fecha|limite|vence):\s*(\d{4}-\d{2}-\d{2})', markdown, re.IGNORECASE)
        for date_str in matches:
            try:
                deadline_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                if now <= deadline_date <= limit:
                    # Found upcoming deadline!
                    key = f"{obj_id}-{date_str}"
                    if key not in notified:
                        deadlines.append({
                            "id": obj_id,
                            "name": obj_name,
                            "date": date_str,
                            "time_left": str(deadline_date - now).split('.')[0],
                            "key": key
                        })
            except Exception as e:
                print(f"Date parsing error on '{date_str}': {e}")
                
    # Send notifications and update state
    if deadlines:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        for d in deadlines:
            msg = f"⏰ *[Anytype Alerta]* La tarea *\"{d['name']}\"* vence el *{d['date']}* (Quedan: {d['time_left']}).\n🔗 Ver en Anytype: {d['id']}"
            print(f"Alerting: {msg}")
            
            # Send to WhatsApp via OpenClaw
            if WHATSAPP_TARGET:
                whatsapp_cmd = f'openclaw message send --channel whatsapp --target "{WHATSAPP_TARGET}" --message "{msg}"'
                run_cmd(whatsapp_cmd)
                
            # Send to Discord if webhook is set
            if DISCORD_WEBHOOK:
                try:
                    requests.post(DISCORD_WEBHOOK, json={"content": msg}, timeout=5)
                except Exception as e:
                    print(f"Discord webhook error: {e}")
                    
            # Save state
            notified[d["key"]] = now.isoformat()
            
        # Write state file
        try:
            STATE_FILE.write_text(json.dumps(notified, indent=2) + "\n", encoding="utf-8")
        except Exception as e:
            print(f"Error saving notified state: {e}")
    else:
        print("No upcoming deadlines found within the 48-hour window.")

def main():
    print(f"Anytype synchronization starting. Target space: {ANYTYPE_SPACE_ID}")
    
    # 1. Fetch data from Git and Intake briefs
    git_milestones = get_git_milestones()
    intake_briefs = get_intake_briefs()
    
    # 2. Build the Markdown content for the Milestone Map
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    map_markdown = f"""# GoalChain Milestone Map

*Última actualización: {now_str}*

Este mapa se actualiza automáticamente leyendo el repositorio de Git y la carpeta de briefs activos en `docs/intake/` del servidor.

---

## 🔄 Hitos del Repositorio (Git Commits)
{git_milestones}

---

## 📋 Propuestas y Tareas Activas (Intake Briefs)
{intake_briefs}

---

*Para agregar nuevos eventos al calendario de deadlines, agrega en la descripción de cualquier página en Anytype la línea: `Deadline: YYYY-MM-DD`*
"""
    
    # 3. Query existing Anytype objects and sync the Milestone Map
    objects = get_anytype_objects()
    milestone_obj_id = None
    
    for obj in objects:
        if obj.get("name") == "GoalChain Milestone Map":
            milestone_obj_id = obj.get("id")
            break
            
    if milestone_obj_id:
        update_anytype_object(milestone_obj_id, "GoalChain Milestone Map", map_markdown)
    else:
        milestone_obj_id = create_anytype_object("GoalChain Milestone Map", map_markdown)
        
    # Re-fetch objects to ensure we have the latest list (including the new one)
    objects = get_anytype_objects()
    
    # 4. Check for calendar deadlines
    check_calendar_deadlines(objects)
    
    print("Anytype synchronization completed successfully.")

if __name__ == "__main__":
    # Allow quick connection test
    if len(sys.argv) > 1 and sys.argv[1] == "--test-connection":
        try:
            res = requests.get(f"{ANYTYPE_API_URL}/spaces", headers=HEADERS, timeout=5)
            if res.status_code == 200:
                print("Connection: SUCCESSFUL")
                sys.exit(0)
            else:
                print(f"Connection FAILED: Status code {res.status_code}")
                sys.exit(1)
        except Exception as e:
            print(f"Connection FAILED: {e}")
            sys.exit(1)
            
    main()
