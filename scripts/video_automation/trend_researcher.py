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

# World Cup 2026 player stories for GoalChainSol content
WORLD_CUP_2026_PLAYERS = """
CONTEXTO DEL MUNDIAL 2026 — usa historias de estos jugadores/momentos REALES para construir narrativas:
- Lionel Messi (Argentina): Posiblemente su último mundial. ¿Los que apostaron CONTRA él en 2014 o A FAVOR en 2022?
- Kylian Mbappé (Francia): Llegó al Real Madrid, toda la presión del mundo encima. ¿Apostaste en sus expectativas vs su realidad?
- Cristiano Ronaldo (Portugal/Al-Nassr): Su última oportunidad histórica. "Si CR7 gana el mundial, dejo de beber" — promesas de fanáticos.
- Erling Haaland (Noruega): Noruega NO clasificó al Mundial 2026. El mejor goleador del mundo. ¿Cuántos apostaron que clasificarían con él?
- Pedri & Lamine Yamal (España): Yamal tiene 17 años. El jugador más joven en brillar. ¿Apostar en un adolescente?
- Vinicius Jr. (Brasil): Favorito perpetuo de Brasil. Brasil perdió en cuartos en Qatar 2022. El síndrome del favoritismo.
- Jude Bellingham (Inglaterra): "Football's coming home" — meme cultural de apostadores ingleses que siempre pierden.
- Julián Álvarez (Argentina): El héroe silencioso de Qatar 2022 que NADIE apostó que brillaría sobre Lautaro.
- Cody Gakpo (Países Bajos): Llegó de la nada en Qatar 2022. Apostar en los outsiders desconocidos.
- El efecto VAR: Goles anulados por centímetros que destruyeron apuestas de millones de personas.
- La historia de Marruecos 2022: Primer equipo africano en semis. Apostadores que perdieron vs los que acertaron.
- Luis Suárez (Uruguay, retirado): Sus manos en 2010 que costaron el sueño africano. Drama puro.

CADA VIDEO debe centrarse en UNO de estos jugadores/momentos. No repitas el mismo jugador en varios videos del mismo batch.
Conecta la historia con la psicología de apostar con el corazón vs. la razón fría.
GoalChain = convierte tus apuestas emocionales en contratos inteligentes en Solana.
"""

TOPICS_TO_AVOID = [
    "maracanazo", "maracana", "1950", "estadio fallback", "sala de mando"
]

def get_research_prompt(account_name: str, niche: str, count: int = 5, recent_topics: list = None) -> str:
    recent_topics = recent_topics or []
    avoid_str = ""
    if recent_topics:
        avoid_str = f"\n    EVITA ESTOS TEMAS (ya fueron cubiertos recientemente): {', '.join(recent_topics[:8])}\n"
    
    if account_name in ("GoalChainSol", "NicoPezDorado"):
        focus = (
            f"Enfócate EXCLUSIVAMENTE en la Copa del Mundo FIFA 2026 y los jugadores que están participando. "
            f"Cada video debe contar la historia de UN jugador específico del Mundial 2026 y conectarlo con "
            f"la psicología de apostar con el corazón, promesas absurdas de fanáticos, y la disciplina de GoalChain.\n"
            f"\n{WORLD_CUP_2026_PLAYERS}"
        )

    return f"""
    Eres Hermes, el estratega de marketing y creador de contenido estrella de GoalChain.
    Tu tarea hoy es realizar un estudio de mercado y análisis de tendencias para planificar los próximos {count} videos cortos (9:16) para la cuenta "{account_name}" en el nicho: "{niche}".
    
    Instrucciones específicas de contenido:
    {focus}
    {avoid_str}
    IMPORTANTE: Cada uno de los {count} videos debe tratar un tema/jugador DIFERENTE entre sí. Máxima variedad.
    
    Para cada video, usa la estructura de guion **Hook -> Context -> Mechanism -> Twist**:
    - Hook: Un gancho inicial en los primeros 3 segundos de alto impacto, mencionando al jugador o situación por su nombre.
    - Context: El dato histórico, la apuesta fallida o la promesa absurda del fanático conectada a ese jugador.
    - Mechanism: El puente lógico con GoalChain en Solana — ¿cómo habría salvado la situación?
    - Twist: Cierre irónico, divertido y llamado a la acción.
    
    Para el image_prompt: genera escenas ÚNICAS y VARIADAS por video. No uses siempre estadios genéricos.
    Varía entre: escenas íntimas de vestuario, calles de fans celebrando, pantallas de cripto con estadísticas,
    retratos heroicos tipo póster animado, split-screen de fanáticos antes/después del partido.
    
    Genera {count} ideas completas. Devuelve STRICT JSON válido (sin markdown, sin texto extra):
    [
      {{
        "topic": "Título corto y adictivo en español (menciona al jugador si aplica)",
        "narrative_angle": "Por qué este ángulo genera retención extrema en los primeros 3 segundos",
        "post_text": "Texto completo del copy en español con emojis, párrafos cortos y 3-5 hashtags relevantes",
        "image_prompt": "Prompt en inglés altamente descriptivo, escena ÚNICA Y ESPECÍFICA para este video, estilo 3D render cinematográfico o anime premium, sin caras fotorrealistas ni texto en la imagen",
        "video_prompt": "Prompt de animación en inglés describiendo movimientos sutiles y efectos de cámara para dar vida a esa escena específica"
      }}
    ]
    """

def get_recent_topics(account_name: str, limit: int = 10) -> list:
    """Read recent topics from runs.json to avoid repetition."""
    try:
        if RUNS_FILE.exists():
            with open(RUNS_FILE, 'r', encoding='utf-8') as f:
                runs = json.load(f)
            topics = [
                r.get('topic', '') for r in runs
                if r.get('account_name') == account_name
                and r.get('status') in ('published', 'planned', 'generating')
                and r.get('topic')
            ]
            # Also add known avoid list
            topics += TOPICS_TO_AVOID
            return topics[:limit]
    except Exception:
        pass
    return TOPICS_TO_AVOID

def normalize_prompts(data: dict) -> dict:
    if not isinstance(data, dict):
        return {}
    
    def safe_get(keys, default=""):
        for k in keys:
            if k in data and data[k]:
                return str(data[k]).strip()
            for dk in data.keys():
                if dk.lower() == k.lower() and data[dk]:
                    return str(data[dk]).strip()
        return default
        
    return {
        "topic": safe_get(["topic", "title", "tema", "titulo"]),
        "narrative_angle": safe_get(["narrative_angle", "narrativeAngle", "narrative-angle", "angle", "angulo"]),
        "post_text": safe_get(["post_text", "postText", "post-text", "copy", "caption", "text", "post_copy", "texto"]),
        "image_prompt": safe_get(["image_prompt", "imagePrompt", "image-prompt", "image", "prompt_image", "prompt-image"]),
        "video_prompt": safe_get(["video_prompt", "videoPrompt", "video-prompt", "video", "prompt_video", "prompt-video", "animation_prompt", "animation-prompt"]),
    }

def research_and_queue():
    print(f"[{datetime.now()}] Iniciando investigación de tendencias de Hermes...")
    
    new_planned_runs = []
    
    # 1. Generate for each account
    for account_name, details in ACCOUNTS.items():
        print(f"Investigando tendencias para {account_name}...")
        recent_topics = get_recent_topics(account_name)
        print(f"  Evitando temas recientes: {recent_topics[:5]}")
        prompt = get_research_prompt(account_name, details["niche"], count=5, recent_topics=recent_topics)
        
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
                
                norm_idea = normalize_prompts(idea)
                
                planned_run = {
                    "id": plan_id,
                    "timestamp": (datetime.utcnow() + timedelta(minutes=idx)).isoformat() + "Z",
                    "account_name": account_name,
                    "topic": norm_idea["topic"] or "Tema de Tendencia",
                    "narrative_angle": norm_idea["narrative_angle"],
                    "status": "planned",
                    "image_url": "",
                    "video_url": "",
                    "post_text": norm_idea["post_text"],
                    "image_prompt": norm_idea["image_prompt"],
                    "video_prompt": norm_idea["video_prompt"],
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
