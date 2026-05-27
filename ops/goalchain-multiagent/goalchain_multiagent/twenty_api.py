"""Twenty CRM REST API client for saving leads and opportunities."""

from __future__ import annotations

import logging
import urllib.request
import json
from typing import Any

from goalchain_multiagent.config import Settings, get_settings

logger = logging.getLogger(__name__)


def create_twenty_lead(
    name: str,
    email: str | None = None,
    linkedin: str | None = None,
    note: str | None = None,
    settings: Settings | None = None,
) -> dict[str, Any] | None:
    """Create a new person (Lead) in Twenty CRM.

    We use twenty REST API `/api/v1/people` or similar endpoints.
    """
    s = settings or get_settings()
    api_key = s.goalchain_ma_twenty_api_key.strip()
    base_url = s.goalchain_ma_twenty_url.strip().rstrip("/")

    if not api_key:
        logger.warning("Twenty API Key is missing. Skipping real CRM save.")
        return None

    # Payload for Twenty People REST API (Standard Schema)
    payload = {
        "name": {
            "firstName": name.split(" ")[0] if name else "Lead",
            "lastName": " ".join(name.split(" ")[1:]) if len(name.split(" ")) > 1 else "LangGraph",
        },
    }
    if email:
        payload["emails"] = [{"address": email, "label": "Work"}]
    if linkedin:
        # Standard custom/social field or store in notes/description
        payload["linkedin"] = linkedin

    url = f"{base_url}/api/v1/people"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode("utf-8")
            result = json.loads(res_body)
            person_id = result.get("data", {}).get("id") or result.get("id")
            
            # If we have a note, let's create a Note connected to this person if Twenty supports it,
            # or return the created person metadata.
            logger.info("Successfully created lead in Twenty CRM: %s", person_id)
            return {
                "id": person_id,
                "name": name,
                "url": f"{base_url}/object/person/{person_id}",
                "live": True
            }

    except Exception as exc:
        logger.exception("Failed to write to Twenty CRM: %s", exc)
        return None
