#!/usr/bin/env python3
import sys
import requests
import json

API_KEY = "ntn_r13805357121IGsPraUr8WgBaDtOEaKJrstxAMhxnQrcV7"
NOTION_VERSION = "2022-06-28"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json"
}

def list_shared_pages():
    url = "https://api.notion.com/v1/search"
    payload = {
        "filter": {
            "value": "page",
            "property": "object"
        }
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        print(f"Error connecting to Notion API: {response.status_code} - {response.text}")
        return []
    
    results = response.json().get("results", [])
    return results

def create_intake_database(parent_page_id, title="Hermes Task Intake"):
    url = "https://api.notion.com/v1/databases"
    payload = {
        "parent": {
            "type": "page_id",
            "page_id": parent_page_id
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": title
                }
            }
        ],
        "properties": {
            "Title": {
                "title": {}
            },
            "Status": {
                "status": {
                    "options": [
                        {"name": "Inbox", "color": "gray"},
                        {"name": "Ready", "color": "blue"},
                        {"name": "In Progress", "color": "yellow"},
                        {"name": "Done", "color": "green"}
                    ]
                }
            },
            "Agent": {
                "select": {
                    "options": [
                        {"name": "hermes", "color": "purple"},
                        {"name": "grok", "color": "red"}
                    ]
                }
            },
            "Priority": {
                "select": {
                    "options": [
                        {"name": "P0", "color": "red"},
                        {"name": "P1", "color": "yellow"},
                        {"name": "P2", "color": "blue"}
                    ]
                }
            },
            "Objective": {
                "rich_text": {}
            }
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        db_id = response.json().get("id")
        print(f"\nSuccess! Intake Database created with ID: {db_id}")
        return db_id
    else:
        print(f"Failed to create intake database: {response.status_code} - {response.text}")
        return None

def create_milestones_database(parent_page_id, title="GoalChain Milestones"):
    url = "https://api.notion.com/v1/databases"
    payload = {
        "parent": {
            "type": "page_id",
            "page_id": parent_page_id
        },
        "title": [
            {
                "type": "text",
                "text": {
                    "content": title
                }
            }
        ],
        "properties": {
            "Title": {
                "title": {}
            },
            "Date": {
                "date": {}
            },
            "Category": {
                "select": {
                    "options": [
                        {"name": "Milestone", "color": "purple"},
                        {"name": "Codebase", "color": "blue"},
                        {"name": "Marketing", "color": "orange"}
                    ]
                }
            },
            "Link": {
                "url": {}
            },
            "Description": {
                "rich_text": {}
            }
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        db_id = response.json().get("id")
        print(f"Success! Milestones Database created with ID: {db_id}")
        return db_id
    else:
        print(f"Failed to create milestones database: {response.status_code} - {response.text}")
        return None

def main():
    print("Searching for pages shared with the Notion integration...")
    pages = list_shared_pages()
    if not pages:
        print("\nNo pages found! Make sure you follow these steps first:")
        print("1. Go to Notion and create or select a page.")
        print("2. Click the '...' menu in the top-right corner.")
        print("3. Click 'Add connections' (or 'Connections') and search/select your integration.")
        sys.exit(1)
        
    print("\nShared Pages found:")
    for idx, page in enumerate(pages):
        title = "Untitled Page"
        properties = page.get("properties", {})
        for prop_name, prop_val in properties.items():
            if prop_val.get("type") == "title" and prop_val.get("title"):
                title = prop_val["title"][0].get("text", {}).get("content", "Untitled Page")
        print(f"[{idx}] ID: {page.get('id')} | Title: {title}")
        
    choice = input("\nSelect page index to place the databases under: ")
    try:
        page_idx = int(choice)
        parent_id = pages[page_idx]["id"]
    except (ValueError, IndexError):
        print("Invalid selection.")
        sys.exit(1)
        
    intake_id = create_intake_database(parent_id, "Hermes Task Intake")
    milestones_id = create_milestones_database(parent_id, "GoalChain Milestones")
    
    if intake_id or milestones_id:
        print(f"\nNow add these database IDs to your config.env:")
        if intake_id:
            print(f"NOTION_DATABASE_ID=\"{intake_id.replace('-', '')}\"")
        if milestones_id:
            print(f"NOTION_MILESTONES_DATABASE_ID=\"{milestones_id.replace('-', '')}\"")

if __name__ == "__main__":
    main()
