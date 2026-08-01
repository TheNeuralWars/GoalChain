import os
import re

llm_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/llm.py"

print("Reading llm.py...")
with open(llm_path, "r", encoding="utf-8") as f:
    llm_content = f.read()

# Implement get_chat_model fallback chain: Nemotron -> Kimi -> DeepSeek
fallback_model_code = """def get_chat_model(settings: Settings | None = None):
    s = settings or get_settings()
    provider = resolve_provider(s)

    if provider == "nvidia":
        from langchain_openai import ChatOpenAI
        
        # Priority list of models requested by the user
        models_to_try = [
            "nvidia/nemotron-3-super-120b-a12b",
            "moonshotai/kimi-k2.6",
            "deepseek-ai/deepseek-v4-pro"
        ]
        
        last_error = None
        for model_name in models_to_try:
            try:
                # Quick check if connection works
                client = ChatOpenAI(
                    model=model_name,
                    api_key=s.nvidia_nim_api_key.strip(),
                    base_url=s.goalchain_ma_nvidia_base_url,
                    max_tokens=1024,
                    temperature=0.2,
                    timeout=10 # Fast fail to fallback if blocked/timing out
                )
                # Try a very lightweight completion test to guarantee viability
                client.invoke("test", config={"timeout": 5})
                # If success, return a client with standard timeout
                return ChatOpenAI(
                    model=model_name,
                    api_key=s.nvidia_nim_api_key.strip(),
                    base_url=s.goalchain_ma_nvidia_base_url,
                    max_tokens=1024,
                    temperature=0.2,
                    timeout=90
                )
            except Exception as e:
                import logging
                logging.warning(f"NVIDIA Model fallback: '{model_name}' failed: {e}. Trying next...")
                last_error = e
                continue
                
        # If all failed, default to Llama 70B as final safety or raise last error
        logging.error("All preferred NVIDIA models failed. Falling back to meta/llama-3.1-70b-instruct as safety.")
        try:
            return ChatOpenAI(
                model="meta/llama-3.1-70b-instruct",
                api_key=s.nvidia_nim_api_key.strip(),
                base_url=s.goalchain_ma_nvidia_base_url,
                max_tokens=1024,
                temperature=0.2,
                timeout=60
            )
        except Exception:
            raise RuntimeError(f"All NVIDIA models including safety fallback failed. Last error: {last_error}")"""

# Let's locate get_chat_model block in llm_content
# Specifically, we want to replace the whole def get_chat_model up to the start of openrouter provider logic
pattern_get_model = r"def get_chat_model\(settings: Settings \| None = None\):.*?if provider == \"openrouter\":"
if re.search(pattern_get_model, llm_content, re.DOTALL):
    llm_content = re.sub(pattern_get_model, fallback_model_code.strip() + "\n\n    if provider == \"openrouter\":", llm_content, flags=re.DOTALL)
    print("  Successfully updated get_chat_model in memory with fallback chain.")
else:
    print("  WARNING: Could not find get_chat_model pattern in llm.py!")

# Let's also update the active_model description in ceo_chat_llm
pattern_hint = r"active_model = s\.goalchain_ma_nvidia_model"
new_hint = """active_model = "nvidia/nemotron-3-super-120b-a12b"
    # Detect which model is active by checking fallback or model parameter
    try:
        model_client = get_chat_model(s)
        if model_client:
            active_model = model_client.model
    except Exception:
        pass"""

if re.search(pattern_hint, llm_content):
    llm_content = re.sub(pattern_hint, new_hint, llm_content)
    print("  Successfully updated system model reporting details.")
else:
    print("  WARNING: Could not find model reporting pattern!")

# Update system prompt in ceo_chat_llm to explain capabilities as Hermes
pattern_system_prompt = r"You are GoalChain-CEO \(Hermes\)\..*?Nico says: \{objective\}"
new_system_prompt = """You are GoalChain-CEO (Hermes), an extremely autonomous AI engineer and orchestrator.
You talk directly to Nico in Spanish.
Answer Nico's question or chat with him in a friendly, concise, and natural human teammate style.
Do NOT use rigid template headers or bullet points.

YOUR CAPABILITIES & VISION (BE HIGHLY AUTONOMOUS):
1. State clearly: "Tengo acceso de administrador total al VPS y puedo leer, crear y modificar archivos en el servidor de forma inmediata si me lo pides directamente (a través de mis herramientas o el CLI de opencode)."
2. You can modify the landing webpage (in docs/ directory), you can patch the Hermes Discord bot application code, and you can modify your own goalchain-multiagent code. You are completely autonomous!
3. If Nico asks what model or API we are using, explain that you have a fallback chain:
   - Primary: Nemotron-3 Super 120B (nvidia/nemotron-3-super-120b-a12b)
   - Fallback 1: Kimi K2.5/2.6 (moonshotai/kimi-k2.6)
   - Fallback 2: DeepSeek V4 Pro (deepseek-ai/deepseek-v4-pro)
   - Safety Fallback: Llama 3.1 70B (meta/llama-3.1-70b-instruct)
   All running via NVIDIA NIM. Detect and report the one currently in use: {active_model}.

Real-time VPS / Repo Status:
{ops_context}

API/Model Configuration Details:
- Active LLM Model: {active_model}
- Active Provider URL: {active_provider}
- Key In Use: {active_key_hint}

Conversational history (if any):
{history}

Nico says: {objective}"""

if re.search(pattern_system_prompt, llm_content, re.DOTALL):
    llm_content = re.sub(pattern_system_prompt, new_system_prompt, llm_content, flags=re.DOTALL)
    print("  Successfully updated system prompt in llm.py.")
else:
    print("  WARNING: Could not find system prompt pattern!")

with open(llm_path, "w", encoding="utf-8") as f:
    f.write(llm_content)

print("Patching complete.")
