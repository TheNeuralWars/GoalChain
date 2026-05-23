# Handoff Antigravity — Hermes + OpenClaw + Voice (GoalChain)

- **Status:** done (OpenClaw + WhatsApp Manager; Twilio voice optional/deferred)
- **Priority:** P1
- **Owner (implementer):** antigravity
- **Reviewers:** cursor
- **Created:** 2026-05-23
- **PR:** (pendiente)

## Objective

Completar en el servidor Hermes (`178.105.148.109`) la integración OpenClaw + Grok + Voice Call (Twilio/ngrok), sin romper el flujo Hermes (`~/hermes`).

## Context (read first)

- Repo: `TheNeuralWars/GoalChain` (clone en server: `~/hermes/workspace/GoalChain`)
- **Hermes** = scripts 24/7 (`~/hermes/scripts/*`, `config.env`)
- **OpenClaw** = gateway Grok en `127.0.0.1:18789` (panel vía SSH tunnel desde Mac)
- **Fuente de verdad tareas:** `docs/intake/*.md` + GitHub issues
- **Cursor** implementa código; **Antigravity** solo ops en server salvo brief explícito
- Docs: `ai_context/AGENT_ORCHESTRATION.md`, `ai_context/HERMES_SETUP.md`

### Estado al handoff (2026-05-23)

| Componente | Estado |
|------------|--------|
| Hermes sync/digest | OK (`~/hermes`) |
| OpenClaw gateway | OK (`Connectivity probe: ok`) |
| xAI OAuth (Grok) | OK (`xai/grok-4.3` o `grok-build`) |
| Device pairing panel | Reparado vía scopes en `~/.openclaw/devices/*.json` |
| ngrok | Debe quedar en tmux: `ngrok http 3334` → `skyrocket-femur-endpoint.ngrok-free.dev` |
| Voice Call plugin | Instalar/configurar + Twilio credenciales (pendiente usuario) |

## Allowed files (server only)

- `~/.openclaw/openclaw.json`
- `~/.openclaw/devices/*`
- `~/hermes/config.env`
- `~/hermes/scripts/*`
- tmux/systemd user services del usuario `goalchain`
- **NO** editar `GoalChain` repo salvo `docs/intake/` markdown

## Out of scope

- Cambios en `goalchain_program`, API, webapp
- Commits a `main` sin review Cursor
- Exponer gateway en `0.0.0.0` (mantener loopback + SSH tunnel)

## Tasks (orden estricto)

### 1) Verificar servicios base

```bash
openclaw gateway status
"$HOME/hermes/scripts/sync.sh"
tmux ls
```

### 2) Mantener ngrok para webhooks Twilio

```bash
tmux attach -t ngrok-voice
# debe mostrar: https://skyrocket-femur-endpoint.ngrok-free.dev -> http://127.0.0.1:3334
```

Si no existe sesión:

```bash
tmux new -s ngrok-voice
ngrok http 3334
```

Webhook URL:

```text
https://skyrocket-femur-endpoint.ngrok-free.dev/voice/webhook
```

### 3) Instalar/activar Voice Call

```bash
openclaw plugins install @openclaw/voice-call
systemctl --user restart openclaw-gateway.service
sleep 12
openclaw plugins list | grep -i voice
```

### 4) Configurar `voice-call` en `~/.openclaw/openclaw.json`

Pedir a Nico (fuera de git):

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (E.164)
- `NICO_MOBILE` (E.164, allowlist)

Plantilla mínima:

```json
"voice-call": {
  "enabled": true,
  "config": {
    "provider": "twilio",
    "fromNumber": "+1...",
    "inboundPolicy": "allowlist",
    "allowFrom": ["+54..."],
    "twilio": { "accountSid": "AC...", "authToken": "..." },
    "serve": { "port": 3334, "path": "/voice/webhook" },
    "publicUrl": "https://skyrocket-femur-endpoint.ngrok-free.dev/voice/webhook",
    "outbound": { "defaultMode": "conversation" },
    "streaming": { "enabled": true }
  }
}
```

### 5) Twilio console

Número → Voice → webhook POST → `publicUrl` arriba.

### 6) Validar

```bash
openclaw voicecall setup
openclaw voicecall smoke
openclaw voicecall smoke --to "+54NICO_MOBILE" --yes
```

### 7) Reportar

Crear/update brief con resultado + bloqueos. Si OK, marcar **Status: done** y notificar Cursor.

## Pairing fix (si vuelve `scope upgrade pending`)

NO usar `devices approve` en bucle si el panel sigue reconectando.

Aplicar fix local (backup automático):

```bash
python3 - <<'PY'
import json, shutil, time
from pathlib import Path
dev = Path.home() / ".openclaw/devices"
paired_p, pending_p = dev/"paired.json", dev/"pending.json"
ts = time.strftime("%Y%m%d-%H%M%S")
for p in (paired_p, pending_p):
    shutil.copy2(p, p.with_suffix(p.suffix + f".bak.{ts}"))
paired = json.loads(paired_p.read_text())
pending = json.loads(pending_p.read_text())
FULL = ["operator.admin","operator.read","operator.write","operator.approvals","operator.pairing","operator.talk","operator.talk.secrets"]
for rid, req in list(pending.items()):
    did = req.get("deviceId")
    if did in paired:
        merged = sorted(set((paired[did].get("scopes") or []) + (req.get("scopes") or []) + FULL))
        paired[did]["scopes"] = merged
        paired[did]["approvedScopes"] = merged
        del pending[rid]
paired_p.write_text(json.dumps(paired, indent=2))
pending_p.write_text(json.dumps(pending, indent=2))
print("done")
PY
```

## Mac access (para Nico)

```bash
# Panel OpenClaw
ssh -N -L 18790:127.0.0.1:18789 goalchain@178.105.148.109
# Browser: http://127.0.0.1:18790/#token=<gateway.auth.token>
```

Token: `python3 -c 'import json;print(json.load(open("/home/goalchain/.openclaw/openclaw.json"))["gateway"]["auth"]["token"])'` (solo en server, no pegar en Slack).

## Acceptance criteria

- [ ] `openclaw gateway status` → `Connectivity probe: ok`
- [ ] ngrok activo en 3334 con URL estable
- [ ] `openclaw voicecall setup` sin errores de webhook
- [ ] Llamada de prueba `--yes` a móvil de Nico (o documentar bloqueo Twilio)
- [ ] Resumen en este brief: qué se hizo, qué falta, comandos exactos

## Test commands

```bash
openclaw gateway status
openclaw voicecall setup
openclaw voicecall smoke --to "+54..." --yes
"$HOME/hermes/scripts/sync.sh"
```

## Risks and rollback

- **Risk:** ngrok URL cambia → actualizar `publicUrl` + Twilio webhook.
- **Risk:** tokens expuestos en chat → rotar `gateway.auth.token` y Twilio auth.
- **Rollback:** `openclaw.json.bak*`, `~/.openclaw/devices/*.bak.*`, `systemctl --user restart openclaw-gateway`.

## Notes for other agents

- **Cursor:** no tocar server; revisar solo este brief al cerrar.
- **Hermes:** solo intake/digest; no implementar código on-chain.
- **Grok:** review opcional del runbook.
