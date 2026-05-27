from __future__ import annotations

import json
import re
from typing import Any, Literal

from goalchain_multiagent.config import Settings, get_settings
from goalchain_multiagent.fcc_env import load_fcc_env
from goalchain_multiagent.state import AgentName, GraphState

Provider = Literal["mock", "openrouter", "anthropic", "openai", "none"]


def resolve_provider(settings: Settings | None = None) -> Provider:
    s = settings or get_settings()
    if s.goalchain_ma_mock_llm:
        return "mock"

    mode = (s.goalchain_ma_provider or "auto").lower().strip()
    fcc = load_fcc_env() if s.goalchain_ma_use_fcc_keys else {}

    if mode == "openrouter":
        key = s.openrouter_api_key.strip() or fcc.get("OPENROUTER_API_KEY", "").strip()
        return "openrouter" if key else "none"
    if mode == "anthropic":
        return "anthropic" if s.anthropic_api_key.strip() else "none"
    if mode == "openai":
        key = s.openai_api_key.strip()
        return "openai" if key else "none"

    # auto: prefer explicit multiagent keys, then FCC OpenRouter (no extra billing)
    if s.anthropic_api_key.strip():
        return "anthropic"
    if s.openai_api_key.strip():
        return "openai"
    if fcc.get("OPENROUTER_API_KEY", "").strip():
        return "openrouter"
    return "none"


def llm_available(settings: Settings | None = None) -> bool:
    return resolve_provider(settings) not in ("mock", "none")


def _openrouter_key(settings: Settings) -> str:
    fcc = load_fcc_env() if settings.goalchain_ma_use_fcc_keys else {}
    return settings.openrouter_api_key.strip() or fcc.get("OPENROUTER_API_KEY", "").strip()


def get_chat_model(settings: Settings | None = None):
    s = settings or get_settings()
    provider = resolve_provider(s)

    if provider == "openrouter":
        from langchain_openai import ChatOpenAI

        key = _openrouter_key(s)
        if not key:
            return None
        return ChatOpenAI(
            model=s.goalchain_ma_openrouter_model,
            api_key=key,
            base_url=s.goalchain_ma_openrouter_base_url,
            max_tokens=1024,
            temperature=0.2,
        )

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model=s.goalchain_ma_model,
            api_key=s.anthropic_api_key.strip(),
            max_tokens=1024,
            temperature=0.2,
        )

    if provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=s.goalchain_ma_openai_model,
            api_key=s.openai_api_key.strip(),
            max_tokens=1024,
            temperature=0.2,
        )

    return None


def _parse_json_block(text: str) -> dict[str, Any]:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    else:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            text = text[start : end + 1]
    return json.loads(text)


def _invoke_json(prompt: str, settings: Settings | None = None) -> dict[str, Any]:
    model = get_chat_model(settings)
    if model is None:
        raise RuntimeError("No LLM configured")
    response = model.invoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        content = "".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in content
        )
    return _parse_json_block(str(content))


def ceo_delegate_llm(state: GraphState, settings: Settings | None = None) -> AgentName:
    objective = (state.get("objective") or "").strip()
    prompt = f"""You are GoalChain-CEO, orchestrator for a Solana gaming / dev-platform company.
Pick exactly ONE worker for this objective. Reply with JSON only.

Workers:
- dev: code, Solana/Anchor, webapp, API, GitHub issues (no direct repo writes)
- growth: partnerships, monetization, CRM, marketing
- ops: VPS, Hermes, FCC queue, deploy health, Anytype, Slack alerts

Objective: {objective}

JSON schema:
{{"agent": "dev"|"growth"|"ops", "reason": "one short sentence"}}
"""
    data = _invoke_json(prompt, settings)
    agent = str(data.get("agent", "ops")).lower().strip()
    if agent not in ("dev", "growth", "ops"):
        return "ops"
    return agent  # type: ignore[return-value]


def ceo_synthesize_llm(state: GraphState, settings: Settings | None = None) -> str:
    objective = (state.get("objective") or "").strip()
    trace = " → ".join(state.get("route_trace") or [])
    artifacts = state.get("artifacts") or []
    messages = state.get("messages") or []

    art_text = "\n\n".join(
        f"### {a.get('title') or a.get('type')}\n{(a.get('body') or '')[:2000]}"
        for a in artifacts[:5]
    )
    msg_text = "\n".join(f"- {m.get('role')}: {m.get('content')}" for m in messages[-8:])

    prompt = f"""You are GoalChain-CEO reporting to Nico via Hermes (Discord/WhatsApp).
Write a concise executive summary in Spanish (unless objective is clearly English-only).
Include: what was analyzed, route taken, key artifacts, and ONE clear next human step.
Do not invent repo writes or merges — code goes through FCC dispatch opencode.
IMPORTANT: Use ONLY facts present in Artifacts below (gh/systemctl output). If data is missing, say so — do not invent issue counts or percentages.

Objective: {objective}
Route: {trace}

Agent messages:
{msg_text}

Artifacts:
{art_text}

Reply with JSON only:
{{"summary": "markdown-friendly plain text, max 12 lines"}}
"""
    data = _invoke_json(prompt, settings)
    summary = str(data.get("summary", "")).strip()
    if not summary:
        raise ValueError("empty summary from LLM")
    return summary
