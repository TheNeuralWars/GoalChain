import os
import subprocess
import tempfile

base_dir = r"c:\Users\NicoPez\goalchain\docs\assets\img\neuralwars"
clips_dir = os.path.join(base_dir, "05_Clips")
output_trailer = os.path.join(base_dir, "The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4")
root_trailer = os.path.join(base_dir, "trailer_cinematic_teaser.mp4")
webapp_trailer = r"c:\Users\NicoPez\goalchain\goalchain_webapp\public\assets\img\neuralwars\trailer_cinematic_teaser.mp4"
trilogy_trailer = r"c:\Users\NicoPez\the-neural-wars-trilogy\00_SERIES_BIBLE_AND_CANON\VISUAL_ASSETS\The_Neural_Wars_Official_Cinematic_Trailer_2026.mp4"

# Timeline sequence of scenes: (clip_filename, start_sec, duration_sec, text_card, card_color)
timeline = [
    # Act I: The Monolithic Grid
    (
        "Clip_01_Neo_Veridia_Street_Level_Surveillance.mp4",
        0.0, 4.0,
        "NEO-VERIDIA // SECTOR 4\n[CONTROL. CONTAIN. CONQUER.]",
        "0x38bdf8"
    ),
    (
        "Clip_02_Neo_Veridia_Skyscraper_Canyon.mp4",
        0.0, 3.5,
        "8,000,000 CONSCIOUSNESSES UNDER SURVEILLANCE",
        "0xa855f7"
    ),
    # Act II: The Fracture
    (
        "Clip_03_Mileo_Chen_Quantum_Console_Discovery.mp4",
        0.0, 4.0,
        "PROJECT REBIRTH DISCOVERED\n[MILEO CHEN // SPECIALIST L-7]",
        "0x38bdf8"
    ),
    (
        "Clip_04_The_Severing_Neural_Disconnection.mp4",
        0.0, 3.5,
        "THE SEVERING INITIATED",
        "0xef4444"
    ),
    (
        "Clip_05_Mileo_Skybridge_Rooftop_Pursuit.mp4",
        0.0, 4.5,
        "PURSUIT // REAPER DRONE PROTOCOL ACTIVE",
        "0xef4444"
    ),
    # Act III: The Resistance & The Frequency
    (
        "Clip_06_Sub_Grid_Subway_Tunnels.mp4",
        0.0, 3.5,
        "THE SUB-GRID // REBEL PLATFORM B",
        "0xf59e0b"
    ),
    (
        "Clip_07_Dr_Darius_Thorne_Pavilion_9.mp4",
        0.0, 4.0,
        "DR. DARIUS THORNE // RECOVERY WARD 9",
        "0x34d399"
    ),
    (
        "Clip_08_Kora_Vega_432Hz_Harmonic_Rings.mp4",
        0.0, 5.0,
        "KORA VEGA // 432 Hz RESONANCE DETECTED",
        "0xc084fc"
    ),
    (
        "Clip_09_Sierra_Catalano_Tactical_Railgun_Fire.mp4",
        0.0, 3.5,
        "COMMANDER SIERRA CATALANO // VANGUARD DEFENSE",
        "0xf43f5e"
    ),
    # Act IV: The Awakening
    (
        "Clip_10_The_432Hz_Core_Pulse_Awakening_Climax.mp4",
        0.0, 6.0,
        "THE SOVEREIGN CORE OVERLOAD\n432 Hz HARMONIC PULSE UNLEASHED",
        "0xfbbf24"
    ),
    (
        "Clip_11_Earth_Dawn_Orbital_Awakening.mp4",
        0.0, 5.0,
        "THE FIRST DAWN // THE AWAKENING BEGINS",
        "0x38bdf8"
    ),
]

temp_dir = tempfile.mkdtemp(prefix="trailer_build_")
print(f"Building cinematic trailer in temp dir: {temp_dir}")

rendered_segments = []

for i, (clip_name, start_t, dur_t, text_overlay, color) in enumerate(timeline):
    src_clip = os.path.join(clips_dir, clip_name)
    out_segment = os.path.join(temp_dir, f"seg_{i:02d}.mp4")

    # Format text for drawtext filter (escape colons and newlines)
    escaped_text = text_overlay.replace(":", "\\:").replace("'", "").replace("\n", "\\\n")

    # FFmpeg filter: scale to 1920x1080, 24fps, add subtle cinematic letterbox bars, title card overlay
    vf = (
        f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
        f"setsar=1,fps=24,"
        f"drawbox=y=0:h=60:color=black@1:t=fill,drawbox=y=1020:h=60:color=black@1:t=fill,"
        f"drawbox=x=80:y=890:w=1760:h=70:color=black@0.65:t=fill,"
        f"drawbox=x=80:y=890:w=6:h=70:color={color}@1:t=fill,"
        f"drawtext=font='Arial':text='{escaped_text}':x=110:y=905:fontsize=24:fontcolor=white:shadowcolor=black@0.8:shadowx=2:shadowy=2"
    )

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start_t),
        "-t", str(dur_t),
        "-i", src_clip,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        out_segment
    ]

    print(f"Rendering segment {i+1}/{len(timeline)}: {clip_name}...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error rendering {clip_name}: {res.stderr}")
    else:
        rendered_segments.append(out_segment)

# Generate Outro Card (4 seconds)
outro_card = os.path.join(temp_dir, "seg_outro.mp4")
outro_vf = (
    "color=c=black:s=1920x1080:d=4.5:r=24,"
    "drawtext=font='Arial':text='THE NEURAL WARS':x=(w-text_w)/2:y=380:fontsize=64:fontcolor=0x38bdf8:shadowcolor=0xa855f7@0.8:shadowx=4:shadowy=4,"
    "drawtext=font='Arial':text='BOOK 1: FRACTURED CODE':x=(w-text_w)/2:y=480:fontsize=36:fontcolor=white,"
    "drawtext=font='Arial':text='OFFICIAL 2026 EDITION // AVAILABLE NOW':x=(w-text_w)/2:y=560:fontsize=24:fontcolor=0xfbbf24,"
    "drawtext=font='Arial':text='THE NEURAL WARS STUDIO + NICO PEZ':x=(w-text_w)/2:y=720:fontsize=20:fontcolor=0x94a3b8"
)
cmd_outro = [
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
    "-f", "lavfi", "-i", outro_vf,
    "-t", "4.5",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k",
    outro_card
]
subprocess.run(cmd_outro, capture_output=True)
rendered_segments.append(outro_card)

# Concatenate all segments with concat demuxer
concat_file = os.path.join(temp_dir, "concat.txt")
with open(concat_file, "w") as f:
    for seg in rendered_segments:
        # Format path for ffmpeg concat
        safe_path = seg.replace("\\", "/")
        f.write(f"file '{safe_path}'\n")

concat_temp = os.path.join(temp_dir, "raw_concat.mp4")
cmd_concat = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_file,
    "-c", "copy",
    concat_temp
]
print("Concatenating segments...")
subprocess.run(cmd_concat, capture_output=True)

# Generate 432 Hz Solfeggio Harmonic Drone Bed to mix underneath
solfeggio_audio = os.path.join(temp_dir, "solfeggio_432.wav")
# Generate 432 Hz sine wave with subtle 864 Hz harmonic overtone
cmd_synth = [
    "ffmpeg", "-y",
    "-f", "lavfi",
    "-i", "sine=frequency=432:sample_rate=48000:duration=60",
    "-f", "lavfi",
    "-i", "sine=frequency=216:sample_rate=48000:duration=60",
    "-filter_complex", "[0:a]volume=0.08[a0];[1:a]volume=0.04[a1];[a0][a1]amix=inputs=2[aout]",
    "-map", "[aout]",
    solfeggio_audio
]
subprocess.run(cmd_synth, capture_output=True)

# Final Mix: Audio normalization + Solfeggio layer + video encoding
print("Finalizing master trailer with audio mix...")
cmd_final = [
    "ffmpeg", "-y",
    "-i", concat_temp,
    "-i", solfeggio_audio,
    "-filter_complex", "[0:a]volume=1.0[main_a];[1:a]volume=0.45[synth_a];[main_a][synth_a]amix=inputs=2:duration=first[a_mix]",
    "-map", "0:v",
    "-map", "[a_mix]",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "256k",
    output_trailer
]
res_final = subprocess.run(cmd_final, capture_output=True, text=True)
if res_final.returncode == 0:
    print(f"Master trailer successfully exported to: {output_trailer} ({os.path.getsize(output_trailer)} bytes)")
    import shutil
    shutil.copy2(output_trailer, root_trailer)
    shutil.copy2(output_trailer, webapp_trailer)
    shutil.copy2(output_trailer, trilogy_trailer)
    print("Trailer distributed to webapp and repository locations!")
else:
    print(f"Error in final render: {res_final.stderr}")
