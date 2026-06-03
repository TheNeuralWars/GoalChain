#!/usr/bin/env python3
"""
Telegram Voice Listener Bot for GoalChain (Humans-0 Pipeline)
Escucha notas de voz de Telegram, las transcribe con Gemini v1beta,
genera un brief de ingesta en docs/intake/ y detona el flujo autónomo de código y push.
"""

import os
import sys
import json
import time
import base64
import requests
import subprocess

# === CONFIGURATION ===
BOT_TOKEN = "8677250341:AAFK4UIJzXxgnGL_qLhXrq_RmRKeWKmCNIg"
HERMES_HOME = os.getenv("HERMES_HOME", os.path.expanduser("~/hermes"))
REPO_ROOT = os.getenv("GOALCHAIN_REPO_PATH", os.path.join(HERMES_HOME, "workspace/GoalChain"))
INTAKE_DIR = os.path.join(REPO_ROOT, "docs/intake")

# Local Gemini Web API proxy
LOCAL_API_URL = "http://localhost:8081/v1/chat/completions"
CHAT_HISTORY = {} # Keep conversation history: chat_id -> list of message dicts

# Load Gemini API Key from active environment or process proc environment fallback
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    config_file = os.path.join(HERMES_HOME, "config.env")
    if os.path.exists(config_file):
        with open(config_file) as f:
            for line in f:
                if "GEMINI_API_KEY" in line and "=" in line:
                    parts = line.split("=", 1)
                    val = parts[1].strip().strip('"').strip("'")
                    GEMINI_API_KEY = val
                    os.environ["GEMINI_API_KEY"] = val

def report_to_discord(brief_path, transcription_text):
    """Llama al reporte de Discord en segundo plano"""
    try:
        subprocess.Popen([
            "python3", 
            "/home/ubuntu/GoalChain/scripts/post_discord_manifesto.py", 
            "--task-file", brief_path
        ])
    except Exception as e:
        log(f"Reporter error (non-fatal): {e}")

def log(msg):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [TELEGRAM-BOT] {msg}", flush=True)

def transcribe_audio_gemini(audio_bytes, mime_type="audio/ogg"):
    """Llama a la API de Gemini v1beta con soporte nativo de audio multimodal (sin dependencias de SDK)"""
    if not GEMINI_API_KEY:
        raise ValueError("Missing GEMINI_API_KEY. Cannot transcribe audio.")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64_audio
                        }
                    },
                    {
                        "text": (
                            "Transcribí este audio con alta precisión en el idioma original. "
                            "Si contiene mezclas de inglés y español o jerga técnica de programación/blockchain "
                            "(como React, components, NFTs, Solana, PDA, SDK, etc.), mantenelos exactos "
                            "y no los traduzcas. Devolvé ÚNICAMENTE la transcripción limpia sin comentarios."
                        )
                    }
                ]
            }
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        data = response.json()
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            return text
        except (KeyError, IndexError) as e:
            raise Exception(f"Failed parsing Gemini API response: {e}. Raw response: {response.text}")
    else:
        raise Exception(f"Gemini API returned status {response.status_code}: {response.text}")

def create_intake_brief_from_voice(transcription_text):
    """Crea un brief de ingesta en docs/intake/ y lo guarda en disco"""
    os.makedirs(INTAKE_DIR, exist_ok=True)
    
    date_str = time.strftime("%Y-%m-%d")
    timestamp = int(time.time())
    slug = f"voice-task-{timestamp}"
    filepath = os.path.join(INTAKE_DIR, f"{date_str}-{slug}.md")
    
    words = transcription_text.strip().split()
    title_words = words[:8] if len(words) >= 8 else words
    title_str = " ".join(title_words).strip(".!?, ")
    if not title_str:
        title_str = "Voice Task via Telegram"
        
    title = f"Voice Task: {title_str}"
    
    markdown_content = f"""# {title}

- **Status:** ready-for-hermes
- **Priority:** P1
- **Owner:** grok-triage
- **Created:** {date_str}
- **Source:** Voice Note via Telegram Bot

## Objective

This task was received as a voice note from Nico via the Telegram Bot and transcribed autonomously using the Gemini Multimodal Audio engine.

## Transcription

> {transcription_text}

## Recommended Path Forward

- [ ] Parse and generate implementation tasks via autonomic-intake-processor.
- [ ] Auto-dispatch to FCC/OpenCode for code implementation.
- [ ] Run typescript checks and auto-merge to main if clean.

## Tags

#voice-task #telegram-bot #gemini-transcribe #humans-0 #autonomous-push
"""
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(markdown_content)
        
    log(f"Successfully generated intake brief: {filepath}")
    return filepath

def chat_with_gemini(chat_id, user_text):
    """Talks to the local gemini-web2api server with conversational history"""
    if chat_id not in CHAT_HISTORY:
        CHAT_HISTORY[chat_id] = [
            {"role": "system", "content": "You are Hermes, Nico's expert Web3 & SportsFi development agent for GoalChain. Help him design, draft, and refine features. Keep formatting readable and tone direct."}
        ]
    
    # Append user prompt
    CHAT_HISTORY[chat_id].append({"role": "user", "content": user_text})
    
    # Keep history to last 15 messages (plus system prompt) to conserve context
    if len(CHAT_HISTORY[chat_id]) > 16:
        CHAT_HISTORY[chat_id] = [CHAT_HISTORY[chat_id][0]] + CHAT_HISTORY[chat_id][-15:]
        
    try:
        payload = {
            "model": "gemini-3.5-flash-thinking",
            "messages": CHAT_HISTORY[chat_id]
        }
        res = requests.post(LOCAL_API_URL, json=payload, timeout=90)
        if res.status_code == 200:
            assistant_content = res.json()["choices"][0]["message"]["content"]
            CHAT_HISTORY[chat_id].append({"role": "assistant", "content": assistant_content})
            return assistant_content
        else:
            return f"⚠️ Local Gemini API proxy returned status {res.status_code}: {res.text}"
    except Exception as e:
        return f"⚠️ Error communicating with local Gemini API proxy: {e}"

def process_text_flow(chat_id, text):
    """Decides if the text is a direct intake command (starting with xq) or standard agent chat"""
    cleaned = text.strip()
    
    # Check for direct code/tasks ingestion prefix
    if cleaned.lower().startswith("xq "):
        task_prompt = cleaned[3:].strip()
        brief_path = create_intake_brief_from_voice(task_prompt)
        report_to_discord(brief_path, task_prompt)
        response_msg = (
            f"📝 **Text Brief Ingested!**\n\n"
            f"📁 **Brief:** `{os.path.basename(brief_path)}`\n"
            f"⚡ Task enqueued autonomously. Worker started!"
        )
        send_message(chat_id, response_msg)
    else:
        # Standard chat mode
        response = chat_with_gemini(chat_id, cleaned)
        send_message(chat_id, response)

def handle_voice_message(voice_data, file_id):
    """Descarga el audio de Telegram, lo transcribe y procesa como chat o ingesta"""
    log(f"Downloading voice note {file_id} from Telegram...")
    chat_id = voice_data["chat"]["id"]
    
    file_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getFile?file_id={file_id}"
    res = requests.get(file_url).json()
    if not res.get("ok"):
        log(f"ERROR: Failed to get file path from Telegram: {res}")
        return
        
    file_path = res["result"]["file_path"]
    download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
    
    audio_res = requests.get(download_url)
    if audio_res.status_code != 200:
        log(f"ERROR: Failed to download audio file: {audio_res.status_code}")
        return
        
    audio_bytes = audio_res.content
    log("Voice note downloaded. Transcribing using Gemini multimodal...")
    
    try:
        transcription = transcribe_audio_gemini(audio_bytes, mime_type="audio/ogg")
        log(f"Transcription result: '{transcription}'")
        
        if len(transcription.strip()) < 3:
            log("WARN: Transcription is too short. Ignoring.")
            return
            
        process_text_flow(chat_id, transcription)
        
    except Exception as e:
        log(f"ERROR during transcription/processing: {e}")
        send_message(chat_id, f"❌ **Error processing voice note:** {e}")

def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    # Fallback to HTML if markdown parsing fails
    res = requests.post(url, json=payload)
    if res.status_code != 200:
        payload["parse_mode"] = ""
        requests.post(url, json=payload)

def main_loop():
    log("Starting Telegram Voice Listener Bot (Dual Chat/Intake Mode)...")
    offset = 0
    
    while True:
        try:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?offset={offset}&timeout=30"
            res = requests.get(url, timeout=35).json()
            
            if not res.get("ok"):
                log(f"ERROR getting updates: {res}")
                time.sleep(5)
                continue
                
            for update in res.get("result", []):
                update_id = update["update_id"]
                offset = update_id + 1
                
                message = update.get("message")
                if not message:
                    continue
                    
                # Check for voice notes
                if "voice" in message:
                    voice = message["voice"]
                    file_id = voice["file_id"]
                    handle_voice_message(message, file_id)
                elif "text" in message:
                    text = message["text"]
                    chat_id = message["chat"]["id"]
                    log(f"Received text command: {text}")
                    if text.lower().startswith("/start") or text.lower().startswith("/help"):
                        send_message(chat_id, "🎙️ **GoalChain Humans-0 Voice Bot (Dual Chat/Intake)** 🎙️\n\n- Talk normally to chat with me as an AI assistant to discuss ideas.\n- Start your message with `xq ` (e.g. `xq create a new page`) to trigger an automatic code intake task.")
                    else:
                        process_text_flow(chat_id, text)
                        
        except Exception as e:
            log(f"Exception in polling loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main_loop()
