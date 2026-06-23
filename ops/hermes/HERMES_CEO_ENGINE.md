# Hermes CEO — Code Engine (reemplaza FCC)

**Archivo deprecado:** Este documento describe la arquitectura anterior con Free Claude Code (FCC).  
**Arquitectura actual (desde 2026-06-12):** Motor unificado **Hermes CEO** (Nemotron-3-Ultra-free) vía `oa-run-code.sh` con semáforo de 4 slots.

---

## Nueva arquitectura: Hermes CEO

| Componente | Antes (FCC) | Ahora (Hermes CEO) |
|------------|-------------|-------------------|
| **Motor de código** | `fcc-claude` + `fcc-server` proxy | **Hermes Agent** (Grok gateway) + `oa-run-code.sh` |
| **Modelo** | Tier mapping: opus/sonnet/haiku (NIM, OpenRouter, Groq) | **NVIDIA NIM** único para P0/P1/P2 (`nvidia/nemotron-3-super-120b-a12b`, issue #832) |
| **Concurrencia** | 1 worker por perfil griego (25 perfiles) | **Semáforo 4 slots** (`worker_1.lock`–`worker_4.lock`) |
| **Perfiles** | 25 perfiles griegos + `default` | **Único: `hermes-ceo`** |
| **Configuración** | `fcc.secrets.env` → `configure-fcc-env.sh` → `~/.fcc/.env` | Keys directas en `~/hermes/config.env` |
| **Ejecución** | `fcc-claude --model <tier>` | `oa-run-code.sh --workdir <repo> --prompt-file <file>` |

---

## Flujo actual: Kanban → Hermes CEO

```bash
# 1. Manager crea issue (Discord/WhatsApp o manual)
bash ~/hermes/scripts/create-task.sh hermes P1 "[DRAFT] Task title" "detailed prompt with skills"

# 2. Hermes CEO ejecuta (máx 4 concurrentes)
bash ~/hermes/scripts/oa-run-code.sh \
  --workdir ~/hermes/workspace/GoalChain \
  --prompt-file /tmp/oa-code-prompt-<number>.txt \
  --log /tmp/oa-hermes-<number>.log

# 3. Resultado: draft PR en branch exp/hermes-issue-<number>
#    Revisión → Antigravity mergea
```

---

## Configuración (solo `~/hermes/config.env`)

```bash
# Motor de código
OA_CODE_ENGINE=hermes
# Issue #832: NVIDIA NIM provider (was: nemotron-3-ultra-free via Nous)
OA_CODE_MODEL=nvidia/nemotron-3-super-120b-a12b

# Keys usadas por Hermes CEO (ya en config.env)
NVIDIA_NIM_API_KEY=...
OPENROUTER_API_KEY=...
GROQ_API_KEY=...
DEEPSEEK_API_KEY=...
# etc.
```

**No** existe `fcc.secrets.env`, `configure-fcc-env.sh`, `fcc-server` ni `fcc-claude`.

---

## Semáforo 4 slots (`oa-run-code.sh`)

```bash
# Adquiere lock (worker_1.lock a worker_4.lock)
for i in {1..4}; do
  exec 9>"/home/ubuntu/hermes/oa/worker_${i}.lock"
  if flock -n 9; then acquired=1; lock_num=$i; break; fi
  exec 9>&-
done

# Si no hay slot libre: sleep 5 y reintenta
# Ejecuta Hermes CEO con el perfil hermes-ceo
python -m hermes_cli.main --profile hermes-ceo --oneshot "$PROMPT" --yolo --accept-hooks
```

---

## Skills disponibles (vía `install-hermes-superpowers.sh`)

| Skill | Uso |
|-------|-----|
| `frontend-design` | Webapp UI (React/Vite) — no generic AI UI |
| `gstack review` | Pre-PR quality gate |
| `gstack investigate` | Bug hunt (root cause, max 3 fixes) |
| `gstack plan-eng-review` | Large refactor / architecture (P0) |

En el issue body, agregar:
- `Apply frontend-design skill` (webapp)
- `Follow gstack plan-eng-review before coding` (P0)
- `Follow gstack investigate workflow` (bugs)
- `Follow gstack review pass before opening draft PR` (pre-merge)

---

## Referencias actualizadas

- **Setup:** [`ai_context/HERMES_SETUP.md`](../ai_context/HERMES_SETUP.md)
- **Orchestration:** [`ai_context/AGENT_ORCHESTRATION.md`](../ai_context/AGENT_ORCHESTRATION.md)
- **SOUL template:** [`ops/hermes/workspace-templates/SOUL.md`](workspace-templates/SOUL.md)
- **Superpowers install:** `bash ~/hermes/scripts/install-hermes-superpowers.sh`