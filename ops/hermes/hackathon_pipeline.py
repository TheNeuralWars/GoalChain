#!/usr/bin/env python3
"""
GoalChain Hackathon Pipeline Engine.
Scans or mocks Solana hackathon schedules, aligns track opportunities, and drafts
submission project cards and technical pitch summaries.
"""

import os
import sys
import argparse
import requests
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

def fetch_solana_hackathons():
    """Queries or compiles active Solana / Devpost Hackathons context."""
    # We can mock this or query a public API/list if available.
    # To keep it robust without external network failure, we build a structured active tracker.
    return [
        {
            "name": "Solana Renaissance / Hyperdrive / Radar / Colosseum",
            "tracks": ["DeFi & Payments", "Consumer Apps", "Crypto Gaming (GoalChain's Target)", "Infrastructure", "DePIN"],
            "deadline": "2026-06-30 (Simulated Devpost Opportunity)"
        }
    ]

import re
import subprocess

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

def generate_submission_package(config, hackathons):
    prompt = f"""You are the GoalChain Hackathon Architect. Prepare a complete, competition-grade hackathon project submission package.
Strictly enforce:
1. **English Max Law**: 100% English. Absolutely NO Spanish words/phrases.
2. **Technical Depth**: Explain our Solana Program (smart contract built with Anchor), Oracle vault yield redistribution strategy, React/Vite webapp, and shared SDK layout.

### Target Hackathons:
{hackathons}

### Output Deliverables:
1. **Submission Pitch Deck Script**: 3-minute video presentation transcript (Hook, Problem, Solution, Demo walkthrough, Codebase architecture).
2. **Project Description Card (Devpost style)**:
   - **What it does**: High-level explanation of GoalChain web3 football gaming.
   - **How we built it**: Detail package monorepo structure, program/anchor logic, and rest API.
   - **Challenges we ran into**: Real developer hurdles (transaction latency, wallet state adapters, oracle cron sync).
   - **What's next**: Multi-agent auto-training & autonomous league management.
"""

    hermes_cmd = os.environ.get("HERMES_PATH", "/home/ubuntu/.local/bin/hermes")
    if not os.path.exists(hermes_cmd):
        hermes_cmd = "hermes"

    print(f"[Hackathon] Routing generation via: {hermes_cmd} --profile repo-deepdive --oneshot")
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
            
        print("[Hackathon] Attempting fallback to direct xAI call...")
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
    parser = argparse.ArgumentParser(description="GoalChain Hackathon Pipeline")
    parser.add_argument("--dry-run", action="store_true", help="Print output to console without writing files")
    args = parser.parse_args()

    config = load_env_config()
    repo_path = config.get("GOALCHAIN_REPO_PATH", "/home/ubuntu/GoalChain")
    
    print("[Hackathon] Gathering target track details...")
    hackathons = fetch_solana_hackathons()
    
    print("[Hackathon] Drafting project submission package...")
    content = generate_submission_package(config, hackathons)
    
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")
    
    if args.dry_run:
        print("\n=== HACKATHON SUBMISSION DRAFT ===")
        print(content)
        print("==================================")
    else:
        out_dir = Path(repo_path) / "docs" / "hackathons"
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"submission-{ts}.md"
        out_file.write_text(content, encoding="utf-8")
        print(f"[Hackathon] Wrote submission package: {out_file}")

if __name__ == "__main__":
    main()
