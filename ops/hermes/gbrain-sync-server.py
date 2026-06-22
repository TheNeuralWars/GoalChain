#!/usr/bin/env python3
# gbrain-sync-server.py — minimal stdlib HTTP server for live brain sync.
# Listens on 0.0.0.0:8648. Allows Tailscale (100.64/10) + private/loopback only.
# JSONL audit at ~/.gbrain/sync/pushed-changes.jsonl. Tailscale = the auth.
#
# Endpoints:
#   GET  /health                  {"ok":true,"records":N,"last_seen":<iso>}
#   GET  /sync/since/<epoch>      [rec, ...] (newest first, max 50)
#   POST /webhook/gbrain-push     {"message":..., "brain_change":{...}}
#                                 -> 202; header X-Host-Id required (^[a-z0-9-]{3,32}$)
#
# Stdlib only. No Flask/fastapi. Single file.

from __future__ import annotations

import json
import os
import re
import signal
import sys
import time
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = os.environ.get("GBRAIN_SYNC_HOST", "0.0.0.0")
PORT = int(os.environ.get("GBRAIN_SYNC_PORT", "8648"))

TAILSCALE_CIDR = "100.64.0.0/10"
PRIVATE_OK_CIDRS = ("127.0.0.0/8", "10.0.0.0/8", "192.168.0.0/16")

SYNC_DIR = Path(os.environ.get("GBRAIN_SYNC_DIR", f"{os.path.expanduser('~')}/.gbrain/sync"))
SYNC_FILE = SYNC_DIR / "pushed-changes.jsonl"
MAX_RECORDS = 2000

HOST_ID_RE = re.compile(r"^[a-z0-9-]{3,32}$")

_lock = threading.Lock()
_records: list[dict] = []


def _ip_to_int(ip: str):
    parts = ip.split('.')
    if len(parts) != 4:
        return None
    try:
        return (int(parts[0]) << 24) | (int(parts[1]) << 16) | (int(parts[2]) << 8) | int(parts[3])
    except ValueError:
        return None


def _in_cidr(ip: str, cidr: str) -> bool:
    base, _, bits = cidr.partition('/')
    ip_i = _ip_to_int(ip)
    base_i = _ip_to_int(base)
    if ip_i is None or base_i is None:
        return False
    bits = int(bits)
    mask = (0xFFFFFFFF << (32 - bits)) & 0xFFFFFFFF
    return (ip_i & mask) == (base_i & mask)


def _allowed_client(ip: str) -> bool:
    if any(_in_cidr(ip, c) for c in PRIVATE_OK_CIDRS):
        return True
    if _in_cidr(ip, TAILSCALE_CIDR):
        return True
    return False


def _ensure_sync_dir() -> None:
    SYNC_DIR.mkdir(parents=True, exist_ok=True)


def _persist(rec: dict) -> None:
    _ensure_sync_dir()
    line = json.dumps(rec, ensure_ascii=False) + '\n'
    try:
        with SYNC_FILE.open('a', encoding='utf-8') as f:
            f.write(line)
    except OSError:
        pass


def _load_initial() -> None:
    if not SYNC_FILE.exists():
        return
    try:
        with SYNC_FILE.open('r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    _records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        if len(_records) > MAX_RECORDS:
            del _records[:-MAX_RECORDS]
    except OSError:
        pass


def _append(rec: dict) -> None:
    with _lock:
        _records.append(rec)
        if len(_records) > MAX_RECORDS:
            del _records[: len(_records) - MAX_RECORDS]
    _persist(rec)


def _since(epoch):
    try:
        target = int(epoch)
    except ValueError:
        target = 0
    out = [r for r in _records if r.get('ts', 0) > target]
    out.reverse()
    return out[:50]


class SyncHandler(BaseHTTPRequestHandler):
    server_version = 'gbrain-sync/0.1.0'

    def log_message(self, format, *args):
        ts = datetime.now(timezone.utc).isoformat()
        sys.stderr.write(f'[gbrain-sync] {ts} {self.address_string()} {format % args}\n')

    def _is_allowed(self) -> bool:
        ip = (self.headers.get('X-Forwarded-For', self.client_address[0])).split(',')[0].strip()
        return _allowed_client(ip)

    def _send_json(self, status: int, payload) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if not self._is_allowed():
            self._send_json(403, {'error': 'client ip not in tailscale range'})
            return
        path = urlparse(self.path).path
        if path == '/health':
            last = max((r.get('ts', 0) for r in _records), default=0)
            last_iso = (datetime.fromtimestamp(last, tz=timezone.utc).isoformat() if last else None)
            return self._send_json(200, {'ok': True, 'records': len(_records), 'last_seen': last_iso})
        if path.startswith('/sync/since/'):
            epoch = path.removeprefix('/sync/since/')
            return self._send_json(200, _since(epoch))
        self._send_json(404, {'error': 'unknown route'})

    def do_POST(self) -> None:
        if not self._is_allowed():
            self._send_json(403, {'error': 'client ip not in tailscale range'})
            return
        path = urlparse(self.path).path
        if path != '/webhook/gbrain-push':
            return self._send_json(405, {'error': 'use /webhook/gbrain-push'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            raw = self.rfile.read(length)
            data = json.loads(raw.decode('utf-8') or '{}')
        except (ValueError, json.JSONDecodeError):
            return self._send_json(400, {'error': 'invalid json'})

        host_id = self.headers.get('X-Host-Id', '').strip()
        if not HOST_ID_RE.match(host_id):
            return self._send_json(400, {'error': 'X-Host-Id header must match ^[a-z0-9-]{3,32}$'})

        message = str(data.get('message', ''))[:1024]
        brain_change = data.get('brain_change') or {}

        rec = {
            'ts': int(time.time()),
            'ts_iso': datetime.now(timezone.utc).isoformat(),
            'host_id': host_id,
            'message': message,
            'brain_change': brain_change,
            'client_ip': self.client_address[0],
        }
        _append(rec)
        return self._send_json(202, {'ok': True, 'ts': rec['ts']})


def _shutdown(_signum, _frame):
    sys.exit(0)


def main() -> None:
    _ensure_sync_dir()
    _load_initial()

    httpd = ThreadingHTTPServer((HOST, PORT), SyncHandler)
    print(f'[gbrain-sync] listening on http://{HOST}:{PORT} (cidr allow {TAILSCALE_CIDR} + private)', flush=True)

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == '__main__':
    main()
