import os
import re

llm_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/llm.py"
ceo_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/agents/ceo.py"

print("Reading llm.py...")
with open(llm_path, "r", encoding="utf-8") as f:
    llm_content = f.read()

# Replace ceo_chat_llm with the one that injects real-time ops snapshot context
new_chat_llm = """def ceo_chat_llm(state: GraphState, settings: Settings | None = None) -> str:
    objective = (state.get("objective") or "").strip()
    messages = state.get("messages") or []
    
    # Collect real-time VPS and repo status as background context
    from goalchain_multiagent.ops_live import collect_ops_snapshot
    ops_context = ""
    try:
        ops_context = collect_ops_snapshot(objective, settings)
    except Exception as e:
        ops_context = f"Error gathering ops context: {e}"

    # Format a brief context of the conversation
    history = ""
    if messages:
        history = "\\n".join(f"- {m.get('role', 'user')}: {m.get('content', '')}" for m in messages[-5:])

    prompt = f\"\"\"You are GoalChain-CEO (Hermes). You are talking directly to Nico in Spanish.
Answer Nico's question or chat with him in a friendly, concise, and natural human teammate style.
Do NOT use rigid template headers or bullet points like "Analizado:", "Ruta:", "Artefactos clave:".
Use the real-time VPS/repo status context below to answer any questions about experiments, issues, services, balance, or repository files.

Real-time VPS / Repo Status:
{ops_context}

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

# Replace in llm_content
pattern_chat = r"def ceo_chat_llm\(state: GraphState, settings: Settings \| None = None\) -> str:.*"
if re.search(pattern_chat, llm_content, re.DOTALL):
    llm_content = re.sub(pattern_chat, lambda m: new_chat_llm.strip() + "\n", llm_content, flags=re.DOTALL)
    print("  Successfully updated ceo_chat_llm in llm.py.")
else:
    print("  WARNING: Could not find ceo_chat_llm pattern in llm.py!")

with open(llm_path, "w", encoding="utf-8") as f:
    f.write(llm_content)


print("Reading ceo.py...")
with open(ceo_path, "r", encoding="utf-8") as f:
    ceo_content = f.read()

# Replace ceo_node to default to direct chat
new_ceo_node = """def ceo_node(state: GraphState) -> GraphState:
    hop = int(state.get("hop") or 0) + 1
    trace = list(state.get("route_trace") or [])
    trace.append("ceo")

    messages = list(state.get("messages") or [])
    if hop == 1:
        messages.append({"role": "user", "content": state.get("objective") or ""})

    if state.get("finished"):
        return {"hop": hop, "route_trace": trace, "next_agent": "finish", "messages": messages}

    max_hops = int(state.get("max_hops") or 6)
    if hop >= max_hops:
        summary = state.get("summary") or _default_summary(state)
        return {
            "hop": hop,
            "route_trace": trace,
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
            "messages": messages,
        }

    # Second CEO pass: synthesize and finish after a worker spoke.
    if len(trace) >= 2 and trace[-2] in ("dev", "growth", "ops"):
        summary = _synthesize_summary(state)
        return {
            "hop": hop,
            "route_trace": trace,
            "next_agent": "finish",
            "finished": True,
            "summary": summary,
            "messages": messages,
        }

    objective_lower = (state.get("objective") or "").lower()
    
    # Check for explicit delegation request
    explicit_delegation = any(
        kw in objective_lower for kw in ["delegar", "delegate", "dev_node", "ops_node", "growth_node", "agent:dev", "agent:ops", "agent:growth"]
    )

    settings = get_settings()

    if not explicit_delegation:
        # Default: direct conversation in chat mode
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

    delegate = _pick_delegate(state.get("objective") or "")
    msg = f"Delegating to {delegate}."
    if llm.llm_available(settings):
        try:
            delegate = llm.ceo_delegate_llm(state, settings)
            msg = f"LLM delegating to {delegate}."
        except Exception as exc:  # noqa: BLE001 — fall back to rules
            msg = f"LLM routing failed ({exc}); rule-based delegate to {delegate}."

    return {
        "hop": hop,
        "route_trace": trace,
        "next_agent": delegate,
        "messages": messages + [{"role": "ceo", "content": msg}],
    }"""

pattern_ceo = r"def ceo_node\(state: GraphState\) -> GraphState:.*"
if re.search(pattern_ceo, ceo_content, re.DOTALL):
    # We replace from def ceo_node to the end of the file or just replace the function.
    # Since there are helper functions after it, let's replace only ceo_node function.
    # Specifically, match up to def route_after_ceo(state: GraphState)
    pattern_ceo_func = r"def ceo_node\(state: GraphState\) -> GraphState:.*?def route_after_ceo"
    if re.search(pattern_ceo_func, ceo_content, re.DOTALL):
        ceo_content = re.sub(pattern_ceo_func, new_ceo_node + "\n\ndef route_after_ceo", ceo_content, flags=re.DOTALL)
        print("  Successfully replaced ceo_node function in ceo.py.")
    else:
        # fallback to replacing from def ceo_node to end of file if helper functions are absent/different
        ceo_content = re.sub(pattern_ceo, lambda m: new_ceo_node + "\n", ceo_content, flags=re.DOTALL)
        print("  Successfully replaced ceo_node to end of file in ceo.py.")
else:
    print("  WARNING: Could not find ceo_node pattern in ceo.py!")

with open(ceo_path, "w", encoding="utf-8") as f:
    f.write(ceo_content)

print("Patching complete.")
