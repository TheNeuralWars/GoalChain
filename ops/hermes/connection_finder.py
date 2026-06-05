#!/usr/bin/env python3
"""
GoalChain Connection Finder Engine.
Bridges development status (git commits, Notion tasks) with marketing strategy,
generating strategic insights and backlog recommendations under the English Max Law.
"""

import os
import sys
import argparse
import requests
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

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

def get_git_changes(repo_path, max_commits=10):
    try:
        res = subprocess.run(
            ["git", "log", f"-n {max_commits}", "--pretty=format:- %s (%an)"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            check=True
        )
        return res.stdout.strip()
    except Exception as e:
        return f"Unable to fetch git log: {e}"

def get_file_content(path):
    p = Path(path)
    if p.is_file():
        try:
            return p.read_text(encoding="utf-8").strip()
        except Exception as e:
            return f"(Error reading {p.name}: {e})"
    return f"({p.name} not found)"

def query_notion_recent_tasks(config):
    """Queries Notion database for tasks in progress or done to get recent developer context."""
    api_key = config.get("NOTION_API_KEY")
    database_id = config.get("NOTION_DATABASE_ID")
    if not api_key or not database_id:
        return "Notion credentials missing."
        
    url = f"https://api.notion.com/v1/databases/{database_id}/query"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    payload = {
        "filter": {
            "or": [
                {"property": "Status", "status": {"equals": "In Progress"}},
                {"property": "Status", "status": {"equals": "Done"}}
            ]
        },
        "page_size": 10
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        if response.status_code != 200:
            return f"Notion database query returned status {response.status_code}"
            
        results = response.json().get("results", [])
        tasks_summary = []
        for page in results:
            props = page.get("properties", {})
            title = "Untitled Task"
            title_prop = props.get("Title") or props.get("Name")
            if title_prop and title_prop.get("title"):
                title = "".join([t.get("text", {}).get("content", "") for t in title_prop["title"]])
            
            status = "Unknown"
            status_prop = props.get("Status")
            if status_prop and status_prop.get("status"):
                status = status_prop["status"].get("name", "Unknown")
                
            agent = "unknown"
            agent_prop = props.get("Agent") or props.get("Owner")
            if agent_prop and agent_prop.get("select"):
                agent = agent_prop["select"].get("name", "unknown")
                
            tasks_summary.append(f"- [{status}] {title} (Agent: {agent})")
            
        return "\n".join(tasks_summary) if tasks_summary else "No tasks in progress or completed recently."
    except Exception as e:
        return f"Notion query exception: {e}"

def check_english_max_law(text):
    text_lower = text.lower()
    if "¿" in text or "¡" in text:
        raise ValueError("English Max Law Violated! Generated content contains Spanish punctuation (¿ or ¡).")
        
    absolute_spanish = [
        (r"\by\b", "y"),
        (r"\bque\b", "que"),
        (r"\bpara\b", "para"),
        (r"\bpor\b", "por"),
        (r"\bcomo\b", "como"),
        (r"\bgracias\b", "gracias"),
        (r"\bhola\b", "hola"),
        (r"\btodos\b", "todos"),
        (r"\buna\b", "una"),
        (r"\buno\b", "uno"),
        (r"\bunos\b", "unos"),
        (r"\bunas\b", "unas"),
        (r"\bpero\b", "pero"),
        (r"\bmas\b", "mas"),
        (r"\bcon gusto\b", "con gusto"),
        (r"\bbuenos dias\b", "buenos dias"),
        (r"\bbuenas noches\b", "buenas noches")
    ]
    
    for pattern, word in absolute_spanish:
        if re.search(pattern, text_lower):
            raise ValueError(f"English Max Law Violated! Generated content contains absolute Spanish word/phrase: '{word}'")
            
    suspicious_patterns = [
        (r"\blos\b", ["los angeles", "los alamos", "los banos"]),
        (r"\blas\b", ["las vegas", "las cruces"]),
        (r"\bdel\b", ["del mar", "del rey", "del norte", "del rio", "del sol", "taco del", "panera del"]),
        (r"\bde\b", ["de facto", "de jure", "de rigueur", "de novo", "coup de", "de la", "de los", "de las", "de-"]),
    ]
    
    for pattern, exemptions in suspicious_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            start = max(0, match.start() - 15)
            end = min(len(text_lower), match.end() + 15)
            context = text_lower[start:end]
            is_exempt = False
            for exempt in exemptions:
                if exempt in context:
                    is_exempt = True
                    break
            if not is_exempt:
                raise ValueError(f"English Max Law Violated! Generated content contains Spanish word without English context: '{context.strip()}'")

    ambiguous_spanish = [
        r"\ben\b", r"\bel\b", r"\bla\b", r"\bcon\b", r"\bal\b"
    ]
    matches_ambiguous = []
    for pattern in ambiguous_spanish:
        found = re.findall(pattern, text_lower)
        if found:
            matches_ambiguous.extend(found)
            
    if len(matches_ambiguous) > 3:
        raise ValueError(
            f"English Max Law Violated! Too many ambiguous Spanish prepositions: {set(matches_ambiguous)} "
            f"(total occurrences: {len(matches_ambiguous)})"
        )

def generate_connection_brief(config, context_data):
    prompt = f"""You are the GoalChain Chief Architect & Strategy Agent. Connect our engineering progress with our growth and marketing goals.
Strictly enforce:
1. **English Max Law**: 100% English. Absolutely NO Spanish words/phrases.
2. **Ley de Canales**: Respect our Discord channel roles (#announcements, #genesis-lounge, #degen-locker-room).
3. **No Overload**: Keep suggestions punchy, unique, and value-driven.

### Centralized Context:
{context_data}

### Output Deliverables:
Provide a structured strategy brief covering:
1. **Development Status to Marketing Insights**: Connect recent code commits and Notion tasks to specific marketing highlights we should push on X or Discord (Genesis Lounge vs Degen Locker Room).
2. **Backlog Recommendations**: Recommend the next 3 high-impact technical or operational issues we should queue in Notion/GitHub based on current priorities.
3. **Alignment Anomalies**: Identify any gaps between what is being coded (e.g. English localization, priority fees) and what is being promised in campaigns.

Format your output in markdown. Start with `# GoalChain Connection Brief - [Timestamp]`.
"""

    hermes_cmd = os.environ.get("HERMES_PATH", "/home/ubuntu/.local/bin/hermes")
    if not os.path.exists(hermes_cmd):
        hermes_cmd = "hermes"

    print(f"[Connections] Routing generation via: {hermes_cmd} --profile repo-deepdive --oneshot")
    try:
        res = subprocess.run(
            [hermes_cmd, "--profile", "repo-deepdive", "--oneshot", prompt],
            capture_output=True,
            text=True,
            check=True
        )
        content = res.stdout.strip()
        check_english_max_law(content)
        return content
    except Exception as hermes_err:
        print(f"[Warning] hermes command failed or returned Spanish content: {hermes_err}", file=sys.stderr)
        if hasattr(hermes_err, "stderr") and hermes_err.stderr:
            print(f"Command stderr: {hermes_err.stderr}", file=sys.stderr)
            
        xai_key = config.get("XAI_API_KEY")
        if not xai_key:
            print("[Error] xAI fallback key missing and hermes command failed.", file=sys.stderr)
            sys.exit(1)
            
        print("[Connections] Attempting fallback to direct xAI call...")
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {xai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "grok-3",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3
        }
        try:
            res = requests.post(url, json=payload, headers=headers, timeout=90)
            if res.status_code != 200:
                print(f"[Error] xAI API returned status {res.status_code}: {res.text}", file=sys.stderr)
                sys.exit(1)
            content = res.json()["choices"][0]["message"]["content"].strip()
            check_english_max_law(content)
            return content
        except Exception as e:
            print(f"[Error] Fallback API query failed: {e}", file=sys.stderr)
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="GoalChain Connection Finder")
    parser.add_argument("--dry-run", action="store_true", help="Print output to console without writing files")
    args = parser.parse_args()

    config = load_env_config()
    repo_path = config.get("GOALCHAIN_REPO_PATH", "/home/ubuntu/GoalChain")
    
    print("[Connections] Reading centralized context...")
    claude_md = get_file_content(Path(repo_path) / "CLAUDE.md")
    campaign_md = get_file_content(Path(repo_path) / "LAUNCH_CAMPAIGN_AGGRESSIVE.md")
    
    print("[Connections] Gathering git changes...")
    git_log = get_git_changes(repo_path)
    
    print("[Connections] Querying Notion recent activity...")
    notion_tasks = query_notion_recent_tasks(config)
    
    context_data = f"""=== CLAUDE.MD CONTEXT ===
{claude_md}

=== CAMPAIGN SPECIFICATIONS ===
{campaign_md}

=== RECENT COMMITS ===
{git_log}

=== NOTION ACTIVE TASKS ===
{notion_tasks}
"""
    
    print("[Connections] Running AI connection finder...")
    brief = generate_connection_brief(config, context_data)
    
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    
    if args.dry_run:
        print("\n=== DRY RUN CONNECTION BRIEF ===")
        print(brief)
        print("================================")
    else:
        out_dir = Path(repo_path) / "docs" / "brain"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"connections-{ts}.md"
        out_file.write_text(brief, encoding="utf-8")
        print(f"[Connections] Wrote connection brief: {out_file}")

if __name__ == "__main__":
    main()
