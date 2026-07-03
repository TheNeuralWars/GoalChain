import os
import json
import urllib.request
import urllib.error
from config import GEMINI_API_KEY, XAI_API_KEY, NVIDIA_API_KEY, ACCOUNTS

def call_grok(prompt: str, json_mode: bool = False) -> str:
    """Call x.ai Grok API"""
    if not XAI_API_KEY:
        raise ValueError("XAI_API_KEY no configurada.")
    url = "https://api.x.ai/v1/chat/completions"
    payload = {
        "model": "grok-4.3",
        "messages": [{"role": "user", "content": prompt}]
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {XAI_API_KEY}"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)
            return res_json["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"Grok API Error {e.code}: {error_body}")
        raise RuntimeError(f"Grok API Error {e.code}: {error_body}")

def call_nvidia(prompt: str, json_mode: bool = False) -> str:
    """Call Nvidia NIM API (Llama 3.1 70b)"""
    if not NVIDIA_API_KEY:
        raise ValueError("NVIDIA_API_KEY no configurada.")
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    payload = {
        "model": "meta/llama-3.1-70b-instruct",
        "messages": [{"role": "user", "content": prompt}]
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NVIDIA_API_KEY}"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            res_data = response.read().decode("utf-8")
            res_json = json.loads(res_data)
            return res_json["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"Nvidia API Error {e.code}: {error_body}")
        raise RuntimeError(f"Nvidia API Error {e.code}: {error_body}")

def call_gemini(prompt: str, json_mode: bool = False) -> str:
    """Call Gemini API"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY no configurada.")
    model = "gemini-1.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    if json_mode:
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        res_data = response.read().decode("utf-8")
        res_json = json.loads(res_data)
        return res_json["candidates"][0]["content"]["parts"][0]["text"]

def call_llm(prompt: str, json_mode: bool = False, skip_grok: bool = False) -> str:
    """Fallback orchestrator to call LLM using available API keys (Grok, Nvidia, Gemini)"""
    errors = []
    
    # 1. Try Grok
    if XAI_API_KEY and not skip_grok:
        try:
            return call_grok(prompt, json_mode)
        except Exception as e:
            errors.append(f"Grok Error: {str(e)}")
            
    # 2. Try Nvidia Llama
    if NVIDIA_API_KEY:
        try:
            return call_nvidia(prompt, json_mode)
        except Exception as e:
            errors.append(f"Nvidia Llama Error: {str(e)}")
            
    # 3. Try Gemini
    if GEMINI_API_KEY:
        try:
            return call_gemini(prompt, json_mode)
        except Exception as e:
            errors.append(f"Gemini Error: {str(e)}")
            
    raise RuntimeError(f"Todos los proveedores de LLM fallaron. Detalles de errores:\n" + "\n".join(errors))

def generate_script(topic: str, account_name: str) -> dict:
    """Generate a high-retention script with the structure: Hook -> Context -> Mechanism -> Twist"""
    account_info = ACCOUNTS.get(account_name)
    if not account_info:
        raise ValueError(f"Cuenta no encontrada: {account_name}")
        
    niche_info = account_info["niche"]
    
    prompt = f"""
    Eres un guionista experto en videos cortos virales de TikTok, Instagram Reels y YouTube Shorts.
    Tu objetivo es escribir un guion de alto impacto para la cuenta "{account_name}" cuyo nicho es: "{niche_info}".
    El tema o idea central es: "{topic}".

    Debes estructurar el guion en 4 secciones claras siguiendo esta estructura de retención:
    1. Hook (Gancho): Un primer segundo extremadamente magnético. Algo contraintuitivo, intrigante o impactante.
    2. Context (Contexto): Presenta datos curiosos, oscuros, hechos reales o un problema intrigante relacionado con el tema.
    3. Mechanism (Mecanismo): La solución, la explicación o la lección clave. Cómo funciona esto en la práctica.
    4. Twist (Giro/Cierre): Un giro final sorprendente o una llamada a la acción (CTA) directa y provocativa que invite a comentar o seguir.

    Escribe el guion en ESPAÑOL. Mantén el tono directo, dinámico, usando oraciones cortas (ideal para subtítulos dinámicos de ritmo rápido).
    Evita clichés de IA comunes como "alguna vez te has preguntado", "en este video te enseño", o saludos.
    
    Debes devolver el resultado en formato JSON (asegúrate de que sea JSON válido) con la siguiente estructura:
    {{
        "hook": "Texto del gancho",
        "context": "Texto del contexto",
        "mechanism": "Texto del mecanismo",
        "twist": "Texto del giro o llamado a la acción"
    }}
    """
    
    print(f"[{account_name}] Generando guion inicial para: '{topic}'...")
    raw_response = call_llm(prompt, json_mode=True)
    
    # Strip markdown block quotes if returned by the LLM
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    return json.loads(cleaned)

def score_and_refine_script(script: dict, topic: str, account_name: str) -> dict:
    """Line Scoring Agent that rates each part of the script and refines it if it scores below 8/10"""
    prompt = f"""
    Eres un Director Creativo experto en retención de videos cortos.
    Analiza y puntúa cada sección de este guion propuesto para el tema: "{topic}" (Cuenta: "{account_name}").
    
    Guion a evaluar:
    - HOOK: "{script.get('hook')}"
    - CONTEXT: "{script.get('context')}"
    - MECHANISM: "{script.get('mechanism')}"
    - TWIST: "{script.get('twist')}"
    
    Evalúa cada sección en una escala de 1 a 10 en base a:
    1. Hook: ¿Es irresistible en el primer segundo? ¿Provoca curiosidad inmediata?
    2. Context: ¿Es interesante y aporta valor/hechos poco conocidos en vez de ser genérico?
    3. Mechanism: ¿Es fácil de entender y práctico?
    4. Twist: ¿Tiene un cierre potente o interactivo?

    Debes responder en formato JSON indicando la puntuación de cada sección (un número del 1 al 10), una crítica breve de por qué le das ese puntaje, y la versión optimizada de esa sección si su puntuación es menor a 8.
    
    Estructura de respuesta JSON esperada:
    {{
        "evaluations": {{
            "hook": {{
                "score": 9,
                "feedback": "...",
                "suggested_text": null
            }},
            "context": {{
                "score": 7,
                "feedback": "Es algo predecible.",
                "suggested_text": "Texto optimizado con un dato más impactante..."
            }},
            "mechanism": {{
                "score": 8,
                "feedback": "...",
                "suggested_text": null
            }},
            "twist": {{
                "score": 6,
                "feedback": "CTA débil.",
                "suggested_text": "Texto optimizado de cierre..."
            }}
        }}
    }}
    """
    
    print(f"[{account_name}] Evaluando calidad del guion con el Line Scoring Agent...")
    raw_eval = call_llm(prompt, json_mode=True)
    
    cleaned = raw_eval.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    evaluation = json.loads(cleaned)
    refined_script = script.copy()
    changes_made = False
    
    for section, data in evaluation.get("evaluations", {}).items():
        score = data.get("score", 10)
        feedback = data.get("feedback", "")
        print(f"  - Sección {section.upper()}: Puntaje {score}/10. Feedback: {feedback}")
        if score < 8 and data.get("suggested_text"):
            refined_script[section] = data["suggested_text"]
            changes_made = True
            print(f"    --> Sección {section.upper()} optimizada por baja calificación.")
            
    if changes_made:
        print(f"[{account_name}] Guion optimizado con éxito.")
    else:
        print(f"[{account_name}] El guion cumple con todos los estándares de calidad (8+/10).")
        
    return refined_script

def build_full_script(topic: str, account_name: str) -> dict:
    """Generate and refine script using the complete agent pipeline"""
    initial_script = generate_script(topic, account_name)
    refined_script = score_and_refine_script(initial_script, topic, account_name)
    return refined_script

if __name__ == "__main__":
    # Test generation for both accounts
    test_personal = build_full_script("Por qué madrugar a las 4 AM no te hace productivo", "NicoPezDorado")
    print("\nGuion final para NicoPezDorado:")
    print(json.dumps(test_personal, indent=2, ensure_ascii=False))
    
    print("\n" + "="*50 + "\n")
    
    test_project = build_full_script("Cómo obligar a tu amigo a programar usando Solana", "GoalChainSol")
    print("\nGuion final para GoalChainSol:")
    print(json.dumps(test_project, indent=2, ensure_ascii=False))
