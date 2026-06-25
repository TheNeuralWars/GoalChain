import os
import subprocess
from pathlib import Path

def concat_clips(clips_dir: str, logo_path: str, output_path: str):
    """
    Toma los 6 clips generados en la carpeta, los une en secuencia, les agrega 
    el logo con fondo blanco removido en la esquina superior derecha y mezcla 
    el sonido ambiental (crowd_ambience).
    """
    print("=== GoalChain Video Post-Production ===")
    
    clips_path = Path(clips_dir)
    # Listar y ordenar numéricamente los 6 archivos mp4
    clips = sorted(list(clips_path.glob("*.mp4")), key=lambda p: p.name)
    
    # Excluir archivos residuales de salidas anteriores
    clips = [c for c in clips if "final" not in c.name and "concat" not in c.name]
    
    # Crear archivo txt de concatenación para FFmpeg
    temp_list = clips_path / "concat_list.txt"
    with open(temp_list, "w", encoding="utf-8") as f:
        for clip in clips:
            escaped_name = clip.name.replace("'", "'\\''")
            f.write(f"file '{escaped_name}'\n")
            print(f"Añadido a la lista (escapado): {escaped_name}")

    raw_output = clips_path / "match_raw_concat.mp4"
    
    # Paso 1: Concatenar clips directamente sin recompresión
    print("\n--- Paso 1: Uniendo los clips de video en secuencia ---")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(temp_list),
        "-c", "copy",
        str(raw_output)
    ]
    subprocess.run(concat_cmd, check=True)
    print("Clips concatenados temporalmente.")

    # Paso 2: Mezclar con sonido ambiental y overlay de Logo (removiendo fondo blanco)
    print("\n--- Paso 2: Aplicando Logo (sin fondo blanco) y sonido ambiental ---")
    
    project_bg_audio = Path("c:/Users/NicoPez/goalchain/scripts/marketing/video-automation/assets/crowd_ambience.ogg")
    
    # Filtro de video para quitar el blanco (#FFFFFF) con un margen de tolerancia (similarity=0.08)
    # y escalar el logo a un ancho de 110px manteniendo la relación de aspecto.
    video_filter = "[2:v]colorkey=0xFFFFFF:0.08:0.05,scale=110:-1[logo];[0:v][logo]overlay=W-w-15:15[out_v]"
    audio_filter = "[0:a]volume=1.0[orig];[1:a]volume=0.15[bg];[orig][bg]amix=inputs=2:duration=first[out_a]"
    
    if project_bg_audio.exists():
        print(f"Sonido ambiental encontrado: {project_bg_audio}")
        mix_cmd = [
            "ffmpeg", "-y",
            "-i", str(raw_output),
            "-i", str(project_bg_audio),
            "-i", str(logo_path),
            "-filter_complex", f"{video_filter};{audio_filter}",
            "-map", "[out_v]",
            "-map", "[out_a]",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            output_path
        ]
    else:
        print("No se encontró el sonido ambiental en la ruta estándar. Compilando solo con logo.")
        video_filter_no_bg = "[1:v]colorkey=0xFFFFFF:0.08:0.05,scale=110:-1[logo];[0:v][logo]overlay=W-w-15:15[out_v]"
        mix_cmd = [
            "ffmpeg", "-y",
            "-i", str(raw_output),
            "-i", str(logo_path),
            "-filter_complex", video_filter_no_bg,
            "-map", "[out_v]",
            "-map", "0:a",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            output_path
        ]
        
    subprocess.run(mix_cmd, check=True)
    print("Mezcla de video y audio finalizada.")

    # Limpieza
    try:
        temp_list.unlink()
        raw_output.unlink()
    except Exception as e:
        print(f"Error de limpieza menor: {e}")

    print(f"\nPostproduccion lista! Video con Logo y Sonido guardado en: {output_path}")

if __name__ == "__main__":
    concat_clips(
        clips_dir="c:/Users/NicoPez/Videos/Grok/GoalChain/Arg'Por'480",
        logo_path="C:/Users/NicoPez/.gemini/antigravity/brain/43bd1cc1-1655-490b-afc9-34b4874847e7/media__1782343968714.jpg",
        output_path="c:/Users/NicoPez/Videos/Grok/GoalChain/GoalChain_Match_Argentina_Portugal.mp4"
    )
