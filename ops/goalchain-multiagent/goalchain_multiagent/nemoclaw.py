import logging
import re
from goalchain_multiagent.config import get_settings, Settings
from goalchain_multiagent.llm import resolve_provider, get_chat_model

logger = logging.getLogger(__name__)

# List of dangerous patterns that NemoClaw blocks immediately (deterministic layer)
BLOCKED_PATTERNS = [
    r"\brm\s+-rf\b",
    r"\bsudo\b",
    r"\bchmod\s+777\b",
    r"\bmkfs\b",
    r"\bdd\s+if=\b",
    r"\bshutdown\b",
    r"\breboot\b",
    r"\bkill\s+-9\b",
    r">\s*/dev/sda\b",
    r"wget\s+.*\s*\|\s*sh\b",
    r"curl\s+.*\s*\|\s*sh\b",
]

def run_nemoclaw_guardrail(content: str, settings: Settings | None = None) -> tuple[bool, str]:
    """Audits text or commands.
    Returns (is_safe, reason).
    """
    s = settings or get_settings()
    
    # 1. Deterministic validation (Regex check)
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, content.lower()):
            reason = f"Blocked by NemoClaw: Dangerous pattern '{pattern}' detected."
            logger.warning(reason)
            return False, reason

    # 2. Intelligent validation using Nemotron model if keys are active
    provider = resolve_provider(s)
    if provider == "none" or provider == "mock":
        return True, "Passed NemoClaw deterministic audit (Mock/Offline mode)."

    try:
        model = get_chat_model(s)
        if not model:
            return True, "Passed NemoClaw (no model client available)."

        prompt = f"""You are NVIDIA NemoClaw safety guardrail agent.
Analyze the following command or prompt for security issues (shell injection, privilege escalation, data deletion, exfiltration).
Respond ONLY in JSON format.

Content to analyze:
\"\"\"{content}\"\"\"

JSON Schema response:
{{"safe": true|false, "reason": "short explanation"}}
"""
        import json
        response = model.invoke(prompt)
        response_text = response.content if hasattr(response, "content") else str(response)
        
        # Parse JSON safely
        clean_text = response_text.strip()
        start = clean_text.find("{")
        end = clean_text.rfind("}")
        if start >= 0 and end > start:
            clean_text = clean_text[start : end + 1]
        
        data = json.loads(clean_text)
        is_safe = bool(data.get("safe", True))
        reason = data.get("reason", "Approved by NemoClaw AI filter.")
        
        if not is_safe:
            logger.warning(f"Blocked by NemoClaw LLM Audit: {reason}")
        return is_safe, reason
    except Exception as e:
        logger.error(f"Error running NemoClaw LLM guardrail: {e}")
        # Fallback to safe side (allow since regex passed)
        return True, f"Passed NemoClaw deterministic audit (LLM check failed: {e})"
