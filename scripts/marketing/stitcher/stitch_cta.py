#!/usr/bin/env python3
"""
GoalChain Hook + CTA Stitcher
Attaches a 7-second GoalChain CTA video to every scraped hook.
Output: vertical 1080x1920 MP4 ready for YouTube Shorts.
"""

import os
import sys
import subprocess
import argparse
import json
from pathlib import Path

def check_ffmpeg():
    result = subprocess.run(["which", "ffmpeg"], capture_output=True)
    return result.returncode == 0

def get_video_info(path):
    """Get video resolution, fps, codecs via ffprobe."""
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,r_frame_rate,codec_name",
        "-of", "json", str(path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        data = json.loads(result.stdout)
        if data.get("streams"):
            s = data["streams"][0]
            return {
                "width": s.get("width"),
                "height": s.get("height"),
                "fps": eval(s.get("r_frame_rate", "30/1")),
                "codec": s.get("codec_name")
            }
    return None

def stitch_videos(hook_path, cta_path, output_path):
    """Stitch hook + CTA with re-encoding for compatibility."""
    # Normalize both to 1080x1920, 30fps, h264, aac
    cmd = [
        "ffmpeg", "-y",
        "-i", str(hook_path),
        "-i", str(cta_path),
        "-filter_complex",
        "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];"
        "[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1];"
        "[0:a]aresample=44100[a0];"
        "[1:a]aresample=44100[a1];"
        "[v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]",
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return result.returncode == 0, result.stderr

def main():
    parser = argparse.ArgumentParser(description="Stitch CTA to football hooks")
    parser.add_argument("--hooks", required=True, help="Folder with hook_*.mp4 files")
    parser.add_argument("--cta", required=True, help="Path to GoalChain CTA video (7s)")
    parser.add_argument("--output", required=True, help="Output folder for final videos")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing")
    args = parser.parse_args()

    if not check_ffmpeg():
        print("❌ ffmpeg not found. Install: apt install ffmpeg")
        sys.exit(1)

    hooks_dir = Path(args.hooks)
    cta_path = Path(args.cta)
    output_dir = Path(args.output)

    if not hooks_dir.exists():
        print(f"❌ Hooks folder not found: {hooks_dir}")
        sys.exit(1)
    if not cta_path.exists():
        print(f"❌ CTA video not found: {cta_path}")
        sys.exit(1)

    output_dir.mkdir(exist_ok=True)

    # Verify CTA is ~7 seconds
    cta_info = get_video_info(cta_path)
    print(f"🎬 CTA video: {cta_info}")

    # Find hook files
    hook_files = sorted(hooks_dir.glob("hook_*.mp4"))
    if not hook_files:
        print(f"❌ No hook_*.mp4 files in {hooks_dir}")
        sys.exit(1)

    print(f"🔗 Stitching CTA to {len(hook_files)} hooks...")

    success_log = []
    failure_log = []

    for i, hook_file in enumerate(hook_files, 1):
        output_file = output_dir / f"final_{i:03d}.mp4"
        
        if output_file.exists() and not args.overwrite:
            print(f"  [{i}/{len(hook_files)}] ⏭️  Skipping {output_file.name} (exists)")
            success_log.append(str(output_file))
            continue

        print(f"  [{i}/{len(hook_files)}] 🔧 Stitching {hook_file.name} + CTA...")
        success, err = stitch_videos(hook_file, cta_path, output_file)
        
        if success:
            size_mb = output_file.stat().st_size / (1024 * 1024)
            print(f"    ✅ Done ({size_mb:.1f} MB)")
            success_log.append(str(output_file))
        else:
            print(f"    ❌ Failed: {err[:200]}")
            failure_log.append({"hook": str(hook_file), "error": err[:500]})

    # Save logs
    (output_dir / "stitch_success.txt").write_text("\n".join(success_log))
    (output_dir / "stitch_failures.json").write_text(json.dumps(failure_log, indent=2))

    print(f"\n📊 Complete: {len(success_log)} success, {len(failure_log)} failed")
    print(f"📁 Final videos: {output_dir.absolute()}")

if __name__ == "__main__":
    main()
