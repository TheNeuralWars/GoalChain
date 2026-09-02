#!/usr/bin/env python3
import os
import sys
import json
import requests
from pathlib import Path

# Paths
PRIMARY_ROOT = Path("/Users/NicoPez/GoalChain")
if not PRIMARY_ROOT.exists():
    if Path("/data/apps/GoalChain").exists():
        PRIMARY_ROOT = Path("/data/apps/GoalChain")
    else:
        PRIMARY_ROOT = Path(os.getcwd())

# Critical files to audit
AUDIT_FILES = {
    "SDK Index": "goalchain-sdk/src/index.ts",
    "API Main": "goalchain_api/src/index.ts",
    "Oracle Entry": "goalchain_oracle/src/index.ts",
    "Oracle Priority Fees": "goalchain_oracle/src/priorityFees.ts",
    "Oracle Vault Crank": "goalchain_oracle/src/vault_crank.ts"
}

def load_file_content(relative_path: str) -> str:
    full_path = PRIMARY_ROOT / relative_path
    if not full_path.exists():
        return f"[File not found: {relative_path}]"
    try:
        content = full_path.read_text(encoding="utf-8")
        # Truncate to first 400 lines if it is extremely long
        lines = content.splitlines()
        if len(lines) > 400:
            return "\n".join(lines[:400]) + "\n\n[... Truncated for audit context limit ...]"
        return content
    except Exception as e:
        return f"[Error reading file {relative_path}: {e}]"

def main():
    xai_key = os.getenv("XAI_API_KEY", "").strip()
    if not xai_key:
        env_path = PRIMARY_ROOT / ".env"
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    if key.strip() == "XAI_API_KEY":
                        xai_key = val.strip().strip('"').strip("'")
                        break

    if not xai_key:
        # Try loading from VPS config
        config_path = Path("/home/ubuntu/hermes/config.env")
        if config_path.exists():
            for line in config_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    if key.strip() == "XAI_API_KEY":
                        xai_key = val.strip().strip('"').strip("'")
                        break

    if not xai_key:
        print("Error: XAI_API_KEY env var or config not found. Aborting.")
        sys.exit(1)

    print("Gathering critical files for comprehensive audit...")
    collected_code = []
    for name, rel_path in AUDIT_FILES.items():
        print(f"Reading {name} ({rel_path})...")
        content = load_file_content(rel_path)
        collected_code.append(f"### File: {rel_path} ({name})\n```typescript\n{content}\n```\n")

    code_payload = "\n".join(collected_code)

    prompt = f"""You are a Principal Software Architect and Security Auditor performing a comprehensive review of the GoalChain platform.
Here is the source code of the core files representing the SDK, Express REST API, and Oracle (including priority fees estimation and vault staking mechanics).

Analyze the entire architecture and implementation detail to compile a professional, detailed Code Audit Report.

Focus on:
1. **Architecture Consistency:** How well do the SDK, API, and Oracle integrate with each other and with the Solana smart contract?
2. **Robustness & Error Handling:** Are there unhandled edge cases in the Express API endpoints? Does the Oracle handle transaction retries and network timeouts gracefully?
3. **Transaction Optimizations:** Review how priority fees and compute budget limits are handled in `priorityFees.ts` and `vault_crank.ts`. Are there performance risks?
4. **Security & Standards Audit:**
   - Verify compliance with the **English Max Law** (no Spanish strings in user-facing logging/outputs).
   - Ensure no credentials or keys are exposed.
   - Look for standard Web3 vulnerabilities or memory leak risks in connections.
5. **Actionable Recommendations:** Provide a checklist of concrete items that need to be resolved.

Format your output in a beautiful, extensive Markdown document. Start with a structured index and title.

Source Code:
{code_payload}
"""

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {xai_key}"
    }

    payload = {
        "model": os.environ.get("XAI_MODEL", "grok-4.6"),
        "messages": [
            {"role": "system", "content": "You are a principal staff engineer auditing a repository. Write a highly detailed, professional markdown report."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    print("Submitting codebase context to Grok API (this might take a minute)...")
    try:
        resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=120)
        if resp.status_code != 200:
            print(f"Grok API error: {resp.status_code} - {resp.text}")
            sys.exit(1)
        
        report_content = resp.json()["choices"][0]["message"]["content"]
        
        # Save to docs/REPORTS/GOALCHAIN_ARCHITECTURE_AUDIT.md
        report_dir = PRIMARY_ROOT / "docs/REPORTS"
        report_dir.mkdir(parents=True, exist_ok=True)
        report_path = report_dir / "GOALCHAIN_ARCHITECTURE_AUDIT.md"
        report_path.write_text(report_content, encoding="utf-8")
        
        print(f"\n🎉 Successfully compiled codebase audit! Saved report to: {report_path}")
        
    except Exception as e:
        print(f"Failed to compile audit report: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
