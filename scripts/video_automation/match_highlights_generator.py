#!/usr/bin/env python3
import os
import sys
import json
import time
import shlex
import re
import argparse
import subprocess
import platform
import random
from pathlib import Path
from datetime import datetime, timezone

# Force UTF-8 stdout/stderr encoding for Windows console environments
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')


# Setup paths relative to the project base
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))

# Load configs and imports
from config import ACCOUNTS, ELEVENLABS_API_KEY, OUTPUT_DIR
from script_generator import call_llm
from grok_super_pipeline import (
    generate_image_on_vps,
    generate_video_on_vps,
    post_to_buffer,
    CHANNEL_IDS,
    ssh_run,
    update_run_state
)
from video_builder import generate_voiceover, get_audio_duration

MATCHUPS = [
    "México vs Sudáfrica",
    "Argentina vs Portugal",
    "Brasil vs Francia",
    "España vs Inglaterra",
    "Alemania vs Italia",
    "Uruguay vs Ghana",
    "EEUU vs México",
    "Colombia vs Países Bajos"
]

def get_mock_screenplay(matchup: str) -> dict:
    return {
        "post_text": f"¡La emoción de la Copa del Mundo en GoalChain! 🏆🔥 {matchup}: el momento más caliente del partido. ¿Apostaste en contra? Con GoalChain en Solana tomas el control de tus predicciones con contratos inteligentes. #WorldCup2026 #GoalChain #Solana",
        "scenes": [
            {
                "scene_num": 1,
                "narration": f"¡Locura total en el minuto noventa y tres del {matchup}!",
                "visual_prompt": f"Dramatic photo of football players celebrating on the pitch, slow motion, stadium lights flare, vertical 9:16",
                "animation_prompt": "Camera zooms in smoothly on the celebrating player, fans cheering in the background"
            },
            {
                "scene_num": 2,
                "narration": "Falta dramática en el área. El árbitro señala penal. ¡Tensión absoluta!",
                "visual_prompt": "Close-up of a football player placing the ball on the penalty spot, cinematic low-angle shot, stadium lights, vertical 9:16",
                "animation_prompt": "Camera pans slowly around the player's face, sweat dripping, high tension"
            },
            {
                "scene_num": 3,
                "narration": "¿Apostaste en contra? Con GoalChain en Solana, tomas el control.",
                "visual_prompt": "Solana green coin glowing inside a digital vault, soccer ball pattern, vertical 9:16",
                "animation_prompt": "Vault doors open slowly, revealing the glowing Solana coins"
            },
            {
                "scene_num": 4,
                "narration": "Entra a goalchain.fun y apuesta por ti mismo hoy. ¡Link en bio!",
                "visual_prompt": "High quality 3D render of a smartphone screen showing goalchain.fun dashboard, white glow, vertical 9:16",
                "animation_prompt": "Smooth camera slide down, highlighting the prediction cards and call-to-action button"
            }
        ]
    }

def generate_match_screenplay(matchup: str, account_name: str, dry_run: bool = False) -> dict:
    """Generate a 4-scene screenplay of the match's hottest moments"""
    if dry_run:
        print("[Dry-Run] Usando guión de mockup local.")
        return get_mock_screenplay(matchup)
        
    niche = ACCOUNTS.get(account_name, {}).get("niche", "Mundial 2026 y predicciones de fútbol")
    
    prompt = f"""
    Eres Hermes, director de contenido estrella de GoalChain.
    Crea un guión dinámico, adictivo y de alta retención para un video vertical (9:16) de Shorts/TikTok sobre los momentos más calientes del partido de fútbol: "{matchup}".
    Nicho de la cuenta: "{niche}".
    
    El video constará de exactamente 4 escenas secuenciales (de unos 4 segundos cada una).
    
    Estructura del guión por escenas:
    - Escena 1 (Hook/Gancho): Mención directa al partido y al escenario dramático inicial (ej. "¡Locura total en el minuto 93 del {matchup}!").
    - Escena 2 (Context/Contexto): Describe la jugada crítica o el momento más tenso del partido (el "hottest moment" como una falta dramática, tiro libre, etc.).
    - Escena 3 (Mechanism/Mecanismo): El desenlace de la jugada (el gol, la atajada, el penal). Conecta directamente con GoalChain (ej. "¿Apostaste en contra? Con GoalChain en Solana tomas el control con contratos inteligentes...").
    - Escena 4 (Twist/CTA): Cierre divertido, irónico y llamado a la acción directo (ej. "Entra a goalchain.fun y apuesta por ti mismo hoy. Link en bio.").
    
    CRITICAL JSON RULES:
    1. Devuelve ÚNICAMENTE un bloque JSON válido. No incluyas texto de introducción o despedida.
    2. Las comillas dobles (") SOLAMENTE deben usarse para delimitar claves y valores de cadenas JSON.
    3. CUALQUIER comilla dentro del texto DEBE ser comilla simple ('). NUNCA uses comillas dobles sin escapar dentro de un valor.
    
    Devuelve la respuesta en este formato exacto:
    {{
        "post_text": "Texto completo para el pie del video en español, con emojis y 3-5 hashtags relevantes.",
        "scenes": [
            {{
                "scene_num": 1,
                "narration": "Texto corto y enérgico que se narrará en esta escena (en español, oraciones cortas, máx 15 palabras)",
                "visual_prompt": "Prompt en inglés detallado de la acción visual en esta escena (estilo foto de acción deportiva de alta definición, cámara lenta, estadio, sin texto en la imagen, sin comillas dobles)",
                "animation_prompt": "Prompt en inglés describiendo la animación o movimiento de cámara lenta para dar vida a esa escena (sin comillas dobles)"
            }},
            {{
                "scene_num": 2,
                "narration": "Texto corto y enérgico que se narrará en esta escena",
                "visual_prompt": "Prompt en inglés detallado de la acción visual en esta escena",
                "animation_prompt": "Prompt en inglés describiendo la animación o movimiento de cámara"
            }},
            {{
                "scene_num": 3,
                "narration": "Texto corto y enérgico que se narrará en esta escena",
                "visual_prompt": "Prompt en inglés detallado de la acción visual en esta escena",
                "animation_prompt": "Prompt en inglés describiendo la animación o movimiento de cámara"
            }},
            {{
                "scene_num": 4,
                "narration": "Texto corto y enérgico que se narrará en esta escena",
                "visual_prompt": "Prompt en inglés detallado de la acción visual en esta escena",
                "animation_prompt": "Prompt en inglés describiendo la animación o movimiento de cámara"
            }}
        ]
    }}
    """
    
    print(f"[{account_name}] Generando guión para {matchup} usando Grok CLI del VPS...")
    cmd = f"/home/ubuntu/.local/bin/grok --single {shlex.quote(prompt)}"
    raw_response = ssh_run(cmd)
    
    # Strip markdown block quotes
    cleaned = raw_response.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as jde:
        print(f"[Aviso] Falló análisis JSON estándar: {jde}. Intentando limpieza de comillas...")
        # Replace unescaped double quotes with single quotes inside values
        fixed_str = re.sub(r'(?<![:{\[,])"(?![:}\],])', "'", cleaned)
        try:
            data = json.loads(fixed_str)
        except Exception as e:
            print("=== RAW RESPONSE THAT FAILED TO PARSE ===")
            print(cleaned)
            raise RuntimeError(f"Error parseando JSON del guión: {e}. Respuesta original: {cleaned[:500]}")
    
    # Normalize keys of screenplay
    normalized_scenes = []
    for scene in data.get("scenes", []):
        def safe_get(scene_dict, keys):
            for k in keys:
                if k in scene_dict:
                    return scene_dict[k]
                for dk in scene_dict.keys():
                    if dk.lower() == k.lower():
                        return scene_dict[dk]
            return ""
            
        normalized_scenes.append({
            "scene_num": safe_get(scene, ["scene_num", "sceneNum", "scene_number", "number"]),
            "narration": safe_get(scene, ["narration", "text", "voice", "voiceover", "narracion"]),
            "visual_prompt": safe_get(scene, ["visual_prompt", "visualPrompt", "image_prompt", "prompt_image", "visual"]),
            "animation_prompt": safe_get(scene, ["animation_prompt", "animationPrompt", "video_prompt", "prompt_video", "animation"])
        })
        
    data["scenes"] = normalized_scenes
    return data

def format_subtitles(text: str, max_chars: int = 25) -> str:
    escaped = text.replace("'", "'\\''").replace(":", "\\:")
    words = escaped.split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(" ".join(current_line)) > max_chars:
            lines.append(" ".join(current_line))
            current_line = []
    if current_line:
        lines.append(" ".join(current_line))
    return "\n".join(lines)

def get_font_path() -> str:
    if platform.system() == "Windows":
        return "C\\:/Windows/Fonts/arial.ttf"
    else:
        # standard Ubuntu/Debian paths
        paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/msttcorefonts/Arial.ttf"
        ]
        for p in paths:
            if os.path.exists(p):
                return p
        return "arial.ttf" # fallback to ffmpeg system default search

def compile_match_video(screenplay: dict, account_name: str, run_id: str, dry_run: bool = False) -> Path:
    temp_dir = OUTPUT_DIR / f"compile_{run_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    scenes = screenplay.get("scenes", [])
    voice_preset = ACCOUNTS.get(account_name, {}).get("voice_preset", "antoni")
    
    video_parts = []
    font_path = get_font_path()
    
    print(f"Font seleccionada: {font_path}")
    
    for i, scene in enumerate(scenes):
        scene_num = scene.get("scene_num", i + 1)
        narration = scene.get("narration", "")
        visual_prompt = scene.get("visual_prompt", "")
        animation_prompt = scene.get("animation_prompt", "")
        
        print(f"\n--- Procesando escena {scene_num}/4 ---")
        print(f"Narración: {narration}")
        
        audio_path = temp_dir / f"scene_{scene_num}.mp3"
        subvideo_path = temp_dir / f"scene_{scene_num}_comp.mp4"
        
        if dry_run:
            # Touch dummy paths in dry-run
            audio_path.touch()
            # Create a 4 second dummy clip using ffmpeg lavfi if ffmpeg available
            cmd = [
                "ffmpeg", "-y",
                "-f", "lavfi", "-i", "color=c=black:s=720x1280",
                "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                "-t", "4.0",
                "-pix_fmt", "yuv420p",
                str(subvideo_path)
            ]
            try:
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                print(f"[Dry-Run] Escena {scene_num} simulada.")
                video_parts.append(subvideo_path)
            except Exception as e:
                print(f"[Dry-Run] Error creando video simulado: {e}")
            continue
            
        # 1. Generate Voiceover
        generate_voiceover(narration, voice_preset, audio_path)
        duration = get_audio_duration(audio_path)
        print(f"Duración del audio de escena {scene_num}: {duration:.2f}s")
        
        # 2. Generate Image & Video via Grok VPS
        try:
            img_name = generate_image_on_vps(visual_prompt)
            vid_name = generate_video_on_vps(animation_prompt, img_name)
            
            # The generated video is copied to VPS outputs directory
            vid_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / vid_name
            if not vid_path.exists():
                local_fallback = OUTPUT_DIR / vid_name
                if local_fallback.exists():
                    vid_path = local_fallback
                else:
                    raise FileNotFoundError(f"No se encontró el video generado: {vid_name}")
        except Exception as e:
            print(f"⚠️ Error generando medios con Grok CLI: {e}. Usando video de color de fallback.")
            vid_path = temp_dir / f"fallback_{scene_num}.mp4"
            fallback_cmd = [
                "ffmpeg", "-y",
                "-f", "lavfi", "-i", f"color=c=darkblue:s=720x1280",
                "-t", f"{duration:.2f}",
                "-pix_fmt", "yuv420p",
                str(vid_path)
            ]
            subprocess.run(fallback_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            
        # 3. Burn Subtitles and Concatenate Voiceover
        display_text = format_subtitles(narration)
        
        cmd = [
            "ffmpeg", "-y",
            "-stream_loop", "10",
            "-i", str(vid_path),
            "-i", str(audio_path),
            "-filter_complex", f"[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,drawtext=fontfile='{font_path}':text='{display_text}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.6:boxborderw=10[v]",
            "-map", "[v]",
            "-map", "1:a",
            "-t", f"{duration:.2f}",
            "-pix_fmt", "yuv420p",
            str(subvideo_path)
        ]
        
        print(f"Ensamblando subvideo para escena {scene_num}...")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        video_parts.append(subvideo_path)
        
    # 4. Concat all subvideos
    raw_output = temp_dir / "raw_concat.mp4"
    concat_list_path = temp_dir / "concat_list.txt"
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for vp in video_parts:
            f.write(f"file '{vp.resolve()}'\n")
            
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list_path),
        "-c", "copy",
        str(raw_output)
    ]
    print("\nConcatenando todas las escenas...")
    subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # 5. Apply Logo and Stadium Ambience Audio
    final_output_name = f"grok_match_{run_id}.mp4"
    final_output = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / final_output_name
    if not final_output.parent.exists():
        final_output = OUTPUT_DIR / final_output_name
        
    crowd_bg = BASE_DIR / "scripts" / "marketing" / "video-automation" / "assets" / "crowd_ambience.ogg"
    logo_path = Path("C:/Users/NicoPez/.gemini/antigravity/brain/43bd1cc1-1655-490b-afc9-34b4874847e7/media__1782343968714.jpg")
    if not logo_path.exists():
        logo_path = BASE_DIR / "scripts" / "marketing" / "video-automation" / "assets" / "logo.jpg"
        
    # Filter configuration
    has_logo = logo_path.exists()
    has_crowd = crowd_bg.exists()
    
    print(f"Post-producción: logo={has_logo}, crowd_ambience={has_crowd}")
    
    inputs = ["-i", str(raw_output)]
    input_index = 1
    filters = []
    
    if has_crowd:
        inputs += ["-i", str(crowd_bg)]
        crowd_idx = input_index
        input_index += 1
        audio_filter = f"[0:a]volume=1.0[orig];[{crowd_idx}:a]volume=0.15[bg];[orig][bg]amix=inputs=2:duration=first[out_a]"
        filters.append(audio_filter)
        audio_map = "[out_a]"
    else:
        audio_map = "0:a"
        
    if has_logo:
        inputs += ["-i", str(logo_path)]
        logo_idx = input_index
        input_index += 1
        is_png = logo_path.suffix.lower() == ".png"
        logo_filter = f"[{logo_idx}:v]" + ("scale=110:-1[logo];" if is_png else "colorkey=0xFFFFFF:0.12:0.05,scale=110:-1[logo];") + f"[0:v][logo]overlay=W-w-15:15[out_v]"
        filters.append(logo_filter)
        video_map = "[out_v]"
    else:
        video_map = "0:v"
        
    mix_cmd = ["ffmpeg", "-y"] + inputs
    if filters:
        mix_cmd += ["-filter_complex", ";".join(filters)]
    mix_cmd += ["-map", video_map, "-map", audio_map]
    
    # In dry-run, just copy or skip re-encoding
    if dry_run:
        mix_cmd += ["-c", "copy"]
    else:
        mix_cmd += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac"]
        
    mix_cmd.append(str(final_output))
    
    print("Aplicando efectos de post-producción final...")
    subprocess.run(mix_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Cleanup temp directory
    for file in temp_dir.glob("*"):
        try:
            file.unlink()
        except:
            pass
    try:
        temp_dir.rmdir()
    except:
        pass
        
    print(f"¡Compilación de video finalizada!: {final_output}")
    return final_output

def main():
    parser = argparse.ArgumentParser(description="Hermes World Cup Match Highlights Generator")
    parser.add_argument("--match", type=str, help="Matchup name (e.g. 'Argentina vs Portugal')")
    parser.add_argument("--account", choices=["NicoPezDorado", "GoalChainSol"], default="GoalChainSol", help="Target account name")
    parser.add_argument("--dry-run", action="store_true", help="Simulate video and audio generation")
    parser.add_argument("--run-id", type=str, help="Custom run ID")
    
    args = parser.parse_args()
    
    run_id = args.run_id or f"run_{int(time.time())}_match_{args.account.lower()}"
    matchup = args.match or random.choice(MATCHUPS)
    
    print(f"Iniciando generador de Match Highlights para: {matchup} (Run ID: {run_id}, Account: {args.account}, Dry-Run: {args.dry_run})")
    
    # 1. Screenplay
    try:
        screenplay = generate_match_screenplay(matchup, args.account, dry_run=args.dry_run)
        print("\n=== Guión Generado ===")
        print(f"Post Text: {screenplay.get('post_text')[:120]}...")
        for scene in screenplay.get("scenes", []):
            print(f"Scene {scene.get('scene_num')}: {scene.get('narration')}")
    except Exception as e:
        print(f"Error generando guión: {e}")
        sys.exit(1)
        
    # 2. Compile video
    try:
        final_video_path = compile_match_video(screenplay, args.account, run_id, dry_run=args.dry_run)
    except Exception as e:
        print(f"Error compilando video: {e}")
        sys.exit(1)
        
    # 3. Schedule via Buffer
    if args.dry_run:
        print("\n[Dry-Run] Omitiendo publicación en Buffer.")
        return
        
    video_url = f"https://api.goalchain.fun/pilot/{final_video_path.name}"
    post_text = screenplay.get("post_text", f"¡Momento más caliente del partido {matchup}!")
    
    channels = CHANNEL_IDS.get(args.account, [])
    for channel_id in channels:
        try:
            res = post_to_buffer(channel_id, post_text, video_url, all_channels=channels)
            print(f"✅ Programado en Buffer para el canal {channel_id}: {res}")
        except Exception as e:
            print(f"❌ Error programando en canal {channel_id}: {e}")
            
    # Update run state
    update_run_state(run_id, {
        "status": "published",
        "account_name": args.account,
        "topic": f"Highlights: {matchup}",
        "video_url": video_url,
        "post_text": post_text,
        "image_prompt": "AI Soccer Match Action Render",
        "video_prompt": "AI Soccer Animation Sequence",
        "comments": []
    })

if __name__ == "__main__":
    main()
