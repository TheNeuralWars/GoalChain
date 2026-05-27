"""GitHub API subprocess interaction helper for creating issues on the repo."""

from __future__ import annotations

import json
import logging
import subprocess

logger = logging.getLogger(__name__)


def create_github_issue(
    title: str,
    body: str,
    repo: str,
    labels: list[str] | None = None,
    assignee: str | None = None,
    timeout: int = 30,
) -> dict[str, str | int] | None:
    """Create a new issue on GitHub using the gh CLI.

    Returns dict with issue info if successful, None otherwise.
    """
    cmd = ["gh", "issue", "create", "--repo", repo, "--title", title, "--body", body]

    if labels:
        for lbl in labels:
            cmd.extend(["--label", lbl])

    if assignee:
        cmd.extend(["--assignee", assignee])

    logger.info("Executing: %s", " ".join(cmd))
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        stdout = (proc.stdout or "").strip()
        stderr = (proc.stderr or "").strip()

        if proc.returncode != 0:
            logger.error("GitHub issue creation failed (code %d): %s", proc.returncode, stderr)
            return None

        # Output format from gh issue create is the URL of the created issue
        if stdout.startswith("https://"):
            url = stdout
            # Extract issue number from URL (e.g. .../issues/123)
            num_match = url.split("/issues/")[-1]
            num = int(num_match) if num_match.isdigit() else 0
            return {"url": url, "number": num}

        logger.warning("GitHub CLI output didn't return expected URL: %s", stdout)
        return None

    except subprocess.TimeoutExpired:
        logger.error("GitHub issue creation timed out after %ds", timeout)
        return None
    except FileNotFoundError:
        logger.error("GitHub CLI ('gh') not found in PATH")
        return None
    except Exception as exc:
        logger.exception("Unexpected error creating GitHub issue: %s", exc)
        return None
