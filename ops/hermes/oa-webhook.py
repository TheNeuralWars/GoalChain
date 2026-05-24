#!/usr/bin/env python3
"""
OA webhook receiver with lightweight auth + payload normalization.

Supported payload styles:
- Generic JSON: {"source":"discord","from":"nico","text":"...","meta":{...}}
- Discord-like JSON: {"content":"...","author":{"username":"..."}}
- WhatsApp/Twilio form: Body=...&From=...
"""

import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs

HOST = "127.0.0.1"
PORT = 3456

HERMES_HOME = Path.home() / "hermes"
CONFIG_PATH = HERMES_HOME / "config.env"
OA_HOME = HERMES_HOME / "oa"
INBOX = OA_HOME / "inbox" / "messages.jsonl"
OA_HOME.mkdir(parents=True, exist_ok=True)
INBOX.parent.mkdir(parents=True, exist_ok=True)


def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_config(path: Path) -> dict:
    if not path.exists():
        return {}
    out = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        value = value.replace("${HOME}", str(Path.home()))
        out[key] = value
    return out


CONFIG = load_config(CONFIG_PATH)
WEBHOOK_TOKEN = os.getenv("OA_WEBHOOK_TOKEN", CONFIG.get("OA_WEBHOOK_TOKEN", "")).strip()
ALLOWED_SOURCES = {
    x.strip().lower()
    for x in os.getenv("OA_WEBHOOK_ALLOWED_SOURCES", CONFIG.get("OA_WEBHOOK_ALLOWED_SOURCES", "")).split(",")
    if x.strip()
}


def normalize_payload(path: str, payload: dict) -> dict:
    data = payload if isinstance(payload, dict) else {}
    nested = data.get("d") if isinstance(data.get("d"), dict) else {}
    source = (
        data.get("source")
        or data.get("platform")
        or ("discord" if "discord" in path else ("whatsapp" if "whatsapp" in path else "unknown"))
    )
    sender = (
        data.get("from")
        or data.get("sender")
        or (data.get("author") or {}).get("username")
        or data.get("From")
        or nested.get("author", {}).get("username")
        or "unknown"
    )
    text = (
        data.get("text")
        or data.get("content")
        or data.get("Body")
        or nested.get("content")
        or ""
    )
    return {
        "source": str(source).strip() or "unknown",
        "from": str(sender).strip() or "unknown",
        "text": str(text).strip(),
        "meta": data.get("meta", {}) if isinstance(data.get("meta"), dict) else {},
    }


def parse_request_body(content_type: str, raw: str) -> dict:
    if "application/x-www-form-urlencoded" in content_type:
        parsed = parse_qs(raw or "", keep_blank_values=True)
        return {k: (v[0] if isinstance(v, list) and v else "") for k, v in parsed.items()}
    try:
        return json.loads(raw or "{}")
    except json.JSONDecodeError:
        return {}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, payload: dict):
        out = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def _authorized(self) -> bool:
        if not WEBHOOK_TOKEN:
            return True
        auth = self.headers.get("Authorization", "")
        header_token = self.headers.get("X-OA-Token", "")
        bearer = auth.replace("Bearer ", "", 1).strip() if auth.startswith("Bearer ") else ""
        return WEBHOOK_TOKEN in {header_token.strip(), bearer}

    def do_POST(self):
        if self.path not in {"/webhook", "/webhook/discord", "/webhook/whatsapp"}:
            self._send(404, {"ok": False, "error": "not_found"})
            return
        if not self._authorized():
            self._send(401, {"ok": False, "error": "unauthorized"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        content_type = self.headers.get("Content-Type", "")
        payload = parse_request_body(content_type, raw)
        msg = normalize_payload(self.path, payload)

        if ALLOWED_SOURCES and msg["source"].lower() not in ALLOWED_SOURCES:
            self._send(403, {"ok": False, "error": "source_not_allowed"})
            return
        if not msg["text"]:
            self._send(400, {"ok": False, "error": "text_required"})
            return

        msg["id"] = f"oa-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
        msg["receivedAt"] = now_utc()

        with INBOX.open("a", encoding="utf-8") as f:
            f.write(json.dumps(msg, ensure_ascii=True) + "\n")

        self._send(200, {"ok": True, "queued": True, "id": msg["id"]})

    def log_message(self, _fmt, *_args):
        return


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print(f"[oa-webhook] listening on http://{HOST}:{PORT}/webhook", flush=True)
    server.serve_forever()
