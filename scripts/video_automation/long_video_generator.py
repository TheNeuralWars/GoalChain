import os
import sys
import json
import time
import argparse
import shlex
import re
import subprocess
from pathlib import Path
from datetime import datetime

# Setup paths relative to the project base
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))

# Import pipeline functions
from config import ACCOUNTS
try:
    from grok_super_pipeline import (
        generate_image_on_vps,
        generate_video_on_vps,
        ssh_run,
        normalize_prompts,
        update_run_state
    )
    PIPELINE_OK = True
except ImportError as e:
    print(f"[Aviso] No se pudo importar de grok_super_pipeline: {e}")
    PIPELINE_OK = False

RUNS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"

def generate_long_screenplay(topic: str, account_name: str, scenes_count: int) -> dict:
    """Ask Grok to generate a structured screenplay for a long video."""
    niche = ACCOUNTS.get(account_name, {}).get("niche", "Mundial 2026 y predicciones de fútbol")
    
    # Context of today's World Cup matches
    context = """
    Hoy es 24 de junio de 2026. Los partidos decisivos de hoy son:
    - Escocia vs Brasil (Grupo C, Miami) - Brasil necesita ganar/empatar para asegurar clasificación cómoda, Escocia sueña con dar el golpe.
    - República Checa vs México (Grupo A, Ciudad de México) - México juega en casa y busca puntaje perfecto (9 pts).
    - Suiza vs Canadá (Grupo B, Vancouver) - Pelea directa por la cima del grupo.
    - Marruecos vs Haití (Grupo C, Atlanta) - Marruecos busca sellar pase.
    """
    
    prompt = f"""
    Eres Hermes, director de contenido estrella de GoalChain.
    Diseña un guión dinámico e impactante de {scenes_count * 4} segundos para un video corto compilado de {scenes_count} escenas de 4 segundos cada una.
    El tema central es: "{topic if topic else 'Resultados del Mundial 2026 y predicciones para hoy'}"
    Contexto de partidos de hoy (24 de junio de 2026):
    {context}
    
    Estructura Narrativa del Copy:
    Usa la estructura Hook -> Context -> Mechanism -> Twist.
    El Hook debe llamar la atención del espectador inmediatamente. El Twist debe ser irónico/divertido y llamar a apostar sobre sí mismos o hacer predicciones en goalchain.fun.
    
    Necesitamos que devuelvas un JSON válido con la siguiente estructura exacta:
    {{
        "post_text": "Copy del pie de video completo en español, muy intrigante con emojis.",
        "scenes": [
            {{
                "scene_num": 1,
                "visual_prompt": "Prompt en inglés detallado de la primera escena (3D render, anime o drama deportivo, sin texto en la imagen)",
                "animation_prompt": "Prompt en inglés para animar esa escena (movimiento lento de cámara, paneo, luces, etc.)"
            }},
            ... (exactamente {scenes_count} escenas)
        ]
    }}
    """
    
    print(f"[{account_name}] Generando guión para video compilado de {scenes_count} escenas usando Grok CLI...")
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(prompt)}"
    
    raw = ssh_run(cmd)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON del guión de Grok CLI: {raw}")
        
    return json.loads(json_match.group(0).strip())

def main():
    parser = argparse.ArgumentParser(description="Hermes Long Video Compiler")
    parser.add_argument("--scenes", type=int, default=10, help="Número de escenas a generar (cada una dura 4 segundos)")
    parser.add_argument("--dry-run", action="store_true", help="Solo genera el guión en JSON y simula la unión, no genera imágenes ni videos reales")
    parser.add_argument("--account", type=str, default="GoalChainSol", help="Nombre de la cuenta de destino")
    parser.add_argument("--topic", type=str, default="", help="Temática del video")
    parser.add_argument("--run-id", type=str, default="", help="ID de la ejecución")
    
    args = parser.parse_args()
    
    if not args.run_id:
        args.run_id = f"run_{int(time.time())}_long_{args.account.lower()}"
        
    print(f"Iniciando compilador de video largo (ID: {args.run_id}, Escenas: {args.scenes}, Dry-Run: {args.dry_run})")
    
    # 1. Generate screenplay
    try:
        screenplay = generate_long_screenplay(args.topic, args.account, args.scenes)
        print("\n=== Guión Generado ===")
        print(f"Copy: {screenplay.get('post_text')[:100]}...")
        print(f"Número de escenas devueltas: {len(screenplay.get('scenes', []))}")
    except Exception as e:
        print(f"Error generando guión: {e}")
        sys.exit(1)
        
    scenes = screenplay.get("scenes", [])
    if not scenes:
        print("Error: No se encontraron escenas en el guión generado.")
        sys.exit(1)
        
    post_text = screenplay.get("post_text", "Resumen del Mundial 2026 de hoy.")
    
    # Create output directory for temporary compilation files
    compile_dir = BASE_DIR / "scripts" / "video_automation" / "output" / f"compile_{args.run_id}"
    compile_dir.mkdir(parents=True, exist_ok=True)
    
    video_paths = []
    
    # 2. Sequential generation of scenes
    for i, scene in enumerate(scenes):
        scene_num = scene.get("scene_num", i + 1)
        visual_prompt = scene.get("visual_prompt")
        animation_prompt = scene.get("animation_prompt")
        
        print(f"\n--- Procesando Escena {scene_num}/{len(scenes)} ---")
        print(f"Prompt Imagen: {visual_prompt}")
        print(f"Prompt Video: {animation_prompt}")
        
        if args.dry_run:
            # Simulate video file creation
            simulated_video = compile_dir / f"scene_{scene_num}.mp4"
            simulated_video.touch()
            video_paths.append(simulated_video)
            print(f"[Dry-Run] Escena {scene_num} simulada.")
            continue
            
        try:
            # Generate image
            img_name = generate_image_on_vps(visual_prompt)
            # Generate video
            vid_name = generate_video_on_vps(animation_prompt, img_name)
            
            # The generated video is copied to /home/ubuntu/scratch/grok_batches/batch_01/outputs/<vid_name>
            vid_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / vid_name
            if not vid_path.exists():
                # Fallback if path is different (e.g. running locally for debug)
                local_fallback = BASE_DIR / "scripts" / "video_automation" / "output" / vid_name
                if local_fallback.exists():
                    vid_path = local_fallback
                else:
                    raise FileNotFoundError(f"No se encontró el video generado {vid_name}")
                    
            video_paths.append(vid_path)
            print(f"Escena {scene_num} completada con éxito: {vid_path}")
            
            # Sleep briefly to avoid hammering Grok CLI
            time.sleep(2)
        except Exception as e:
            print(f"Error procesando escena {scene_num}: {e}")
            sys.exit(1)
            
    # 3. Concatenate using ffmpeg
    final_output_name = f"grok_long_vid_{int(time.time())}_{args.account.lower()}.mp4"
    final_output_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / final_output_name
    
    if not final_output_path.parent.exists():
        # Fallback for local testing
        final_output_path = BASE_DIR / "scripts" / "video_automation" / "output" / final_output_name
        
    print(f"\n=== Concatenando {len(video_paths)} videos con FFmpeg ===")
    concat_file = compile_dir / "concat.txt"
    
    with open(concat_file, "w", encoding="utf-8") as f:
        for path in video_paths:
            f.write(f"file '{path.resolve()}'\n")
            
    if args.dry_run:
        # Simulate final output creation
        final_output_path.touch()
        print(f"[Dry-Run] Simulación de video final compilado en: {final_output_path}")
    else:
        # Run ffmpeg concat demuxer
        cmd = f"ffmpeg -y -f concat -safe 0 -i {shlex.quote(str(concat_file))} -c copy {shlex.quote(str(final_output_path))}"
        print(f"Ejecutando comando: {cmd}")
        res = subprocess.run(cmd, shell=True, capture_output=True, encoding="utf-8")
        if res.returncode != 0:
            print(f"Error en concatenación de FFmpeg: {res.stderr}")
            sys.exit(1)
        print(f"Video final compilado con éxito en: {final_output_path}")
        
    # 4. Save to runs.json
    video_url = f"https://api.goalchain.fun/pilot/{final_output_name}"
    
    if not args.dry_run:
        update_run_state(args.run_id, {
            "status": "planned",
            "account_name": args.account,
            "topic": args.topic or f"Mundial 2026 Resumen: {datetime.now().strftime('%Y-%m-%d')}",
            "video_url": video_url,
            "image_url": "",
            "post_text": post_text,
            "image_prompt": "Compilation of multiple scenes",
            "video_prompt": "Concatenation of multiple video files",
            "comments": []
        })
        print(f"Registro de ejecución '{args.run_id}' guardado en runs.json con estado 'planned'.")
        
    # Clean up temporary compile files
    try:
        for path in video_paths:
            if args.dry_run:
                path.unlink()
        concat_file.unlink()
        compile_dir.rmdir()
    except Exception as e:
        print(f"Aviso: No se pudieron limpiar algunos archivos temporales: {e}")
        
    print("\nProceso finalizado con éxito.")

if __name__ == "__main__":
    main()
