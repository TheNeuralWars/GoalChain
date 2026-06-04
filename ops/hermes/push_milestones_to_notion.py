#!/usr/bin/env python3
import os
import sys
import argparse
import requests
import json
from datetime import datetime
from pathlib import Path

NOTION_VERSION = "2022-06-28"

def load_env_config():
    config = {}
    possible_paths = [
        Path.home() / "hermes" / "config.env",
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
            break
    for k, v in os.environ.items():
        config[k] = v
    return config

def push_milestone(api_key, database_id, title, date_str, category, link, description):
    url = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json"
    }
    
    payload = {
        "parent": {
            "database_id": database_id
        },
        "properties": {
            "Title": {
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": title
                        }
                    }
                ]
            },
            "Date": {
                "date": {
                    "start": date_str
                }
            },
            "Category": {
                "select": {
                    "name": category
                }
            },
            "Link": {
                "url": link or "https://github.com/TheNeuralWars/GoalChain"
            },
            "Description": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {
                            "content": description
                        }
                    }
                ]
            }
        }
    }
    
    res = requests.post(url, headers=headers, json=payload)
    if res.status_code == 200:
        print(f"Successfully posted milestone: '{title}'")
        return True
    else:
        print(f"Failed to post milestone: {res.status_code} - {res.text}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Push milestones to Notion")
    parser.add_argument("--title", required=True, help="Milestone Title")
    parser.add_argument("--date", help="Milestone Date (YYYY-MM-DD), defaults to today")
    parser.add_argument("--category", default="Milestone", choices=["Milestone", "Codebase", "Marketing"], help="Milestone Category")
    parser.add_argument("--link", help="Reference Link URL")
    parser.add_argument("--description", required=True, help="Detailed description")
    args = parser.parse_args()

    config = load_env_config()
    api_key = config.get("NOTION_API_KEY")
    database_id = config.get("NOTION_MILESTONES_DATABASE_ID")

    if not api_key or not database_id:
        print("Error: NOTION_API_KEY or NOTION_MILESTONES_DATABASE_ID missing in config.env", file=sys.stderr)
        sys.exit(1)

    date_str = args.date or datetime.today().strftime("%Y-%m-%d")
    push_milestone(api_key, database_id, args.title, date_str, args.category, args.link, args.description)

if __name__ == "__main__":
    main()
