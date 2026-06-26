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
        run_grok_with_prompt_file,
        normalize_prompts,
        update_run_state,
        _cost_guard_check_and_increment,
        MAX_GROK_GENERATIONS_PER_DAY,
    )
    PIPELINE_OK = True
except ImportError as e:
    print(f"[Aviso] No se pudo importar de grok_super_pipeline: {e}")
    PIPELINE_OK = False
    _cost_guard_check_and_increment = None
    MAX_GROK_GENERATIONS_PER_DAY = 40

# Marketing-stack enrichment (Bloque C). Each import is independently optional
# so a single missing module never blocks generation.
try:
    from ab_tester import pick_variants  # type: ignore
    ABTESTER_OK = True
except ImportError:
    pick_variants = None  # type: ignore
    ABTESTER_OK = False
try:
    from story_arc import assign_arc  # type: ignore
    ARC_OK = True
except ImportError:
    assign_arc = None  # type: ignore
    ARC_OK = False
try:
    from hashtag_researcher import choose as choose_hashtags  # type: ignore
    HASHTAGS_OK = True
except ImportError:
    choose_hashtags = None  # type: ignore
    HASHTAGS_OK = False
try:
    from quality_scorer import score_run as score_quality  # type: ignore
    QUALITY_OK = True
except ImportError:
    score_quality = None  # type: ignore
    QUALITY_OK = False

GROK_BATCHES_OUTPUTS = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs")
RUNS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "runs.json"


# Default context (24 June 2026) — overridable via --context for future dates.
DEFAULT_CONTEXT = """
Hoy es 24 de junio de 2026. Los partidos decisivos de hoy son:
- Escocia vs Brasil (Grupo C, Miami) - Brasil necesita ganar/empatar para asegurar clasificación cómoda, Escocia sueña con dar el golpe.
- República Checa vs México (Grupo A, Ciudad de México) - México juega en casa y busca puntaje perfecto (9 pts).
- Suiza vs Canadá (Grupo B, Vancouver) - Pelea directa por la cima del grupo.
- Marruecos vs Haití (Grupo C, Atlanta) - Marruecos busca sellar pase.
"""

def generate_long_screenplay(topic: str, account_name: str, scenes_count: int, context: str = DEFAULT_CONTEXT) -> dict:
    """Ask Grok to generate a structured screenplay for a long video."""
    niche = ACCOUNTS.get(account_name, {}).get("niche", "Mundial 2026 y predicciones de fútbol")

    prompt = f"""
    Eres Hermes, director de contenido estrella de GoalChain.
    Diseña un guión dinámico e impactante de {scenes_count * 4} segundos para un video corto compilado de {scenes_count} escenas de 4 segundos cada una.
    El tema central es: "{topic if topic else 'Resultados del Mundial 2026 y predicciones para hoy'}"
    Contexto de partidos de hoy (24 de junio de 2026):
    {context}
    
    Estructura Narrativa del Copy:
    Usa la estructura Hook -> Context -> Mechanism -> Twist.
    El Hook debe llamar la atención del espectador inmediatamente. El Twist debe ser irónico/divertido y llamar a apostar sobre sí mismos o hacer predicciones en goalchain.fun.
    
    CRITICAL JSON RULES:
    1. Devuelve ÚNICAMENTE un bloque JSON válido. No incluyas texto de introducción o despedida.
    2. Las comillas dobles (") SOLAMENTE deben usarse para delimitar claves y valores de cadenas JSON.
    3. CUALQUIER comilla dentro del texto (como en '3D' o 'Reels') DEBE ser comilla simple ('). NUNCA uses comillas dobles sin escapar dentro de un valor.
    
    Devuelve la respuesta en este formato exacto:
    {{
        "post_text": "Copy del pie de video completo en español con emojis, sin comillas dobles internas.",
        "scenes": [
            {{
                "scene_num": 1,
                "visual_prompt": "Prompt en inglés detallado de la primera escena (estilo cinematográfico, sin texto en la imagen, sin comillas dobles internas)",
                "animation_prompt": "Prompt en inglés para animar esa escena (movimiento de cámara, luces, sin comillas dobles internas)"
            }},
            ... (exactamente {scenes_count} escenas)
        ]
    }}
    """
    
    print(f"[{account_name}] Generando guión para video compilado de {scenes_count} escenas usando Grok CLI...")
    raw = run_grok_with_prompt_file(prompt)
    
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise RuntimeError(f"No se pudo extraer JSON del guión de Grok CLI: {raw}")
        
    json_str = json_match.group(0).strip()
    
    # Simple self-heal for unescaped double quotes inside values:
    # Look for double quotes that are NOT preceded by a colon/comma/brace or followed by colon/comma/brace.
    # But since we enforced single quotes in the prompt, this is a safety fallback.
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as jde:
        print(f"[Aviso] Falló análisis JSON estándar: {jde}. Intentando limpieza de comillas...")
        # Escape internal double quotes (very basic regex heuristic)
        # Replace "3D" with '3D' inside JSON strings:
        fixed_str = re.sub(r'(?<![:{\[,])"(?![:}\],])', "'", json_str)
        try:
            return json.loads(fixed_str)
        except Exception:
            print("Contenido crudo de Grok que falló:")
            print(raw)
            raise jde

def main():
    parser = argparse.ArgumentParser(description="Hermes Long Video Compiler")
    parser.add_argument("--scenes", type=int, default=10, help="Número de escenas a generar (cada una dura 4 segundos)")
    parser.add_argument("--dry-run", action="store_true", help="Solo genera el guión en JSON y simula la unión, no genera imágenes ni videos reales")
    parser.add_argument("--account", type=str, default="GoalChainSol", help="Nombre de la cuenta de destino")
    parser.add_argument("--topic", type=str, default="", help="Temática del video")
    parser.add_argument("--run-id", type=str, default="", help="ID de la ejecución")
    parser.add_argument("--context", type=str, default=DEFAULT_CONTEXT, help="Contexto de partidos/noticias para Grok (default: 24-jun-2026)")
    parser.add_argument("--resilient", action="store_true", default=True, help="Si una escena falla, sigue con las siguientes (default ON). Use --no-resilient para abortar total.")
    parser.add_argument("--no-resilient", dest="resilient", action="store_false")
    parser.add_argument("--publish-buffer", action="store_true", help="(NOVEDAD: stub) Reservado para integración futura con Buffer. Por ahora no agenda.")

    args = parser.parse_args()

    if not args.run_id:
        args.run_id = f"run_{int(time.time())}_long_{args.account.lower()}"

    print(f"Iniciando compilador de video largo (ID: {args.run_id}, Escenas: {args.scenes}, Dry-Run: {args.dry_run})")

    # 1. Generate screenplay
    try:
        screenplay = generate_long_screenplay(args.topic, args.account, args.scenes, context=args.context)
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

    # ── Gripe 1 fix: dry-run lives in /tmp, real generations in grok_batches. ──
    if args.dry_run:
        compile_dir = Path("/tmp") / f"long_video_dryrun_{args.run_id}"
    else:
        GROK_BATCHES_OUTPUTS.mkdir(parents=True, exist_ok=True)
        compile_dir = BASE_DIR / "scripts" / "video_automation" / "output" / f"compile_{args.run_id}"
    compile_dir.mkdir(parents=True, exist_ok=True)

    video_paths = []   # validated ready-to-concat video file paths
    scene_records = [] # per-scene record for runs.json + question_debug

    # 2. Sequential generation of scenes
    for i, scene in enumerate(scenes):
        scene_num = scene.get("scene_num", i + 1)
        visual_prompt = scene.get("visual_prompt")
        animation_prompt = scene.get("animation_prompt")

        print(f"\n--- Procesando Escena {scene_num}/{len(scenes)} ---")
        print(f"Prompt Imagen: {visual_prompt}")
        print(f"Prompt Video: {animation_prompt}")

        if args.dry_run:
            # Simulate video file creation in /tmp so we never touch the
            # real Grok outputs dir on a dry run.
            simulated_video = compile_dir / f"scene_{scene_num}.mp4"
            simulated_video.touch()
            video_paths.append(simulated_video)
            scene_records.append({
                "scene_num": scene_num,
                "status": "simulated",
                "visual_prompt": visual_prompt,
                "animation_prompt": animation_prompt,
                "video_path": str(simulated_video),
            })
            print(f"[Dry-Run] Escena {scene_num} simulada.")
            continue

        # ── Gripe 3: cost guard. Block before we burn rate quota. ──
        if _cost_guard_check_and_increment is not None:
            if not _cost_guard_check_and_increment(f"long-image-{scene_num}"):
                print(f"[CostGuard] Bloqueado en escena {scene_num} (límite {MAX_GROK_GENERATIONS_PER_DAY}/día).")
                if args.resilient:
                    scene_records.append({"scene_num": scene_num, "status": "blocked-cost",
                                          "visual_prompt": visual_prompt, "animation_prompt": animation_prompt})
                    continue
                else:
                    print("[CostGuard] abortando --no-resilient")
                    sys.exit(2)

        try:
            img_name = generate_image_on_vps(visual_prompt)

            # Second increment for video generation.
            if _cost_guard_check_and_increment is not None:
                if not _cost_guard_check_and_increment(f"long-video-{scene_num}"):
                    print(f"[CostGuard] Bloqueado en escena {scene_num} video (límite {MAX_GROK_GENERATIONS_PER_DAY}/día).")
                    if args.resilient:
                        scene_records.append({"scene_num": scene_num, "status": "blocked-cost-after-image",
                                              "visual_prompt": visual_prompt, "animation_prompt": animation_prompt,
                                              "image_url": f"https://api.goalchain.fun/pilot/{img_name}"})
                        continue
                    else:
                        sys.exit(2)

            vid_name = generate_video_on_vps(animation_prompt, img_name)

            vid_path = GROK_BATCHES_OUTPUTS / vid_name
            if not vid_path.exists():
                local_fallback = BASE_DIR / "scripts" / "video_automation" / "output" / vid_name
                if local_fallback.exists():
                    vid_path = local_fallback
                else:
                    raise FileNotFoundError(f"No se encontró el video generado {vid_name}")

            video_paths.append(vid_path)
            scene_records.append({
                "scene_num": scene_num,
                "status": "ok",
                "visual_prompt": visual_prompt,
                "animation_prompt": animation_prompt,
                "image_url": f"https://api.goalchain.fun/pilot/{img_name}",
                "video_url": vid_path.as_uri(),
            })
            print(f"Escena {scene_num} completada con éxito: {vid_path}")

            time.sleep(2)  # avoid hammering Grok CLI

        except Exception as e:
            print(f"[Escena {scene_num}] error: {e}")
            scene_records.append({
                "scene_num": scene_num,
                "status": "failed",
                "error": str(e),
                "visual_prompt": visual_prompt,
                "animation_prompt": animation_prompt,
            })
            if args.resilient:
                print(f"[Resilient] Continuando con la siguiente escena...")
                continue
            else:
                print("[Resilient=off] abortando total")
                sys.exit(1)

    if not video_paths:
        print("Error: Ninguna escena produjo un video válido. Aborting.")
        sys.exit(1)

    # 3. Concatenate using ffmpeg (RE-ENCODE robusto, g7).
    final_output_name = f"grok_long_vid_{int(time.time())}_{args.account.lower()}.mp4"

    # Gripe 1: dry-run writes elsewhere
    if args.dry_run:
        final_output_dir = Path("/tmp")
    else:
        final_output_dir = GROK_BATCHES_OUTPUTS

    final_output_path = final_output_dir / final_output_name

    print(f"\n=== Concatenando {len(video_paths)} videos con FFmpeg (re-encode para robustez codec) ===")
    concat_file = compile_dir / "concat.txt"

    with open(concat_file, "w", encoding="utf-8") as f:
        for path in video_paths:
            f.write(f"file '{shlex.quote(str(path.resolve()))}'\n")

    if args.dry_run:
        final_output_path.touch()
        print(f"[Dry-Run] Simulación de video final compilado en: {final_output_path}")
    else:
        # Gripe 7: ffmpeg with explicit re-encode instead of -c copy.
        # Even if all inputs are mp4 from the same model, codec parameters
        # differ between files; -c copy fails with "Non-monotonous DTS" or
        # codec mismatch. -c:v libx264 + yuv420p normalizes to a safe
        # vertical video compatible with every social platform.
        cmd = [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-f", "concat", "-safe", "0",
            "-i", str(concat_file),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
            "-pix_fmt", "yuv420p",
            "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,fps=30",
            "-c:a", "aac", "-b:a", "128k", "-ac", "2",
            "-movflags", "+faststart",
            str(final_output_path),
        ]
        print(f"Ejecutando: {' '.join(cmd[:12])}…")
        try:
            res = subprocess.run(cmd, capture_output=True, encoding="utf-8", timeout=300)
            if res.returncode != 0 or not final_output_path.exists():
                print(f"[ffmpeg] stderr:\n{res.stderr[-1500:]}")
                sys.exit(1)
            size_mb = final_output_path.stat().st_size / (1024 * 1024)
            print(f"[ffmpeg] OK — {size_mb:.2f} MB en {final_output_path}")
        except subprocess.TimeoutExpired:
            print("Error: ffmpeg timeout (>300s)")
            sys.exit(1)
        except FileNotFoundError:
            print("Error: ffmpeg no instalado. 'sudo apt-get install -y ffmpeg'")
            sys.exit(1)

    # 4. Save to runs.json (Gripe 2 + 4 + 6).
    video_url = f"https://api.goalchain.fun/pilot/{final_output_name}"

    if not args.dry_run:
        # Gripe 2: image_prompt / video_prompt réels (no placeholders).
        all_image_prompts = " | ".join(
            (s.get("visual_prompt") or "")
            for s in scene_records if s.get("status") == "ok"
        )
        all_video_prompts = " | ".join(
            (s.get("animation_prompt") or "")
            for s in scene_records if s.get("status") == "ok"
        )

        # Gripe 4: marketing enrichment — variants, arc, hashtags, quality.
        enrichment = {}
        try:
            if ABTESTER_OK and pick_variants is not None:
                enrichment.update(pick_variants(args.account))
            if ARC_OK and assign_arc is not None:
                enrichment.update(assign_arc(args.account, args.topic or "Mundial 2026"))
            if HASHTAGS_OK and choose_hashtags is not None:
                existing = set(re.findall(r"#\w+", post_text))
                hashtags = choose_hashtags(args.topic or args.account, args.account)
                new_tags = [t for t in hashtags if t not in existing]
                if new_tags:
                    post_text = post_text.rstrip() + "\n\n" + " ".join(new_tags)
                enrichment["hashtags"] = hashtags
        except Exception as _e:
            print(f"[Aviso] marketing enrichment partial-failed: {_e}")
        quality_record = None
        if QUALITY_OK and score_quality is not None:
            try:
                quality_record = score_quality({
                    "post_text": post_text,
                    "image_prompt": all_image_prompts,
                    "video_prompt": all_video_prompts,
                })
                enrichment["quality_score"] = quality_record
            except Exception as _e:
                print(f"[Aviso] quality scorer falló: {_e}")

        update_run_state(args.run_id, {
            "status": "planned",  # Gripe G6: stay planned until human approves.
            "account_name": args.account,
            "topic": args.topic or f"Mundial 2026 Resumen: {datetime.now().strftime('%Y-%m-%d')}",
            "video_url": video_url,
            "image_url": "",
            "post_text": post_text,
            "image_prompt": all_image_prompts or "(compilation)",
            "video_prompt": all_video_prompts or "(concatenated via ffmpeg)",
            "scenes": scene_records,   # full per-scene breakdown
            "long_video": True,
            "scene_count_ok": sum(1 for s in scene_records if s.get("status") == "ok"),
            "scene_count_failed": sum(1 for s in scene_records if s.get("status") == "failed"),
            "scene_count_blocked": sum(1 for s in scene_records if s.get("status", "").startswith("blocked-")),
            "ffmpeg_re_encoded": True,
            "comments": [],
            **enrichment,
        })
        print(f"Registro de ejecución '{args.run_id}' guardado en runs.json con estado 'planned'.")

    # Cleanup
    try:
        concat_file.unlink()
        # Only delete compile_dir contents in dry-run.
        if args.dry_run and compile_dir.exists():
            for p in compile_dir.iterdir():
                try:
                    p.unlink()
                except Exception:
                    pass
            try:
                compile_dir.rmdir()
            except Exception:
                pass
    except Exception as e:
        print(f"Aviso: cleanup parcial: {e}")

    print("\nProceso finalizado con éxito.")

if __name__ == "__main__":
    main()
