"""Twenty CRM GraphQL API client for saving leads dynamically."""

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
    """Create a new person (Lead) in Twenty CRM using GraphQL.

    Fallback loopback GraphQL: http://127.0.0.1:3000/graphql (for container bypass)
    Standard URL: https://crm.goalchain.fun/graphql
    """
    s = settings or get_settings()
    api_key = s.goalchain_ma_twenty_api_key.strip()
    base_url = s.goalchain_ma_twenty_url.strip().rstrip("/")

    if not api_key:
        logger.warning("Twenty API Key is missing. Skipping real CRM save.")
        return None

    first_name = name.split(" ")[0] if name else "Solana"
    last_name = " ".join(name.split(" ")[1:]) if len(name.split(" ")) > 1 else "Partner"

    # We will build standard GraphQL Mutation.
    # Note: If crm.goalchain.fun blocks loopback, we can fallback to http://127.0.0.1:3000/graphql
    # which we verified works flawlessly on the VPS local network.
    graphql_url = f"{base_url}/graphql"
    if "crm.goalchain.fun" in base_url:
        # Loopback bypass for local fast network speeds and reliability
        graphql_url = "http://127.0.0.1:3000/graphql"

    query = """
    mutation CreateLead($first: String!, $last: String!, $email: String) {
      createPerson(data: {
        name: { firstName: $first, lastName: $last }
        emails: { primaryEmail: $email }
      }) {
        id
      }
    }
    """
    if not email:
        # Avoid creating emails field if none provided
        query = """
        mutation CreateLead($first: String!, $last: String!) {
          createPerson(data: {
            name: { firstName: $first, lastName: $last }
          }) {
            id
          }
        }
        """

    variables = {"first": first_name, "last": last_name}
    if email:
        variables["email"] = email

    payload = {
        "query": query,
        "variables": variables
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(graphql_url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=20) as response:
            res_body = response.read().decode("utf-8")
            result = json.loads(res_body)

            if "errors" in result:
                logger.error("GraphQL reported errors: %s", result["errors"])
                return None

            person_data = result.get("data", {}).get("createPerson")
            if not person_data:
                logger.error("Response body did not contain person data: %s", res_body)
                return None

            person_id = person_data.get("id")
            logger.info("Successfully created lead in Twenty CRM via GraphQL: %s", person_id)
            return {
                "id": person_id,
                "name": name,
                "url": f"{base_url}/object/person/{person_id}",
                "live": True
            }

    except Exception as exc:
        logger.exception("Failed to write to Twenty CRM via GraphQL: %s", exc)
        return None
