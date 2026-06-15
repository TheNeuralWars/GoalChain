#!/usr/bin/env python3
"""
Telegram Voice Listener Bot for GoalChain (Humans-0 Pipeline)
Escucha notas de voz de Telegram, las transcribe con Gemini v1beta,
genera un brief de ingesta en docs/intake/ y detona el flujo autónomo de código y push.
También admite chat directo con Grok (xAI) y consulta de estado de la cola.
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
QUEUE_FILE = os.path.join(HERMES_HOME, ".local-issues/queue.json")

CHAT_HISTORY = {} # Keep conversation history: chat_id -> list of message dicts

# Load Gemini and xAI API Keys from config.env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
XAI_API_KEY = os.getenv("XAI_API_KEY")

def load_keys():
    global GEMINI_API_KEY, XAI_API_KEY
    config_file = os.path.join(HERMES_HOME, "config.env")
    if os.path.exists(config_file):
        with open(config_file) as f:
            for line in f:
                if "=" in line:
                    parts = line.split("=", 1)
                    key = parts[0].strip()
                    val = parts[1].strip().strip('"').strip("'")
                    if key == "GEMINI_API_KEY":
                        GEMINI_API_KEY = val
                        os.environ["GEMINI_API_KEY"] = val
                    elif key == "XAI_API_KEY":
                        XAI_API_KEY = val
                        os.environ["XAI_API_KEY"] = val

load_keys()

# Fallback keys if empty
if not GEMINI_API_KEY:
    GEMINI_API_KEY = "AQ.Ab8RN6J42usKOAbHisJC8dkgkRpH8IZGNVet_l7rWvrIHsvpQA"
if not XAI_API_KEY:
    XAI_API_KEY = ""

def log(msg):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [TELEGRAM-BOT] {msg}", flush=True)

def transcribe_audio_gemini(audio_bytes, mime_type="audio/ogg"):
    """Llama a la API de Gemini v1beta con soporte nativo de audio multimodal"""
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
    
    # Extract first few words as title
    words = transcription_text.strip().split()
    title_words = words[:8] if len(words) >= 8 else words
    title_str = " ".join(title_words).strip(".!?, ")
    if not title_str:
        title_str = "Voice Task via Telegram"
        
    title = f"Voice Task: {title_str}"
    
    markdown_content = f"""# {title}

- **Status:** ready-for-hermes
- **Priority:** P1
- **Owner:** opencode
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

def get_local_queue_status():
    """Reads queue.json and returns a formatted status report"""
    if not os.path.exists(QUEUE_FILE):
        return "📁 No queue file found on VPS."
    
    try:
        with open(QUEUE_FILE, "r") as f:
            data = json.load(f)
        issues = data.get("issues", [])
        if not issues:
            return "✅ The queue is empty."
        
        status_map = {
            "in_progress": "⚡ In Progress",
            "ready": "⏳ Ready",
            "done": "✅ Done",
            "merged": "🚀 Merged",
            "blocked": "🚫 Blocked"
        }
        
        report = "📊 **GoalChain Fleet Status** 📊\n\n"
        for i in issues:
            gh_num = i.get("github_number")
            issue_ref = f"#{gh_num}" if gh_num else f"ID {i.get('id')}"
            status = i.get("status")
            status_display = status_map.get(status, status.capitalize())
            worker = i.get("assigned_worker") or "None"
            
            report += f"• **{issue_ref}**: {i.get('title')}\n"
            report += f"  Status: {status_display} | Worker: `{worker}`\n\n"
            
        return report.strip()
    except Exception as e:
        return f"⚠️ Error reading queue status: {e}"

def chat_with_grok(chat_id, user_text):
    """Chats with Grok (xAI) using XAI_API_KEY and maintains conversation history"""
    if not XAI_API_KEY:
        return "⚠️ Missing XAI_API_KEY in VPS environment. Cannot chat."

    if chat_id not in CHAT_HISTORY:
        CHAT_HISTORY[chat_id] = [
            {"role": "system", "content": "You are Hermes, Nico's expert Web3 & SportsFi development agent for GoalChain. Help him design, draft, and refine features. Keep formatting readable, bullet-pointed where helpful, and tone direct. Speak in Spanish since Nico is Spanish-speaking."}
        ]

    # Append new user message
    CHAT_HISTORY[chat_id].append({"role": "user", "content": user_text})

    url = "https://api.x.ai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {XAI_API_KEY}"
    }
    
    payload = {
        "model": os.environ.get("XAI_MODEL", "grok-4.3"),
        "messages": CHAT_HISTORY[chat_id],
        "temperature": 0.7
    }

    try:
        res = requests.post(url, json=payload, headers=headers, timeout=40)
        if res.status_code == 200:
            data = res.json()
            assistant_text = data["choices"][0]["message"]["content"].strip()
            
            # Save history
            CHAT_HISTORY[chat_id].append({"role": "assistant", "content": assistant_text})
            
            # Limit history to 20 messages (including system prompt)
            if len(CHAT_HISTORY[chat_id]) > 21:
                CHAT_HISTORY[chat_id] = [CHAT_HISTORY[chat_id][0]] + CHAT_HISTORY[chat_id][-20:]
                
            return assistant_text
        else:
            return f"⚠️ Grok API returned status {res.status_code}: {res.text}"
    except Exception as e:
        return f"⚠️ Error communicating with Grok API: {e}"

def process_text_flow(chat_id, text):
    """Decides if the text is a direct intake command, a status query, or standard chat"""
    cleaned = text.strip()
    cleaned_lower = cleaned.lower()
    
    # 1. Check for queue status commands
    if cleaned_lower in ["/status", "status", "queue", "/queue", "cola", "estado"]:
        status_report = get_local_queue_status()
        send_message(chat_id, status_report)
        return

    # 2. Check for direct code/tasks ingestion prefix
    if cleaned_lower.startswith("xq "):
        task_prompt = cleaned[3:].strip()
        brief_path = create_intake_brief_from_voice(task_prompt)
        response_msg = (
            f"📝 **Text Brief Ingested!**\n\n"
            f"📁 **Brief:** `{os.path.basename(brief_path)}`\n"
            f"⚡ Task enqueued autonomously. Worker started!"
        )
        send_message(chat_id, response_msg)
    else:
        # 3. Standard chat mode (uses Grok/xAI as default)
        response = chat_with_grok(chat_id, cleaned)
        send_message(chat_id, response)

def handle_voice_message(voice_data, file_id):
    """Descarga el audio de Telegram, lo transcribe y genera la tarea"""
    log(f"Downloading voice note {file_id} from Telegram...")
    chat_id = voice_data["chat"]["id"]
    
    # getFile API call
    file_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getFile?file_id={file_id}"
    res = requests.get(file_url).json()
    
    if not res.get("ok"):
        log(f"ERROR: Failed to get file path from Telegram: {res}")
        return
        
    file_path = res["result"]["file_path"]
    download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
    
    # Download audio bytes
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
            
        # Create intake brief
        brief_path = create_intake_brief_from_voice(transcription)
        
        # Respond back to Telegram user
        success_msg = (
            f"🧠 **Hermes Ingestion de Voz Exitosa** 🚀\n\n"
            f"📝 **Transcripción:**\n_\"{transcription}\"_\n\n"
            f"📁 **Brief de Ingreso Creado:** `{os.path.basename(brief_path)}`\n"
            f"⚡ **Estado:** Tarea encolada autónomamente (`status:ready`). ¡El worker está codificando y testeando!"
        )
        send_message(chat_id, success_msg)
        
    except Exception as e:
        log(f"ERROR during transcription/ingestion: {e}")
        send_message(chat_id, f"❌ **Error al transcribir tu nota de voz:** {e}\n\nNota: Tu cuenta de Gemini API parece bloqueada (403 PERMISSION_DENIED). Por favor actualiza GEMINI_API_KEY en config.env.")

def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
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
                        send_message(chat_id, "🎙️ **GoalChain Humans-0 Voice Bot (Modo Dual)** 🎙️\n\n- Háblame normalmente para chatear conmigo sobre ideas (usando Grok).\n- Envía `status` o `queue` para ver el estado de la flota de workers.\n- Empieza tu mensaje con `xq ` (ej: `xq agregar endpoint de prueba`) para encolar una tarea de código automáticamente.")
                    else:
                        process_text_flow(chat_id, text)
                        
        except Exception as e:
            log(f"Exception in polling loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main_loop()
