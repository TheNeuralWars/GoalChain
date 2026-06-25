#!/usr/bin/env python3
"""
Match Highlights Generator v2 — Hermes Pipeline
================================================
Changes from v1:
  - Script generation: Gemini (REST, no Grok API quota used)
  - Web trend search: RapidAPI Twitter search to find today's hot match
  - Voice/Audio: Grok Imagine generates it natively inside the video (EN)
  - ElevenLabs: REMOVED
  - YouTube long-form: YouTube Data API v3 (google-api-python-client)
  - Buffer: TikTok + Instagram + YouTube Shorts (unchanged)
  - Language: ENGLISH (prompts, narration, captions, YT metadata)
"""

import os
import sys
import json
import time
import shlex
import re
import argparse
import subprocess
import platform
import random
from pathlib import Path
from datetime import datetime, timezone

# Force UTF-8 stdout/stderr on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))

from config import (
    ACCOUNTS, GEMINI_API_KEY, RAPIDAPI_KEY, RAPIDAPI_HOST_TWITTER, OUTPUT_DIR
)
from grok_super_pipeline import (
    generate_image_on_vps,
    generate_video_on_vps,
    post_to_buffer,
    CHANNEL_IDS,
    update_run_state,
)

# ─────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────

FALLBACK_MATCHUPS = [
    "Argentina vs Austria",
    "Brazil vs Morocco",
    "Spain vs Uruguay",
    "France vs Norway",
    "Portugal vs Colombia",
    "Germany vs Ecuador",
    "England vs Croatia",
    "USA vs Paraguay",
    "Belgium vs Egypt",
    "Netherlands vs Sweden",
]

YT_CREDENTIALS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "youtube_oauth_token.json"
YT_CLIENT_SECRETS_FILE = BASE_DIR / "data" / "marketing_pipeline" / "youtube_client_secrets.json"
YT_SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


# ─────────────────────────────────────────────
# STEP 1 — TREND SEARCH (RapidAPI Twitter)
# ─────────────────────────────────────────────

def search_trending_match() -> str:
    """
    Query Twitter via RapidAPI to find the hottest World Cup 2026 match right now.
    Falls back to a curated list if the API call fails.
    """
    if not RAPIDAPI_KEY:
        print("[Trend] No RAPIDAPI_KEY — using fallback matchup list.")
        return random.choice(FALLBACK_MATCHUPS)

    import urllib.request, urllib.error
    queries = [
        "World Cup 2026 match today goals highlights",
        "WorldCup2026 live score winner"
    ]
    for q in queries:
        try:
            url = (
                "https://twitter241.p.rapidapi.com/search-v2"
                f"?q={urllib.parse.quote(q)}&count=5&type=Latest"
            )
            req = urllib.request.Request(
                url,
                headers={
                    "X-RapidAPI-Key": RAPIDAPI_KEY,
                    "X-RapidAPI-Host": RAPIDAPI_HOST_TWITTER,
                }
            )
            import urllib.parse
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
            tweets = (data.get("result", {})
                         .get("timeline", {})
                         .get("instructions", [{}])[0]
                         .get("entries", []))
            texts = []
            for entry in tweets[:5]:
                try:
                    txt = (entry["content"]["itemContent"]
                                ["tweet_results"]["result"]
                                ["legacy"]["full_text"])
                    texts.append(txt)
                except (KeyError, TypeError):
                    continue

            if not texts:
                continue

            # Ask Gemini to extract the most relevant matchup from the tweets
            joined = "\n---\n".join(texts)
            prompt = (
                f"These are recent tweets about World Cup 2026:\n{joined}\n\n"
                "Extract the single most talked-about match (e.g. 'Argentina vs Austria'). "
                "Return ONLY the matchup string, nothing else."
            )
            matchup = _call_gemini_raw(prompt).strip().strip('"').strip("'")
            if " vs " in matchup or " v " in matchup.lower():
                print(f"[Trend] Hot matchup detected: {matchup}")
                return matchup
        except Exception as e:
            print(f"[Trend] Twitter search failed ({e}). Trying next query...")

    fallback = random.choice(FALLBACK_MATCHUPS)
    print(f"[Trend] Using fallback matchup: {fallback}")
    return fallback


# ─────────────────────────────────────────────
# STEP 2 — SCRIPT GENERATION (Gemini)
# ─────────────────────────────────────────────

def _call_nvidia_nim(prompt: str) -> str:
    """Call NVIDIA NIM API (Llama 3.3 70B) via REST."""
    from config import NVIDIA_API_KEY
    import urllib.request, urllib.error
    if not NVIDIA_API_KEY:
        raise RuntimeError("NVIDIA_API_KEY not set in .env")
    
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    payload = json.dumps({
        "model": "meta/llama-3.3-70b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2048
    }).encode("utf-8")
    
    req = urllib.request.Request(
        url, data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NVIDIA_API_KEY}"
        },
        method="POST"
    )
    # 120 seconds timeout
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode())
    return data["choices"][0]["message"]["content"]


def _call_gemini_raw(prompt: str) -> str:
    """Call Gemini 2.0 Flash via REST API (no SDK needed) with NVIDIA fallback."""
    import urllib.request, urllib.error
    
    # Try Gemini first
    if GEMINI_API_KEY:
        try:
            model = "gemini-2.0-flash"
            url = (
                f"https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={GEMINI_API_KEY}"
            )
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }).encode("utf-8")
            req = urllib.request.Request(
                url, data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"[LLM] Gemini request failed or quota exceeded ({e}).")
    
    print("[LLM] Falling back to NVIDIA NIM...")
    try:
        return _call_nvidia_nim(prompt)
    except Exception as e:
        print(f"[LLM] NVIDIA NIM request failed ({e}).")
        raise RuntimeError(f"All LLM services failed. Gemini/NVIDIA error: {e}")


def generate_match_screenplay(matchup: str, account_name: str, dry_run: bool = False) -> dict:
    """
    Use Gemini to write a 4-scene short-video screenplay in ENGLISH
    for the given World Cup 2026 matchup.
    Voice/narration will be handled natively by Grok Imagine inside the video.
    """
    if dry_run:
        print("[Dry-Run] Using mock screenplay.")
        return _mock_screenplay(matchup)

    niche = ACCOUNTS.get(account_name, {}).get("niche", "World Cup 2026 sports betting on Solana")

    prompt = f"""You are Hermes, GoalChain's world-class content director.
Write a high-retention, addictive 4-scene screenplay in ENGLISH for a vertical 9:16 video
(TikTok / Instagram Reels / YouTube Shorts) about the World Cup 2026 match: "{matchup}".
Account niche: "{niche}".

IMPORTANT:
- Language: ENGLISH only (narration, captions, post text)
- Each scene is ~4 seconds. Total ~16 seconds.
- The video_prompt for each scene MUST include a voice-over instruction at the end:
  Format: '... [English sports narrator voice says: "<narration text>"]'
  This tells Grok Imagine to generate the video with spoken audio.
- visual_prompt: describe dramatic photorealistic football action, cinematic, vertical 9:16, no text in image
- animation_prompt: describe camera movement + narration voice instruction

Scene structure:
1. HOOK (0-4s): Dramatic opening line about the match moment
2. CONTEXT (4-8s): The critical play — penalty, goal, save, red card
3. MECHANISM (8-12s): Connect to GoalChain on Solana — betting on-chain
4. CTA (12-16s): Call to action — goalchain.fun, link in bio

Return ONLY valid JSON, no markdown, no extra text:
{{
    "post_text": "English post caption with emojis and 3-5 hashtags",
    "youtube_title": "Engaging YouTube video title (max 100 chars)",
    "youtube_description": "Full YouTube video description (200-400 chars) with #hashtags",
    "scenes": [
        {{
            "scene_num": 1,
            "narration": "Short punchy English narration (max 12 words)",
            "visual_prompt": "Detailed English image prompt, photorealistic football action, vertical 9:16, no text",
            "animation_prompt": "Camera movement description. [English sports narrator voice says: \\"<same narration text>\\"]"
        }},
        {{
            "scene_num": 2,
            "narration": "Short punchy English narration (max 12 words)",
            "visual_prompt": "Detailed English image prompt",
            "animation_prompt": "Camera movement. [English sports narrator voice says: \\"<narration>\\"]"
        }},
        {{
            "scene_num": 3,
            "narration": "Short punchy English narration (max 12 words)",
            "visual_prompt": "Detailed English image prompt",
            "animation_prompt": "Camera movement. [English sports narrator voice says: \\"<narration>\\"]"
        }},
        {{
            "scene_num": 4,
            "narration": "Short punchy English narration (max 12 words)",
            "visual_prompt": "Detailed English image prompt",
            "animation_prompt": "Camera movement. [English sports narrator voice says: \\"<narration>\\"]"
        }}
    ]
}}"""

    print(f"[Gemini] Generating screenplay for: {matchup}")
    raw = _call_gemini_raw(prompt)

    # Strip markdown if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-z]*\n?", "", cleaned)
        cleaned = re.sub(r"\n?```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[Gemini] JSON parse failed: {e}. Raw:\n{cleaned[:500]}")
        raise RuntimeError(f"Failed to parse Gemini screenplay JSON: {e}")

    # Normalize scene keys
    normalized = []
    for sc in data.get("scenes", []):
        def sg(keys):
            for k in keys:
                if k in sc and sc[k]:
                    return str(sc[k]).strip()
                for dk in sc:
                    if dk.lower() == k.lower() and sc[dk]:
                        return str(sc[dk]).strip()
            return ""
        normalized.append({
            "scene_num":        sg(["scene_num", "sceneNum", "number"]),
            "narration":        sg(["narration", "text", "voice", "voiceover"]),
            "visual_prompt":    sg(["visual_prompt", "visualPrompt", "image_prompt", "visual"]),
            "animation_prompt": sg(["animation_prompt", "animationPrompt", "video_prompt", "animation"]),
        })
    data["scenes"] = normalized
    return data


def _mock_screenplay(matchup: str) -> dict:
    return {
        "post_text": f"🔥 {matchup} — The moment that changed everything! Bet on-chain with GoalChain on Solana. #WorldCup2026 #GoalChain #Solana",
        "youtube_title": f"{matchup} — World Cup 2026 Highlights | GoalChain",
        "youtube_description": (
            f"The hottest moment from {matchup} at the FIFA World Cup 2026. "
            "Bet on real matches on-chain with GoalChain on Solana. "
            "Visit goalchain.fun #WorldCup2026 #Solana #SportsBetting"
        ),
        "scenes": [
            {"scene_num": 1, "narration": "Ninety-three minutes — absolute chaos on the pitch!",
             "visual_prompt": "Dramatic football player celebrating goal, stadium lights, slow motion, vertical 9:16",
             "animation_prompt": "Camera zooms in smoothly on celebrating player. [English sports narrator voice says: \"Ninety-three minutes — absolute chaos on the pitch!\"]"},
            {"scene_num": 2, "narration": "Penalty. The crowd holds its breath.",
             "visual_prompt": "Close-up player placing ball on penalty spot, cinematic, low-angle, vertical 9:16",
             "animation_prompt": "Slow pan around player face. [English sports narrator voice says: \"Penalty. The crowd holds its breath.\"]"},
            {"scene_num": 3, "narration": "On GoalChain, you bet on-chain. You control your stake.",
             "visual_prompt": "Glowing Solana coin inside digital vault, soccer ball pattern, vertical 9:16",
             "animation_prompt": "Vault opens revealing Solana coin. [English sports narrator voice says: \"On GoalChain, you bet on-chain. You control your stake.\"]"},
            {"scene_num": 4, "narration": "Play your prediction now. Link in bio.",
             "visual_prompt": "3D render of smartphone showing goalchain.fun dashboard, white glow, vertical 9:16",
             "animation_prompt": "Camera slides down to CTA button. [English sports narrator voice says: \"Play your prediction now. Link in bio.\"]"},
        ]
    }


# ─────────────────────────────────────────────
# STEP 3 — VIDEO COMPILATION (FFmpeg, no ElevenLabs)
# NOTE: Grok Imagine generates each scene video WITH native audio/voice.
# FFmpeg job: scale + burn subtitles + concat + logo + crowd ambience
# ─────────────────────────────────────────────

def get_font_path() -> str:
    if platform.system() == "Windows":
        return "C\\:/Windows/Fonts/arialbd.ttf"
    for p in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]:
        if os.path.exists(p):
            return p
    return "arial.ttf"


def format_subtitle(text: str, max_chars: int = 28) -> str:
    """Wrap narration text for FFmpeg drawtext (escape special chars)."""
    text = text.replace("'", "\u2019").replace(":", "\\:")
    words = text.split()
    lines, line = [], []
    for w in words:
        line.append(w)
        if len(" ".join(line)) > max_chars:
            lines.append(" ".join(line))
            line = []
    if line:
        lines.append(" ".join(line))
    return "\\n".join(lines)


def compile_highlights_video(
    screenplay: dict,
    account_name: str,
    run_id: str,
    dry_run: bool = False
) -> Path:
    """
    For each scene:
      1. Generate image via Grok Imagine
      2. Animate image to video WITH narration voice via Grok Imagine
      3. Scale to 720x1280, burn English subtitle with FFmpeg
    Then:
      4. Concatenate all scene clips
      5. Overlay logo + mix crowd ambience audio
    Returns path to final compiled video.
    """
    temp_dir = OUTPUT_DIR / f"compile_{run_id}"
    temp_dir.mkdir(parents=True, exist_ok=True)

    scenes = screenplay.get("scenes", [])
    font_path = get_font_path()
    video_parts: list[Path] = []

    print(f"\n[Compile] Starting {len(scenes)}-scene compilation...")

    for i, scene in enumerate(scenes):
        scene_num = scene.get("scene_num", i + 1)
        narration = scene.get("narration", "")
        visual_prompt = scene.get("visual_prompt", "")
        animation_prompt = scene.get("animation_prompt", "")
        subtitle_text = format_subtitle(narration)
        subvideo_path = temp_dir / f"scene_{scene_num}_final.mp4"

        print(f"\n  Scene {scene_num}/4: {narration[:60]}")

        if dry_run:
            # Create a silent 4s black clip as placeholder
            subprocess.run([
                "ffmpeg", "-y",
                "-f", "lavfi", "-i", "color=c=black:s=720x1280:r=24",
                "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                "-t", "4.0", "-pix_fmt", "yuv420p",
                str(subvideo_path)
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            video_parts.append(subvideo_path)
            continue

        # 1. Generate image
        try:
            img_name = generate_image_on_vps(visual_prompt)
            print(f"    Image: {img_name}")
        except Exception as e:
            print(f"    ⚠️  Image generation failed: {e}. Using color fallback.")
            img_name = None

        # 2. Generate video WITH narration audio via Grok Imagine
        try:
            vid_name = generate_video_on_vps(animation_prompt, img_name)
            vid_path = Path("/home/ubuntu/scratch/grok_batches/batch_01/outputs") / vid_name
            if not vid_path.exists():
                local = OUTPUT_DIR / vid_name
                vid_path = local if local.exists() else None
        except Exception as e:
            print(f"    ⚠️  Video generation failed: {e}. Using color fallback.")
            vid_path = None

        # Fallback: generate solid-color clip if Grok failed
        if not vid_path or not vid_path.exists():
            vid_path = temp_dir / f"fallback_{scene_num}.mp4"
            subprocess.run([
                "ffmpeg", "-y",
                "-f", "lavfi", "-i", "color=c=0x030307:s=720x1280:r=24",
                "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono",
                "-t", "4.5", "-pix_fmt", "yuv420p",
                str(vid_path)
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"    Using fallback clip: {vid_path.name}")

        # 3. Scale to 720x1280 + burn English subtitle (white text, semi-transparent bg)
        vf = (
            f"[0:v]scale=720:1280:force_original_aspect_ratio=increase,"
            f"crop=720:1280,"
            f"drawtext=fontfile='{font_path}':"
            f"text='{subtitle_text}':"
            f"fontcolor=white:fontsize=40:x=(w-text_w)/2:y=h-text_h-80:"
            f"box=1:boxcolor=black@0.55:boxborderw=12[v]"
        )
        subprocess.run([
            "ffmpeg", "-y",
            "-stream_loop", "10", "-i", str(vid_path),
            "-filter_complex", vf,
            "-map", "[v]", "-map", "0:a?",
            "-t", "4.5",
            "-pix_fmt", "yuv420p",
            "-c:v", "libx264", "-c:a", "aac",
            str(subvideo_path)
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        video_parts.append(subvideo_path)
        print(f"    ✅ Scene {scene_num} done.")

    # 4. Concatenate all scenes
    concat_list = temp_dir / "concat_list.txt"
    raw_concat = temp_dir / "raw_concat.mp4"
    concat_list.write_text(
        "\n".join(f"file '{p.resolve()}'" for p in video_parts),
        encoding="utf-8"
    )
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy",
        str(raw_concat)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"\n[Compile] All scenes concatenated: {raw_concat.name}")

    # 5. Post-production: logo watermark + crowd ambience
    final_name = f"highlights_{run_id}.mp4"
    final_path = OUTPUT_DIR / final_name

    logo_path = BASE_DIR / "docs" / "assets" / "img" / "logo_3d_clean.png"
    if not logo_path.exists():
        logo_path = None
    crowd_path = BASE_DIR / "scripts" / "marketing" / "video-automation" / "assets" / "crowd_ambience.ogg"
    has_crowd = crowd_path.exists()
    has_logo = logo_path is not None and logo_path.exists()

    print(f"[Post-prod] logo={has_logo}, crowd_ambience={has_crowd}")

    inputs = ["-i", str(raw_concat)]
    filters = []
    audio_map = "0:a?"
    video_map = "0:v"
    idx = 1

    if has_crowd:
        inputs += ["-i", str(crowd_path)]
        filters.append(
            f"[0:a]volume=1.0[orig];[{idx}:a]volume=0.12[bg];"
            f"[orig][bg]amix=inputs=2:duration=first[outa]"
        )
        audio_map = "[outa]"
        idx += 1

    if has_logo:
        inputs += ["-i", str(logo_path)]
        filters.append(
            f"[{idx}:v]scale=90:-1,format=rgba[logo];"
            f"[0:v][logo]overlay=W-w-12:12[outv]"
        )
        video_map = "[outv]"
        idx += 1

    mix_cmd = ["ffmpeg", "-y"] + inputs
    if filters:
        mix_cmd += ["-filter_complex", ";".join(filters)]
    mix_cmd += [
        "-map", video_map,
        "-map", audio_map,
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-shortest",
        str(final_path)
    ]

    subprocess.run(mix_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Cleanup temp
    for f in temp_dir.glob("*"):
        try: f.unlink()
        except: pass
    try: temp_dir.rmdir()
    except: pass

    print(f"[Compile] ✅ Final video: {final_path}")
    return final_path


# ─────────────────────────────────────────────
# STEP 4a — BUFFER (TikTok + IG + YouTube Shorts)
# ─────────────────────────────────────────────

def publish_to_buffer(account_name: str, video_path: Path, post_text: str) -> None:
    """Schedule the video to TikTok, Instagram, and YouTube Shorts via Buffer."""
    video_url = f"https://api.goalchain.fun/pilot/{video_path.name}"
    channels = CHANNEL_IDS.get(account_name, [])
    if not channels:
        print(f"[Buffer] No channels configured for {account_name}")
        return

    for channel_id in channels:
        try:
            res = post_to_buffer(channel_id, post_text, video_url, all_channels=channels)
            print(f"[Buffer] ✅ Scheduled for channel {channel_id}")
        except Exception as e:
            print(f"[Buffer] ❌ Failed for channel {channel_id}: {e}")


# ─────────────────────────────────────────────
# STEP 4b — YOUTUBE DATA API v3 (Long-form upload)
# ─────────────────────────────────────────────

def _get_youtube_service():
    """
    Build authenticated YouTube API service.
    First run: opens browser for OAuth2 consent (stores token in youtube_oauth_token.json).
    Subsequent runs: loads stored token automatically.
    """
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request as GoogleRequest
        from googleapiclient.discovery import build
    except ImportError:
        raise RuntimeError(
            "google-api-python-client / google-auth-oauthlib not installed. "
            "Run: pip install google-api-python-client google-auth-oauthlib"
        )

    creds = None

    if YT_CREDENTIALS_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(YT_CREDENTIALS_FILE), YT_SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
        else:
            if not YT_CLIENT_SECRETS_FILE.exists():
                raise RuntimeError(
                    f"YouTube client_secrets.json not found at:\n{YT_CLIENT_SECRETS_FILE}\n"
                    "Download it from Google Cloud Console → APIs & Services → Credentials."
                )
            # Support both 'installed' (Desktop) and 'web' app types
            import json as _json
            secrets_data = _json.loads(YT_CLIENT_SECRETS_FILE.read_text(encoding="utf-8"))
            app_type = list(secrets_data.keys())[0]  # 'installed' or 'web'
            if app_type == "web":
                # Patch to 'installed' format so InstalledAppFlow works
                secrets_data["installed"] = secrets_data.pop("web")
                secrets_data["installed"]["redirect_uris"] = ["http://localhost:8080/"]
                patched_path = YT_CLIENT_SECRETS_FILE.parent / "_yt_secrets_patched.json"
                patched_path.write_text(_json.dumps(secrets_data), encoding="utf-8")
                secrets_file = str(patched_path)
                print("[YouTube] Web-type credentials patched to 'installed' with strict port 8080 redirect.")
            else:
                secrets_file = str(YT_CLIENT_SECRETS_FILE)

            flow = InstalledAppFlow.from_client_secrets_file(secrets_file, YT_SCOPES)
            creds = flow.run_local_server(port=8080)

            # Cleanup patched file if created
            patched = YT_CLIENT_SECRETS_FILE.parent / "_yt_secrets_patched.json"
            if patched.exists():
                try: patched.unlink()
                except: pass

        YT_CREDENTIALS_FILE.parent.mkdir(parents=True, exist_ok=True)
        YT_CREDENTIALS_FILE.write_text(creds.to_json(), encoding="utf-8")
        print(f"[YouTube] OAuth token saved to {YT_CREDENTIALS_FILE}")

    return build("youtube", "v3", credentials=creds)


def upload_to_youtube_longform(
    video_path: Path,
    title: str,
    description: str,
    tags: list[str] | None = None,
    dry_run: bool = False,
) -> str | None:
    """
    Upload a video as a standard YouTube video (not a Short).
    Returns the YouTube video URL, or None on failure.
    """
    if dry_run:
        print(f"[YouTube][Dry-Run] Would upload: {video_path.name}")
        print(f"  Title: {title}")
        return None

    if not YT_CLIENT_SECRETS_FILE.exists() and not YT_CREDENTIALS_FILE.exists():
        print(
            "[YouTube] ⚠️  No client_secrets.json or stored token found.\n"
            f"   Place your OAuth2 client secrets at:\n   {YT_CLIENT_SECRETS_FILE}\n"
            "   Skipping YouTube long-form upload."
        )
        return None

    try:
        from googleapiclient.http import MediaFileUpload

        youtube = _get_youtube_service()

        body = {
            "snippet": {
                "title": title[:100],
                "description": description[:5000],
                "tags": tags or ["WorldCup2026", "GoalChain", "Solana", "SportsBetting", "Soccer"],
                "categoryId": "17",  # Sports
                "defaultLanguage": "en",
            },
            "status": {
                "privacyStatus": "public",
                "selfDeclaredMadeForKids": False,
            },
        }

        media = MediaFileUpload(
            str(video_path),
            mimetype="video/mp4",
            resumable=True,
            chunksize=1024 * 1024 * 5  # 5 MB chunks
        )

        print(f"[YouTube] Uploading: {video_path.name} ({video_path.stat().st_size // 1024} KB)")
        request = youtube.videos().insert(
            part="snippet,status",
            body=body,
            media_body=media,
        )

        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                pct = int(status.progress() * 100)
                print(f"  Upload progress: {pct}%")

        video_id = response["id"]
        yt_url = f"https://www.youtube.com/watch?v={video_id}"
        print(f"[YouTube] ✅ Uploaded: {yt_url}")
        return yt_url

    except Exception as e:
        print(f"[YouTube] ❌ Upload failed: {e}")
        return None


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Hermes Match Highlights Generator v2 — Gemini + Grok Imagine + YouTube"
    )
    parser.add_argument("--match",   type=str, help="Matchup (e.g. 'Argentina vs Austria'). Auto-detected if omitted.")
    parser.add_argument("--account", choices=["NicoPezDorado", "GoalChainSol"], default="GoalChainSol")
    parser.add_argument("--run-id",  type=str)
    parser.add_argument("--dry-run", action="store_true", help="Simulate all steps, no API calls")
    parser.add_argument("--skip-youtube", action="store_true", help="Skip YouTube long-form upload")
    parser.add_argument("--skip-buffer",  action="store_true", help="Skip Buffer scheduling")
    args = parser.parse_args()

    run_id  = args.run_id or f"match_{int(time.time())}_{args.account.lower()}"
    dry_run = args.dry_run

    print("=" * 60)
    print("  HERMES MATCH HIGHLIGHTS GENERATOR v2")
    print(f"  Account : {args.account}")
    print(f"  Run ID  : {run_id}")
    print(f"  Dry-Run : {dry_run}")
    print("=" * 60)

    # ── Step 1: Find the trending match ───────────────────────
    matchup = args.match
    if not matchup:
        print("\n[Step 1] Searching for today's trending match...")
        matchup = search_trending_match()
    print(f"[Step 1] Match: {matchup}")

    # ── Step 2: Generate screenplay (Gemini) ──────────────────
    print(f"\n[Step 2] Generating screenplay via Gemini...")
    screenplay = generate_match_screenplay(matchup, args.account, dry_run=dry_run)
    print(f"  Post text : {screenplay.get('post_text', '')[:80]}...")
    print(f"  YT title  : {screenplay.get('youtube_title', '')}")
    for sc in screenplay.get("scenes", []):
        print(f"  Scene {sc['scene_num']}: {sc['narration']}")

    update_run_state(run_id, {
        "status": "generating",
        "account_name": args.account,
        "topic": f"Highlights: {matchup}",
        "post_text": screenplay.get("post_text", ""),
    })

    # ── Step 3: Compile video ─────────────────────────────────
    print(f"\n[Step 3] Compiling video (Grok Imagine + FFmpeg)...")
    final_path = compile_highlights_video(screenplay, args.account, run_id, dry_run=dry_run)

    video_url = f"https://api.goalchain.fun/pilot/{final_path.name}"
    update_run_state(run_id, {
        "video_url": video_url,
        "status": "publishing",
    })

    # ── Step 4a: Buffer (TikTok + IG + YT Shorts) ────────────
    if not args.skip_buffer and not dry_run:
        print(f"\n[Step 4a] Scheduling via Buffer (TikTok / IG / YouTube Shorts)...")
        publish_to_buffer(args.account, final_path, screenplay.get("post_text", ""))
    else:
        print(f"\n[Step 4a] Buffer: {'DRY-RUN skip' if dry_run else 'skipped by flag'}")

    # ── Step 4b: YouTube long-form upload ─────────────────────
    if not args.skip_youtube:
        print(f"\n[Step 4b] Uploading to YouTube (long-form)...")
        yt_url = upload_to_youtube_longform(
            video_path=final_path,
            title=screenplay.get("youtube_title", f"{matchup} — World Cup 2026 Highlights | GoalChain"),
            description=screenplay.get("youtube_description",
                f"Watch the hottest moment from {matchup} at FIFA World Cup 2026. "
                "Bet on real matches on-chain at goalchain.fun #WorldCup2026 #Solana"),
            tags=["WorldCup2026", "GoalChain", "Solana", matchup.replace(" ", ""), "Soccer", "Football"],
            dry_run=dry_run,
        )
    else:
        yt_url = None
        print(f"\n[Step 4b] YouTube: skipped by flag")

    # ── Done ──────────────────────────────────────────────────
    update_run_state(run_id, {
        "status": "published",
        "video_url": video_url,
        "youtube_url": yt_url or "",
        "post_text": screenplay.get("post_text", ""),
        "topic": f"Highlights: {matchup}",
        "comments": [],
    })

    print(f"\n{'='*60}")
    print(f"  ✅ DONE — Run ID: {run_id}")
    print(f"  Video   : {final_path}")
    print(f"  CDN     : {video_url}")
    if yt_url:
        print(f"  YouTube : {yt_url}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
