#!/usr/bin/env python3
import os
import sys
import subprocess
import requests

def get_git_diff():
    try:
        # Get diff against main branch (or base ref if available)
        base_branch = os.getenv("GITHUB_BASE_REF", "main")
        print(f"Generating diff against origin/{base_branch}...")
        
        # Ensure we have origin/base_branch fetched
        subprocess.run(["git", "fetch", "origin", base_branch], check=True)
        
        result = subprocess.run(
            ["git", "diff", f"origin/{base_branch}...HEAD"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except Exception as e:
        print(f"Error generating git diff: {e}")
        return ""

def call_grok_api(diff: str):
    xai_key = os.getenv("XAI_API_KEY", "").strip()
    if not xai_key:
        print("XAI_API_KEY is not set. Skipping review.")
        return ""

    # Truncate diff if it's too large to prevent token blowup (limit to ~30k chars)
    if len(diff) > 30000:
        print(f"Diff is too large ({len(diff)} characters). Truncating to 30,000 characters...")
        diff = diff[:30000] + "\n\n[Diff truncated due to size limit...]"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {xai_key}"
    }
    
    prompt = f"""You are an elite Staff Engineer and automated Code Reviewer for the GoalChain project.
GoalChain is a Solana-based Web3 football gaming platform written in TypeScript/React/Rust.

Analyze the following Git diff and perform a thorough, constructive code review.
Focus on:
1. **Critical Bugs:** Logic errors, potential memory leaks, race conditions, or unhandled promise rejections.
2. **Solana/Web3 Best Practices:** PDA validation, security checks, signature verification, or transaction fee optimizations (if Anchor/program code is touched).
3. **Project Rules:**
   - **English Max Law:** Verify that all user-facing strings, logs, or public configurations are in 100% English. NO Spanish words/phrases are allowed in public-facing additions.
   - **No Secrets:** Ensure no API keys, private keys, or credentials are hardcoded.
4. **Style & Readability:** Code organization, proper TypeScript types, naming conventions.

Provide your review in clean GitHub Markdown format. Start with a quick high-level summary, then bulleted points for issues/improvement suggestions, and highlight any "Critical" blockers if found. Be precise and keep it constructive.

Git Diff:
```diff
{diff}
```
"""

    payload = {
        "model": "grok-2",  # Fast and robust code review model
        "messages": [
            {"role": "system", "content": "You are a senior tech lead reviewing a pull request. Output the review directly in markdown format."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    try:
        resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=90)
        if resp.status_code != 200:
            print(f"Grok API error: {resp.status_code} - {resp.text}")
            return ""
        return resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Connection to Grok API failed: {e}")
        return ""

def post_github_comment(review: str):
    token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("REPOSITORY")
    pr_number = os.getenv("PR_NUMBER")

    if not token or not repo or not pr_number:
        print("Missing GitHub action environment context. Print review output to stdout:")
        print(review)
        return

    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Prepend a header to identify the review
    body = f"## 🤖 GoalChain AI Code Review\n\n{review}"
    
    payload = {"body": body}

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        if resp.status_code == 201:
            print("Successfully posted code review comment on the PR.")
        else:
            print(f"Failed to post comment: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Error posting GitHub comment: {e}")

def main():
    diff = get_git_diff()
    if not diff.strip():
        print("No changes found in the PR diff. Skipping review.")
        sys.exit(0)

    print("Sending diff to Grok for analysis...")
    review = call_grok_api(diff)
    
    if review:
        print("Posting review comment on GitHub...")
        post_github_comment(review)
    else:
        print("Could not generate code review.")

if __name__ == "__main__":
    main()
