#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import shlex
import re
import time
from pathlib import Path
from datetime import datetime, timedelta

# Base Directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))
from config import ACCOUNTS

RUNS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"

def ssh_run(cmd_string: str) -> str:
    """Run command locally on VPS or via SSH from Windows"""
    is_local = (os.name != "nt")
    if is_local:
        res = subprocess.run(cmd_string, shell=True, capture_output=True, encoding="utf-8", check=True)
        return res.stdout.strip()
    else:
        # For local testing from Windows
        VPS_HOST = "ubuntu@89.168.20.135"
        ssh_cmd = ["ssh", "-o", "BatchMode=yes", VPS_HOST, cmd_string]
        res = subprocess.run(ssh_cmd, capture_output=True, encoding="utf-8", check=True)
        return res.stdout.strip()

def get_research_prompt(account_name: str, niche: str, count: int = 5) -> str:
    if account_name == "GoalChainSol":
        focus = (
            "Enfócate en la Copa del Mundo de fútbol, la historia del fútbol (anécdotas bizarras, "
            "historias poco conocidas de jugadores, partidos legendarios como el Maracanazo, Uruguay 1930, "
            "o psicología de apuestas deportivas, promesas absurdas de fanáticos y la mala cabeza de apostar con el corazón). "
            "Conecta la moraleja de cada historia con la disciplina, control de hábitos y apuestas contra uno mismo "
            "de GoalChain en Solana (bóvedas bloqueadas inteligente y on-chain)."
        )
    else: # NicoPezDorado
        focus = (
            "Enfócate en productividad extrema, sesgos cognitivos en el desarrollo de software (Build in Public), "
            "filosofía estoica aplicada a la programación, hábitos de enfoque y cómo un desarrollador / creador "
            "puede evitar postergar y stakear su palabra contra sí mismo."
        )

    return f"""
    Eres Hermes, el estratega de marketing y creador de contenido estrella de GoalChain.
    Tu tarea hoy es realizar un estudio de mercado y análisis de tendencias para planificar los próximos {count} videos cortos (9:16) para la cuenta "{account_name}" en el nicho: "{niche}".
    
    Instrucciones específicas de contenido:
    {focus}
    
    Para cada uno de los {count} videos planificados, usa la estructura de guion e copy: **Hook -> Context -> Mechanism -> Twist**.
    - Hook: Un gancho inicial en el segundo 1 de alto impacto visual y textual.
    - Context: El dato histórico, bizarro o psicológico que engancha al lector.
    - Mechanism: El puente lógico y la analogía con la disciplina de GoalChain en Solana.
    - Twist: Cierre irónico, divertido y llamado a la acción.
    
    Genera {count} ideas completas. Devuelve tu respuesta STRICTLY como un array JSON válido con la siguiente estructura (sin texto explicativo adicional fuera del bloque de código JSON):
    [
      {{
        "topic": "Título corto y adictivo en español",
        "narrative_angle": "Explicación del ángulo y por qué genera retención",
        "post_text": "Texto completo del copy en español con emojis, párrafos cortos y hashtags",
        "image_prompt": "Prompt en inglés altamente descriptivo, estilo 3D render cinematográfico o anime premium sin caras ni texto, para generar la primera escena en grok-imagine-image-quality",
        "video_prompt": "Prompt de animación en inglés describiendo movimientos sutiles y efectos de cámara en grok-imagine-video"
      }},
      ...
    ]
    """

def research_and_queue():
    print(f"[{datetime.now()}] Iniciando investigación de tendencias de Hermes...")
    
    new_planned_runs = []
    
    # 1. Generate for each account
    for account_name, details in ACCOUNTS.items():
        print(f"Investigando tendencias para {account_name}...")
        prompt = get_research_prompt(account_name, details["niche"], count=5)
        
        cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(prompt)}"
        try:
            raw = ssh_run(cmd)
            json_match = re.search(r"\[\s*\{.*\}\s*\]", raw, re.DOTALL)
            if not json_match:
                print(f"⚠️ No se pudo extraer array JSON de Grok para {account_name}. Intento alternativo buscando llaves...")
                json_match = re.search(r"\[.*\]", raw, re.DOTALL)
                
            if not json_match:
                raise RuntimeError(f"Grok no devolvió JSON válido: {raw[:300]}...")
                
            ideas = json.loads(json_match.group(0).strip())
            print(f"✅ Generadas {len(ideas)} ideas planificadas para {account_name}")
            
            # Map ideas to planned runs
            for idx, idea in enumerate(ideas):
                ts = int(time.time()) + (idx * 60) # Unique timestamps
                plan_id = f"run_{ts}_{account_name.lower()}_planned"
                
                planned_run = {
                    "id": plan_id,
                    "timestamp": (datetime.utcnow() + timedelta(minutes=idx)).isoformat() + "Z",
                    "account_name": account_name,
                    "topic": idea.get("topic", "Tema de Tendencia"),
                    "narrative_angle": idea.get("narrative_angle", ""),
                    "status": "planned",
                    "image_url": "",
                    "video_url": "",
                    "post_text": idea.get("post_text", ""),
                    "image_prompt": idea.get("image_prompt", ""),
                    "video_prompt": idea.get("video_prompt", ""),
                    "comments": []
                }
                new_planned_runs.append(planned_run)
                
        except Exception as e:
            print(f"❌ Error investigando {account_name}: {e}")
            
    if not new_planned_runs:
        print("No se generaron nuevos planes. Saliendo.")
        return

    # 2. Update runs.json
    try:
        runs = []
        if RUNS_FILE.exists():
            with open(RUNS_FILE, "r", encoding="utf-8") as f:
                runs = json.load(f)
                
        # Filter out existing planned runs if they exist to prevent overloading, or just prepend new ones
        # We can keep them all, but let's prepend them so they are the newest planned runs
        runs = new_planned_runs + runs
        
        RUNS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(RUNS_FILE, "w", encoding="utf-8") as f:
            json.dump(runs, f, indent=2)
            
        print(f"📦 ¡Se agregaron {len(new_planned_runs)} nuevos videos planificados a runs.json!")
    except Exception as e:
        print(f"❌ Error guardando planes en runs.json: {e}")

if __name__ == "__main__":
    research_and_queue()
