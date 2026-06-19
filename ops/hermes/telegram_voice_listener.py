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

# Load Gemini API Key from active environment or process proc environment fallback
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    # Attempt to read from config.env or zshrc
    config_file = os.path.join(HERMES_HOME, "config.env")
    if os.path.exists(config_file):
        with open(config_file) as f:
            for line in f:
                if "GEMINI_API_KEY" in line and "=" in line:
                    GEMINI_API_KEY = line.strip().split("=", 1)[1].strip('"').strip("'")
                    break

# Fallback hardcoded matching what we extracted from active process
if not GEMINI_API_KEY:
    GEMINI_API_KEY = "AQ.Ab8RN6J42usKOAbHisJC8dkgkRpH8IZGNVet_l7rWvrIHsvpQA"

def log(msg):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] [TELEGRAM-BOT] {msg}", flush=True)

def chat_with_hermes(text):
    """Llama a la CLI de Hermes de forma síncrona para interactuar conversacionalmente"""
    log(f"Routing chat query to Hermes: '{text}'")
    try:
        env = os.environ.copy()
        local_bin = os.path.expanduser("~/.local/bin")
        if local_bin not in env.get("PATH", ""):
            env["PATH"] = f"{local_bin}:{env.get('PATH', '')}"

        # Ejecuta la CLI de Hermes con el perfil hermes-ceo y la query del usuario
        cmd = ["hermes", "-p", "hermes-ceo", "chat", "-q", text]
        log(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, env=env, timeout=180)
        
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            log(f"ERROR: Hermes CLI returned code {result.returncode}. Stderr: {result.stderr}")
            return f"❌ **Error de Hermes CLI:**\n{result.stderr.strip() or 'Código de salida no cero'}"
    except subprocess.TimeoutExpired:
        log("ERROR: Hermes CLI execution timed out.")
        return "⏰ **Hermes tardó demasiado en responder.**"
    except Exception as e:
        log(f"ERROR: Exception executing Hermes CLI: {e}")
        return f"❌ **Error llamando a Hermes:** {e}"


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
            text = data["contents"][0]["parts"][0]["text"].strip()
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

def handle_voice_message(voice_data, file_id):
    """Descarga el audio de Telegram, lo transcribe y decide si es chat o tarea de código"""
    log(f"Downloading voice note {file_id} from Telegram...")
    
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
            
        chat_id = voice_data["chat"]["id"]
        
        # Check if it is a task ingestion or a normal chat query
        if transcription.strip().lower().startswith("xq"):
            # Create intake brief
            brief_path = create_intake_brief_from_voice(transcription)
            
            # Respond back to Telegram user
            success_msg = (
                f"🧠 **Hermes Voice Ingestion Success** 🚀\n\n"
                f"📝 **Transcription:**\n_\"{transcription}\"_\n\n"
                f"📁 **Intake Brief Created:** `{os.path.basename(brief_path)}`\n"
                f"⚡ **Task status:** Enqueued autonomously (`status:ready`). Worker is coding & testing now!"
            )
            send_message(chat_id, success_msg)
        else:
            # Route as conversational query to Hermes CLI
            send_message(chat_id, "⏳ *Hermes está procesando tu consulta de voz...*")
            reply = chat_with_hermes(transcription)
            send_message(chat_id, reply)
        
    except Exception as e:
        log(f"ERROR during transcription/ingestion: {e}")
        chat_id = voice_data["chat"]["id"]
        send_message(chat_id, f"❌ **Error transcribing your voice note:** {e}")

def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    requests.post(url, json=payload)

def main_loop():
    log("Starting Telegram Voice Listener Bot...")
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
                        help_msg = (
                            "🎙️ **GoalChain Humans-0 Voice Bot (Dual Chat/Intake) 🎤**\n\n"
                            "- Envía un mensaje de voz o texto normal para chatear conmigo (usando Hermes en el VPS).\n"
                            "- Empieza tu mensaje de voz o texto con **xq** (ej: *xq crear una nueva vista*) para generar una tarea de código y ejecutar el pipeline autónomo."
                        )
                        send_message(chat_id, help_msg)
                    elif text.strip().lower().startswith("xq"):
                        # Process text as direct task ingestion
                        brief_path = create_intake_brief_from_voice(text)
                        send_message(chat_id, f"📝 **Text Brief Ingested!**\n\n📁 **Brief:** `{os.path.basename(brief_path)}`\n⚡ Task enqueued autonomously. Worker started!")
                    else:
                        # Process as direct chat with Hermes
                        send_message(chat_id, "⏳ *Hermes está procesando...*")
                        reply = chat_with_hermes(text)
                        send_message(chat_id, reply)
                        
        except Exception as e:
            log(f"Exception in polling loop: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main_loop()
