from __future__ import annotations

import re
import logging
from goalchain_multiagent.config import get_settings
from goalchain_multiagent.state import GraphState
from goalchain_multiagent.twenty_api import create_twenty_lead

logger = logging.getLogger(__name__)



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


    # Create automated marketing issues for FCC to pick up
    marketing_issue_info = None
    if any(k in objective.lower() for k in ["marketing", "campaña", "grow", "leads", "twenty"]):
        title = f"Campaña de Marketing: Captura y Narrativa '{objective[:40]}...'"
        body = (
            f"### 📢 Plan de Campaña de Marketing GoalChain\n\n"
            f"**Objetivo Solicitado**: {objective}\n\n"
            f"**Estrategia Propuesta**:\n"
            f"- Extraer tendencias narrativas y shifts de Solana Web3 de forma automatizada.\n"
            f"- Generar borradores de hilos de Twitter/X y campañas de email frío (outreach) en Twenty CRM.\n"
            f"- Mapear los KPIs de retención del simulador del Estadio en vivo.\n\n"
            f"**Acciones de Ejecución Automática (FCC / OpenCode)**:\n"
            f"- [ ] Crear script scraper `scripts/marketing_trend_scraper.py` para analizar competidores.\n"
            f"- [ ] Generar plantilla de email de campaña `templates/marketing_campaign_outreach.html`.\n\n"
            f"**Estado del Issue**: Listo para procesamiento autónomo."
        )
        repo = settings.github_repo or "TheNeuralWars/GoalChain"
        try:
            from goalchain_multiagent.github_api import create_github_issue
            marketing_issue_info = create_github_issue(
                title=title,
                body=body,
                repo=repo,
                labels=["status:ready", "agent:opencode", "marketing"],
            )
            if marketing_issue_info:
                crm_msg += f" | Creado Issue de Marketing autónomo en GitHub: {marketing_issue_info['url']} (FCC lo tomará en 5 mins)."
        except Exception as ge:
            logger.warning("Could not auto-create GitHub marketing issue: %s", ge)

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
                "marketing_issue_url": marketing_issue_info["url"] if marketing_issue_info else None,
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

