# 2026-06-22 — dot-hermes truth + live-sync with Tailscale

Decisión de Nico hoy, chat WhatsApp self-chat:

1. **Aclarar la diferencia real de "perfiles"**: `~/.hermes/profiles/hermes-ceo/` es un perfil
   único, no coexiste con un "default" separado. El chat actual corre en `~/.hermes/` directamente.
   `hermes-ceo.service` NO está instalado como systemd unit — el CEO corre como oneshot CLI.
   Hermes Gateway SÍ es un service activo.
2. **GBrain ESTÁ VIVO** — `(gbrain not installed)` del snapshot era bug del script:
   - `gbrain serve` activo (PID 492502), 75M PGLite, respuesta `200<!DOCTYPE …>Error response`.
   - Bug: `hermes-context.sh` chequea `command -v gbrain` sin cargar `~/.bun/bin`. Parcheado.
3. **Live-sync "verdaderamente live"** entre VPS GBrain, Mac (Cursor+Antigravity) y Win mini PC
   via Tailscale. Plan en brief CEO.

## Tailscale topología detectada (2026-06-22 10:20 UTC)
- VPS: `goalchain`, 100.101.211.44 (linux, active)
- MacBook Pro: `macbook-pro-di-jennifer`, 100.101.94.9 (macOS, offline now)
- Win mini PC: `win-90p10qeopqq`, 100.101.209.8 (windows, active, direct 94.162.217.132)

## Decisiones tomadas (Nico)
- Arreglar gbrain snapshot = P0 inmediato (hecho).
- Opción B para live-sync (sync server + clientes tailnet).
- One-shot installer para Mac (launchd) y Windows (Scheduled Task via PowerShell).
- Transporte: Tailscale (sin tunnel público, sin certs).

## Lo que este brief produce
1. GitHub issue #XYZ — CEO implementa el sync-server (con skill hints).
2. `ops/hermes/install-gbrainsync-macos.sh` — installer para Mac (one-shot).
3. `ops/hermes/install-gbrainsync-windows.ps1` — installer para Windows (one-shot).
4. `ops/hermes/gbrain-sync-server.py` (CEO lo produce) — webhook push endpoint.

## Estado
- ✅ Snapshot script parchado (commit pendiente en `docs/intake` — no requiere PR).
- ⏳ Issue CEO #TBD abierto.
- ⏳ Instaladores escritos abajo — falta commit + PR separado.
