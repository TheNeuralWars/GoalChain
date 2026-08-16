#!/usr/bin/env python3
"""
hermes-mmwebhook.py
-------------------
Bridge between Mattermost outgoing webhooks/slash commands and the
REAL Hermes CLI agent on the VPS.

Instead of calling a mock multiagent API, this bridge executes the
real Hermes CLI command in oneshot mode, capturing the output and
updating the Mattermost chat asynchronously.

Autor: Antigravity
"""

import os
import re
import json
import subprocess
import threading
import urllib.request
import urllib.parse
import urllib.error
from http.server import BaseHTTPRequestHandler, HTTPServer

# ──────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────
PORT = int(os.getenv("HM_PORT", "8088"))
CONFIG_ENV_PATH = "/data/apps/hermes/config.env"
HERMES_CLI_PATH = "/home/ubuntu/.hermes/hermes-agent/venv/bin/python"
HERMES_CWD = "/home/ubuntu/hermes/workspace/GoalChain"

# Global lock to prevent concurrent git/database conflicts on the same workspace
cli_lock = threading.Lock()

# Global bot user ID (resolved dynamically at startup)
BOT_USER_ID = None

# Palabras clave que Mattermost antepone al texto y que debemos limpiar
TRIGGER_WORDS = {"@hermes", "hermes", "/hermes"}

# Regex for stripping ANSI color codes
ANSI_ESCAPE = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')


def load_env_file(path=CONFIG_ENV_PATH) -> dict:
    """Parses config.env and returns a dict of keys."""
    env = {}
    if not os.path.exists(path):
        print(f"[Warning] Env file not found at {path}")
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                val = val.strip("'\"")
                env[key.strip()] = val
    return env


# Initial load of configuration
config_env = load_env_file()
MM_URL = config_env.get("GOALCHAIN_MA_MATTERMOST_URL", "http://localhost:8065").rstrip("/")
BOT_TOKEN = config_env.get("GOALCHAIN_MA_MATTERMOST_BOT_TOKEN", "utw9f7ieh3ro3r3kn6hcqm3hmw")


def strip_trigger(text: str) -> str:
    """Removes the trigger word from the beginning of the message."""
    for tw in TRIGGER_WORDS:
        if text.lower().startswith(tw):
            text = text[len(tw):].lstrip(":, ")
    return text.strip()


def clean_agent_output(text: str) -> str:
    """Removes ANSI formatting and standard agent prefix wrappers."""
    text = ANSI_ESCAPE.sub('', text).strip()
    # Strip leading [Manager], [Hermes], [CEO] prefixes
    text = re.sub(r"^\[(?:Manager|Hermes|CEO)\]\s*", "", text, flags=re.IGNORECASE)
    return text.strip()


def resolve_bot_user_id():
    """Fetches the bot user ID dynamically from Mattermost."""
    global BOT_USER_ID
    url = f"{MM_URL}/api/v4/users/me"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {BOT_TOKEN}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            BOT_USER_ID = data.get("id")
            print(f"[hermes-mmwebhook] Resolved Bot User ID: {BOT_USER_ID} ({data.get('username')})")
    except Exception as e:
        print(f"[Error] Failed to resolve bot user ID: {e}")


def join_channel(channel_id: str):
    """Ensures the bot user is joined to the channel (required to post)."""
    if not BOT_USER_ID:
        return
    url = f"{MM_URL}/api/v4/channels/{channel_id}/members"
    payload = json.dumps({"user_id": BOT_USER_ID}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {BOT_TOKEN}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp.read()
    except Exception:
        # Ignore errors (e.g. already joined or direct message channels)
        pass


def post_to_mattermost(channel_id: str, message: str, root_id: str = None) -> str:
    """Posts a new message to Mattermost and returns the post ID."""
    url = f"{MM_URL}/api/v4/posts"
    payload_data = {
        "channel_id": channel_id,
        "message": message
    }
    if root_id:
        payload_data["root_id"] = root_id
        
    payload = json.dumps(payload_data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {BOT_TOKEN}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("id")
    except urllib.error.HTTPError as e:
        if root_id and e.code == 400:
            print(f"[Warning] Threaded post failed (code 400). Retrying without root_id...")
            return post_to_mattermost(channel_id, message, root_id=None)
        err_body = e.read().decode('utf-8', errors='replace')
        print(f"[Error] Failed to post message: {e.code} {err_body}")
        return None
    except Exception as e:
        print(f"[Error] Failed to post message: {e}")
        return None


def update_mattermost_post(post_id: str, message: str):
    """Updates/edits an existing Mattermost post."""
    url = f"{MM_URL}/api/v4/posts/{post_id}"
    payload = json.dumps({
        "id": post_id,
        "message": message
    }).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": f"Bearer {BOT_TOKEN}",
            "Content-Type": "application/json"
        },
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
    except Exception as e:
        print(f"[Error] Failed to update post {post_id}: {e}")


def execute_agent_task(message: str, channel_id: str, post_id_to_edit: str):
    """Executes the Hermes CLI in oneshot mode and updates the Mattermost post."""
    sub_env = os.environ.copy()
    
    # Reload keys from config.env to ensure we always have the freshest secrets
    fresh_config = load_env_file()
    sub_env.update(fresh_config)
    
    # Standardize the active NVIDIA API Key
    if "NVIDIA_API_KEY" not in sub_env and "NVIDIA_API_KEY_1" in sub_env:
        sub_env["NVIDIA_API_KEY"] = sub_env["NVIDIA_API_KEY_1"]
        
    sub_env["PATH"] = f"/home/ubuntu/.local/bin:/home/ubuntu/.npm-global/bin:/usr/local/bin:{sub_env.get('PATH', '')}"
    sub_env["HOME"] = "/home/ubuntu"
    
    cmd = [
        HERMES_CLI_PATH,
        "-m",
        "hermes_cli.main",
        "--profile",
        "hermes-ceo",
        "--continue",
        f"mm-{channel_id}",
        "--oneshot",
        message,
        "--yolo"
    ]
    
    # Safe fallback folder if workdir doesn't exist
    cwd = HERMES_CWD if os.path.exists(HERMES_CWD) else "/home/ubuntu"
    
    print(f"[hermes-mmwebhook] Starting Hermes CLI oneshot execution for channel {channel_id}...")
    
    # Run CLI within serialized lock to prevent repo/DB parallel write conflicts
    cli_lock.acquire()
    try:
        res = subprocess.run(
            cmd,
            cwd=cwd,
            env=sub_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=600 # 10 minutes timeout safety
        )
    except subprocess.TimeoutExpired:
        cli_lock.release()
        update_mattermost_post(post_id_to_edit, ":warning: La tarea de Hermes excedió el tiempo límite de 10 minutos.")
        return
    except Exception as exc:
        cli_lock.release()
        update_mattermost_post(post_id_to_edit, f":warning: Error al iniciar el proceso: {exc}")
        return
        
    cli_lock.release()
    
    if res.returncode == 0:
        output = clean_agent_output(res.stdout)
        if not output:
            output = "_El agente completó la tarea exitosamente pero no generó respuesta de texto._"
        # If output is too long, truncate it
        if len(output) > 4000:
            output = output[:4000] + "\n\n_[Respuesta truncada debido al límite de caracteres de Mattermost]_"
        update_mattermost_post(post_id_to_edit, output)
    else:
        err_msg = res.stderr or res.stdout or "Error desconocido."
        print(f"[Error] Hermes CLI returned {res.returncode}: {err_msg}")
        update_mattermost_post(
            post_id_to_edit, 
            f":warning: Error al ejecutar Hermes CLI (código {res.returncode}):\n```\n{err_msg[:1000]}\n```"
        )


class Handler(BaseHTTPRequestHandler):

    def send_json(self, obj: dict):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        """Health-check endpoint."""
        self.send_json({"ok": True, "service": "hermes-mmwebhook-real"})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        raw    = self.rfile.read(length)

        content_type = self.headers.get("Content-Type", "")

        try:
            if "json" in content_type:
                data = json.loads(raw.decode("utf-8"))
            else:
                # form-urlencoded (slash commands / webhooks)
                parsed = urllib.parse.parse_qs(raw.decode("utf-8"))
                data = {k: v[0] for k, v in parsed.items()}
        except Exception as exc:
            self.send_json({"text": f":warning: No pude parsear el payload: {exc}"})
            return

        # Ignorar mensajes del propio bot para evitar bucles
        bot_user = data.get("user_name", "")
        if bot_user in ("hermes", "webhookbot", "slackbot"):
            self.send_response(200)
            self.end_headers()
            return

        raw_text   = data.get("text", data.get("command_args", "")).strip()
        channel_id = data.get("channel_id", "default")
        user_name  = data.get("user_name", "unknown")
        post_id    = data.get("post_id", "")
        root_id    = data.get("root_id", "") or post_id

        if not raw_text:
            self.send_json({"text": "¡Hola! Escríbeme algo para que pueda ayudarte."})
            return

        message = strip_trigger(raw_text)
        if not message:
            self.send_json({"text": "¡Hola! ¿En qué puedo ayudarte?"})
            return

        print(f"[hermes-mmwebhook] {user_name} en {channel_id}: {message[:80]}")

        # Ejecutamos de manera asíncrona para prevenir timeouts en Mattermost
        def async_flow():
            join_channel(channel_id)
            post_id_to_edit = post_to_mattermost(channel_id, "🤖 _Hermes está pensando..._", root_id)
            if post_id_to_edit:
                execute_agent_task(message, channel_id, post_id_to_edit)

        threading.Thread(target=async_flow, daemon=True).start()

        # Respuesta HTTP 200 vacía para avisar a Mattermost que el POST fue recibido.
        # El bot publicará y editará el mensaje de manera asíncrona.
        self.send_response(200)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    resolve_bot_user_id()
    print(f"[hermes-mmwebhook] Iniciando bridge con Hermes CLI real en http://0.0.0.0:{PORT}")
    httpd = HTTPServer(("", PORT), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        print("[hermes-mmwebhook] Detenido.")
