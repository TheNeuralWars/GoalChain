"""GoalChain: deterministic empresa:/grafo: dispatch (no Grok narration)."""

from __future__ import annotations

import asyncio
import logging
import os
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

_EMPRESA_RE = re.compile(
    r"(?:^|\s)(?:empresa|grafo)\s*:\s*(.+)$",
    re.IGNORECASE | re.DOTALL,
)
_MENTION_RE = re.compile(r"<@!?\d+>")

_DEFAULT_REPO = Path.home() / "hermes" / "workspace" / "GoalChain"
_EMPRESA_SCRIPT = "ops/hermes/empresa.sh"
_TIMEOUT_SEC = 120
_MAX_DISCORD = 1900


def _repo_root() -> Path:
    env = os.environ.get("GOALCHAIN_REPO_PATH", "").strip()
    if env:
        return Path(env).expanduser()
    return _DEFAULT_REPO


def _extract_objective(text: str) -> Optional[str]:
    cleaned = _MENTION_RE.sub(" ", text or "").strip()
    cleaned = re.sub(r"^@\S+\s+", "", cleaned).strip()
    match = _EMPRESA_RE.search(cleaned)
    if not match:
        return None
    objective = match.group(1).strip()
    return objective or None


def _run_empresa(objective: str) -> str:
    repo = _repo_root()
    script = repo / _EMPRESA_SCRIPT
    if not script.is_file():
        return f"[Empresa] ERROR: missing script {script}"
    try:
        proc = subprocess.run(
            ["bash", str(script), objective],
            cwd=str(repo),
            capture_output=True,
            text=True,
            timeout=_TIMEOUT_SEC,
            env=os.environ.copy(),
        )
    except subprocess.TimeoutExpired:
        return f"[Empresa] ERROR: empresa.sh timed out after {_TIMEOUT_SEC}s"
    except OSError as exc:
        return f"[Empresa] ERROR: could not run empresa.sh: {exc}"

    out = (proc.stdout or proc.stderr or "").strip()
    if not out:
        return f"[Empresa] ERROR: empty output (exit {proc.returncode})"
    if proc.returncode != 0:
        return f"{out}\n\n[Empresa] WARNING: script exit code {proc.returncode}"
    return out


async def _send_reply(gateway: Any, source: Any, body: str) -> None:
    platform = getattr(source, "platform", None)
    chat_id = getattr(source, "chat_id", None)
    if not platform or not chat_id:
        return
    adapter = gateway.adapters.get(platform)
    if adapter is None:
        return
    chunk = body[:_MAX_DISCORD]
    if len(body) > _MAX_DISCORD:
        chunk += "\n\n… (truncado; ver VPS empresa.sh para salida completa)"
    try:
        await adapter.send(chat_id, chunk)
    except Exception as exc:
        logger.warning("goalchain-empresa send failed: %s", exc)


def pre_gateway_dispatch(event, gateway, session_store, **kwargs):
    """Intercept empresa:/grafo: before auth+LLM; post LangGraph stdout directly."""
    text = getattr(event, "text", None) or ""
    objective = _extract_objective(text)
    if objective is None:
        return None

    source = getattr(event, "source", None)
    if source is None:
        return None

    # Respect Hermes allowlists (do not run LangGraph for unauthorized senders).
    try:
        if not gateway._is_user_authorized(source):
            return None
    except Exception:
        return None

    output = _run_empresa(objective)

    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_send_reply(gateway, source, output))
    except RuntimeError:
        logger.warning("goalchain-empresa: no running event loop; cannot send reply")

    return {"action": "skip", "reason": "goalchain-empresa-langgraph"}


def register(ctx):
    ctx.register_hook("pre_gateway_dispatch", pre_gateway_dispatch)
    logger.info("goalchain-empresa plugin registered (empresa:/grafo: → empresa.sh)")
