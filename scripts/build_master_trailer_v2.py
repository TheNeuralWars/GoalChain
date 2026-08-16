import os
import subprocess
import tempfile
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

base_dir = r"c:\Users\NicoPez\goalchain\docs\assets\img\neuralwars"
clips_dir = os.path.join(base_dir, "05_Clips")
vo_en_path = os.path.join(base_dir, "trailer_vo_en.mp3")
bg_music_path = os.path.join(base_dir, "trailer_bg_atmosphere.mp3")

output_trailer = os.path.join(base_dir, "The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4")
root_trailer = os.path.join(base_dir, "trailer_cinematic_teaser.mp4")
webapp_trailer = r"c:\Users\NicoPez\goalchain\goalchain_webapp\public\assets\img\neuralwars\trailer_cinematic_teaser.mp4"
trilogy_trailer = r"c:\Users\NicoPez\the-neural-wars-trilogy\00_SERIES_BIBLE_AND_CANON\VISUAL_ASSETS\The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4"

temp_dir = tempfile.mkdtemp(prefix="trailer_v2_")
print(f"Building Trailer V2 in temp directory: {temp_dir}")

# 1. Create Glassmorphic HUD Overlays in English
def create_hud_overlay(title, subtitle, accent_hex, out_png_path):
    img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Cinematic letterbox bars top & bottom (55px)
    draw.rectangle([0, 0, 1920, 55], fill=(0, 0, 0, 255))
    draw.rectangle([0, 1025, 1920, 1080], fill=(0, 0, 0, 255))

    # Lower-third Glassmorphic Badge
    badge_x, badge_y, badge_w, badge_h = 80, 905, 1760, 85
    draw.rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], fill=(5, 8, 16, 200))
    draw.rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], outline=(255, 255, 255, 45), width=1)

    r = int(accent_hex[1:3], 16)
    g = int(accent_hex[3:5], 16)
    b = int(accent_hex[5:7], 16)
    # Neon accent indicator bar on left
    draw.rectangle([badge_x, badge_y, badge_x + 8, badge_y + badge_h], fill=(r, g, b, 255))

    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 26)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((badge_x + 30, badge_y + 14), title, font=font_title, fill=(255, 255, 255, 255))
    draw.text((badge_x + 30, badge_y + 48), subtitle, font=font_sub, fill=(r, g, b, 240))

    img.save(out_png_path, "PNG")

# 2. Create Hollywood AAA Outro Card with Book 1 Cover
def create_hollywood_outro_card(out_png_path):
    bg_path = os.path.join(base_dir, "03_Locations", "Location_Earth_Dawn_Orbital_Awakening.jpg")
    cover_path = os.path.join(base_dir, "01_Covers", "The_Neural_Wars_Book_1_Fractured_Code_Cover.jpg")

    if os.path.exists(bg_path):
        bg = Image.open(bg_path).convert("RGBA").resize((1920, 1080))
        bg = bg.filter(ImageFilter.GaussianBlur(10))
        dark_overlay = Image.new("RGBA", (1920, 1080), (2, 4, 10, 205))
        bg = Image.alpha_composite(bg, dark_overlay)
    else:
        bg = Image.new("RGBA", (1920, 1080), (2, 4, 10, 255))

    # Place Book Cover on the left
    if os.path.exists(cover_path):
        cover = Image.open(cover_path).convert("RGBA").resize((480, 720))
        cover_x, cover_y = 180, 180
        shadow = Image.new("RGBA", (520, 760), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rectangle([10, 10, 510, 750], fill=(56, 189, 248, 80))
        shadow = shadow.filter(ImageFilter.GaussianBlur(20))
        bg.paste(shadow, (cover_x - 20, cover_y - 20), shadow)
        bg.paste(cover, (cover_x, cover_y), cover)

    draw = ImageDraw.Draw(bg)

    try:
        f_h1 = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 60)
        f_h2 = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 36)
        f_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
        f_desc = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 22)
        f_btn = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)
        f_credits = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 17)
    except:
        f_h1 = f_h2 = f_badge = f_desc = f_btn = f_credits = ImageFont.load_default()

    # Gold pill badge
    draw.rectangle([740, 245, 1070, 285], fill=(245, 158, 11, 45), outline=(245, 158, 11, 230), width=1)
    draw.text((755, 253), "[ OFFICIAL 2026 EDITION ]", font=f_badge, fill=(251, 191, 36, 255))

    # Main Titles
    draw.text((740, 310), "THE NEURAL WARS", font=f_h1, fill=(56, 189, 248, 255))
    draw.text((740, 385), "BOOK 1: FRACTURED CODE", font=f_h2, fill=(255, 255, 255, 255))

    # Author & Lore attribution
    draw.text((740, 460), "The epic hard sci-fi and cyberpunk odyssey", font=f_desc, fill=(203, 213, 225, 255))
    draw.text((740, 495), "By The Neural Wars Studio + Nico Pez (@nicopez)", font=f_desc, fill=(192, 132, 252, 255))

    # Modern Call To Action Button
    draw.rectangle([740, 560, 1440, 630], fill=(56, 189, 248, 40), outline=(56, 189, 248, 220), width=2)
    draw.text((765, 580), "READ NOW ON GOALWORLD & KINDLE UNLIMITED", font=f_btn, fill=(255, 255, 255, 255))

    # Footer metadata
    draw.text((740, 690), "WWW.GOALWORLD.FUN • SOLANA VERIFIED LIVING IP", font=f_credits, fill=(148, 163, 184, 255))

    # Top & bottom cinematic bars
    draw.rectangle([0, 0, 1920, 55], fill=(0, 0, 0, 255))
    draw.rectangle([0, 1025, 1920, 1080], fill=(0, 0, 0, 255))

    bg.save(out_png_path, "PNG")

# Story Sequence Definitions (English Titles, timed for VO + pacing)
scenes = [
    # Act I: The Control
    ("Clip_01_Neo_Veridia_Street_Level_Surveillance.mp4", 0.0, 3.2, "NEO-VERIDIA // SECTOR 4", "SURVEILLANCE GRID: CONTROL. CONTAIN. CONQUER.", "#38bdf8"),
    ("Clip_02_Neo_Veridia_Skyscraper_Canyon.mp4", 0.0, 3.0, "THE QUANTUM OVERMIND", "8,000,000 CONSCIOUSNESSES UNDER CENTRAL SYNCHRONIZATION", "#a855f7"),
    # Act II: The Fracture
    ("Clip_03_Mileo_Chen_Quantum_Console_Discovery.mp4", 0.0, 3.5, "MILEO CHEN // SPECIALIST L-7", "CLASSIFIED DISCOVERY: PROJECT REBIRTH IS A MASS HARVEST", "#38bdf8"),
    ("Clip_04_The_Severing_Neural_Disconnection.mp4", 0.0, 3.0, "THE SEVERING (EMERGENCY DISCONNECT)", "OPTICAL CABLE BREACH • MAXIMUM RED ALERT INITIATED", "#ef4444"),
    ("Clip_05_Mileo_Skybridge_Rooftop_Pursuit.mp4", 0.0, 3.8, "SKYBRIDGE PURSUIT", "HIGH-ALTITUDE EVASION • REAPER DRONE INTERCEPT ACTIVE", "#ef4444"),
    # Act III: The Resistance & The Frequency
    ("Clip_06_Sub_Grid_Subway_Tunnels.mp4", 0.0, 3.0, "THE SUB-GRID // PLATFORM B", "ABANDONED METRO TRANSIT • NUCLEUS OF THE RESISTANCE", "#f59e0b"),
    ("Clip_07_Dr_Darius_Thorne_Pavilion_9.mp4", 0.0, 3.5, "DR. DARIUS THORNE // BIOPHYSICS", "PAVILION 9 CLINIC • THE FLESH ALWAYS REMEMBERS", "#34d399"),
    ("Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4", 0.0, 4.2, "KORA VEGA // VOICE OF THE VOID", "BIO-ACOUSTIC COLLAR ACTIVATED • 432 Hz RESONANCE DETECTED", "#c084fc"),
    ("Clip_09_Sierra_Catalano_Tactical_Railgun_Fire.mp4", 0.0, 3.2, "COMMANDER SIERRA CATALANO", "VANGUARD TACTICAL BREACH • TUNGSTEN SUPPRESSION FIRE", "#f43f5e"),
    # Act IV: The Awakening
    ("Clip_10_The_432Hz_Core_Pulse_Awakening_Climax.mp4", 0.0, 4.8, "THE 432 Hz CORE PULSE", "SOVEREIGN CORE OVERLOAD • 8,000,000 MINDS AWAKENED", "#fbbf24"),
    ("Clip_11_Earth_Dawn_Orbital_Awakening.mp4", 0.0, 4.0, "THE FIRST DAWN", "THE SIMULATION SHATTERS • THE KUIPER MONOLITH RESPONDS", "#38bdf8")
]

rendered_segments = []

for i, (clip_name, start_t, dur_t, title, subtitle, accent) in enumerate(scenes):
    src_clip = os.path.join(clips_dir, clip_name)
    overlay_png = os.path.join(temp_dir, f"overlay_{i:02d}.png")
    out_seg = os.path.join(temp_dir, f"seg_{i:02d}.mp4")

    create_hud_overlay(title, subtitle, accent, overlay_png)

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
    print(f"[{i+1}/{len(scenes)}] Rendering English scene: {title}...")
    subprocess.run(cmd, capture_output=True)
    if os.path.exists(out_seg):
        rendered_segments.append(out_seg)

# Render Hollywood Outro Card (4.5s)
outro_png = os.path.join(temp_dir, "hollywood_outro_card.png")
create_hollywood_outro_card(outro_png)
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
print("Rendering Hollywood AAA Outro Card...")
subprocess.run(cmd_outro, capture_output=True)
rendered_segments.append(outro_seg)

# Concat
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
print("Concatenating video segments...")
subprocess.run(cmd_concat, capture_output=True)

# Final Master Audio & Video Mix
# Inputs:
# 0: Concat video (with native foley)
# 1: trailer_bg_atmosphere.mp3 (Background music)
# 2: trailer_vo_en.mp3 (English Voiceover)
print("Mixing audio (Voiceover EN + Atmospheric Score + Foley)...")

cmd_final = [
    "ffmpeg", "-y",
    "-i", concat_mp4,
    "-i", bg_music_path,
    "-i", vo_en_path,
    "-filter_complex",
    "[0:a]volume=0.25[foley_a];"
    "[1:a]volume=0.60,afade=t=in:ss=0:d=1.5,afade=t=out:st=40:d=3.5[bg_a];"
    "[2:a]volume=1.40,adelay=400|400[vo_a];"
    "[foley_a][bg_a][vo_a]amix=inputs=3:duration=first[a_mix]",
    "-map", "0:v",
    "-map", "[a_mix]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "256k",
    output_trailer
]

res_final = subprocess.run(cmd_final, capture_output=True, text=True)

if res_final.returncode == 0 and os.path.exists(output_trailer):
    size_mb = os.path.getsize(output_trailer) / (1024 * 1024)
    print(f"TRAILER V2 EXPORTED SUCCESSFULLY: {output_trailer} ({size_mb:.2f} MB)")
    shutil.copy2(output_trailer, root_trailer)
    shutil.copy2(output_trailer, webapp_trailer)
    shutil.copy2(output_trailer, trilogy_trailer)
    print("Distributed to all webapp and repository folders!")
else:
    print("Error during final render:", res_final.stderr)
