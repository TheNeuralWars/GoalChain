#!/usr/bin/env python3
import os
import sys
import time
import argparse
import requests

# Forzar codificación UTF-8 en salida estándar para consolas Windows (evita errores con emojis)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from requests_oauthlib import OAuth1
from dotenv import load_dotenv

# Cargar variables desde el archivo .env en la raíz del proyecto
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Credenciales de Discord
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
# Canales de Discord
DISCORD_DEV_CHANNEL = "1506815180129173504"  # #dev-announcements
DISCORD_PROD_CHANNEL = "1503668120521408513" # #📢┃announcements

# Credenciales de X (Twitter)
X_API_KEY = os.getenv("X_API_KEY")
X_API_SECRET = os.getenv("X_API_SECRET")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
X_ACCESS_SECRET = os.getenv("X_ACCESS_SECRET")

def post_to_discord(token, channel_id, file_path, message_text):
    print(f"\n--- Posting to Discord Channel: {channel_id} ---")
    if not token:
        print("❌ Error: Missing DISCORD_TOKEN")
        return False
        
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages"
    headers = {
        "Authorization": f"Bot {token}"
    }
    
    if not os.path.exists(file_path):
        print(f"❌ Error: Video file not found at {file_path}")
        return False

    with open(file_path, "rb") as f:
        files = {
            "file": (os.path.basename(file_path), f, "video/mp4")
        }
        data = {
            "content": message_text
        }
        print("Uploading video file to Discord...")
        res = requests.post(url, headers=headers, files=files, data=data)
        
    if res.status_code in [200, 201]:
        print("✅ Video posted to Discord successfully!")
        return True
    else:
        print(f"❌ Failed to post to Discord: {res.status_code} - {res.text}")
        return False

def upload_video_to_twitter(auth, file_path):
    print("\n--- Uploading Video to Twitter (Chunked Media API) ---")
    filename = os.path.basename(file_path)
    total_bytes = os.path.getsize(file_path)
    
    upload_url = "https://upload.twitter.com/1.1/media/upload.json"
    
    # STEP 1: INIT
    init_data = {
        "command": "INIT",
        "media_type": "video/mp4",
        "media_category": "tweet_video",
        "total_bytes": str(total_bytes)
    }
    
    print(f"INIT: Initializing upload for {filename} ({total_bytes} bytes)...")
    res = requests.post(upload_url, auth=auth, data=init_data)
    if res.status_code != 202:
        print(f"❌ INIT failed: {res.status_code} - {res.text}")
        return None
        
    media_id = res.json()["media_id_string"]
    print(f"✅ INIT succeeded. Media ID: {media_id}")
    
    # STEP 2: APPEND
    chunk_size = 1024 * 1024  # 1 MB chunks
    segment_index = 0
    
    with open(file_path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
                
            print(f"APPEND: Uploading segment {segment_index} ({len(chunk)} bytes)...")
            append_data = {
                "command": "APPEND",
                "media_id": media_id,
                "segment_index": str(segment_index)
            }
            append_files = {
                "media": chunk
            }
            
            res = requests.post(upload_url, auth=auth, data=append_data, files=append_files)
            if res.status_code < 200 or res.status_code >= 300:
                print(f"❌ APPEND failed on segment {segment_index}: {res.status_code} - {res.text}")
                return None
                
            segment_index += 1
            
    print("✅ All segments uploaded.")
    
    # STEP 3: FINALIZE
    finalize_data = {
        "command": "FINALIZE",
        "media_id": media_id
    }
    print("FINALIZE: Finalizing upload...")
    res = requests.post(upload_url, auth=auth, data=finalize_data)
    if res.status_code < 200 or res.status_code >= 300:
        print(f"❌ FINALIZE failed: {res.status_code} - {res.text}")
        return None
        
    print("✅ FINALIZE succeeded.")
    
    # STEP 4: STATUS (Wait for processing)
    res_json = res.json()
    processing_info = res_json.get("processing_info")
    
    while processing_info:
        state = processing_info.get("state")
        print(f"STATUS: Video processing state: {state}")
        
        if state == "succeeded":
            break
        elif state == "failed":
            error_info = processing_info.get("error", {})
            print(f"❌ Video processing failed: {error_info.get('message')}")
            return None
            
        check_after_secs = processing_info.get("check_after_secs", 5)
        print(f"Waiting {check_after_secs} seconds for processing...")
        time.sleep(check_after_secs)
        
        status_params = {
            "command": "STATUS",
            "media_id": media_id
        }
        res = requests.get(upload_url, auth=auth, params=status_params)
        if res.status_code != 200:
            print(f"❌ STATUS poll failed: {res.status_code} - {res.text}")
            return None
            
        processing_info = res.json().get("processing_info")
        
    print("✅ Video processing completed successfully!")
    return media_id

def post_to_twitter(auth, media_id, tweet_text):
    print(f"\n--- Posting Tweet with Media ID {media_id} ---")
    url_v2 = "https://api.twitter.com/2/tweets"
    
    payload = {
        "text": tweet_text,
        "media": {
            "media_ids": [media_id]
        }
    }
    
    res = requests.post(url_v2, auth=auth, json=payload)
    if res.status_code == 201:
        tweet_id = res.json()["data"]["id"]
        print(f"✅ Tweet published successfully! ID: {tweet_id}")
        print(f"🔗 View Tweet: https://x.com/i/status/{tweet_id}")
        return True
    else:
        print(f"❌ Failed to publish Tweet: {res.status_code} - {res.text}")
        return False

def main():
    parser = argparse.ArgumentParser(description="GoalChain Social Video Poster")
    parser.add_argument("--video", required=True, help="Path to the MP4 video to upload")
    parser.add_argument("--text", default="⚽ LIVE ORACLE UPDATE: Yield boosted on GoalChain! 💎🚀", help="Text caption for the post")
    parser.add_argument("--discord-only", action="store_true", help="Post only to Discord")
    parser.add_argument("--twitter-only", action="store_true", help="Post only to Twitter (X)")
    parser.add_argument("--prod", action="store_true", help="Send to production Discord announcements instead of dev room")
    parser.add_argument("--channel-id", help="Override Discord channel ID")

    args = parser.parse_args()

    # Determine which Discord channel to use
    discord_channel = DISCORD_DEV_CHANNEL
    if args.prod:
        discord_channel = DISCORD_PROD_CHANNEL
    if args.channel_id:
        discord_channel = args.channel_id

    # Verify video file exists
    if not os.path.exists(args.video):
        print(f"❌ Error: Video file not found: {args.video}")
        sys.exit(1)

    discord_success = True
    twitter_success = True

    # 1. Post to Discord
    if not args.twitter_only:
        discord_success = post_to_discord(
            token=DISCORD_TOKEN,
            channel_id=discord_channel,
            file_path=args.video,
            message_text=args.text
        )

    # 2. Post to Twitter (X)
    if not args.discord_only:
        if not all([X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET]):
            print("❌ Error: Missing Twitter credentials in .env")
            twitter_success = False
        else:
            auth = OAuth1(X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET)
            media_id = upload_video_to_twitter(auth, args.video)
            if media_id:
                twitter_success = post_to_twitter(auth, media_id, args.text)
            else:
                print("❌ Twitter upload failed. Cannot post tweet.")
                twitter_success = False

    # Summary
    print("\n--- Posting Summary ---")
    if not args.twitter_only:
        print(f"Discord Posting: {'✅ SUCCESS' if discord_success else '❌ FAILED'}")
    if not args.discord_only:
        print(f"Twitter Posting: {'✅ SUCCESS' if twitter_success else '❌ FAILED'}")

    if not (discord_success and twitter_success):
        sys.exit(1)

if __name__ == "__main__":
    main()
