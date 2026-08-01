import os

llm_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/llm.py"
ceo_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/agents/ceo.py"

print("Reading llm.py...")
with open(llm_path, "r", encoding="utf-8") as f:
    llm_content = f.read()

# Replace ceo_delegate_llm
old_delegate = """def ceo_delegate_llm(state: GraphState, settings: Settings | None = None) -> AgentName:
    objective = (state.get("objective") or "").strip()
    prompt = f\"\"\"You are GoalChain-CEO, orchestrator for a Solana gaming / dev-platform company.
Pick exactly ONE worker for this objective. Reply with JSON only.

Workers:
- dev: code, Solana/Anchor, webapp, API, GitHub issues (no direct repo writes)
- growth: partnerships, monetization, CRM, marketing
- ops: VPS, Hermes, FCC queue, deploy health, Anytype, Slack alerts

Objective: {objective}

JSON schema:
{{"agent": "dev"|"growth"|"ops", "reason": "one short sentence"}}
\"\"\"
    data = _invoke_json(prompt, settings)
    agent = str(data.get("agent", "ops")).lower().strip()
    if agent not in ("dev", "growth", "ops"):
        return "ops"
    return agent  # type: ignore[return-value]"""

new_delegate = """def ceo_delegate_llm(state: GraphState, settings: Settings | None = None) -> AgentName | Literal["chat"]:
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
\"\"\"
    data = _invoke_json(prompt, settings)
    agent = str(data.get("agent", "ops")).lower().strip()
    if agent not in ("dev", "growth", "ops", "chat"):
        return "ops"
    return agent  # type: ignore[return-value]


def ceo_chat_llm(state: GraphState, settings: Settings | None = None) -> str:
    objective = (state.get("objective") or "").strip()
    messages = state.get("messages") or []
    
    # Format a brief context of the conversation
    history = ""
    if messages:
        history = "\\n".join(f"- {m.get('role', 'user')}: {m.get('content', '')}" for m in messages[-5:])

    prompt = f\"\"\"You are GoalChain-CEO reporting to Nico via Hermes. Nico is chatting with you.
Respond to Nico in a natural, friendly, human-like way in Spanish.
Keep it casual and conversational. Do NOT use bullet points like "Analyzed:", "Route:", "Next human step:", etc.
Just chat with him like a helpful teammate.

Conversational history (if any):
{history}

Nico says: {objective}
\"\"\"
    model = get_chat_model(settings)
    if model is None:
        raise RuntimeError("No LLM configured")
    response = model.invoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        content = "".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in content
        )
    return str(content).strip()"""

if old_delegate in llm_content:
    llm_content = llm_content.replace(old_delegate, new_delegate)
    print("  Successfully updated ceo_delegate_llm in memory.")
else:
    # Try with unix line endings in case of mismatch
    old_delegate_unix = old_delegate.replace("\r\n", "\n")
    new_delegate_unix = new_delegate.replace("\r\n", "\n")
    if old_delegate_unix in llm_content:
        llm_content = llm_content.replace(old_delegate_unix, new_delegate_unix)
        print("  Successfully updated ceo_delegate_llm (unix) in memory.")
    else:
        print("  WARNING: Could not find old_delegate exact content in llm.py!")

with open(llm_path, "w", encoding="utf-8") as f:
    f.write(llm_content)

print("Reading ceo.py...")
with open(ceo_path, "r", encoding="utf-8") as f:
    ceo_content = f.read()

# In ceo.py we want to insert the chat handler right before:
#     return {
#         "hop": hop,
#         "route_trace": trace,
#         "next_agent": delegate,
#         "messages": messages + [{"role": "ceo", "content": msg}],
#     }

old_return_block = """    return {
        "hop": hop,
        "route_trace": trace,
        "next_agent": delegate,
        "messages": messages + [{"role": "ceo", "content": msg}],
    }"""

new_return_block = """    if delegate == "chat":
        summary = "Hola Nico!"
        if llm.llm_available(settings):
            try:
                summary = llm.ceo_chat_llm(state, settings)
            except Exception as exc:
                summary = f"Hola Nico! (Error: {exc})"
        return {
            "hop": hop,
            "route_trace": trace + ["chat"],
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
            "messages": messages + [{"role": "ceo", "content": summary}],
        }

    return {
        "hop": hop,
        "route_trace": trace,
        "next_agent": delegate,
        "messages": messages + [{"role": "ceo", "content": msg}],
    }"""

if old_return_block in ceo_content:
    ceo_content = ceo_content.replace(old_return_block, new_return_block)
    print("  Successfully updated return block in ceo.py.")
else:
    old_return_block_unix = old_return_block.replace("\r\n", "\n")
    new_return_block_unix = new_return_block.replace("\r\n", "\n")
    if old_return_block_unix in ceo_content:
        ceo_content = ceo_content.replace(old_return_block_unix, new_return_block_unix)
        print("  Successfully updated return block (unix) in ceo.py.")
    else:
        print("  WARNING: Could not find return block in ceo.py!")

with open(ceo_path, "w", encoding="utf-8") as f:
    f.write(ceo_content)

print("Patching complete.")
