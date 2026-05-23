#!/usr/bin/env python3
import os
import sys
import argparse
import subprocess
import json
import tempfile

def main():
    parser = argparse.ArgumentParser(description="GoalChain Video Post-Production & Automation Engine")
    parser.add_argument("--teamA", default="Argentina", help="Name of Team A")
    parser.add_argument("--teamB", default="Francia", help="Name of Team B")
    parser.add_argument("--scoreA", default="2", help="Score of Team A")
    parser.add_argument("--scoreB", default="1", help="Score of Team B")
    parser.add_argument("--eventText", default="Messi anotó (82')", help="Oracle event description text")
    parser.add_argument("--yieldChange", default="+15.4%", help="Yield boost change percentage")
    parser.add_argument("-v", "--voice", default="ef_dora", help="Kokoro voice ID (default: ef_dora for Spanish Enzo Bit)")
    parser.add_argument("-o", "--output", default="scripts/marketing/video-automation/assets/reel_output.mp4", help="Final output MP4 path")
    parser.add_argument("--text", help="Override speech commentary narrative text")
    parser.add_argument("--caption", default="⚽ ¡LIVE ORACLE UPDATE! Enzo Bit reporta los últimos rendimientos impulsados en GoalChain! 💎🚀", help="Caption for social media posting")
    parser.add_argument("--publish", action="store_true", help="Post to X (Twitter) and Discord after compilation")
    parser.add_argument("--discord-only", action="store_true", help="Publish only to Discord")
    parser.add_argument("--twitter-only", action="store_true", help="Publish only to Twitter")
    parser.add_argument("--prod", action="store_true", help="Publish to production Discord announcements instead of dev room")

    args = parser.parse_args()

    # Determine paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.abspath(os.path.join(script_dir, ".."))
    comp_dir = os.path.join(script_dir, "marketing", "video-automation")
    bg_music_path = os.path.join(comp_dir, "assets", "crowd_ambience.ogg")

    # Output path absolute
    output_abs_path = os.path.abspath(args.output)
    output_dir = os.path.dirname(output_abs_path)
    os.makedirs(output_dir, exist_ok=True)

    print("=== GoalChain Video Post-Production & Automation Engine ===")
    print(f"Team A:      {args.teamA} ({args.scoreA})")
    print(f"Team B:      {args.teamB} ({args.scoreB})")
    print(f"Event:       {args.eventText}")
    print(f"Yield:       {args.yieldChange}")
    print(f"Voice ID:    {args.voice}")
    print(f"Final Reel:  {output_abs_path}")
    print("==========================================================")

    # Determine speech narrative
    if args.text:
        narrative_text = args.text
    else:
        narrative_text = (
            f"¡Atención fanáticos de GoalChain! Enzo Bit reporta desde el oráculo. "
            f"En el emocionante partido entre {args.teamA} y {args.teamB}, {args.eventText}. "
            f"¡Esto ha provocado que los rendimientos aumenten un {args.yieldChange}! "
            f"¡Una locura total en el mercado de derivados de GoalChain!"
        )
    
    print(f"Narrative Speech Text: \"{narrative_text}\"")

    # Use a temporary directory for raw files
    with tempfile.TemporaryDirectory() as tmpdir:
        temp_raw_video = os.path.join(tmpdir, "raw_visuals.mp4")
        temp_speech_wav = os.path.join(tmpdir, "speech.wav")

        # Step 1: Render Visuals
        print("\n--- Step 1: Rendering raw visuals using Hyperframes ---")
        generator_script = os.path.join(script_dir, "generate_video_alert.py")
        
        gen_cmd = [
            sys.executable, generator_script,
            "--teamA", args.teamA,
            "--teamB", args.teamB,
            "--scoreA", args.scoreA,
            "--scoreB", args.scoreB,
            "--eventText", args.eventText,
            "--yieldChange", args.yieldChange,
            "-o", temp_raw_video
        ]

        try:
            print(f"Executing: {' '.join(gen_cmd)}")
            subprocess.run(gen_cmd, check=True)
            print("✅ Raw visuals rendered successfully.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to render raw visuals: {e}")
            sys.exit(1)

        # Step 2: Generate Speech
        print("\n--- Step 2: Generating speech audio with Kokoro TTS ---")
        tts_cmd = [
            "npx", "--yes", "hyperframes@0.6.36", "tts",
            narrative_text,
            "-v", args.voice,
            "-o", temp_speech_wav
        ]

        try:
            print(f"Executing: {' '.join(tts_cmd)}")
            # We run in comp_dir so it has proper package/config context if needed
            subprocess.run(tts_cmd, cwd=comp_dir, check=True)
            print("✅ Speech audio generated successfully.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to generate speech: {e}")
            sys.exit(1)

        # Step 3: Mix & Combine with FFmpeg
        print("\n--- Step 3: Mixing audio tracks & compiling final reel ---")
        if not os.path.exists(bg_music_path):
            print(f"⚠️ Warning: Background music not found at {bg_music_path}. Compiling with speech only.")
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-stream_loop", "-1", "-i", temp_raw_video,
                "-i", temp_speech_wav,
                "-map", "0:v", "-map", "1:a",
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-shortest",
                output_abs_path
            ]
        else:
            print(f"Found background music: {bg_music_path}")
            # Filter complex: Voice is input 1, bg music is input 2 (looped).
            # Voice volume is amplified (x2.0), background music is ducked (x0.08).
            # Mixed using amix filter, length governed by first input (which is the voice track).
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-stream_loop", "-1", "-i", temp_raw_video,
                "-i", temp_speech_wav,
                "-stream_loop", "-1", "-i", bg_music_path,
                "-filter_complex", "[1:a]volume=2.0[voice];[2:a]volume=0.08[bg];[voice][bg]amix=inputs=2:duration=first:dropout_transition=0[out_a]",
                "-map", "0:v", "-map", "[out_a]",
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-shortest",
                output_abs_path
            ]

        try:
            print(f"Executing: {' '.join(ffmpeg_cmd)}")
            subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            print("✅ Final post-produced reel compiled successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ FFmpeg compilation failed: {e}")
            print(f"Stdout: {e.stdout}")
            print(f"Stderr: {e.stderr}")
            sys.exit(1)

    # Verify final output exists
    if os.path.exists(output_abs_path):
        size_mb = os.path.getsize(output_abs_path) / (1024 * 1024)
        print(f"\n🎉 Success! Reel generated: {output_abs_path} ({size_mb:.2f} MB)")
    else:
        print(f"❌ Error: Compiled file not found at {output_abs_path}")
        sys.exit(1)

    # Step 4: Publish to Social Media
    if args.publish:
        print("\n--- Step 4: Publishing to Social Media ---")
        poster_script = os.path.join(script_dir, "post_video_update.py")
        pub_cmd = [
            sys.executable, poster_script,
            "--video", output_abs_path,
            "--text", args.caption
        ]
        
        if args.discord_only:
            pub_cmd.append("--discord-only")
        if args.twitter_only:
            pub_cmd.append("--twitter-only")
        if args.prod:
            pub_cmd.append("--prod")

        try:
            print(f"Executing: {' '.join(pub_cmd)}")
            subprocess.run(pub_cmd, check=True)
            print("✅ Video published to social media platforms successfully.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to publish video: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
