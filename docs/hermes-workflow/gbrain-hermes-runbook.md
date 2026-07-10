# GBrain en Hermes — Runbook Operativo

## Objetivo

Configurar y mantener GBrain en el VPS Hermes con swap, embedding keys y cron nocturno de dream.

## Suscripciones actuales y qué alimentan

| Suscripción | Sirve en Hermes | ¿Alimenta embeddings? |
|-------------|----------------|----------------------|
| GitHub Copilot | `dev` agent + OpenCode `OA_MODEL=github-copilot/...` | **No** (modelo de código, no vectores) |
| Super Grok (xAI) | OpenClaw chat, OA worker (`xai/grok-4.3`) | **No** para embeddings; **sí** para LLM en agentes |
| Cursor | Solo tu Mac local | **No** en el VPS |

## GBrain por capa — qué necesitas

| Capa | ¿Obligatorio? | Estado con tus suscripciones |
|------|---------------|------------------------------|
| Keyword search (`gbrain query`) | No extra | **Ya funciona** (~53 páginas importadas) |
| Dream nocturno (`gbrain dream`) | Swap recomendado | Necesita **2GB swap** (ver abajo) |
| Embeddings (`gbrain embed`, `gbrain think`) | API aparte | Necesitás ZeroEntropy **u** OpenAI (ver abajo) |

## Swap 2GB — primera vez (requiere sudo una vez)

```bash
# En el VPS
ssh goalchain@<IP>
cd ~/hermes/workspace/GoalChain
git pull origin main
sudo bash ops/hermes/setup-swap.sh

# Verificar
free -h
swapon --show
```

Sin swap, `gbrain dream` puede hacer OOM. Swap es persistente (se activa en `/etc/fstab`).

## Embedding API key — elegir UNA

### Opción A: ZeroEntropy (recomendado)

1. Ir a https://zeroentropy.dev → Dashboard → API Keys
2. Crear key y agregar a `~/hermes/config.env`:

```bash
# En el VPS
nano ~/hermes/config.env
# Agregar línea:
ZEROENTROPY_API_KEY=ze-tu-key-aqui
```

### Opción B: OpenAI (alternativa)

```bash
# En ~/hermes/config.env
OPENAI_API_KEY=sk-tu-key-aqui
```

Sin embedding key: `gbrain query` keyword sigue funcionando. Dream corre pero no re-embed.

## Instalación GBrain (primera vez en VPS limpio)

```bash
ssh goalchain@<IP>
cd ~/hermes/workspace/GoalChain
git pull origin main
bash ops/hermes/install-gbrain-hermes.sh
# Responde no (N) a la pregunta de INSTALL_DREAM_CRON si preferís instalarlo después con el script dedicado
```

El script instala bun, gbrain CLI, PGLite, importa contexto GoalChain, y cablea MCP en Hermes/OpenClaw/FCC.

## Instalar cron de dream nocturno

```bash
# Verificar estado antes de instalar
bash ops/hermes/gbrain-dream-cron.sh status

# Instalar (dry-run primero)
bash ops/hermes/gbrain-dream-cron.sh install --dry-run
bash ops/hermes/gbrain-dream-cron.sh install

# Verificar
crontab -l | grep gbrain
```

El cron corre `gbrain dream` a las **03:30 UTC** cada noche. Log: `$HOME/hermes/logs/gbrain-dream.log`.

**El script verifica swap antes de correr dream** — si no hay swap, skips sin error.

Para desinstalar:
```bash
bash ops/hermes/gbrain-dream-cron.sh uninstall
```

## GitHub token en config.env (para scripts que usan gh CLI)

```bash
# En el VPS — si gh ya está logueado
bash ops/hermes/sync-github-token-to-config.sh
grep '^GITHUB_TOKEN=' ~/hermes/config.env   # muestra GITHUB_TOKEN="gho_..." sin pegarlo
```

Si gh no está logueado: GitHub → Settings → Developer settings → Fine-grained tokens → crear PAT con permisos repo + issues + PR. Luego editar `~/hermes/config.env` manualmente.

## Verificación post-setup

```bash
# 1. Swap
free -h && swapon --show

# 2. GBrain doctor
gbrain doctor --fast 2>/dev/null || gbrain doctor

# 3. Query test
gbrain query "GoalChain intake blockers"

# 4. Si hay embedding key
gbrain embed --stale

# 5. Dream manual (test)
gbrain dream

# 6. Cron status
bash ops/hermes/gbrain-dream-cron.sh status
```

## Resumen de variables en ~/hermes/config.env

```bash
# GBrain embeddings (elegir UNA)
ZEROENTROPY_API_KEY=ze-...     # preferido
# OPENAI_API_KEY=sk-...        # alternativa

# GitHub (scripts que usan gh CLI)
GITHUB_TOKEN="gho_..."         # vía sync-github-token-to-config.sh o PAT manual

# Modelo para OA (ya configurado)
OA_MODEL=github-copilot/claude-sonnet-4.5
```

## Rollback rápido

```bash
# Quitar cron dream
bash ops/hermes/gbrain-dream-cron.sh uninstall

# Quitar GBrain MCP de Hermes (backup creado por install-gbrain-hermes.sh)
# Restaurar: cp ~/.hermes/config.yaml.bak-gbrain-YYYYMMDDHHMMSS ~/.hermes/config.yaml

# Quitar GBrain completamente (cuidadoso — borra brain data)
rm -rf ~/.gbrain ~/brain
openclaw gateway restart
```

## Archivos del sistema

| Archivo | Qué hace |
|---------|----------|
| `ops/hermes/setup-swap.sh` | Crea 2GB swap persistente |
| `ops/hermes/sync-github-token-to-config.sh` | Copia gh auth token a config.env |
| `ops/hermes/install-gbrain-hermes.sh` | Instala GBrain + cablea MCP |
| `ops/hermes/gbrain-dream-cron.sh` | Gestiona cron de dream nocturno |
| `ops/hermes/gbrain-vacuum.sh` | Limpia JSONL históricos del brain |
| `docs/intake/2026-05-24-gbrain-keys-y-swap.md` | Intake original (referencia) |