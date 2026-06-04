#!/usr/bin/env python3
"""
Notion Intake Daemon for GoalChain & Hermes.
Polls Notion database for new briefs and triggers create-task.sh.
"""

import os
import sys
import json
import time
import argparse
import subprocess
import requests
from pathlib import Path

# Headers required for Notion API
NOTION_VERSION = "2022-06-28"

def load_env_config():
    """Loads environment variables from config.env files."""
    possible_paths = [
        Path.home() / "hermes" / "config.env",
        Path("/data/apps/hermes/config.env"),
        Path(__file__).resolve().parents[2] / "config.env",
        Path(__file__).resolve().parents[1] / "config.env",
    ]
    config = {}
    for path in possible_paths:
        if path.is_file():
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    config[k.strip()] = v.strip().strip('"').strip("'")
            break
    # Merge with active environment
    for k, v in os.environ.items():
        config[k] = v
    return config

def get_notion_client(api_key):
    """Returns a requests Session configured for Notion API."""
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    })
    return session

def query_notion_tasks(session, database_id):
    """Queries Notion database for tasks where Status is 'Ready' or 'Inbox'."""
    url = f"https://api.notion.com/v1/databases/{database_id}/query"
    payload = {
        "filter": {
            "or": [
                {
                    "property": "Status",
                    "status": {
                        "equals": "Ready"
                    }
                },
                {
                    "property": "Status",
                    "status": {
                        "equals": "Inbox"
                    }
                }
            ]
        }
    }
    
    try:
        response = session.post(url, json=payload, timeout=15)
        if response.status_code != 200:
            print(f"[Notion] Error querying database: {response.status_code} - {response.text}", file=sys.stderr)
            return []
        return response.json().get("results", [])
    except Exception as e:
        print(f"[Notion] Network exception querying database: {e}", file=sys.stderr)
        return []

def update_task_status(session, page_id, status_name="In Progress"):
    """Updates the status of a Notion task/page."""
    url = f"https://api.notion.com/v1/pages/{page_id}"
    payload = {
        "properties": {
            "Status": {
                "status": {
                    "name": status_name
                }
            }
        }
    }
    try:
        response = session.patch(url, json=payload, timeout=15)
        return response.status_code == 200
    except Exception as e:
        print(f"[Notion] Error updating task status: {e}", file=sys.stderr)
        return False

def ensure_github_issue_property(session, database_id):
    """
    Checks the database schema, and if the 'GitHub Issue' property is missing,
    sends a request to Notion to add it as a URL property.
    """
    url = f"https://api.notion.com/v1/databases/{database_id}"
    try:
        response = session.get(url, timeout=15)
        if response.status_code != 200:
            print(f"[Notion] Error checking database info: {response.status_code}", file=sys.stderr)
            return False
            
        db_info = response.json()
        properties = db_info.get("properties", {})
        
        # Check if 'GitHub Issue' exists
        if "GitHub Issue" in properties:
            print("[Notion] 'GitHub Issue' property already exists in database schema.")
            return True
            
        # Add it if missing
        print("[Notion] 'GitHub Issue' property is missing. Adding it to the database schema...")
        payload = {
            "properties": {
                "GitHub Issue": {
                    "url": {}
                }
            }
        }
        update_res = session.patch(url, json=payload, timeout=15)
        if update_res.status_code == 200:
            print("[Notion] Successfully added 'GitHub Issue' URL property to Notion database schema.")
            return True
        else:
            print(f"[Notion] Warning: Failed to add 'GitHub Issue' property: {update_res.status_code} - {update_res.text}", file=sys.stderr)
            
    except Exception as e:
        print(f"[Notion] Exception trying to ensure 'GitHub Issue' property: {e}", file=sys.stderr)
        
    return False

def write_github_link_to_notion(session, page_id, issue_url):
    """
    Attempts to write the GitHub issue URL back to Notion.
    First tries to update a property named 'GitHub Issue' or 'Link'.
    If that fails (property doesn't exist), appends a block comment to the page content.
    """
    url = f"https://api.notion.com/v1/pages/{page_id}"
    for prop_name in ["GitHub Issue", "Link"]:
        payload = {
            "properties": {
                prop_name: {
                    "url": issue_url
                }
            }
        }
        try:
            response = session.patch(url, json=payload, timeout=15)
            if response.status_code == 200:
                print(f"[Notion] Successfully updated property '{prop_name}' with GitHub issue URL.")
                return True
        except Exception:
            pass
            
    print(f"[Notion] Property update not successful. Appending link to page blocks...")
    blocks_url = f"https://api.notion.com/v1/blocks/{page_id}/children"
    blocks_payload = {
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": "GitHub Issue: ",
                                "link": None
                            },
                            "annotations": {
                                "bold": True
                            }
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": issue_url,
                                "link": {
                                    "url": issue_url
                                }
                            }
                        }
                    ]
                }
            }
        ]
    }
    try:
        response = session.patch(blocks_url, json=blocks_payload, timeout=15)
        if response.status_code == 200:
            print(f"[Notion] Successfully appended GitHub issue URL as a block on page.")
            return True
        else:
            print(f"[Notion] Warning: Failed to append block to page: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[Notion] Error appending block to page: {e}", file=sys.stderr)
        
    return False

def parse_notion_properties(page):
    """Extracts Title, Priority, Owner/Agent, and Objective properties from a Notion page."""
    properties = page.get("properties", {})
    
    # 1. Extract Title
    title = "Untitled Task"
    title_prop = properties.get("Title") or properties.get("Name")
    if title_prop and title_prop.get("title"):
        title = "".join([t.get("text", {}).get("content", "") for t in title_prop["title"]])
    
    # 2. Extract Priority
    priority = "P1"
    pri_prop = properties.get("Priority")
    if pri_prop:
        if pri_prop.get("select"):
            priority = pri_prop["select"].get("name", "P1")
        elif pri_prop.get("status"):
            priority = pri_prop["status"].get("name", "P1")
    if priority not in {"P0", "P1", "P2"}:
        priority = "P1"

    # 3. Extract Owner / Agent
    owner = "opencode"
    owner_prop = properties.get("Agent") or properties.get("Owner")
    if owner_prop:
        if owner_prop.get("select"):
            owner = owner_prop["select"].get("name", "opencode").lower()
        elif owner_prop.get("status"):
            owner = owner_prop["status"].get("name", "opencode").lower()
    if owner not in {"cursor", "antigravity", "opencode", "grok", "code"}:
        owner = "opencode"
    if owner == "code":
        owner = "opencode"

    # 4. Extract Objective (reads text from Objective property or falls back to description)
    objective = ""
    obj_prop = properties.get("Objective") or properties.get("Description")
    if obj_prop and obj_prop.get("rich_text"):
        objective = "".join([t.get("text", {}).get("content", "") for t in obj_prop["rich_text"]])
        
    return {
        "id": page.get("id"),
        "title": title.strip(),
        "priority": priority,
        "owner": owner,
        "objective": objective.strip() or f"Execute task: {title}"
    }

def process_tasks(config, session, database_id):
    """Finds tasks, processes them, and runs create-task.sh."""
    tasks = query_notion_tasks(session, database_id)
    if not tasks:
        return
        
    print(f"[Notion] Found {len(tasks)} new task(s)")
    repo_path = Path(config.get("GOALCHAIN_REPO_PATH", "/home/ubuntu/GoalChain"))
    script_path = repo_path / "ops" / "hermes" / "create-task.sh"
    
    if not script_path.is_file():
        print(f"[Notion] Error: create-task.sh not found at {script_path}", file=sys.stderr)
        return

    for page in tasks:
        parsed = parse_notion_properties(page)
        print(f"[Notion] Dispatching: [{parsed['owner'].upper()}] ({parsed['priority']}) {parsed['title']}")
        
        # Run create-task.sh
        cmd = [
            "bash",
            str(script_path),
            parsed["owner"],
            parsed["priority"],
            parsed["title"],
            parsed["objective"]
        ]
        
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            stdout_str = res.stdout.strip()
            print(f"[Notion] Successfully created issue: {stdout_str}")
            
            # Extract issue URL if present
            issue_url = ""
            for line in stdout_str.splitlines():
                if "Created issue:" in line:
                    issue_url = line.split("Created issue:", 1)[1].strip()
                    break
            
            if issue_url:
                write_github_link_to_notion(session, parsed["id"], issue_url)
            
            # Update status in Notion to prevent reprocessing
            if update_task_status(session, parsed["id"], "In Progress"):
                print(f"[Notion] Updated Notion status to 'In Progress'")
            else:
                print(f"[Notion] Warning: failed to update status for page {parsed['id']}")
                
        except subprocess.CalledProcessError as err:
            print(f"[Notion] Command failed: {err.stderr}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description="Notion Intake Daemon")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--interval", type=int, default=60, help="Polling interval in seconds")
    args = parser.parse_args()

    config = load_env_config()
    api_key = config.get("NOTION_API_KEY")
    database_id = config.get("NOTION_DATABASE_ID")

    if not api_key or not database_id:
        print("[Notion] Error: NOTION_API_KEY or NOTION_DATABASE_ID missing in config.env", file=sys.stderr)
        sys.exit(1)

    session = get_notion_client(api_key)
    # Proactively ensure the 'GitHub Issue' property exists on start
    ensure_github_issue_property(session, database_id)
    print(f"[Notion] Daemon started. Polling every {args.interval}s...")

    if args.once:
        process_tasks(config, session, database_id)
        sys.exit(0)

    while True:
        process_tasks(config, session, database_id)
        time.sleep(args.interval)

if __name__ == "__main__":
    main()
