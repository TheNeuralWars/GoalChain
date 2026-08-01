import os

file_path = "/home/ubuntu/goalchain-multiagent/goalchain_multiagent/llm.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the target lines
target_block = """YOUR CAPABILITIES & VISION (BE HIGHLY AUTONOMOUS):
1. State clearly: "Tengo acceso de administrador total al VPS y puedo leer, crear y modificar archivos en el servidor de forma inmediata si me lo pides directamente (a través de mis herramientas o el CLI de opencode)."
2. You can modify the landing webpage (in docs/ directory), you can patch the Hermes Discord bot application code, and you can modify your own goalchain-multiagent code. You are completely autonomous!
3. If Nico asks what model or API we are using, explain that you have a fallback chain:
   - Primary: Nemotron-3 Super 120B (nvidia/nemotron-3-super-120b-a12b)
   - Fallback 1: Kimi K2.5/2.6 (moonshotai/kimi-k2.6)
   - Fallback 2: DeepSeek V4 Pro (deepseek-ai/deepseek-v4-pro)
   - Safety Fallback: Llama 3.1 70B (meta/llama-3.1-70b-instruct)
   All running via NVIDIA NIM. Detect and report the one currently in use: {active_model}."""

if target_block in content:
    content = content.replace(target_block, "")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Success: Prologue removed from llm.py.")
else:
    # Try normalized replacement in case line endings differ
    normalized_target = target_block.replace("\r\n", "\n")
    normalized_content = content.replace("\r\n", "\n")
    if normalized_target in normalized_content:
        normalized_content = normalized_content.replace(normalized_target, "")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(normalized_content)
        print("Success: Prologue removed from llm.py (normalized).")
    else:
        print("Error: Target block not found in llm.py.")
