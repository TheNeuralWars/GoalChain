# GBrain en Hermes: swap, keys y tus suscripciones

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/251
- **Task Status:** ready

- **Date:** 2026-05-24
- **Status:** ready
- **Owner:** Nico

## Qué tenés hoy (suscripciones)

| Suscripción | Sirve para en Hermes | ¿Alimenta GBrain embeddings? |
|-------------|-------------------|------------------------------|
| **GitHub Copilot** | OpenClaw `dev`, OpenCode `OA_MODEL=github-copilot/...` | **No** (modelo de código, no vectores) |
| **Super Grok (xAI)** | OpenClaw chat, OA worker (`xai/grok-4.3`), OAuth ya en servidor | **No** para embeddings; **sí** para LLM en agentes |
| **Cursor** | Tu Mac (desarrollo local) | **No** en el VPS Hermes |

## Qué necesita GBrain (por capa)

| Capa | ¿Obligatorio? | Con tus suscripciones |
|------|---------------|------------------------|
| **Keyword search** (`gbrain query`) | No extra | **Ya funciona** (53 páginas importadas) |
| **Dream nocturno** (`gbrain dream`) | Swap recomendado | Funciona mejor con **2GB swap** (script abajo) |
| **Embeddings** (`gbrain embed`, `gbrain think`) | API aparte | **Necesitás una de estas** (no incluida en Copilot/Cursor/Grok) |

### Opciones para embeddings (elegí una)

| Proveedor | Dónde conseguir key | Costo típico |
|-----------|---------------------|--------------|
| **ZeroEntropy** (recomendado por gbrain) | [zeroentropy.dev](https://zeroentropy.dev) → dashboard → API keys | Plan free / bajo según uso |
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | Pay-as-you-go (no es tu sub Copilot) |

**No hace falta** pagar otra suscripción tipo Copilot: con **$0–5/mes** en OpenAI o free tier ZeroEntropy alcanza para un brain chico de GoalChain.

Sin ninguna key de embedding: seguís con **keyword search** + dream con tareas que no requieren embed.

### Variables en `~/hermes/config.env` (servidor)

```bash
# Ya tenés (Super Grok / OA):
XAI_API_KEY=                    # solo si usás pay-as-you-go xAI; OAuth SuperGrok suele bastar vía opencode/openclaw
OA_MODEL=github-copilot/claude-sonnet-4.5   # ya en servidor

# GBrain embeddings (elegí UNA):
ZEROENTROPY_API_KEY=ze-...      # preferido
# OPENAI_API_KEY=sk-...         # alternativa

# GitHub (issues/PR desde scripts):
GITHUB_TOKEN=ghp_...            # ver sección GitHub abajo
```

---

## Swap 2GB (para GBrain nocturno)

El VPS tiene ~3.7GB RAM; `gbrain init` y `gbrain dream` pueden hacer OOM sin swap.

**En el servidor** (te pedirá contraseña sudo una vez):

```bash
cd ~/hermes/workspace/GoalChain
git pull origin main
sudo bash ops/hermes/setup-swap.sh
```

Verificar:

```bash
free -h
swapon --show
```

Activar dream en cron (tras swap + opcional embed):

```bash
export PATH="$HOME/.bun/bin:$PATH"
# nightly 03:30 UTC
( crontab -l 2>/dev/null; echo "30 3 * * * PATH=$HOME/.bun/bin:\$PATH gbrain dream >> $HOME/hermes/logs/gbrain-dream.log 2>&1" ) | crontab -
```

---

## GitHub token en `config.env`

### Servidor Hermes (`178.105.148.109`)

`gh` **ya está logueado** como `TheNeuralWars` (scopes: `repo`, `workflow`). Para que `config.env` tenga el token explícito (como querés):

```bash
ssh goalchain@178.105.148.109
bash ~/hermes/workspace/GoalChain/ops/hermes/sync-github-token-to-config.sh
grep '^GITHUB_TOKEN=' ~/hermes/config.env   # debe mostrar GITHUB_TOKEN="gho_..." sin pegarlo en chat
```

Eso copia el token de `gh auth` a `~/hermes/config.env` **sin imprimirlo**.

### Tu Mac (`/Users/NicoPez/hermes/config.env`)

Ese archivo es **local** (ruta Mac en `GOALCHAIN_REPO_PATH`). Para token en Mac:

```bash
gh auth login   # si no lo hiciste
bash /Users/NicoPez/GoalChain/ops/hermes/sync-github-token-to-config.sh
# o manual: GITHUB_TOKEN="$(gh auth token)"
```

**Crear PAT manual** (si preferís no usar `gh auth token`):

1. GitHub → Settings → Developer settings → [Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Repo: `TheNeuralWars/GoalChain`
3. Permisos: Issues R/W, Contents R/W, Pull requests R/W, Metadata R
4. Pegar en `GITHUB_TOKEN="ghp_..."` en `config.env` (nunca en git)

---

## Resumen: qué me tenés que dar

| Item | ¿Lo tenés que dar? | Acción |
|------|-------------------|--------|
| GitHub token | Opcional en servidor | Script `sync-github-token-to-config.sh` o PAT fine-grained |
| Swap | Contraseña sudo 1 vez | `sudo bash ops/hermes/setup-swap.sh` |
| GBrain embeddings | Solo si querés `gbrain think` / vector search | **ZeroEntropy** o **OpenAI** API key (no Copilot) |
| Copilot | Ya está | Nada |
| Super Grok | Ya está | Nada |
| Cursor | Solo Mac | Nada en VPS |

**Mínimo para seguir sin gastar más:** swap + sync GitHub token + reiniciar OpenClaw. GBrain keyword + dream ya pueden correr.

**Para “superpoderes” completos:** una key ZeroEntropy u OpenAI + `gbrain embed --stale`.

---

## Estado 2026-05-24 (configurado en VPS)

- `ZEROENTROPY_API_KEY` en `~/hermes/config.env` (no commitear)
- Embeddings: `zeroentropyai:zembed-1`, ~54 páginas importadas con vectores
- `gbrain query` híbrido operativo; `gbrain think` necesita LLM de síntesis (Anthropic u otro) — opcional
- **Pendiente:** swap (`sudo bash ops/hermes/setup-swap.sh`) antes de `gbrain dream` nocturno estable
