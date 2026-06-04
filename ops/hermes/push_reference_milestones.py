#!/usr/bin/env python3
"""
Pushes reference milestones to the GoalChain Milestones database in Notion.
"""
import sys
import requests
from datetime import datetime
from pathlib import Path

# Load config
config_path = Path.home() / "hermes" / "config.env"
config = {}
if config_path.is_file():
    with open(config_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            config[k.strip()] = v.strip().strip('"').strip("'")

api_key = config.get("NOTION_API_KEY")
database_id = config.get("NOTION_MILESTONES_DATABASE_ID")

if not api_key or not database_id:
    print("Error: NOTION_API_KEY or NOTION_MILESTONES_DATABASE_ID missing in config.env. Skipping push.")
    sys.exit(0)

headers = {
    "Authorization": f"Bearer {api_key}",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
}

def push_milestone(title, date_str, category, description):
    payload = {
        "parent": {"database_id": database_id},
        "properties": {
            "Title": {"title": [{"type": "text", "text": {"content": title}}]},
            "Date": {"date": {"start": date_str}},
            "Category": {"select": {"name": category}},
            "Description": {"rich_text": [{"type": "text", "text": {"content": description}}]}
        }
    }
    res = requests.post("https://api.notion.com/v1/pages", headers=headers, json=payload)
    if res.status_code == 200:
        print(f"Posted milestone: '{title}'")
    else:
        print(f"Failed to post '{title}': {res.status_code} - {res.text}")

print("Pushing reference milestones to Notion...")
today = datetime.today().strftime("%Y-%m-%d")

push_milestone(
    "GoalChain Advanced Autonomy Plan",
    today,
    "Milestone",
    "Designed and approved the multi-agent on-chain growth engine, Jito strategy integration, and multi-platform social multiplexer."
)

push_milestone(
    "Hermes Restructuring & Cleaning",
    today,
    "Codebase",
    "Cleaned duplicate gateway polling conflicts, consolidated primary Grok 4.3 models, and configured the systemd gateways."
)

push_milestone(
    "17 Hacks Custom Adaptation Guide",
    today,
    "Codebase",
    "Formulated the SOP guidelines, target templates, and NVIDIA skills hub installation workflow."
)
print("Done!")
