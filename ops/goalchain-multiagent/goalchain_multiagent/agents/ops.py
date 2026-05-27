from __future__ import annotations

from goalchain_multiagent.state import GraphState


def ops_node(state: GraphState) -> GraphState:
    objective = (state.get("objective") or "").strip()
    trace = list(state.get("route_trace") or [])
    trace.append("ops")

    artifacts = list(state.get("artifacts") or [])
    artifacts.append(
        {
            "type": "ops_checklist",
            "title": "Ops snapshot (stub)",
            "body": (
                f"Objective: {objective}\n\n"
                "Checklist:\n"
                "- [ ] `systemctl --user is-active oa-worker.service fcc-server.service`\n"
                "- [ ] `gh issue list --label status:ready --limit 10`\n"
                "- [ ] Open draft PRs from FCC (`OA draft`)\n"
                "- [ ] Hermes OAuth timer: `goalchain-credential-maintain.timer`\n"
                "- [ ] Anytype deadlines in 48h window (`scripts/anytype_sync.py`)\n"
            ),
            "meta": {"slack_channel": "#goalchain-dev"},
        }
    )

    return {
        "route_trace": trace,
        "artifacts": artifacts,
        "messages": (state.get("messages") or [])
        + [{"role": "ops", "content": "Ops checklist appended (Slack stub)."}],
        "next_agent": "ceo",
    }
