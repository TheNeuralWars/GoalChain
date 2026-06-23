import os
import sys
import json
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

BUFFER_TOKEN = "VB1d1PaKlkyQA-Q97Go4k7SIbk9kQcBxy8pVaRAYJta"
VPS_HOST = "ubuntu@89.168.20.135"

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
    """Run command locally on VPS or via SSH from Windows"""
    is_local = (os.name != "nt")
    if is_local:
        # Run directly on the host (VPS)
        res = subprocess.run(cmd_string, shell=True, capture_output=True, encoding="utf-8", check=True)
        return res.stdout.strip()
    else:
        # Run via SSH from Windows developer machine
        ssh_cmd = ["ssh", "-o", "BatchMode=yes", VPS_HOST, cmd_string]
        res = subprocess.run(ssh_cmd, capture_output=True, encoding="utf-8", check=True)
        return res.stdout.strip()

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
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(prompt)}"
    raw = ssh_run(cmd)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON refinado de Grok CLI: {raw}")
    
    return json.loads(json_match.group(0).strip())

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
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(prompt)}"
    raw = ssh_run(cmd)
    
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
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(prompt)}"
    raw = ssh_run(cmd)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON de la respuesta de Grok CLI: {raw}")
    
    cleaned = json_match.group(0).strip()
    return json.loads(cleaned)

def generate_image_on_vps(image_prompt: str) -> str:
    """Generate image on VPS using Grok CLI and return its filename in pilot.
    Clears Grok image cache first to ensure each run gets a fresh, unique image.
    """
    print("Limpiando caché de imágenes de Grok para garantizar variedad...")
    # Clear previous images from Grok sessions to avoid contamination between runs
    clear_cmd = (
        "find /home/ubuntu/.grok/sessions/ -maxdepth 4 -name '*.jpg' -o -name '*.png' "
        "2>/dev/null | xargs rm -f 2>/dev/null || true"
    )
    try:
        ssh_run(clear_cmd)
        print("  Caché limpiada.")
    except Exception:
        pass  # Non-fatal
    
    print("Generando imagen de inicio en el VPS con Grok CLI...")
    grok_prompt = f"Genera una imagen con el modelo de alta calidad (grok-imagine-image-quality): {image_prompt}"
    
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(grok_prompt)}"
    output = ssh_run(cmd)
    
    copy_cmd = (
        "img_path=$(find /home/ubuntu/.grok/sessions/ /home/ubuntu/scratch/ /home/ubuntu/ -maxdepth 4 -name '*.jpg' -o -name '*.png' -printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ') && "
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

def generate_video_on_vps(video_prompt: str, image_filename: str) -> str:
    """Animate image to video on VPS using Grok CLI and return video filename in pilot"""
    print("Animando imagen a video en el VPS con Grok CLI...")
    grok_prompt = f"Genera un video vertical en formato 9:16 (grok-imagine-video) a partir de la imagen '{image_filename}' usando este prompt de animación: {video_prompt}"
    
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(grok_prompt)}"
    output = ssh_run(cmd)
    
    copy_cmd = (
        "vid_path=$(find /home/ubuntu/.grok/sessions/ /home/ubuntu/scratch/ /home/ubuntu/ -maxdepth 4 -name '*.mp4' -printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ') && "
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

def post_to_buffer(channel_id: str, text: str, video_url: str) -> dict:
    """Create a scheduled/automatic post in Buffer using GraphQL API"""
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
    
    variables = {
      "input": {
        "channelId": channel_id,
        "text": text,
        "assets": [
          { "video": { "url": video_url } }
        ],
        "schedulingType": "automatic",
        "mode": "addToQueue"
      }
    }
    
    # YouTube channel (6a283a4d8f1d11f9b26b0068) requires title and categoryId metadata
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
    # Instagram channel requires type (post, story, or reel)
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
                prompts["image_prompt"] = refined.get("image_prompt")
                prompts["video_prompt"] = refined.get("video_prompt")
                prompts["post_text"] = refined.get("post_text")
                topic = refined.get("topic", topic)
                print(f"[Steering Loop] Prompts refinados con éxito usando comentarios.")
            except Exception as e:
                print(f"[Advertencia] Error al refinar prompts planificados: {e}. Usando originales.")
                prompts["image_prompt"] = planned_run.get("image_prompt")
                prompts["video_prompt"] = planned_run.get("video_prompt")
                prompts["post_text"] = planned_run.get("post_text")
        else:
            print(f"[Queue] Usando prompts y copy originales del plan.")
            prompts["image_prompt"] = planned_run.get("image_prompt")
            prompts["video_prompt"] = planned_run.get("video_prompt")
            prompts["post_text"] = planned_run.get("post_text")
            
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
        
        # 1. Topic (Generate if auto)
        if auto_topic or not topic:
            topic = generate_trending_topic(account_name, feedback_str)
            update_run_state(run_id, {"topic": topic, "account_name": account_name})
            
        # 2. Prompts
        prompts = generate_visual_prompts(topic, account_name, feedback_str)
        print(f"Prompts generados:\n- Imagen: {prompts['image_prompt']}\n- Video: {prompts['video_prompt']}\n- Copy: {prompts['post_text']}")
        
        update_run_state(run_id, {
            "image_prompt": prompts["image_prompt"],
            "video_prompt": prompts["video_prompt"],
            "post_text": prompts["post_text"]
        })
    
    # 3. Image
    img_name = generate_image_on_vps(prompts["image_prompt"])
    img_url = f"https://api.goalchain.fun/pilot/{img_name}"
    print(f"Imagen lista en pilot: {img_url}")
    update_run_state(run_id, {"image_url": img_url})
    
    # 4. Video
    vid_name = generate_video_on_vps(prompts["video_prompt"], img_name)
    video_url = f"https://api.goalchain.fun/pilot/{vid_name}"
    print(f"¡Video animado listo en pilot!: {video_url}")
    update_run_state(run_id, {"video_url": video_url})
    
    # 5. Post to Buffer Channels
    buffer_post_ids = []
    for channel_id in channels:
        try:
            buffer_res = post_to_buffer(channel_id, prompts["post_text"], video_url)
            print(f"✅ Publicado en Buffer canal {channel_id}: {buffer_res}")
            
            # Extract post id if available
            p_id = buffer_res.get("data", {}).get("createPost", {}).get("post", {}).get("id")
            if p_id:
                buffer_post_ids.append(p_id)
        except Exception as buffer_err:
            print(f"❌ Error publicando en canal {channel_id}: {buffer_err}")
            
    update_run_state(run_id, {
        "status": "published",
        "buffer_post_ids": buffer_post_ids
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
