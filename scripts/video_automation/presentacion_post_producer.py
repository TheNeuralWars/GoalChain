import os
import subprocess
import sys
from pathlib import Path

# Force UTF-8 stdout encoding for Windows console environments
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def build_transition_clip(vA_path: Path, vB_path: Path, output_path: Path):
    """
    Creates an enhanced, cinematic transition clip (10 seconds) between Video A and Video B.
    - 0.0s - 1.5s: Video A
    - 1.5s - 3.0s: Glitchy/flickering alternation with bright flash transitions
    - 3.0s - 6.0s: Side-by-side simultaneous split-screen separated by a Solana-green neon divider
    - 6.0s - 8.0s: Faster flickering transitions with flashes, settling down into B
    - 8.0s - 10.04s: Video B
    - Audio is mixed 50/50 from both clips.
    """
    print(f"🎬 Creating enhanced transition clip: {vA_path.name} <-> {vB_path.name}...")
    
    # FFmpeg filter complex for the transition sequence
    filter_complex = (
        # 0.0s - 1.5s: A
        "[0:v]trim=start=0:end=1.5,setpts=PTS-STARTPTS[v0];"
        
        # 1.5s - 3.0s: Flicker A/B with cinematic brightness flashes on cuts
        "[1:v]trim=start=1.5:end=1.65,setpts=PTS-STARTPTS[v1];"
        "[0:v]trim=start=1.65:end=1.80,setpts=PTS-STARTPTS,eq=brightness=0.18:contrast=1.3[v2];" # Flash
        "[1:v]trim=start=1.80:end=1.95,setpts=PTS-STARTPTS[v3];"
        "[0:v]trim=start=1.95:end=2.10,setpts=PTS-STARTPTS[v4];"
        "[1:v]trim=start=2.10:end=2.20,setpts=PTS-STARTPTS,eq=brightness=0.18:contrast=1.3[v5];" # Flash
        "[0:v]trim=start=2.20:end=2.30,setpts=PTS-STARTPTS[v6];"
        "[1:v]trim=start=2.30:end=2.45,setpts=PTS-STARTPTS[v7];"
        "[0:v]trim=start=2.45:end=2.60,setpts=PTS-STARTPTS,eq=brightness=0.18:contrast=1.3[v8];" # Flash
        "[1:v]trim=start=2.60:end=3.00,setpts=PTS-STARTPTS[v9];"
        
        # 3.0s - 6.0s: Side-by-Side simultaneous split screen with Solana Green (#14F195) neon divider
        # Left A: 230px, Divider: 4px, Right B: 230px (Total = 464px)
        "[0:v]trim=start=3.0:end=6.0,setpts=PTS-STARTPTS[a_mid];"
        "[1:v]trim=start=3.0:end=6.0,setpts=PTS-STARTPTS[b_mid];"
        "[a_mid]crop=230:688:0:0[left_A];"
        "[b_mid]crop=230:688:234:0[right_B];"
        "color=c=#14f195:s=4x688:d=3[divider];"
        "[left_A][divider][right_B]hstack=inputs=3[simultaneous];"
        
        # 6.0s - 8.0s: Flicker A/B to B with flashes
        "[0:v]trim=start=6.0:end=6.15,setpts=PTS-STARTPTS[v10];"
        "[1:v]trim=start=6.15:end=6.30,setpts=PTS-STARTPTS[v11];"
        "[0:v]trim=start=6.30:end=6.45,setpts=PTS-STARTPTS,eq=brightness=0.18:contrast=1.3[v12];" # Flash
        "[1:v]trim=start=6.45:end=6.60,setpts=PTS-STARTPTS[v13];"
        "[0:v]trim=start=6.60:end=6.75,setpts=PTS-STARTPTS[v14];"
        "[1:v]trim=start=6.75:end=7.00,setpts=PTS-STARTPTS[v15];"
        "[0:v]trim=start=7.00:end=7.15,setpts=PTS-STARTPTS,eq=brightness=0.18:contrast=1.3[v16];" # Flash
        "[1:v]trim=start=7.15:end=8.00,setpts=PTS-STARTPTS[v17];"
        
        # 8.0s - 10.04s: B
        "[1:v]trim=start=8.0:end=10.04,setpts=PTS-STARTPTS[v18];"
        
        # Concat all 20 video segments
        "[v0][v1][v2][v3][v4][v5][v6][v7][v8][v9][simultaneous][v10][v11][v12][v13][v14][v15][v16][v17][v18]"
        "concat=n=20:v=1:a=0[out_v];"
        
        # Mix audio of both clips
        "[0:a][1:a]amix=inputs=2:duration=first[out_a]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", str(vA_path),
        "-i", str(vB_path),
        "-filter_complex", filter_complex,
        "-map", "[out_v]",
        "-map", "[out_a]",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        str(output_path)
    ]
    subprocess.run(cmd, check=True)
    print("✅ Transition clip compiled.")

def compile_presentation_video(clips_dir: str, logo_path: str, output_path: str):
    """
    Decodes and concatenates the 6 presentation clips, applies the logo overlay,
    and mixes the background audio within a single FFmpeg filter complex.
    This resolves any frame/timestamp freezing at boundaries.
    """
    print("\n🚀 Starting GoalChain Presentation Post-Production (Decoded Concat)...")
    
    clips_path = Path(clips_dir)
    logo_file = Path(logo_path)
    
    # Define exact input paths
    v1 = clips_path / "presentacion-1.mp4"
    v2 = clips_path / "presentacion-2.mp4"
    v3s = clips_path / "presentacion-3s.mp4"
    v3b = clips_path / "presentacion-3b.mp4"
    v4 = clips_path / "presentacion-4.mp4"
    v5 = clips_path / "presentacion-5.mp4"
    v6 = clips_path / "presentacion-6.mp4"
    
    # Compiled transition file
    v3_trans = clips_path / "presentacion-3_transition.mp4"
    
    # 1. Compile the transition clip first
    build_transition_clip(v3s, v3b, v3_trans)
    
    # 2. Build the final command with decoded concatenation, logo overlay, and audio mixing
    print("\n🔗 Step 2: Merging all clips with logo overlay and audio mix (re-encoding for smooth playback)...")
    project_bg_audio = Path("c:/Users/NicoPez/goalchain/scripts/marketing/video-automation/assets/crowd_ambience.ogg")
    
    # We will load 6 videos as inputs 0 to 5
    inputs = [
        "-i", str(v1),
        "-i", str(v2),
        "-i", str(v3_trans),
        "-i", str(v4),
        "-i", str(v5),
        "-i", str(v6)
    ]
    
    is_png = logo_file.suffix.lower() == ".png"
    
    if project_bg_audio.exists():
        inputs += ["-i", str(project_bg_audio)]
        inputs += ["-i", str(logo_file)]
        logo_input_idx = 7
        
        # Filter complex
        filter_complex = (
            # Concat the 6 video and audio streams
            "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a][5:v][5:a]concat=n=6:v=1:a=1[v_concat][a_concat];"
            # Scale and keyout logo
            f"[{logo_input_idx}:v]" + ("scale=110:-1[logo];" if is_png else "colorkey=0xFFFFFF:0.12:0.05,scale=110:-1[logo];") +
            "[v_concat][logo]overlay=W-w-15:15[out_v];"
            # Mix audios
            "[a_concat]volume=1.0[orig];"
            "[6:a]volume=0.15[bg];"
            "[orig][bg]amix=inputs=2:duration=first[out_a]"
        )
        maps = ["-map", "[out_v]", "-map", "[out_a]"]
    else:
        inputs += ["-i", str(logo_file)]
        logo_input_idx = 6
        
        # Filter complex
        filter_complex = (
            "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a][4:v][4:a][5:v][5:a]concat=n=6:v=1:a=1[v_concat][a_concat];"
            f"[{logo_input_idx}:v]" + ("scale=110:-1[logo];" if is_png else "colorkey=0xFFFFFF:0.12:0.05,scale=110:-1[logo];") +
            "[v_concat][logo]overlay=W-w-15:15[out_v]"
        )
        maps = ["-map", "[out_v]", "-map", "[a_concat]"]
        
    cmd = [
        "ffmpeg", "-y"
    ] + inputs + [
        "-filter_complex", filter_complex
    ] + maps + [
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        output_path
    ]
    
    subprocess.run(cmd, check=True)
    print("✅ Video compilation completed successfully.")
    
    # Cleanup temporary transition file
    try:
        v3_trans.unlink()
    except Exception as e:
        print(f"ℹ️ Minor cleanup warning: {e}")
        
    print(f"\n🎉 Success! The final post-produced presentation video is saved at:\n📁 {output_path}")

if __name__ == "__main__":
    # Path configuration
    clips_dir = "C:/Users/NicoPez/Videos/Grok/GoalChain/Presentacion"
    # Use the user's uploaded JPEG logo which we key out using white background keying
    logo_path = "C:/Users/NicoPez/.gemini/antigravity/brain/43bd1cc1-1655-490b-afc9-34b4874847e7/media__1782343968714.jpg"
    output_path = "C:/Users/NicoPez/Videos/Grok/GoalChain/Presentacion/GoalChain_Presentacion_Final.mp4"
    
    compile_presentation_video(clips_dir, logo_path, output_path)
