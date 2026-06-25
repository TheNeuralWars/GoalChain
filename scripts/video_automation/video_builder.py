import os
import json
import urllib.request
import urllib.parse
import subprocess
from pathlib import Path
from config import ELEVENLABS_API_KEY, PEXELS_API_KEY, OUTPUT_DIR, ACCOUNTS
from script_generator import build_full_script

def generate_voiceover(text: str, voice_preset: str, output_path: Path) -> Path:
    """Generate audio from text using ElevenLabs, with a free fallback to Google Translate TTS"""
    print(f"Generando voz para: '{text[:40]}...'")
    
    # Try ElevenLabs if key exists
    if ELEVENLABS_API_KEY:
        # Default voice mapping
        voice_ids = {
            "adam": "pNInz6obpgqjVWtJ45hc",
            "antoni": "ErXwobaYiN019PkySvjV",
        }
        voice_id = voice_ids.get(voice_preset, "pNInz6obpgqjVWtJ45hc")
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "xi-api-key": ELEVENLABS_API_KEY
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                with open(output_path, "wb") as f:
                    f.write(response.read())
            print(f"Audio generado con ElevenLabs: {output_path}")
            return output_path
        except Exception as e:
            print(f"Error con ElevenLabs: {e}. Usando fallback gratuito...")
            
    # Fallback to Google Translate TTS (Free, no credentials needed)
    try:
        quoted_text = urllib.parse.quote(text)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl=es&client=tw-ob&q={quoted_text}"
        
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            with open(output_path, "wb") as f:
                f.write(response.read())
        print(f"Audio generado con Google TTS (gratuito): {output_path}")
        return output_path
    except Exception as e:
        print(f"Error generando audio con Google TTS: {e}. Usando audio silencioso de fallback...")
        
        # Fallback to silent audio using FFmpeg
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", "anullsrc=r=44100:cl=mono",
            "-t", "10",
            str(output_path)
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            print(f"Audio silencioso creado con éxito: {output_path}")
            return output_path
        except Exception as err:
            raise RuntimeError(f"Error generando audio en todos los proveedores, incluyendo fallback silencioso: {err}")

def get_stock_footage(keyword: str, output_path: Path) -> Path:
    """Download vertical stock video from Pexels, with a color background fallback if key is missing/fails"""
    print(f"Buscando video de stock para keyword: '{keyword}'...")
    
    if PEXELS_API_KEY:
        url = f"https://api.pexels.com/videos/search?query={urllib.parse.quote(keyword)}&per_page=3&orientation=portrait"
        try:
            req = urllib.request.Request(
                url,
                headers={"Authorization": PEXELS_API_KEY}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_json = json.loads(response.read().decode("utf-8"))
                videos = res_json.get("videos", [])
                if videos:
                    # Get the lowest resolution vertical video to speed up download/rendering
                    video_files = videos[0].get("video_files", [])
                    # Find a vertical/portrait video file link
                    portrait_files = [f for f in video_files if f.get("width", 0) < f.get("height", 0)]
                    video_url = portrait_files[0]["link"] if portrait_files else video_files[0]["link"]
                    
                    # Download video file
                    video_req = urllib.request.Request(
                        video_url,
                        headers={"User-Agent": "Mozilla/5.0"}
                    )
                    with urllib.request.urlopen(video_req, timeout=10) as video_response:
                        with open(output_path, "wb") as f:
                            f.write(video_response.read())
                    print(f"Video descargado de Pexels: {output_path}")
                    return output_path
        except Exception as e:
            print(f"Error buscando/descargando de Pexels: {e}. Usando fallback...")
            
    # Fallback: Create a solid black/dark background video with FFmpeg
    # This ensures the pipeline works even without Pexels API Key
    print("Creando video de fondo de color (fallback)...")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", "color=c=black:s=720x1280",
        "-t", "10",
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        print(f"Video de fallback creado con éxito: {output_path}")
        return output_path
    except Exception as e:
        raise RuntimeError(f"Error al ejecutar FFmpeg para el video de fallback: {e}. ¿Está FFmpeg instalado?")

def get_audio_duration(audio_path: Path) -> float:
    """Get duration of audio file using ffprobe, fallback to 10.0 if it fails"""
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(audio_path)
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(res.stdout.strip())
    except Exception:
        return 10.0

def build_video(script: dict, account_name: str, video_id: str) -> Path:
    """Compile voiceover, background videos and burn subtitles into the final 9:16 video"""
    account_info = ACCOUNTS[account_name]
    voice_preset = account_info["voice_preset"]
    
    # Temporary paths
    temp_dir = OUTPUT_DIR / f"temp_{video_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    audio_parts = []
    video_parts = []
    
    sections = ["hook", "context", "mechanism", "twist"]
    keywords = {
        "hook": "shocking face" if account_name == "NicoPezDorado" else "solana blockchain",
        "context": "brain scientific" if account_name == "NicoPezDorado" else "angry friend code",
        "mechanism": "meditation focus" if account_name == "NicoPezDorado" else "smart contract code",
        "twist": "success path" if account_name == "NicoPezDorado" else "winner celebration"
    }
    
    # 1. Generate Audio & Video assets for each section
    for sec in sections:
        text = script[sec]
        kw = keywords[sec]
        
        audio_path = temp_dir / f"{sec}.mp3"
        video_path = temp_dir / f"{sec}.mp4"
        
        generate_voiceover(text, voice_preset, audio_path)
        get_stock_footage(kw, video_path)
        
        # Get actual audio duration to set exact video output duration
        duration = get_audio_duration(audio_path)
        print(f"Duración de audio para {sec}: {duration}s")
        
        # Compile a sub-video matching the length of the audio
        subvideo_path = temp_dir / f"{sec}_comp.mp4"
        
        # Escape text for FFmpeg drawtext filter
        escaped_text = text.replace("'", "'\\''").replace(":", "\\:")
        
        # Split text into lines for readable display
        words = escaped_text.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            if len(" ".join(current_line)) > 25:
                lines.append(" ".join(current_line))
                current_line = []
        if current_line:
            lines.append(" ".join(current_line))
        display_text = "\n".join(lines)
        
        # Get a standard Windows font path to avoid drawtext crash
        font_path = "C\\:/Windows/Fonts/arial.ttf"
        
        cmd = [
            "ffmpeg", "-y",
            "-stream_loop", "10",  # Loop finite number of times to cover duration
            "-i", str(video_path),
            "-i", str(audio_path),
            "-filter_complex", f"[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,drawtext=fontfile='{font_path}':text='{display_text}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.6:boxborderw=10[v]",
            "-map", "[v]",
            "-map", "1:a",
            "-t", f"{duration:.2f}",  # Explicit duration termination (prevents infinite loop hang)
            "-pix_fmt", "yuv420p",
            str(subvideo_path)
        ]
        
        print(f"Ensamblando subvideo para {sec}...")
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        video_parts.append(subvideo_path)
        
    # 2. Concat all subvideos into the final output
    final_output = OUTPUT_DIR / f"{account_name}_{video_id}_final.mp4"
    
    # Create file list for concatenation
    concat_list_path = temp_dir / "concat_list.txt"
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for vp in video_parts:
            # Escape path for FFmpeg list file
            f.write(f"file '{vp.resolve()}'\n")
            
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list_path),
        "-c", "copy",
        str(final_output)
    ]
    
    print(f"Concatenando todos los clips en: {final_output}...")
    subprocess.run(concat_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    # Clean up temporary directory
    for file in temp_dir.glob("*"):
        try:
            file.unlink()
        except:
            pass
    try:
        temp_dir.rmdir()
    except:
        pass
        
    print(f"¡Video final completado con éxito! Guardado en: {final_output}")
    return final_output

if __name__ == "__main__":
    # Test generation with a sample topic
    print("Iniciando prueba completa de generación de video...")
    topic = "El truco psicológico del contrato de autodisciplina"
    account = "NicoPezDorado"
    
    # Step 1: Script
    script = build_full_script(topic, account)
    
    # Step 2: Build video
    build_video(script, account, "test_run")
