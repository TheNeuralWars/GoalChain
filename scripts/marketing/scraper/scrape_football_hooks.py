#!/usr/bin/env python3
"""
GoalChain Football Hooks Scraper
Adapted from viral hooks strategy for football + DeFi content.
Scrapes 3-second hooks from top football YouTube Shorts channels.
"""

import os
import sys
import subprocess
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Football viral channels (20M+ subs preferred)
FOOTBALL_CHANNELS = {
    "zackd": "https://www.youtube.com/@ZackDFilms",
    "mrbeast": "https://www.youtube.com/@MrBeastShorts", 
    "footballdaily": "https://www.youtube.com/@footballdaily",
    "copa90": "https://www.youtube.com/@Copa90",
    "ohmygoal": "https://www.youtube.com/@OhMyGoal",
    "433": "https://www.youtube.com/@433",
    "brfootball": "https://www.youtube.com/@brfootball",
    "espnfc": "https://www.youtube.com/@ESPNFC"
}

def check_dependencies():
    """Verify yt-dlp and ffmpeg are available."""
    deps = {}
    for cmd in ["yt-dlp", "ffmpeg"]:
        result = subprocess.run(["which", cmd], capture_output=True)
        deps[cmd] = result.returncode == 0
    return deps

def get_channel_videos(channel_url, max_videos=300):
    """Get video URLs from a YouTube Shorts channel using yt-dlp."""
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--print", "url",
        "--playlist-end", str(max_videos),
        channel_url
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr}")
    urls = [u.strip() for u in result.stdout.strip().split("\n") if u.strip()]
    return urls

def download_hook(url, output_path, index):
    """Download first 3 seconds of a video using yt-dlp + ffmpeg."""
    # Try to download only first 3 seconds via yt-dlp external downloader
    cmd = [
        "yt-dlp",
        "-f", "best[height<=1920]",
        "--external-downloader", "ffmpeg",
        "--external-downloader-args", "ffmpeg_i:-ss 0 -t 3",
        "-o", str(output_path),
        url
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    return result.returncode == 0, result.stderr

def main():
    parser = argparse.ArgumentParser(description="Scrape football viral hooks")
    parser.add_argument("--channel", default="zackd", choices=list(FOOTBALL_CHANNELS.keys()),
                       help="Channel key or full URL")
    parser.add_argument("--max", type=int, default=300, help="Max videos to scrape")
    parser.add_argument("--output", default="hooks", help="Output folder")
    args = parser.parse_args()

    # Resolve channel URL
    channel_url = args.channel
    if channel_url in FOOTBALL_CHANNELS:
        channel_url = FOOTBALL_CHANNELS[channel_url]
    elif not channel_url.startswith("http"):
        print(f"Unknown channel: {args.channel}")
        sys.exit(1)

    # Check deps
    deps = check_dependencies()
    missing = [k for k, v in deps.items() if not v]
    if missing:
        print(f"❌ Missing dependencies: {', '.join(missing)}")
        print("Install: pip install yt-dlp  &&  apt install ffmpeg")
        sys.exit(1)
    print(f"✅ Dependencies OK: yt-dlp, ffmpeg")

    # Setup output
    output_dir = Path(args.output)
    output_dir.mkdir(exist_ok=True)

    # Get videos
    print(f"🔍 Fetching {args.max} videos from {channel_url}...")
    try:
        urls = get_channel_videos(channel_url, args.max)
    except RuntimeError as e:
        print(f"❌ Failed to fetch videos: {e}")
        sys.exit(1)

    print(f"📥 Found {len(urls)} videos. Downloading hooks...")

    # Track results
    downloaded = []
    failed = []

    for i, url in enumerate(urls, 1):
        output_file = output_dir / f"hook_{i:03d}.mp4"
        if output_file.exists():
            print(f"  [{i}/{len(urls)}] ⏭️  Skipping {output_file.name} (exists)")
            downloaded.append(url)
            continue

        print(f"  [{i}/{len(urls)}] ⬇️  Downloading hook_{i:03d}.mp4...")
        success, err = download_hook(url, output_file, i)
        if success:
            downloaded.append(url)
            print(f"    ✅ Done ({output_file.stat().st_size / 1024:.1f} KB)")
        else:
            failed.append({"url": url, "error": err[:200]})
            print(f"    ❌ Failed: {err[:100]}")

    # Save logs
    (output_dir / "downloaded_urls.txt").write_text("\n".join(downloaded))
    (output_dir / "failed_downloads.txt").write_text(json.dumps(failed, indent=2))

    print(f"\n📊 Complete: {len(downloaded)} downloaded, {len(failed)} failed")
    print(f"📁 Hooks saved to: {output_dir.absolute()}")

if __name__ == "__main__":
    main()
