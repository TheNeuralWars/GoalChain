from goalchain_multiagent.config import get_settings
from goalchain_multiagent.ops_live import collect_ops_snapshot
from goalchain_multiagent.slack_api import notify_agent_step_slack
from goalchain_multiagent.stripe_ops import get_stripe_balance
from goalchain_multiagent.state import GraphState


def ops_node(state: GraphState) -> GraphState:
    objective = (state.get("objective") or "").strip()
    trace = list(state.get("route_trace") or [])
    trace.append("ops")

    settings = get_settings()
    
    # Retrieve Stripe balance for the financial layer
    stripe_bal = get_stripe_balance(settings)
    if "error" in stripe_bal:
        bal_str = f"Stripe Error: {stripe_bal['error']}"
    else:
        bal_details = []
        for key in ["available", "pending"]:
            if key in stripe_bal:
                for bal in stripe_bal[key]:
                    amount = bal["amount"] / 100.0
                    currency = bal["currency"].upper()
                    bal_details.append(f"{key.capitalize()}: ${amount:.2f} {currency}")
        bal_str = " | ".join(bal_details) if bal_details else "No balance info"

    if settings.goalchain_ma_ops_live:
        body = collect_ops_snapshot(objective, settings)
        body += f"\n\n## Financial Balance (Stripe)\n- {bal_str}"
        title = "Ops snapshot (live)"
        msg = f"Ops live snapshot collected. Stripe balance: {bal_str}."
    else:
        body = (
            f"Objective: {objective}\n\n"
            "Checklist:\n"
            "- [ ] `systemctl --user is-active oa-worker.service fcc-server.service`\n"
            "- [ ] `gh issue list --label status:ready --limit 10`\n"
            "- [ ] Open draft PRs from FCC (`OA draft`)\n\n"
            f"## Financial Balance (Stripe Mock)\n- {bal_str}"
        )
        title = "Ops snapshot (stub)"
        msg = f"Ops checklist appended. Stripe balance: {bal_str}."


    # Push elegant slack notification for our internal logs pipeline
    if settings.goalchain_ma_slack_webhook.strip():
        try:
            notify_agent_step_slack(
                agent_name="ops",
                objective=objective,
                content=msg,
                meta={
                    "Active Queue": "FCC/OpenCode",
                    "Services Status": "systemctl live",
                },
                settings=settings,
            )
        except Exception:  # noqa: BLE001 — avoid crashing loop if slack fails
            pass

    artifacts = list(state.get("artifacts") or [])
    artifacts.append(
        {
            "type": "ops_checklist",
            "title": title,
            "body": body[:12000],
            "meta": {"slack_channel": "#goalchain-dev", "live": settings.goalchain_ma_ops_live},
        }
    )

    return {
        "route_trace": trace,
        "artifacts": artifacts,
        "messages": (state.get("messages") or []) + [{"role": "ops", "content": msg}],
        "next_agent": "ceo",
    }

