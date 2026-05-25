#!/usr/bin/env python3
"""Proactive xAI Grok OAuth refresh for Hermes auth.json (same logic as gateway)."""
from __future__ import annotations

import os
import sys
from pathlib import Path


def main() -> int:
    hermes_home = Path(os.environ.get("HERMES_AGENT_HOME", Path.home() / ".hermes")).expanduser()
    agent_root = hermes_home / "hermes-agent"
    if not agent_root.is_dir():
        print(f"ERROR: hermes-agent not found under {hermes_home}", file=sys.stderr)
        return 2

    sys.path.insert(0, str(agent_root))
    os.environ.setdefault("HERMES_HOME", str(hermes_home))

    try:
        from hermes_cli.auth import AuthError, resolve_xai_oauth_runtime_credentials
    except ImportError as exc:
        print(f"ERROR: cannot import hermes_cli.auth: {exc}", file=sys.stderr)
        return 2

    try:
        creds = resolve_xai_oauth_runtime_credentials(
            force_refresh=False,
            refresh_if_expiring=True,
        )
        token = str(creds.get("api_key", "") or "")
        preview = f"{token[:8]}…" if len(token) > 8 else "(empty)"
        print(f"OK xai-oauth refreshed or still valid (token preview {preview})")
        return 0
    except AuthError as exc:
        print(f"FAIL xai-oauth: [{exc.code}] {exc}", file=sys.stderr)
        if getattr(exc, "relogin_required", False):
            print(
                "Re-login: hermes auth add xai-oauth --no-browser "
                "(with ssh -L 56121:127.0.0.1:56121 on Mac if remote)",
                file=sys.stderr,
            )
        return 1
    except Exception as exc:
        print(f"FAIL xai-oauth: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
