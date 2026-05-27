from __future__ import annotations

import re
from goalchain_multiagent.config import get_settings
from goalchain_multiagent.state import GraphState
from goalchain_multiagent.twenty_api import create_twenty_lead


def growth_node(state: GraphState) -> GraphState:
    objective = (state.get("objective") or "").strip()
    trace = list(state.get("route_trace") or [])
    trace.append("growth")

    settings = get_settings()
    crm_saved = False
    crm_msg = "Growth memo drafted (CRM stub)."
    lead_info = None

    # Trigger lead creation if Twenty is configured and the objective is a partnership/monetization pitch
    if settings.goalchain_ma_twenty_api_key.strip():
        # Try to parse name/email from objective or context, or use standard mock values
        name_match = re.search(r"\b(?:partner|lead|name)\b:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", objective)
        lead_name = name_match.group(1) if name_match else "Solana Partner"
        
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", objective)
        lead_email = email_match.group(0) if email_match else None

        lead_info = create_twenty_lead(
            name=lead_name,
            email=lead_email,
            note=objective,
            settings=settings,
        )
        if lead_info:
            crm_saved = True
            crm_msg = f"Saved lead '{lead_name}' directly in Twenty CRM ({lead_info['url']})."
            
            # Push elegant slack notification for our internal logs pipeline
            if settings.goalchain_ma_slack_webhook.strip():
                try:
                    notify_agent_step_slack(
                        agent_name="growth",
                        objective=objective,
                        content=crm_msg,
                        meta={
                            "Lead CRM ID": lead_info["id"],
                            "URL": lead_info["url"],
                        },
                        settings=settings,
                    )
                except Exception:  # noqa: BLE001
                    pass


    artifacts = list(state.get("artifacts") or [])
    artifacts.append(
        {
            "type": "growth_memo",
            "title": "Partnership & Monetization Angles",
            "body": (
                f"Objective: {objective}\n\n"
                "- API fee on dev integrations (post-Mundial)\n"
                "- Co-marketing with Solana gaming communities\n"
                "- NFT dynamic collections tied to oracle performance (honest SIMULACIÓN until mainnet)\n"
                "- Track deck opens via Papermark when pitch exists (Fase 2 tool)\n"
            ),
            "meta": {
                "crm_saved": crm_saved,
                "lead_id": lead_info["id"] if lead_info else None,
                "lead_url": lead_info["url"] if lead_info else None,
            },
        }
    )

    return {
        "route_trace": trace,
        "artifacts": artifacts,
        "messages": (state.get("messages") or [])
        + [{"role": "growth", "content": crm_msg}],
        "next_agent": "ceo",
    }

