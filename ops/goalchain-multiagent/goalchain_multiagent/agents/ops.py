from __future__ import annotations

from goalchain_multiagent.config import get_settings
from goalchain_multiagent.ops_live import collect_ops_snapshot
from goalchain_multiagent.slack_api import notify_agent_step_slack
from goalchain_multiagent.state import GraphState


def ops_node(state: GraphState) -> GraphState:
    objective = (state.get("objective") or "").strip()
    trace = list(state.get("route_trace") or [])
    trace.append("ops")

    settings = get_settings()
    if settings.goalchain_ma_ops_live:
        body = collect_ops_snapshot(objective, settings)
        title = "Ops snapshot (live)"
        msg = "Ops live snapshot collected (gh + systemctl)."
    else:
        body = (
            f"Objective: {objective}\n\n"
            "Checklist:\n"
            "- [ ] `systemctl --user is-active oa-worker.service fcc-server.service`\n"
            "- [ ] `gh issue list --label status:ready --limit 10`\n"
            "- [ ] Open draft PRs from FCC (`OA draft`)\n"
        )
        title = "Ops snapshot (stub)"
        msg = "Ops checklist appended (stub)."

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

