#!/usr/bin/env python3
"""
GoalChain Social Multiplexer Engine.
Parses local git commits, milestones, and project structure to generate target-specific
public updates (English Max Law) for X, Indie Hackers, Hacker News, Reddit, and DevTo.
"""

# Postiz integration hook (issue #844): for future agent-driven scheduling via MCP/CLI. Always enforce English Max + budget. Thin for now. See docs/social/POSTIZ_INTEGRATION.md
import os
import sys
import argparse
import requests
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Load environment configuration
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
    # Merge with active environment
    for k, v in os.environ.items():
        config[k] = v
    return config

def get_git_changes(repo_path, max_commits=5):
    """Gathers the latest git commits for context."""
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

import re

def check_english_max_law(text):
    """Enforces 100% English only by searching for Spanish words, splitting into absolute and ambiguous indicators."""
    text_lower = text.lower()
    
    # Check for Spanish punctuation marks
    if "¿" in text or "¡" in text:
        raise ValueError("English Max Law Violated! Generated content contains Spanish punctuation (¿ or ¡).")
        
    # Absolute Spanish indicators (almost never used in standard English)
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
            
    # Context-aware checks for words that can appear in English proper nouns or foreign phrases
    # but are highly suspicious if they appear without English context
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
            # Check if this match is part of any exempted phrase
            is_exempt = False
            for exempt in exemptions:
                if exempt in context:
                    is_exempt = True
                    break
            if not is_exempt:
                raise ValueError(f"English Max Law Violated! Generated content contains Spanish word without English context: '{context.strip()}'")

    # Ambiguous/short Spanish prepositions (limit to max 3 occurrences total to catch general Spanish text)
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

def generate_social_content(config, git_log):
    prompt = f"""You are the GoalChain Chief Marketing Agent. Build structured developer-focused social posts for our web3 football game monorepo.
Strictly enforce:
1. **English Max Law**: 100% English. Absolutely NO Spanish words/phrases.
2. **Authenticity**: No generic corporate jargon or cheesy AI placeholders. Act like a high-energy indie developer building a Solana monorepo in public.

### Repository Context (Recent Commits):
{git_log}

### Output Deliverables:
Generate tailored copies for these specific platforms:

1. **X (Twitter) Thread**: 3-4 tweet thread. First tweet is a hook/strategic update. Follow-up tweets detail technical challenges or screenshots/milestones. Include tags #GoalChain, #Solana, #BuildInPublic. Keep tweets under 270 chars.
2. **Hacker News**: A "Show HN: GoalChain - A Solana-based Web3 Football game monorepo". Draft the opening text block explaining the tech stack (Anchor, React, Express, local Oracle yield crank), why we built it, and our open source architecture.
3. **Reddit (r/SaaS & r/SideProject)**: A thread titled "How we built a decentralized football manager game on Solana (lessons learned, tech stack, and devnet launch)". Highlight the Oracle crank and Jito yield-sharing strategy.
4. **Indie Hackers / Makerlog**: An update list outlining: Today's Tasks Completed, Major Hurdles, and Next Steps. Keep it builder-focused.
5. **DevTo**: A developer-focused markdown article post outlining the monorepo architecture (shared TypeScript SDK, program, API, oracle).

Format your output in markdown. Start with `# GoalChain Social Drafts - [Timestamp]`.
"""

    hermes_cmd = os.environ.get("HERMES_PATH", "/home/ubuntu/.local/bin/hermes")
    if not os.path.exists(hermes_cmd):
        hermes_cmd = "hermes"

    print(f"[Multiplexer] Routing generation via: {hermes_cmd} --profile marketing-active --oneshot")
    try:
        res = subprocess.run(
            [hermes_cmd, "--profile", "marketing-active", "--oneshot", prompt],
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
            
        print("[Multiplexer] Attempting fallback to direct xAI call...")
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {xai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "grok-3",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.4
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
    parser = argparse.ArgumentParser(description="GoalChain Social Multiplexer")
    parser.add_argument("--dry-run", action="store_true", help="Print output to console without writing files")
    args = parser.parse_args()

    config = load_env_config()
    repo_path = config.get("GOALCHAIN_REPO_PATH", "/home/ubuntu/GoalChain")
    
    print("[Multiplexer] Gathering context...")
    git_log = get_git_changes(repo_path)
    
    print("[Multiplexer] Synthesizing social copy via Grok...")
    content = generate_social_content(config, git_log)
    
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    
    if args.dry_run:
        print("\n=== DRY RUN OUTPUT ===")
        print(content)
        print("=======================")
    else:
        out_dir = Path(repo_path) / "docs" / "social_drafts"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"draft-{ts}.md"
        out_file.write_text(content, encoding="utf-8")
        print(f"[Multiplexer] Wrote draft: {out_file}")

if __name__ == "__main__":
    main()
