import os

llm_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/llm.py"

print("Reading llm.py...")
with open(llm_path, "r", encoding="utf-8") as f:
    llm_content = f.read()

# Let's update ceo_delegate_llm to route questions about issues/experiments to ops
old_delegate = """def ceo_delegate_llm(state: GraphState, settings: Settings | None = None) -> AgentName | Literal["chat"]:
    objective = (state.get("objective") or "").strip()
    prompt = f\"\"\"You are GoalChain-CEO, orchestrator for a Solana gaming / dev-platform company.
Pick exactly ONE worker or action for this objective. Reply with JSON only.

Workers/Actions:
- dev: code, Solana/Anchor, webapp, API, GitHub issues (no direct repo writes)
- growth: partnerships, monetization, CRM, marketing
- ops: VPS, Hermes, FCC queue, deploy health, Anytype, Slack alerts
- chat: general greetings, casual chitchat, friendly messages, smalltalk, or conversational responses (e.g. "hola", "quien eres", "como va", "contestame como un ser humano", etc.)

Objective: {objective}

JSON schema:
{{"agent": "dev"|"growth"|"ops"|"chat", "reason": "one short sentence"}}
\"\"\""""

new_delegate = """def ceo_delegate_llm(state: GraphState, settings: Settings | None = None) -> AgentName | Literal["chat"]:
    objective = (state.get("objective") or "").strip()
    prompt = f\"\"\"You are GoalChain-CEO, orchestrator for a Solana gaming / dev-platform company.
Pick exactly ONE worker or action for this objective. Reply with JSON only.

Workers/Actions:
- dev: implementing new code, writing Solana/Anchor contracts, modifying webapp/API, creating new issues, bugfixing (actual development changes).
- growth: partnerships, monetization, CRM, marketing, stripe business rules.
- ops: checking service status, deployment health, listing existing issues / backlog / experiments / tasks on the table, checking financial balance or Stripe balance (information queries about VPS/GitHub/services status).
- chat: general greetings, casual chitchat, simple conversational questions, explanations, or any question from Nico that just wants to talk or discuss things (e.g. "hola", "¿cómo estás?", "¿quién eres?").

Objective: {objective}

JSON schema:
{{"agent": "dev"|"growth"|"ops"|"chat", "reason": "one short sentence"}}
\"\"\""""

if old_delegate in llm_content:
    llm_content = llm_content.replace(old_delegate, new_delegate)
    print("  Successfully updated ceo_delegate_llm.")
else:
    old_delegate_unix = old_delegate.replace("\r\n", "\n")
    new_delegate_unix = new_delegate.replace("\r\n", "\n")
    if old_delegate_unix in llm_content:
        llm_content = llm_content.replace(old_delegate_unix, new_delegate_unix)
        print("  Successfully updated ceo_delegate_llm (unix).")
    else:
        print("  WARNING: Could not find old_delegate pattern!")

with open(llm_path, "w", encoding="utf-8") as f:
    f.write(llm_content)

print("Patching complete.")
