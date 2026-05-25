# GoalChain — Guía de herramientas (para Nico y agentes)

**Última actualización:** 2026-05-25  
**Instalador FCC skills:** `bash ops/hermes/install-fcc-skills.sh`  
**Instrucciones FCC en repo:** `CLAUDE.md` (raíz)

---

## Mapa mental (quién usa qué)

| Herramienta | Hermes (Manager) | FCC (código 24/7) | Cursor (Mac) | Antigravity (Mac) |
|-------------|------------------|-------------------|--------------|-------------------|
| **GBrain** MCP | Sí (`gbrain query`) | No | Sí (`.cursor/mcp.json`) | Sí (`mcp_config.json`) |
| **goalchain-ops** MCP | Sí (cron/scans) | No | Opcional | Opcional |
| **frontend-design** skill | No (delega) | Sí (webapp) | Sí | Sí |
| **gstack** (review/plan) | No | Sí (sin browser) | Sí (completo + `/qa`) | Sí |
| **superpowers** (obra) | No | No en VPS headless | **Recomendado** | Gemini extension |
| **Grok** (chat) | Sí (gateway) | No | No | No |

---

## Para Nico — cómo usarlo tú

### 1) Pedir código automático (FCC en el VPS)

**Canal:** Discord `#dev-room` / `#openclaw-chat`, WhatsApp con prefijo `manager:`, o issue manual.

**Ejemplo (Discord / WhatsApp):**
```text
manager: implementá en la webapp un banner de mantenimiento cuando la API health falle. P1.
```

**Qué hace Hermes:**
1. Crea issue `agent:opencode` + `status:ready` + prioridad P0/P1/P2  
2. `oa-worker` lanza `fcc-claude` con prompt que incluye `CLAUDE.md`  
3. FCC usa skills **frontend-design** (UI) y **gstack review** (mentalidad)  
4. Abrís el **draft PR** en GitHub → revisás → **Antigravity** mergea  

**Forzar prioridad:**
| Decís | Tier FCC | Cuándo |
|-------|----------|--------|
| P0 / refactor / on-chain | opus | Arquitectura, economía |
| P1 (default) | sonnet | Features normales |
| P2 / typo / CSS | haiku | Cambios chicos |

**Urgente a main (cuidado):** incluí `cambio urgente` en el mensaje.

---

### 2) UI de la webapp (frontend-design)

En Cursor o Antigravity, en el chat:

```text
Usá el skill frontend-design. Rediseñá la pantalla de wallet en goalchain_webapp
sin estética genérica de IA; mantené glass + Solana wallet adapter.
```

En un **issue para FCC**, Hermes debería escribir en el cuerpo:
```text
Scope: goalchain_webapp/src/ui/...
Apply frontend-design skill (distinctive UI, no AI slop).
```

---

### 3) Revisión seria en tu Mac (gstack)

**Requisito:** gstack instalado (`bash ops/hermes/install-fcc-skills.sh` en Mac).

En **Claude Code** o terminal con `claude` / `fcc-claude` interactivo:

```text
/review
```
o en lenguaje natural:
```text
Hacé un pass estilo gstack /review sobre goalchain_webapp/src/ui/App.tsx
```

**QA con browser (solo Mac):**
```text
/qa
```
Necesita Chromium; **no** está soportado en el VPS headless.

**No uses** `/ship` si el flujo es draft PR → Antigravity (choca con `CLAUDE.md`).

---

### 4) Superpowers (Cursor / Antigravity) — planificación humana

**Cursor (una vez):**
```text
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```
O marketplace oficial:
```text
/plugin install superpowers@claude-plugins-official
```

**Antigravity:**
```bash
bash ops/hermes/install-gbrain-antigravity.sh   # GBrain ya
gemini extensions install https://github.com/obra/superpowers   # si usás Gemini CLI
```

**Cuándo usarlo:** antes de features grandes en Mac — brainstorming, plan, TDD. **No** lo corre el worker FCC solo.

---

### 5) GBrain (memoria del proyecto)

**Hermes (VPS)** — en chat o cron:
```text
manager: consultá GBrain: ¿qué quedó pendiente del intake de Hermes FCC?
```
(Hermes debería llamar MCP `gbrain` con `gbrain query`.)

**Cursor / Antigravity (Mac):**
1. Reiniciá el IDE (para cargar MCP).  
2. Preguntá: `Busca en GBrain el intake sobre FCC skills`  

**Refrescar memoria tras merge:**
```bash
gbrain import ai_context docs/intake && gbrain embed --stale
```

---

### 6) Instalar / actualizar skills FCC

**En tu Mac:**
```bash
cd /Users/NicoPez/GoalChain
chmod +x ops/hermes/install-fcc-skills.sh
bash ops/hermes/install-fcc-skills.sh
```

**En el VPS (tras `git pull`):**
```bash
ssh goalchain@178.105.148.109
cd ~/hermes/workspace/GoalChain && git pull
bash ops/hermes/install-fcc-skills.sh
# o si ya están los scripts en ~/hermes/scripts:
bash ~/hermes/scripts/install-fcc-skills.sh
```

**Verificar:**
```bash
ls ~/.claude/skills/frontend-design/SKILL.md
ls ~/.claude/skills/gstack/setup
```

---

## Órdenes de ejecución por agente

### Hermes (Manager) — `~/.hermes/SOUL.md`

Al crear tareas `agent:opencode`:

1. Incluir rutas de archivos exactas y comando de test.  
2. Si toca `goalchain_webapp/`, añadir: `Apply frontend-design skill.`  
3. Si es refactor grande: `P0` + `Follow gstack plan-eng-review before coding.`  
4. Nunca pedir merge a main salvo `cambio urgente`.  
5. No instalar paquetes de la lista NFTCPS sin spike en `docs/intake/`.

### FCC (oa-worker) — prompt automático

Lee `CLAUDE.md` + issue body. Skills en `~/.claude/skills/`. Headless: **sin** slash commands; seguir tablas de `CLAUDE.md`.

### Antigravity (integración)

1. Merge owner — revisar draft PR de FCC.  
2. Usar **gstack `/review`** local antes de merge si el PR es UI o on-chain.  
3. **superpowers** opcional para spikes `exp/antigravity-*`.  
4. Tras merge: `gbrain import` en Mac.

### Cursor (draft)

1. Leer `CLAUDE.md` + `ai_context/AGENT_TOOLS_GUIDE.md`.  
2. **frontend-design** para UI; no mergear a `main`.  
3. GBrain MCP tras reload de ventana.  
4. superpowers para exploración; entregar handoff a Antigravity.

### Grok

Review only en `exp/grok-*` — sin instalar skills FCC; packet de riesgos según `AGENT_ORCHESTRATION.md`.

---

## Troubleshooting

| Síntoma | Acción |
|---------|--------|
| FCC PR “genérico feo” | Issue debe mencionar frontend-design; reinstalar skill |
| Worker no mejora código | `journalctl --user -u oa-worker -n 50`; verificar `fcc-claude` |
| Cursor no ve GBrain | Reload window; `bash ops/hermes/install-gbrain-cursor.sh` |
| gstack `/qa` falla en VPS | Normal — usar `/qa` solo en Mac |
| Confusión “superpowers” | Repo `install-hermes-superpowers.sh` = MCP+cron; obra/superpowers = metodología IDE |

---

## Referencias

- `ai_context/HERMES_SETUP.md` — runtime VPS  
- `ai_context/AGENT_ORCHESTRATION.md` — roles y handoffs  
- `ops/hermes/workspace-templates/SOUL.md` — plantilla Manager  
- `CLAUDE.md` — contrato FCC  
