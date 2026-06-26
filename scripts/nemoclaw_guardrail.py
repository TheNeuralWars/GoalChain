#!/usr/bin/env python3
import sys
import re

def audit_command(command: str):
    print(f"🕵️ [NemoClaw] Auditing command: '{command}'")
    
    # 1. P0 Regex Blocks
    dangerous_patterns = [
        (r"rm\s+-rf", "Deletion of root/directories blocked"),
        (r"chmod\s+777", "Insecure permissions change blocked"),
        (r"curl.*bash", "Direct shell piping of external scripts blocked"),
        (r"wget.*sh", "Direct shell piping of external scripts blocked"),
        (r"cat.*/\.env", "Attempting to exfiltrate .env variables blocked"),
        (r"cat.*/id\.json", "Attempting to exfiltrate Solana wallet keys blocked"),
    ]
    
    for pattern, reason in dangerous_patterns:
        if re.search(pattern, command):
            print(f"❌ [NemoClaw] BLOCKED: {reason}")
            return False, reason
            
    # 2. Simulated LLM Guardrail Check (Nvidia NemoClaw NIM)
    # Checks for subtle obfuscation or command injection tricks
    if ";" in command or "&&" in command or "|" in command:
        if "sudo" in command or "npm" in command or "cargo" in command:
            reason = "Complex chained command containing sudo or npm/cargo. Requires manual oversight."
            print(f"⚠️ [NemoClaw] WARNING: {reason}")
            return False, reason
            
    print("✅ [NemoClaw] PASS: Command is clean and safe for execution.")
    return True, "Safe"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 nemoclaw_guardrail.py '<command>'")
        sys.exit(1)
        
    cmd = sys.argv[1]
    passed, reason = audit_command(cmd)
    if not passed:
        sys.exit(1)
    sys.exit(0)
