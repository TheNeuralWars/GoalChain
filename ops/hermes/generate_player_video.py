#!/usr/bin/env python3
import os
import sys
import json
import random
import argparse
import asyncio
import subprocess
import tempfile
import edge_tts

async def generate_speech(text, output_path, voice="en-US-ChristopherNeural"):
    print(f"Generating speech with edge-tts using voice: {voice}")
    print(f"Text: {text}")
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    print("Speech generation completed.")

def get_player_data(player_id=None, json_path="/home/ubuntu/GoalChain/docs/assets/data/players.json"):
    if not os.path.exists(json_path):
        # Fallback to local path if running on Mac
        json_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../docs/assets/data/players.json"))
        
    with open(json_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    if player_id is not None:
        for p in players:
            if str(p.get("id")) == str(player_id):
                return p
        print(f"Player ID {player_id} not found, choosing a random player.")
        
    return random.choice(players)

def get_audio_duration(audio_path):
    try:
        res = subprocess.run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", audio_path
        ], capture_output=True, text=True, check=True)
        return float(res.stdout.strip())
    except Exception as e:
        print(f"Warning: could not get audio duration: {e}. Defaulting to 25.0 seconds.")
        return 25.0

def main():
    parser = argparse.ArgumentParser(description="GoalChain Faceless Player Spotlight Video Generator")
    parser.add_argument("--player-id", type=int, default=None, help="ID of the player to spotlight")
    parser.add_argument("--output", default="/home/ubuntu/GoalChain/assets/player_spotlight.mp4", help="Output video path")
    parser.add_argument("--voice", default="en-US-ChristopherNeural", help="Edge TTS voice name")
    parser.add_argument("--bg-image", default="/home/ubuntu/GoalChain/assets/img/promo/bg_rare_002_floodlights_1778864679047.png", help="Background image template")
    parser.add_argument("--bg-music", default="/home/ubuntu/GoalChain/scripts/marketing/video-automation/assets/crowd_ambience.ogg", help="Background music/crowd ambience")
    args = parser.parse_args()

    # Load player details
    player = get_player_data(args.player_id)
    player_name = player.get("name", "Unknown Player").upper()
    real_name = player.get("real_name", player_name)
    country = player.get("country", "Unknown").upper()
    position = player.get("position", "FWD").upper()
    physical = player.get("physical", {})
    height = physical.get("h", "1.80m")
    weight = physical.get("w", "75kg")
    
    print(f"Spotlighting: {real_name} ({player_name})")
    print(f"Country: {country} | Position: {position} | Height: {height} | Weight: {weight}")

    # Build narrative script (strictly English max law)
    script_text = (
        f"GoalChain player spotlight! Introducing the legendary {real_name}. "
        f"A top tier {position} from {country} dominating the decentralized football arena. "
        f"Measuring {height} and weighing {weight}, {player_name} brings elite stats to any squad. "
        f"Managers holding this Genesis player card can maximize daily G C H token yields in the arena. "
        f"Manage your player's stamina, optimize your starting eleven, and claim victory today. "
        f"Mint your Genesis card now at goalchain dot com!"
    )

    # Output paths
    output_abs_path = os.path.abspath(args.output)
    output_dir = os.path.dirname(output_abs_path)
    os.makedirs(output_dir, exist_ok=True)

    # Use temp directory for rendering
    with tempfile.TemporaryDirectory() as tmpdir:
        temp_audio = os.path.join(tmpdir, "tts_speech.mp3")
        
        # Step 1: Run TTS
        asyncio.run(generate_speech(script_text, temp_audio, voice=args.voice))
        
        # Get audio duration to bound rendering
        duration = get_audio_duration(temp_audio) + 0.5
        print(f"Audio duration: {duration:.2f} seconds. Bounding output to this length.")
        
        # Step 2: Compile Video with FFmpeg
        print("Rendering final video compilation using FFmpeg...")
        
        font_path = "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
        if not os.path.exists(font_path):
            font_path = "FreeSansBold"  # Let system look up the font
            
        bg_image = args.bg_image
        if not os.path.exists(bg_image):
            # Fallback to local path if running on Mac
            bg_image = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../assets/img/promo/bg_rare_002_floodlights_1778864679047.png"))
            
        bg_music = args.bg_music
        if not os.path.exists(bg_music):
            # Fallback to local path if running on Mac
            bg_music = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../scripts/marketing/video-automation/assets/crowd_ambience.ogg"))

        # Base filter complex: scale bg to 9:16 (1080x1920), add semi-transparent black overlay
        # overlay drawtext filters for name, position, country, and stats
        filter_complex = (
            f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];"
            f"[bg]drawbox=y=300:h=1320:color=black@0.6:t=fill[overlay];"
            f"[overlay]drawtext=fontfile='{font_path}':text='GOALCHAIN PLAYER SPOTLIGHT':fontcolor=0x14f195:fontsize=45:x=(w-text_w)/2:y=400,"
            f"drawtext=fontfile='{font_path}':text='{player_name}':fontcolor=white:fontsize=75:x=(w-text_w)/2:y=600,"
            f"drawtext=fontfile='{font_path}':text='{position} | {country}':fontcolor=0x9945ff:fontsize=50:x=(w-text_w)/2:y=720,"
            f"drawtext=fontfile='{font_path}':text='HEIGHT\\: {height}':fontcolor=white:fontsize=45:x=(w-text_w)/2:y=950,"
            f"drawtext=fontfile='{font_path}':text='WEIGHT\\: {weight}':fontcolor=white:fontsize=45:x=(w-text_w)/2:y=1050,"
            f"drawtext=fontfile='{font_path}':text='MINT LIVE NOW AT GOALCHAIN.COM':fontcolor=0x14f195:fontsize=40:x=(w-text_w)/2:y=1400[out_v]"
        )

        # Build FFmpeg command. Mix speech audio with looped background crowd ambience
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-r", "5", "-i", bg_image,
            "-i", temp_audio,
        ]
        
        if os.path.exists(bg_music):
            print(f"Mixing background music: {bg_music}")
            ffmpeg_cmd.extend(["-stream_loop", "-1", "-i", bg_music])
            ffmpeg_cmd.extend([
                "-filter_complex", 
                filter_complex + ";[1:a]volume=2.2[voice];[2:a]volume=0.07[bg_m];[voice][bg_m]amix=inputs=2:duration=first:dropout_transition=2[out_a]"
            ])
            ffmpeg_cmd.extend(["-map", "[out_v]", "-map", "[out_a]"])
        else:
            print("Background music not found, encoding speech audio only.")
            ffmpeg_cmd.extend(["-filter_complex", filter_complex])
            ffmpeg_cmd.extend(["-map", "[out_v]", "-map", "1:a"])

        ffmpeg_cmd.extend([
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-tune", "stillimage", "-preset", "ultrafast",
            "-c:a", "aac", "-b:a", "192k",
            "-t", f"{duration:.2f}",
            output_abs_path
        ])

        print(f"Executing: {' '.join(ffmpeg_cmd)}")
        res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"🎉 Success! Generated video spotlight: {output_abs_path}")
        else:
            print("❌ FFmpeg failed!")
            print("Stdout:", res.stdout)
            print("Stderr:", res.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
