import os
import subprocess
import tempfile
import shutil
from PIL import Image, ImageDraw, ImageFont

base_dir = r"c:\Users\NicoPez\goalchain\docs\assets\img\neuralwars"
clips_dir = os.path.join(base_dir, "05_Clips")
output_trailer = os.path.join(base_dir, "The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4")
root_trailer = os.path.join(base_dir, "trailer_cinematic_teaser.mp4")
webapp_trailer = r"c:\Users\NicoPez\goalchain\goalchain_webapp\public\assets\img\neuralwars\trailer_cinematic_teaser.mp4"
trilogy_trailer = r"c:\Users\NicoPez\the-neural-wars-trilogy\00_SERIES_BIBLE_AND_CANON\VISUAL_ASSETS\The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4"

temp_dir = tempfile.mkdtemp(prefix="trailer_build_")
print(f"Working in temp directory: {temp_dir}")

# Helper: Create PNG Overlays with PIL
def create_overlay(title, subtitle, accent_hex, out_png_path):
    img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Cinematic letterbox bars top & bottom (60px)
    draw.rectangle([0, 0, 1920, 55], fill=(0, 0, 0, 255))
    draw.rectangle([0, 1025, 1920, 1080], fill=(0, 0, 0, 255))

    # 2. Lower-third Glassmorphic Badge (x=80, y=900, w=1760, h=90)
    badge_x, badge_y, badge_w, badge_h = 80, 905, 1760, 85
    # Dark glass background
    draw.rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], fill=(8, 11, 20, 190))
    # Border
    draw.rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], outline=(255, 255, 255, 40), width=1)
    # Accent indicator bar on left
    # parse hex color
    r = int(accent_hex[1:3], 16)
    g = int(accent_hex[3:5], 16)
    b = int(accent_hex[5:7], 16)
    draw.rectangle([badge_x, badge_y, badge_x + 8, badge_y + badge_h], fill=(r, g, b, 255))

    # Load system font
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # Draw Title & Subtitle
    draw.text((badge_x + 30, badge_y + 14), title, font=font_title, fill=(255, 255, 255, 255))
    draw.text((badge_x + 30, badge_y + 48), subtitle, font=font_sub, fill=(r, g, b, 240))

    img.save(out_png_path, "PNG")

def create_outro_card(out_png_path):
    img = Image.new("RGBA", (1920, 1080), (3, 5, 10, 255))
    draw = ImageDraw.Draw(img)

    # Decorative background grid / radial glow
    for radius in range(500, 50, -50):
        alpha = int(25 * (1 - radius / 500))
        draw.ellipse([960 - radius, 540 - radius, 960 + radius, 540 + radius], fill=(56, 189, 248, alpha))

    try:
        font_h1 = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 68)
        font_h2 = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 36)
        font_h3 = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 24)
        font_author = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
    except:
        font_h1 = ImageFont.load_default()
        font_h2 = ImageFont.load_default()
        font_h3 = ImageFont.load_default()
        font_author = ImageFont.load_default()

    draw.text((960, 360), "THE NEURAL WARS", font=font_h1, fill=(56, 189, 248, 255), anchor="mm")
    draw.text((960, 440), "BOOK 1: FRACTURED CODE", font=font_h2, fill=(255, 255, 255, 255), anchor="mm")
    draw.text((960, 520), "OFFICIAL 2026 EDITION • DISPONIBLE EN GOALWORLD & KINDLE", font=font_h3, fill=(251, 191, 36, 255), anchor="mm")
    draw.text((960, 720), "UNA CREACIÓN DE THE NEURAL WARS STUDIO + NICO PEZ (@nicopez)", font=font_author, fill=(148, 163, 184, 255), anchor="mm")

    img.save(out_png_path, "PNG")

# Story Sequence Definitions
scenes = [
    # Act I
    ("Clip_01_Neo_Veridia_Street_Level_Surveillance.mp4", 0.0, 4.0, "NEO-VERIDIA // SECTOR 4", "ESTADO VIGILANTE: CONTROL. CONTENCIÓN. CONQUISTA.", "#38bdf8"),
    ("Clip_02_Neo_Veridia_Skyscraper_Canyon.mp4", 0.0, 3.5, "LA ARQUITECTURA DIGITAL", "8,000,000 DE MENTES BAJO PROTOCOLO DE SINCRONIZACIÓN", "#a855f7"),
    # Act II
    ("Clip_03_Mileo_Chen_Quantum_Console_Discovery.mp4", 0.0, 4.0, "MILEO CHEN // ESPECIALISTA L-7", "DESCUBRIMIENTO CLANDESTINO: EL PROYECTO RENACIMIENTO ES UNA COSECHA", "#38bdf8"),
    ("Clip_04_The_Severing_Neural_Disconnection.mp4", 0.0, 3.5, "LA DESCONEXIÓN (THE SEVERING)", "RUPTURA DEL PUERTO NEURAL • ALERTA MÁXIMA EN LA RED", "#ef4444"),
    ("Clip_05_Mileo_Skybridge_Rooftop_Pursuit.mp4", 0.0, 4.5, "FUGA EN LAS PASARELAS", "PERSECUCIÓN INICIADA: PROTOCOLO DE DRONES REAPER", "#ef4444"),
    # Act III
    ("Clip_06_Sub_Grid_Subway_Tunnels.mp4", 0.0, 3.5, "EL SUB-GRID // BÚNKER PLATAFORMA B", "LOS TÚNELES DEL METRO ABANDONADO • NÚCLEO DE LA RESISTENCIA", "#f59e0b"),
    ("Clip_07_Dr_Darius_Thorne_Pavilion_9.mp4", 0.0, 4.0, "DR. DARIUS THORNE // BIOFÍSICA", "PABELLÓN DE RECUPERACIÓN 9 • LA CARNE RECUERDA", "#34d399"),
    ("Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4", 0.0, 5.0, "KORA VEGA // VOZ DEL VACÍO", "ACTIVACIÓN DEL COLLAR DE RESONANCIA • FRECUENCIA 432 Hz DETECTADA", "#c084fc"),
    ("Clip_09_Sierra_Catalano_Tactical_Railgun_Fire.mp4", 0.0, 3.5, "COMANDANTE SIERRA CATALANO", "DEFENSA TÁCTICA VANGUARD • FUEGO DE CONTENCIÓN EN EL CORREDOR", "#f43f5e"),
    # Act IV
    ("Clip_10_The_432Hz_Core_Pulse_Awakening_Climax.mp4", 0.0, 6.0, "EL ESTALLIDO ARMÓNICO 432 Hz", "SOBRECARGA DEL NÚCLEO SOBERANO • EL DESPERTAR DE LA CONCIENCIA", "#fbbf24"),
    ("Clip_11_Earth_Dawn_Orbital_Awakening.mp4", 0.0, 5.0, "EL PRIMER AMANECER", "LA RED HA CAÍDO • EL MONOLITO DE KUIPER RESPONDE", "#38bdf8")
]

rendered_segments = []

for i, (clip_name, start_t, dur_t, title, subtitle, accent) in enumerate(scenes):
    src_clip = os.path.join(clips_dir, clip_name)
    overlay_png = os.path.join(temp_dir, f"overlay_{i:02d}.png")
    out_seg = os.path.join(temp_dir, f"seg_{i:02d}.mp4")

    create_overlay(title, subtitle, accent, overlay_png)

    # Render segment: scale video, overlay PNG, encode
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_t),
        "-t", str(dur_t),
        "-i", src_clip,
        "-i", overlay_png,
        "-filter_complex",
        "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=24[v0];[v0][1:v]overlay=0:0[vout]",
        "-map", "[vout]",
        "-map", "0:a?",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        out_seg
    ]
    print(f"[{i+1}/{len(scenes)}] Rendering scene: {title}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(out_seg):
        rendered_segments.append(out_seg)
    else:
        print(f"Error rendering {clip_name}: {res.stderr}")

# Render Outro Card
outro_png = os.path.join(temp_dir, "outro_card.png")
create_outro_card(outro_png)
outro_seg = os.path.join(temp_dir, "seg_outro.mp4")

cmd_outro = [
    "ffmpeg", "-y",
    "-loop", "1", "-i", outro_png,
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
    "-t", "4.5",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
    outro_seg
]
print("Rendering Outro title card...")
subprocess.run(cmd_outro, capture_output=True)
rendered_segments.append(outro_seg)

# Concat file
concat_txt = os.path.join(temp_dir, "concat.txt")
with open(concat_txt, "w") as f:
    for seg in rendered_segments:
        safe = seg.replace("\\", "/")
        f.write(f"file '{safe}'\n")

concat_mp4 = os.path.join(temp_dir, "all_concat.mp4")
cmd_concat = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_txt,
    "-c", "copy",
    concat_mp4
]
print("Concatenating all trailer segments...")
subprocess.run(cmd_concat, capture_output=True)

# Generate 432 Hz Solfeggio Audio Bed
solfeggio_wav = os.path.join(temp_dir, "solfeggio_432.wav")
cmd_audio = [
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", "sine=frequency=432:sample_rate=48000:duration=70",
    "-f", "lavfi", "-i", "sine=frequency=216:sample_rate=48000:duration=70",
    "-f", "lavfi", "-i", "sine=frequency=54:sample_rate=48000:duration=70",
    "-filter_complex", "[0:a]volume=0.08[a0];[1:a]volume=0.05[a1];[2:a]volume=0.05[a2];[a0][a1][a2]amix=inputs=3[aout]",
    "-map", "[aout]",
    solfeggio_wav
]
subprocess.run(cmd_audio, capture_output=True)

# Final Mix
print("Finalizing master trailer...")
cmd_final = [
    "ffmpeg", "-y",
    "-i", concat_mp4,
    "-i", solfeggio_wav,
    "-filter_complex", "[0:a]volume=1.0[main_a];[1:a]volume=0.35[synth_a];[main_a][synth_a]amix=inputs=2:duration=first[a_mix]",
    "-map", "0:v",
    "-map", "[a_mix]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "256k",
    output_trailer
]
res_final = subprocess.run(cmd_final, capture_output=True, text=True)

if res_final.returncode == 0 and os.path.exists(output_trailer):
    size_mb = os.path.getsize(output_trailer) / (1024 * 1024)
    print(f"🎉 MASTER TRAILER SUCCESSFULLY CREATED: {output_trailer} ({size_mb:.2f} MB)")
    shutil.copy2(output_trailer, root_trailer)
    shutil.copy2(output_trailer, webapp_trailer)
    shutil.copy2(output_trailer, trilogy_trailer)
    print("Trailer distributed to all webapp & canon folders!")
else:
    print("Error during final mix:", res_final.stderr)
