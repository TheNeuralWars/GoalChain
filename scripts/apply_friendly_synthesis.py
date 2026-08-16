import os

llm_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/llm.py"

print("Reading llm.py...")
with open(llm_path, "r", encoding="utf-8") as f:
    llm_content = f.read()

# Modify ceo_synthesize_llm to be friendly and conversational
old_synthesize = """def ceo_synthesize_llm(state: GraphState, settings: Settings | None = None) -> str:
    objective = (state.get("objective") or "").strip()
    trace = " → ".join(state.get("route_trace") or [])
    artifacts = state.get("artifacts") or []
    messages = state.get("messages") or []

    art_text = "\\n\\n".join(
        f"### {a.get('title') or a.get('type')}\\n{(a.get('body') or '')[:2000]}"
        for a in artifacts[:5]
    )
    msg_text = "\\n".join(f"- {m.get('role')}: {m.get('content')}" for m in messages[-8:])

    prompt = f\"\"\"You are GoalChain-CEO reporting to Nico via Hermes (Discord/WhatsApp).
Write a concise executive summary in Spanish (unless objective is clearly English-only).
Include: what was analyzed, route taken, key artifacts, and ONE clear next human step.
Do not invent repo writes or merges — code goes through FCC dispatch opencode.
IMPORTANT: Use ONLY facts present in Artifacts below (gh/systemctl output). If data is missing, say so — do not invent issue counts or percentages.

Objective: {objective}
Route: {trace}

Agent messages:
{msg_text}

Artifacts:
{art_text}

Reply with JSON only:
{{"summary": "markdown-friendly plain text, max 12 lines"}}
\"\"\"
    data = _invoke_json(prompt, settings)
    summary = str(data.get("summary", "")).strip()
    if not summary:
        raise ValueError("empty summary from LLM")
    return summary"""

new_synthesize = """def ceo_synthesize_llm(state: GraphState, settings: Settings | None = None) -> str:
    objective = (state.get("objective") or "").strip()
    trace = " → ".join(state.get("route_trace") or [])
    artifacts = state.get("artifacts") or []
    messages = state.get("messages") or []

    art_text = "\\n\\n".join(
        f"### {a.get('title') or a.get('type')}\\n{(a.get('body') or '')[:2000]}"
        for a in artifacts[:5]
    )
    msg_text = "\\n".join(f"- {m.get('role')}: {m.get('content')}" for m in messages[-8:])

    prompt = f\"\"\"You are GoalChain-CEO reporting to Nico via Hermes. Nico is chatting with you.
Write a natural, friendly, and concise response in Spanish based ONLY on the facts present in the Artifacts below.
Do NOT use rigid template headers or bullet points like "Analizado:", "Ruta:", "Artefactos clave:", or "Siguiente paso humano:".
Just answer Nico's question or objective directly and conversationally like a helpful teammate.
If the data requested is missing in the artifacts, say so — do not invent facts.

Objective: {objective}
Route: {trace}

Agent messages:
{msg_text}

Artifacts:
{art_text}

Reply with JSON only:
{{"summary": "friendly conversational markdown plain text in Spanish, max 12 lines"}}
\"\"\"
    data = _invoke_json(prompt, settings)
    summary = str(data.get("summary", "")).strip()
    if not summary:
        raise ValueError("empty summary from LLM")
    return summary"""

if old_synthesize in llm_content:
    llm_content = llm_content.replace(old_synthesize, new_synthesize)
    print("  Successfully updated ceo_synthesize_llm in memory.")
else:
    # Try with unix line endings
    old_synthesize_unix = old_synthesize.replace("\r\n", "\n")
    new_synthesize_unix = new_synthesize.replace("\r\n", "\n")
    if old_synthesize_unix in llm_content:
        llm_content = llm_content.replace(old_synthesize_unix, new_synthesize_unix)
        print("  Successfully updated ceo_synthesize_llm (unix) in memory.")
    else:
        print("  WARNING: Could not find old_synthesize in llm.py!")

with open(llm_path, "w", encoding="utf-8") as f:
    f.write(llm_content)

print("Patching complete.")
