import os
import sys
import json
import time
import urllib.request
import urllib.parse
import subprocess
import shlex
import re
import argparse
from pathlib import Path
from datetime import datetime

# Base Directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load configs
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))
from config import ACCOUNTS

# Marketing smarts (added 2026-06-24 by Hermes Manager — Bloque C).
# Each module is independently optional so a single missing import only
# disables one capability without taking down the whole run.
try:
    from ab_tester import pick_variants as pick_variants, get_prompt_injection as get_prompt_injection  # type: ignore
    from story_arc import assign_arc as assign_arc  # type: ignore
    from hashtag_researcher import choose as choose_hashtags  # type: ignore
    from quality_scorer import score_run as score_quality  # type: ignore
    import captions_burnin as captions_burnin_module  # type: ignore
    MARKETING_STACK_AVAILABLE = True
except ImportError as _me:
    pick_variants = None  # type: ignore
    get_prompt_injection = None  # type: ignore
    assign_arc = None  # type: ignore
    choose_hashtags = None  # type: ignore
    score_quality = None  # type: ignore
    captions_burnin_module = None  # type: ignore
    MARKETING_STACK_AVAILABLE = False
    print(f"[Aviso] módulos de marketing no disponibles: {_me}")

try:
    from schedule_optimizer import get_scheduled_at, CHANNEL_SERVICES
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    print("[Aviso] schedule_optimizer no disponible, usando addToQueue")

from script_generator import call_llm

# Buffer token required (loaded from .env via config OR schedule_optimizer).
try:
    from schedule_optimizer import BUFFER_TOKEN as _BUF_INDIRECT  # type: ignore
    BUFFER_TOKEN = _BUF_INDIRECT
except Exception:
    # Direct .env fallback if schedule_optimizer wasn't importable
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
    BUFFER_TOKEN = os.getenv("BUFFER_TOKEN")
    if not BUFFER_TOKEN:
        raise RuntimeError(
            "Missing BUFFER_TOKEN in .env. Add BUFFER_TOKEN=..."
        )

# --- Session-scoped image lock ---
# Bug: clear_cmd at line ~315 used to nuke every .jpg/.png in
# ~/.grok/sessions/ before each generation, which could clobber an
# in-flight generation from a parallel run. Now we drop a per-session
# marker immediately before clearing — and verify our own marker survives
# the find — so concurrent processes don't step on each other.
import uuid as _uuid
SESSION_LOCK_DIR = Path("/home/ubuntu/.grok/sessions") / ".hermes_locks"

# --- Cost guard (per-day generation budget from .env) ---
MAX_GROK_GENERATIONS_PER_DAY = int(os.getenv("MAX_GROK_GENERATIONS_PER_DAY", "40"))
COST_GUARD_FILE = BASE_DIR / "data" / "marketing_pipeline" / "cost_guard.json"

# Multi-channel routing per account
CHANNEL_IDS = {
    "NicoPezDorado": [
        "6a283a868f1d11f9b26b0226"   # TikTok (for NicoPezDorado/personal)
    ],
    "GoalChainSol": [
        "6a283a4d8f1d11f9b26b0068",  # YouTube Shorts (for GoalChainSol/project)
        "6a283a328f1d11f9b26aff82"   # Instagram (for GoalChainSol/project)
    ]
}

def ssh_run(cmd_string: str) -> str:
    """Run command locally on this host, or via SSH if running on Windows."""
    import platform
    if platform.system() == "Windows":
        # Run via SSH to the VPS
        ssh_cmd = [
            "ssh", "-o", "StrictHostKeyChecking=no", "-T", "-n",
            "ubuntu@89.168.20.135",
            cmd_string
        ]
        res = subprocess.run(ssh_cmd, capture_output=True, encoding="utf-8")
        if res.returncode != 0:
            raise RuntimeError(
                f"SSH Command failed with code {res.returncode}.\n"
                f"Command: {cmd_string}\n"
                f"STDOUT:\n{res.stdout}\n"
                f"STDERR:\n{res.stderr}"
            )
        return res.stdout.strip()
    else:
        res = subprocess.run(cmd_string, shell=True, capture_output=True, encoding="utf-8")
        if res.returncode != 0:
            raise RuntimeError(
                f"Command failed with code {res.returncode}.\n"
                f"Command: {cmd_string}\n"
                f"STDOUT:\n{res.stdout}\n"
                f"STDERR:\n{res.stderr}"
            )
        return res.stdout.strip()

def run_grok_with_prompt_file(grok_prompt: str) -> str:
    """Writes the prompt to a temporary file and runs Grok CLI using --prompt-file to bypass shell escaping traps."""
    import platform
    import uuid as _uuid
    temp_filename = f"temp_prompt_{_uuid.uuid4().hex[:12]}.txt"
    
    if platform.system() == "Windows":
        # Remote execution on VPS
        remote_temp_path = f"/home/ubuntu/scratch/{temp_filename}"
        
        # 1. Write the prompt to the remote VPS file using stdin redirection
        write_cmd = [
            "ssh", "-o", "StrictHostKeyChecking=no", "-T",
            "ubuntu@89.168.20.135",
            f"cat > {remote_temp_path}"
        ]
        try:
            subprocess.run(write_cmd, input=grok_prompt, encoding="utf-8", check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            raise RuntimeError(f"Failed to write remote prompt file to VPS: {e}")
            
        # 2. Run grok on VPS referencing the remote prompt file
        grok_cmd = f"/home/ubuntu/.local/bin/grok --prompt-file {remote_temp_path}"
        try:
            output = ssh_run(grok_cmd)
            return output
        finally:
            # 3. Clean up remote temp file
            try:
                ssh_cmd = [
                    "ssh", "-o", "StrictHostKeyChecking=no", "-T", "-n",
                    "ubuntu@89.168.20.135",
                    f"rm -f {remote_temp_path}"
                ]
                subprocess.run(ssh_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                pass
    else:
        # Local execution on VPS
        local_temp_path = Path("/home/ubuntu/scratch") / temp_filename
        local_temp_path.parent.mkdir(parents=True, exist_ok=True)
        local_temp_path.write_text(grok_prompt, encoding="utf-8")
        
        grok_cmd = f"/home/ubuntu/.local/bin/grok --prompt-file {local_temp_path}"
        try:
            res = subprocess.run(grok_cmd, shell=True, capture_output=True, encoding="utf-8")
            if res.returncode != 0:
                raise RuntimeError(
                    f"Local Grok execution failed with code {res.returncode}.\n"
                    f"Command: {grok_cmd}\n"
                    f"STDOUT:\n{res.stdout}\n"
                    f"STDERR:\n{res.stderr}"
                )
            return res.stdout.strip()
        finally:
            try:
                local_temp_path.unlink(missing_ok=True)
            except Exception:
                pass


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

def get_previous_comments(account_name: str) -> str:
    """Load the runs.json database and return recent user comments for steering style"""
    try:
        runs_file = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"
        if not runs_file.exists():
            return ""
            
        with open(runs_file, "r", encoding="utf-8") as f:
            runs = json.load(f)
            
        comments = []
        for run in runs:
            if run.get("account_name") == account_name:
                for c in run.get("comments", []):
                    comments.append(c.get("text"))
                    if len(comments) >= 5:
                        break
            if len(comments) >= 5:
                break
                
        if comments:
            return "\n\nINSTRUCCIONES DE ESTILO ADICIONALES (Feedback directo de tu director humano):\n" + "\n".join(f"- {c}" for c in comments)
    except Exception as e:
        print(f"[Advertencia] No se pudieron leer comentarios previos: {e}")
    return ""


def load_planned_run(run_id: str) -> dict:
    """Load a planned run from runs.json if it exists"""
    try:
        runs_file = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"
        if runs_file.exists():
            with open(runs_file, "r", encoding="utf-8") as f:
                runs = json.load(f)
            for r in runs:
                if r.get("id") == run_id:
                    return r
    except Exception as e:
        print(f"Error loading planned run: {e}")
    return None

def get_next_planned_run(account_name: str) -> dict:
    """Get the oldest planned run for an account (acting as a queue)"""
    try:
        runs_file = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"
        if runs_file.exists():
            with open(runs_file, "r", encoding="utf-8") as f:
                runs = json.load(f)
            # Find the oldest planned run (queue order)
            planned = [r for r in runs if r.get("status") == "planned" and r.get("account_name") == account_name]
            if planned:
                # We return the last one in the list if we prepend new ones, or the one with the oldest timestamp.
                # Let's sort by timestamp ascending to process the oldest scheduled/planned run first.
                planned.sort(key=lambda x: x.get("timestamp", ""))
                return planned[0]
    except Exception as e:
        print(f"Error getting next planned run: {e}")
    return None

def refine_planned_prompts(account_name: str, topic: str, image_prompt: str, video_prompt: str, post_text: str, comments: list) -> dict:
    """Refine original prompts and copy based on user steering feedback using Grok CLI"""
    feedback_str = "\n".join(f"- {c.get('text')}" for c in comments)
    niche = ACCOUNTS[account_name]["niche"]
    
    prompt = f"""
    Eres Hermes, director creativo. Tenemos un video planificado sobre: "{topic}".
    Nicho de la cuenta ({account_name}): "{niche}".
    
    Prompts y texto originales:
    - Image Prompt original (para grok-imagine-image-quality): {image_prompt}
    - Video Prompt original (para grok-imagine-video): {video_prompt}
    - Copy de publicación original: {post_text}
    
    El director humano ha dejado el siguiente feedback para refinar esta publicación antes de generar los medios:
    {feedback_str}
    
    Por favor, refina y ajusta los prompts de imagen, video y el texto de publicación originales de acuerdo a este feedback.
    Asegúrate de mantener el tono intrigante del fútbol y las apuestas, y de cumplir estrictamente con los cambios sugeridos.
    
    Devuelve la respuesta estrictamente en formato JSON con esta estructura exacta:
    {{
        "topic": "Título refinado (o el mismo)",
        "image_prompt": "Prompt de imagen refinado en inglés",
        "video_prompt": "Prompt de video refinado en inglés",
        "post_text": "Texto del copy refinado en español"
    }}
    """
    
    print(f"[{account_name}] Refinando prompts de plan '{topic}' según feedback...")
    try:
        raw = call_llm(prompt, json_mode=True, skip_grok=True)
    except Exception as e:
        print(f"Fallback to Grok CLI: {e}")
        raw = run_grok_with_prompt_file(prompt)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON refinado de Grok CLI: {raw}")
    
    return normalize_prompts(json.loads(json_match.group(0).strip()))

def update_run_state(run_id: str, updates: dict):
    """Update a specific run entry in runs.json"""
    try:
        runs_file = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"
        if not runs_file.exists():
            runs_file.parent.mkdir(parents=True, exist_ok=True)
            with open(runs_file, "w", encoding="utf-8") as f:
                json.dump([], f)
                
        with open(runs_file, "r", encoding="utf-8") as f:
            runs = json.load(f)
            
        found = False
        for run in runs:
            if run.get("id") == run_id:
                for k, v in updates.items():
                    run[k] = v
                found = True
                break
                
        if not found:
            new_run = {
                "id": run_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "account_name": updates.get("account_name", "GoalChainSol"),
                "topic": updates.get("topic", ""),
                "status": updates.get("status", "generating"),
                "image_url": "",
                "video_url": "",
                "post_text": "",
                "comments": []
            }
            for k, v in updates.items():
                new_run[k] = v
            runs.insert(0, new_run)
            
        with open(runs_file, "w", encoding="utf-8") as f:
            json.dump(runs, f, indent=2)
    except Exception as e:
        print(f"Error actualizando runs.json: {e}")

def generate_trending_topic(account_name: str, feedback_str: str) -> str:
    """Ask Grok to choose an engaging football / World Cup 2026 / betting psychology topic"""
    niche = ACCOUNTS[account_name]["niche"]
    
    # Load recent topics to avoid repetition
    wc2026_context = ""
    if account_name == "GoalChainSol":
        wc2026_context = """
CONTEXTO DEL MUNDIAL 2026 — basa el video en UNO de estos jugadores/momentos REALES:
- Messi (Argentina): Último mundial. Apostadores a favor vs. en contra.
- Mbappé (Francia): Real Madrid + presión mundial = expectativa vs. realidad.
- CR7 (Portugal): Promesas de fanáticos ("si gana el mundial dejo de fumar/beber").
- Haaland: Noruega NO clasificó. El mejor goleador del mundo se quedó afuera.
- Vinicius Jr. (Brasil): Favoritismo perpetuo. Brasil cayó en cuartos Qatar 2022.
- Bellingham (Inglaterra): "Football's coming home" — el meme eterno de los apostadores británicos.
- Julián Álvarez: El héroe que nadie apostaba en Qatar 2022.
- Lamine Yamal: 17 años, y ya el mejor de España. ¿Apuestás en un adolescente?
- VAR: Goles anulados por milímetros. Apuestas destruidas por tecnología.
- Marruecos 2022: Primer africano en semifinales. Los que apostaron vs. los que no.
Selecciona UNO y construye la narrativa."""
    
    prompt = f"""
    Eres Hermes, estratega de contenido estrella de GoalChain. Decide un tema de video vertical corto (Tiktok/Shorts) altamente viral sobre fútbol.
    Nicho de la cuenta ({account_name}): "{niche}".
    
    Requisitos del tema:
    - Debe estar centrado en el Mundial 2026, con un jugador o momento REAL y específico como protagonista.
    - Conecta la historia con la psicología de apostar con el corazón vs. la razón fría.
    - Conecta con GoalChain (bóvedas/contratos inteligentes en Solana).
    - Evita el Maracanazo de 1950 y temas de estadios genéricos — ya los cubrimos.
    {wc2026_context}
    
    {feedback_str}
    
    Devuelve la respuesta estrictamente en formato JSON con esta estructura exacta:
    {{
        "topic": "Título corto y adictivo del tema en español (mencionando al jugador)",
        "narrative_angle": "Por qué este gancho generará retención extrema en los primeros 3 segundos"
    }}
    """
    
    print(f"[{account_name}] Generando tema de tendencia de Mundial 2026 usando Grok CLI...")
    try:
        raw = call_llm(prompt, json_mode=True, skip_grok=True)
    except Exception as e:
        print(f"Fallback to Grok CLI: {e}")
        raw = run_grok_with_prompt_file(prompt)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON de tema de Grok CLI: {raw}")
    
    data = json.loads(json_match.group(0).strip())
    topic = data.get("topic", "Misterios de la Copa del Mundo")
    print(f"Tema seleccionado: '{topic}' (\u00c1ngulo: {data.get('narrative_angle')})")
    return topic

def generate_visual_prompts(topic: str, account_name: str, feedback_str: str) -> dict:
    """Generate image and video prompts, and the post text from Grok CLI"""
    niche = ACCOUNTS[account_name]["niche"]
    
    prompt = f"""
    Eres un estratega de contenido y director creativo de alto nivel. Genera las especificaciones para un video viral corto sobre: "{topic}".
    La cuenta de destino es "{account_name}" en el nicho: "{niche}".
    
    Estructura Narrativa del Copy:
    Usa la estructura **Hook -> Context -> Mechanism -> Twist**:
    1. Hook (0-3s): Una frase inicial de alto impacto, intrigante y adictiva.
    2. Context (3-15s): El dato futbolístico oscuro o el escenario del mal hábito financiero.
    3. Mechanism (15-45s): Explicación lógica y cómo GoalChain (apuestas contra uno mismo en Solana) es la solución.
    4. Twist (45-60s): Conclusión irónica/divertida y llamado a la acción.
    
    {feedback_str}
    
    Necesitamos 3 cosas:
    1. Un prompt para generación de imagen estática (grok-imagine-image-quality). Debe describir una escena inicial de alto impacto visual, detallada, estilo 3D render o anime sofisticado de fútbol, sin texto.
    2. Un prompt para animar esa imagen en video (grok-imagine-video). Debe describir el movimiento de cámara y la animación (ej. "Camera zooms in smoothly, volumetric lighting glows...").
    3. El texto de la publicación (Copy) en español. Debe ser corto, directo, intrépido y usar emojis.
    
    Devuelve la respuesta en formato JSON (JSON válido) con esta estructura exacta:
    {{
        "image_prompt": "...",
        "video_prompt": "...",
        "post_text": "..."
    }}
    """
    
    print(f"[{account_name}] Diseñando prompts creativos para: '{topic}'...")
    try:
        raw = call_llm(prompt, json_mode=True, skip_grok=True)
    except Exception as e:
        print(f"Fallback to Grok CLI: {e}")
        raw = run_grok_with_prompt_file(prompt)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON de la respuesta de Grok CLI: {raw}")
    
    cleaned = json_match.group(0).strip()
    return normalize_prompts(json.loads(cleaned))

def generate_image_on_vps(image_prompt: str) -> str:
    """Generate image on host using Grok CLI and return its filename in pilot.
    Clears Grok image cache first to ensure each run gets a fresh, unique image.
    Uses a per-invocation session lock so concurrent pipeline runs don't
    clobber each other's image generations.
    """
    if not image_prompt or not image_prompt.strip():
        raise RuntimeError("image_prompt is empty — refusing to call Grok with empty prompt.")

    print("Limpiando caché de imágenes de Grok para garantizar variedad...")
    # Drop a per-invocation marker FIRST so concurrent runs can distinguish.
    SESSION_LOCK_DIR.mkdir(parents=True, exist_ok=True)
    my_lock = SESSION_LOCK_DIR / f"{os.getpid()}_{_uuid.uuid4().hex[:8]}.lock"
    my_lock.write_text(datetime.utcnow().isoformat() + "Z")
    
    # Clear only image files older than our lock's mtime — leave newer ones
    # (they belong to a concurrent generation that started after us).
    clear_cmd = (
        f"find /home/ubuntu/.grok/sessions/ -maxdepth 8 \\( -name '*.jpg' -o -name '*.png' \\) "
        f"! -newer {shlex.quote(str(my_lock))} "
        f"2>/dev/null -exec rm -f {{}} + 2>/dev/null || true"
    )
    try:
        ssh_run(clear_cmd)
        print("  Caché limpiada (preservando archivos posteriores al lock).")
    except Exception as e:
        print(f"  Aviso: clear_cmd falló ({e}); continuando.")
    finally:
        try:
            my_lock.unlink()
        except Exception:
            pass
    
    print("Generando imagen de inicio en el host con Grok CLI...")
    grok_prompt = f"Genera una imagen con el modelo de alta calidad (grok-imagine-image-quality): {image_prompt}"
    
    output = run_grok_with_prompt_file(grok_prompt)
    
    # Wait 1s to let mkdir/fs sync the new file
    time.sleep(1)

    copy_cmd = (
        "img_path=$(find /home/ubuntu/.grok/sessions/ /home/ubuntu/scratch/generated_images/ /data/apps/GoalChain/scratch/generated_images/ -maxdepth 8 \\( -name '*.jpg' -o -name '*.png' \\) "
        "-printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ') && "
        "if [ -f \"$img_path\" ]; then "
        "  fname=$(basename \"$img_path\"); "
        "  ts=$(date +%s); "
        "  target_name=\"grok_img_${ts}_${fname}\"; "
        "  cp \"$img_path\" \"/home/ubuntu/scratch/grok_batches/batch_01/outputs/${target_name}\" && "
        "  echo \"SUCCESS:${target_name}\"; "
        "else "
        "  echo \"ERROR: No image found\"; "
        "fi"
    )
    res = ssh_run(copy_cmd)
    if "SUCCESS:" not in res:
        raise RuntimeError(f"Error localizando o copiando la imagen generada por Grok CLI: {res}")
        
    return res.split("SUCCESS:")[1].strip()


def generate_video_on_vps(video_prompt: str, image_filename: str, aspect_ratio: str = "9:16") -> str:
    """Animate image to video on host using Grok CLI and return video filename in pilot.
    Refuses to run if video_prompt is empty (would produce a no-op video).
    """
    if not video_prompt or not video_prompt.strip():
        raise RuntimeError("video_prompt is empty — refusing to call Grok with empty prompt.")

    print("Limpiando caché de videos de Grok para garantizar variedad...")
    SESSION_LOCK_DIR.mkdir(parents=True, exist_ok=True)
    my_lock = SESSION_LOCK_DIR / f"vid_{os.getpid()}_{_uuid.uuid4().hex[:8]}.lock"
    my_lock.write_text(datetime.utcnow().isoformat() + "Z")
    
    clear_cmd = (
        f"find /home/ubuntu/.grok/sessions/ -maxdepth 8 -name '*.mp4' "
        f"! -newer {shlex.quote(str(my_lock))} "
        f"2>/dev/null -exec rm -f {{}} + 2>/dev/null || true"
    )
    try:
        ssh_run(clear_cmd)
        print("  Caché de videos limpiada.")
    except Exception as e:
        print(f"  Aviso: clear_cmd de videos falló ({e}); continuando.")
    finally:
        try:
            my_lock.unlink()
        except Exception:
            pass

    print(f"Animando imagen a video ({aspect_ratio}) en el host con Grok CLI...")
    orient = "horizontal en formato 16:9" if aspect_ratio == "16:9" else "vertical en formato 9:16"
    image_path = f"/home/ubuntu/scratch/grok_batches/batch_01/outputs/{image_filename}" if image_filename else ""
    grok_prompt = f"Genera un video {orient} (grok-imagine-video) a partir de la imagen '{image_path}' usando este prompt de animación: {video_prompt}"
    
    output = run_grok_with_prompt_file(grok_prompt)
    
    time.sleep(1)

    copy_cmd = (
        "vid_path=$(find /home/ubuntu/.grok/sessions/ /home/ubuntu/scratch/generated_images/ /data/apps/GoalChain/scratch/generated_images/ -maxdepth 8 -name '*.mp4' -printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ') && "
        "if [ -f \"$vid_path\" ]; then "
        "  fname=$(basename \"$vid_path\"); "
        "  ts=$(date +%s); "
        "  target_name=\"grok_vid_${ts}_${fname}\"; "
        "  cp \"$vid_path\" \"/home/ubuntu/scratch/grok_batches/batch_01/outputs/${target_name}\" && "
        "  echo \"SUCCESS:${target_name}\"; "
        "else "
        "  echo \"ERROR: No video found\"; "
        "fi"
    )
    res = ssh_run(copy_cmd)
    if "SUCCESS:" not in res:
        raise RuntimeError(f"Error localizando o copiando el video generado por Grok CLI: {res}")
        
    return res.split("SUCCESS:")[1].strip()


# --- Cost guard helpers ---
def _cost_guard_state() -> dict:
    """Read today's generation counter for the cost guard."""
    today = datetime.utcnow().date().isoformat()
    try:
        if COST_GUARD_FILE.exists():
            data = json.loads(COST_GUARD_FILE.read_text())
            if data.get("date") == today:
                return data
    except Exception:
        pass
    return {"date": today, "count": 0}


def _cost_guard_check_and_increment(action: str) -> bool:
    """Returns True if we can proceed with this generation (and increments).
    Returns False if daily budget is exhausted.
    """
    state = _cost_guard_state()
    if state["count"] >= MAX_GROK_GENERATIONS_PER_DAY:
        print(f"[CostGuard] Bloqueado: {state['count']}/{MAX_GROK_GENERATIONS_PER_DAY} generaciones hoy ({action}).")
        return False
    state["count"] += 1
    try:
        COST_GUARD_FILE.parent.mkdir(parents=True, exist_ok=True)
        COST_GUARD_FILE.write_text(json.dumps(state, indent=2))
    except Exception as e:
        print(f"[CostGuard] Aviso: no pude persistir estado: {e}")
    print(f"[CostGuard] {state['count']}/{MAX_GROK_GENERATIONS_PER_DAY} usadas hoy ({action}).")
    return True

def post_to_buffer(channel_id: str, text: str, video_url: str, all_channels: list = None) -> dict:
    """Create a smart-scheduled post in Buffer using GraphQL API.
    Uses schedule_optimizer to find optimal posting time for maximum LATAM audience impact.
    Falls back to addToQueue if scheduler unavailable.
    """
    from datetime import timezone
    all_channels = all_channels or [channel_id]
    
    # ── Calculate optimal scheduled time ──────────────────────────────────
    scheduled_at = None
    if SCHEDULER_AVAILABLE:
        try:
            scheduled_at = get_scheduled_at(channel_id, all_channels)
            svc = CHANNEL_SERVICES.get(channel_id, channel_id)
            print(f"  [{svc}] Publicación programada para: {scheduled_at} UTC")
        except Exception as e:
            print(f"  [Aviso] Optimizer falló ({e}), usando addToQueue")
    
    print(f"Enviando publicación a Buffer para el canal {channel_id}...")
    
    mutation = """
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            text
          }
        }
        ... on MutationError {
          message
        }
      }
    }
    """
    
    if scheduled_at:
        scheduling = {
            "schedulingType": "scheduled",
            "scheduledAt": scheduled_at,
        }
    else:
        scheduling = {
            "schedulingType": "automatic",
            "mode": "addToQueue",
        }
    
    variables = {
      "input": {
        "channelId": channel_id,
        "text": text,
        "assets": [
          { "video": { "url": video_url } }
        ],
        **scheduling
      }
    }
    
    # YouTube channel requires title and categoryId metadata
    if channel_id == "6a283a4d8f1d11f9b26b0068":
        title = (text.split("\n")[0][:60] if text else "GoalChain Short").replace("¿", "").replace("?", "").strip()
        if not title:
            title = "GoalChain Video Update"
        variables["input"]["metadata"] = {
            "youtube": {
                "title": title,
                "categoryId": "28"  # Science & Technology
            }
        }
    # Instagram requires reel type
    elif channel_id == "6a283a328f1d11f9b26aff82":
        variables["input"]["metadata"] = {
            "instagram": {
                "type": "reel",
                "shouldShareToFeed": True
            }
        }
        
    payload = {
        "query": mutation,
        "variables": variables
    }
    
    url = "https://api.buffer.com"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {BUFFER_TOKEN}"
        },
        method="POST"
    )
    
    with urllib.request.urlopen(req, timeout=30) as r:
        response_data = json.loads(r.read().decode("utf-8"))
        if "errors" in response_data:
            raise RuntimeError(f"Error de GraphQL en Buffer: {response_data['errors']}")
        # Attach scheduled_at to response for storage
        response_data["_scheduled_at"] = scheduled_at
        return response_data

def run_pipeline(topic: str, account_name: str, run_id: str, auto_topic: bool = False):
    """Execute complete generation and publishing pipeline"""
    channels = CHANNEL_IDS.get(account_name)
    if not channels:
        raise ValueError(f"No hay canales registrados para {account_name}")
        
    print(f"\n==================================================")
    print(f"INICIANDO PIPELINE DE GROK SUPER PARA: {account_name.upper()} (RUN: {run_id})")
    print(f"==================================================")
    
    planned_run = None
    
    # 0. Check if run_id represents an existing planned run, or if we should fetch next planned run
    if run_id:
        planned_run = load_planned_run(run_id)
        
    if not planned_run and auto_topic:
        # Search for next planned run for this account
        next_plan = get_next_planned_run(account_name)
        if next_plan:
            planned_run = next_plan
            run_id = next_plan["id"]
            print(f"[Queue] Encontrado video planificado en cola: '{planned_run['topic']}' (ID: {run_id})")

    prompts = {}
    
    if planned_run:
        topic = planned_run.get("topic")
        # Check if there is comments/steering feedback
        comments = planned_run.get("comments", [])
        if comments:
            try:
                refined = refine_planned_prompts(
                    account_name, 
                    topic, 
                    planned_run.get("image_prompt"), 
                    planned_run.get("video_prompt"), 
                    planned_run.get("post_text"), 
                    comments
                )
                norm_planned = normalize_prompts(planned_run)
                prompts["image_prompt"] = refined.get("image_prompt") or norm_planned["image_prompt"]
                prompts["video_prompt"] = refined.get("video_prompt") or norm_planned["video_prompt"]
                prompts["post_text"] = refined.get("post_text") or norm_planned["post_text"]
                topic = refined.get("topic", topic)
                print(f"[Steering Loop] Prompts refinados con éxito usando comentarios.")
            except Exception as e:
                print(f"[Advertencia] Error al refinar prompts planificados: {e}. Usando originales.")
                norm_planned = normalize_prompts(planned_run)
                prompts["image_prompt"] = norm_planned["image_prompt"]
                prompts["video_prompt"] = norm_planned["video_prompt"]
                prompts["post_text"] = norm_planned["post_text"]
        else:
            print(f"[Queue] Usando prompts y copy originales del plan.")
            norm_planned = normalize_prompts(planned_run)
            prompts["image_prompt"] = norm_planned["image_prompt"]
            prompts["video_prompt"] = norm_planned["video_prompt"]
            prompts["post_text"] = norm_planned["post_text"]
            
        # Update run state to generating
        update_run_state(run_id, {
            "status": "generating",
            "topic": topic,
            "image_prompt": prompts["image_prompt"],
            "video_prompt": prompts["video_prompt"],
            "post_text": prompts["post_text"]
        })
    else:
        # Load feedback from previous completed runs
        feedback_str = get_previous_comments(account_name)
        if feedback_str:
            print("[Steering Loop] Inyectando comentarios previos en Grok.")

        # Build A/B + arc + hashtag injection for the Grok prompt (Bloque C).
        ab_block = ""
        if MARKETING_STACK_AVAILABLE and get_prompt_injection is not None:
            try:
                ab_block = get_prompt_injection(account_name)
            except Exception as _e:
                print(f"[Aviso] ab_tester no inyectó: {_e}")

        # 1. Topic (Generate if auto)
        if auto_topic or not topic:
            topic = generate_trending_topic(account_name, feedback_str + ab_block)
            update_run_state(run_id, {"topic": topic, "account_name": account_name})

        # 2. Prompts
        prompts = generate_visual_prompts(topic, account_name, feedback_str + ab_block)
        print(f"Prompts generados:\n- Imagen: {prompts['image_prompt']}\n- Video: {prompts['video_prompt']}\n- Copy: {prompts['post_text']}")

        update_run_state(run_id, {
            "image_prompt": prompts["image_prompt"],
            "video_prompt": prompts["video_prompt"],
            "post_text": prompts["post_text"]
        })

    # ── 2b. Marketing-stack enrichment (A/B variants, story arcs, hashtags) ──
    enrichment = {}
    if MARKETING_STACK_AVAILABLE:
        try:
            if pick_variants is not None:
                variants = pick_variants(account_name)
                enrichment.update(variants)
            if assign_arc is not None:
                arc = assign_arc(account_name, topic or "Untitled")
                enrichment.update(arc)
            if choose_hashtags is not None:
                existing_tags = set(re.findall(r"#\w+", prompts["post_text"]))
                hashtags = choose_hashtags(topic or account_name, account_name)
                new_tags = [t for t in hashtags if t not in existing_tags]
                if new_tags:
                    prompts["post_text"] = (prompts["post_text"].rstrip() + "\n\n" + " ".join(new_tags)).strip()
                enrichment["hashtags"] = hashtags
            print(f"[Marketing] {enrichment.get('hook_variant','?')} + {enrichment.get('cta_variant','?')} | arc ep{enrichment.get('episode','?')}")
        except Exception as _e:
            print(f"[Aviso] marketing enrichment partial-failed: {_e}")

    # ── 2c. Quality scoring (warn-only, never blocks) ──
    quality_in = {
        "post_text": prompts.get("post_text", ""),
        "image_prompt": prompts.get("image_prompt", ""),
        "video_prompt": prompts.get("video_prompt", ""),
    }
    if MARKETING_STACK_AVAILABLE and score_quality is not None:
        try:
            qs = score_quality(quality_in)
            enrichment["quality_score"] = qs
            if not qs["passes"]:
                print(f"[Quality] {qs['score']}/100 - issues: {qs['issues']}")
            else:
                print(f"[Quality] {qs['score']}/100 PASS")
        except Exception as _e:
            print(f"[Aviso] quality scorer falló: {_e}")

    if enrichment:
        update_run_state(run_id, enrichment)

    # ── 2d. Per-generations cost-guard (image + video). ──
    if not _cost_guard_check_and_increment("image-generation"):
        raise RuntimeError(
            f"Cost guard bloqueó la generación (límite {MAX_GROK_GENERATIONS_PER_DAY}/día)."
        )
    # 3. Image
    img_name = generate_image_on_vps(prompts["image_prompt"])
    img_url = f"https://api.goalchain.fun/pilot/{img_name}"
    print(f"Imagen lista en pilot: {img_url}")
    update_run_state(run_id, {"image_url": img_url})
    
    if not _cost_guard_check_and_increment("video-generation"):
        raise RuntimeError(
            f"Cost guard bloqueó la generación de video (límite {MAX_GROK_GENERATIONS_PER_DAY}/día)."
        )

    # 4. Video
    vid_name = generate_video_on_vps(prompts["video_prompt"], img_name)
    video_url = f"https://api.goalchain.fun/pilot/{vid_name}"
    print(f"¡Video animado listo en pilot!: {video_url}")
    update_run_state(run_id, {"video_url": video_url})

    # ── 4b. Burn-in captions (Optional, OFF by default). Requires ffmpeg. ──
    if (
        os.getenv("CAPTIONS_ENABLED", "false").lower() == "true"
        and MARKETING_STACK_AVAILABLE
        and captions_burnin_module is not None
        and captions_burnin_module.is_ffmpeg_available()
        and prompts.get("post_text", "").strip()
    ):
        try:
            in_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / vid_name
            out_path = in_path.with_name(in_path.stem + "_capped" + in_path.suffix)
            cap = captions_burnin_module.render(in_path, prompts["post_text"], out_path)
            update_run_state(run_id, {"captions_render": cap})
            print(f"[Captions] {cap}")
            if cap.get("status") == "ok" and cap.get("out_path"):
                video_url = f"https://api.goalchain.fun/pilot/{Path(cap['out_path']).name}"
                update_run_state(run_id, {"video_url": video_url})
        except Exception as _e:
            update_run_state(run_id, {"captions_render": {"status": "failed", "error": str(_e)}})
            print(f"[Captions] failed: {_e}")
    else:
        update_run_state(run_id, {
            "captions_render": {
                "status": "disabled_or_unavailable",
                "ffmpeg": MARKETING_STACK_AVAILABLE and captions_burnin_module is not None
                          and captions_burnin_module.is_ffmpeg_available(),
            }
        })
    
    # 5. Post to Buffer Channels (with smart scheduling)
    buffer_post_ids = []
    platform_slots = {}
    earliest_scheduled_at = None
    
    for channel_id in channels:
        try:
            buffer_res = post_to_buffer(channel_id, prompts["post_text"], video_url, all_channels=channels)
            print(f"✅ Publicado en Buffer canal {channel_id}: {buffer_res}")
            
            # Extract post id
            p_id = buffer_res.get("data", {}).get("createPost", {}).get("post", {}).get("id")
            if p_id:
                buffer_post_ids.append(p_id)
            
            # Track scheduled time per channel
            sched = buffer_res.get("_scheduled_at")
            if not sched:
                # Try to get scheduledAt from the returned post
                sched = buffer_res.get("data", {}).get("createPost", {}).get("post", {}).get("scheduledAt")
            
            from schedule_optimizer import CHANNEL_SERVICES
            svc = CHANNEL_SERVICES.get(channel_id, channel_id)
            if sched:
                platform_slots[svc] = sched
                if earliest_scheduled_at is None or sched < earliest_scheduled_at:
                    earliest_scheduled_at = sched
                    
        except Exception as buffer_err:
            print(f"❌ Error publicando en canal {channel_id}: {buffer_err}")
            
    update_run_state(run_id, {
        "status": "published",
        "buffer_post_ids": buffer_post_ids,
        "scheduled_at": earliest_scheduled_at,
        "platform_slots": platform_slots,
    })

    
    print(f"\n✅ PIPELINE GROK SUPER FINALIZADO CON ÉXITO PARA {account_name}!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hermes Grok Super Video Pipeline")
    parser.add_argument("--account", choices=["NicoPezDorado", "GoalChainSol"], required=True, help="Target account name")
    parser.add_argument("--topic", type=str, help="Custom topic for the video")
    parser.add_argument("--auto-topic", action="store_true", help="Generate topic automatically using Grok CLI")
    parser.add_argument("--run-id", type=str, help="Run ID passed by the daemon")
    
    args = parser.parse_args()
    
    run_id = args.run_id or f"run_{int(time.time())}_{args.account.lower()}"
    
    try:
        run_pipeline(
            topic=args.topic,
            account_name=args.account,
            run_id=run_id,
            auto_topic=args.auto_topic
        )
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO EN EL PIPELINE: {e}")
        update_run_state(run_id, {
            "status": "failed",
            "error_message": str(e)
        })
        sys.exit(1)
