#!/usr/bin/env python3
"""Post weekend milestone update to X and Discord announcements."""
from __future__ import annotations

import base64
import hmac
import json
import os
import sys
import time
import urllib.parse
from hashlib import sha1
from pathlib import Path

import requests

HERMES_HOME = Path(os.getenv("HERMES_HOME", Path.home() / "hermes"))
CONFIG = HERMES_HOME / "config.env"
DISCORD_ANNOUNCEMENTS = os.getenv("DISCORD_ANNOUNCEMENTS_CHANNEL_ID", "1503668120521408513")


def load_config() -> None:
    if not CONFIG.exists():
        raise SystemExit(f"missing {CONFIG}")
    for line in CONFIG.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def _pct(v: str) -> str:
    return urllib.parse.quote(v, safe="~-._")


def oauth1(method: str, url: str, ck: str, cs: str, at: str, ats: str) -> str:
    nonce = base64.urlsafe_b64encode(os.urandom(16)).decode().rstrip("=")
    ts = str(int(time.time()))
    oauth = {
        "oauth_consumer_key": ck,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": ts,
        "oauth_token": at,
        "oauth_version": "1.0",
    }
    base = url.split("?", 1)[0]
    param_str = "&".join(f"{_pct(k)}={_pct(v)}" for k, v in sorted(oauth.items()))
    base_str = "&".join([_pct(method.upper()), _pct(base), _pct(param_str)])
    key = f"{_pct(cs)}&{_pct(ats)}"
    sig = base64.b64encode(hmac.new(key.encode(), base_str.encode(), sha1).digest()).decode()
    oauth["oauth_signature"] = sig
    return "OAuth " + ", ".join(f'{_pct(k)}="{_pct(v)}"' for k, v in sorted(oauth.items()))


def post_x(text: str, reply_to: str | None = None) -> str:
    ck = os.getenv("X_API_KEY", "")
    cs = os.getenv("X_API_SECRET", "")
    at = os.getenv("X_ACCESS_TOKEN", "")
    ats = os.getenv("X_ACCESS_SECRET", "")
    if not all([ck, cs, at, ats]):
        raise SystemExit("X API credentials missing")
    url = "https://api.x.com/2/tweets"
    payload: dict = {"text": text[:280]}
    if reply_to:
        payload["reply"] = {"in_reply_to_tweet_id": reply_to}
    r = requests.post(
        url,
        headers={
            "Authorization": oauth1("POST", url, ck, cs, at, ats),
            "Content-Type": "application/json",
            "User-Agent": "GoalChainAnnounce/1.0",
        },
        json=payload,
        timeout=30,
    )
    if r.status_code not in (200, 201):
        raise SystemExit(f"X post failed {r.status_code}: {r.text[:400]}")
    tid = r.json().get("data", {}).get("id", "")
    print(f"x: ok tweet_id={tid}")
    return tid


def post_discord(content: str) -> None:
    token = os.getenv("DISCORD_TOKEN", "")
    channel = os.getenv("DISCORD_ANNOUNCEMENTS_CHANNEL_ID", DISCORD_ANNOUNCEMENTS)
    if not token:
        raise SystemExit("DISCORD_TOKEN missing")
    url = f"https://discord.com/api/v10/channels/{channel}/messages"
    r = requests.post(
        url,
        headers={
            "Authorization": f"Bot {token}",
            "Content-Type": "application/json",
            "User-Agent": "GoalChainAnnounce/1.0",
        },
        json={"content": content[:1900]},
        timeout=30,
    )
    if r.status_code not in (200, 201):
        raise SystemExit(f"Discord post failed {r.status_code}: {r.text[:400]}")
    print(f"discord: ok message_id={r.json().get('id','')}")


X1 = """🌙 Fin de semana épico en GoalChain.

▸ play.goalchain.fun en vivo — dashboard + Classic Hub
▸ Hermes 24/7 + agentes de código (FCC) en el VPS
▸ API Ops pública · X-Scout en #active-research

No es un demo. Es la antesala. 🧵👇"""

X2 = """Soñamos en cadena, construimos en Devnet:

→ Partidos y apuestas con wallet real
→ Manager IA que convierte chat en PRs
→ Economía player-first: 1% cap · 99% al jugador

El roadmap no es un PDF — es código que despierta cada noche.

https://play.goalchain.fun · https://goalchain.fun

#GoalChain #Solana #AIAgents #Web3"""

DISCORD_MSG = """🌙 **GoalChain — fin de semana de avances (y el sueño sigue despierto)**

Este fin de semana cruzamos una línea: dejó de ser “proyecto en repo” y empezó a sentirse **protocolo vivo**.

**Lo que ya está encendido**
• **Play** → https://play.goalchain.fun — dashboard denso, Classic Hub en `/hub`, Devnet con Phantom
• **Ops en vivo** → API en `crm.goalchain.fun/goalchain-api` (mint gate, vault crank, contributor epoch)
• **Hermes 24/7** → Manager en Discord/WhatsApp; convierte pedidos en issues y ramas `exp/opencode-issue-*`
• **FCC (Free Claude Code)** → agente de código multi-proveedor (OpenRouter, NVIDIA NIM, Groq…) sin que tengas que elegir modelos a mano
• **X-Scout** → radar automático en el foro **#active-research** (señales X + síntesis Grok cada ~2h)

**El sueño que estamos materializando**
Imaginá despertar y que el ecosistema ya avanzó: issues cerrados, PRs en review, oportunidades escouteadas, panel Ops verde. Eso no es magia — es **orquestación**: Hermes piensa, FCC construye, vos y el squad revisan.

**Hacia dónde vamos (roadmap en movimiento)**
1. **Devnet sólido** — transacciones reales en Play, smoke diario, menos fricción wallet/RPC
2. **Agentes productivos** — más automatización desde Discord (`P0/P1/P2` → tier Opus/Sonnet/Haiku sin memorizar slugs)
3. **Economía transparente** — treasury, sinks, mint gate alineados al canon on-chain
4. **Comunidad** — research forum alimentado, anuncios claros, contribuidores al Builder Fund

*Build the code. Play the odds. Capture the yield.* ⚽🚀

→ Probalo: https://play.goalchain.fun
→ Ecosistema: https://goalchain.fun
→ ¿Ideas o bugs? `#dev-room` o mencioná al Manager."""


def main() -> int:
    load_config()
    t1 = post_x(X1)
    post_x(X2, reply_to=t1)
    post_discord(DISCORD_MSG)
    return 0


if __name__ == "__main__":
    sys.exit(main())
