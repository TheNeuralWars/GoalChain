#!/usr/bin/env python3
"""Proactive xAI Grok OAuth refresh for Hermes auth.json (same logic as gateway)."""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def _agent_profile_names(list_path: Path) -> list[str]:
    if not list_path.is_file():
        return []
    names: list[str] = []
    for line in list_path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s and not s.startswith("#"):
            names.append(s)
    return names


def _refresh_one(hermes_home: Path, agent_root: Path, label: str) -> int:
    if not agent_root.is_dir():
        print(f"ERROR: hermes-agent not found under {hermes_home}", file=sys.stderr)
        return 2

    sys.path.insert(0, str(agent_root))
    os.environ["HERMES_HOME"] = str(hermes_home)

    try:
        from hermes_cli.auth import AuthError, resolve_xai_oauth_runtime_credentials
    except ImportError as exc:
        print(f"ERROR [{label}]: cannot import hermes_cli.auth: {exc}", file=sys.stderr)
        return 2

    auth_path = hermes_home / "auth.json"
    if not auth_path.is_file():
        print(f"SKIP [{label}]: no auth.json at {auth_path}")
        return 0

    try:
        creds = resolve_xai_oauth_runtime_credentials(
            force_refresh=False,
            refresh_if_expiring=True,
        )
        token = str(creds.get("api_key", "") or "")
        preview = f"{token[:8]}…" if len(token) > 8 else "(empty)"
        print(f"OK [{label}] xai-oauth refreshed or still valid (token preview {preview})")
        return 0
    except AuthError as exc:
        print(f"FAIL [{label}] xai-oauth: [{exc.code}] {exc}", file=sys.stderr)
        if getattr(exc, "relogin_required", False):
            print(
                "Re-login: hermes auth add xai-oauth --no-browser "
                "(with ssh -L 56121:127.0.0.1:56121 on Mac if remote)",
                file=sys.stderr,
            )
        return 1
    except Exception as exc:
        print(f"FAIL [{label}] xai-oauth: {exc}", file=sys.stderr)
        return 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh xAI OAuth in Hermes auth.json")
    parser.add_argument(
        "--all-agent-profiles",
        action="store_true",
        help="Refresh default + every profile in goalchain-agent-profiles.list",
    )
    args = parser.parse_args()

    base = Path.home() / ".hermes"
    agent_root = base / "hermes-agent"
    script_dir = Path(__file__).resolve().parent
    list_path = Path(
        os.environ.get(
            "GOALCHAIN_AGENT_PROFILES_LIST",
            script_dir / "goalchain-agent-profiles.list",
        )
    ).expanduser()

    profile = os.environ.get("HERMES_PROFILE", "").strip()
    if args.all_agent_profiles:
        targets: list[tuple[str, Path]] = [("default", base)]
        for name in _agent_profile_names(list_path):
            targets.append((name, base / "profiles" / name))
        worst = 0
        for label, home in targets:
            if label != "default" and not home.is_dir():
                print(f"SKIP [{label}]: profile dir missing")
                continue
            worst = max(worst, _refresh_one(home, agent_root, label))
        return worst

    hermes_home = base
    if profile and profile not in ("default", ""):
        hermes_home = base / "profiles" / profile
    return _refresh_one(hermes_home, agent_root, profile or "default")


if __name__ == "__main__":
    raise SystemExit(main())
