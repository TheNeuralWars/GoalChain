# Registro de vértices — GoalChain

Cada fila es un **vértice de producción**: una superficie con dueño único, fuente de verdad y gate de calidad.

**Leyenda estado:** `done` = en main · `deploy` = coded, falta prod · `pending` = no iniciado · `frozen` = congelado Mundial

---

## V1 — On-chain (`goalchain_program`)

| Campo | Valor |
|-------|-------|
| **Dueño merge** | Antigravity |
| **Fuente de verdad** | `lib.rs` + tests `goalchain_program/tests/` |
| **Program ID (devnet)** | `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg` |
| **Estado Mundial** | `done` (46 ix; MVP usa ~5 en prod real) |
| **KPI** | Tests anchor verdes; IDL = `goalchain-sdk` |

**Producción real hoy:** `place_bet`, `claim_bet_payout`, `refund_bet`, fixture lifecycle, builder fund (ops).

**Post-Mundial:** `place_market_bet`, rent UI, vault spends validados en cluster objetivo.

**Orden Antigravity:** Tras merge stack, correr tests program; no nuevas ix sin brief P0 firmado por CEO.

---

## V2 — Economía canónica

| Campo | Valor |
|-------|-------|
| **Dueño** | Antigravity (cambios) + Grok (review copy/riesgo) |
| **Fuente de verdad** | `docs/ECONOMIC_CANONICAL_CONFIG.json` |
| **Estado** | `done` (v1.0.0-p0) |
| **KPI** | API `/api/economy/config` sin drift vs on-chain en devnet |

**Orden:** Cualquier cambio numérico → PR dedicado + actualizar oracle `rarityYield.ts` + `IMPLEMENTATION_STATUS.md`.

Ver [`PARAMETER_EXCELLENCE.md`](PARAMETER_EXCELLENCE.md).

---

## V3 — Oracle (`goalchain_oracle`)

| Campo | Valor |
|-------|-------|
| **Dueño** | Antigravity |
| **Fuente de verdad** | `OracleService.ts`, `runScraperOracle.ts` |
| **Estado Mundial** | `done` (record_match on FT; yields desde JSON) |
| **KPI** | Log `Player match participation recorded` en FT demo |

**Orden:** En demos FT, rellenar `participantPlayerIds` en `scripts/oracle_match_state.json`. Mantener `ORACLE_RECORD_MATCH_ON_COMPLETE` ≠ `false`.

**Post-Mundial:** Vault crank execute real o documentar OFF permanente.

---

## V4 — API (`goalchain_api`)

| Campo | Valor |
|-------|-------|
| **Dueño** | Antigravity |
| **URL prod** | `https://crm.goalchain.fun/goalchain-api` |
| **Estado Mundial** | `done` (9 rutas); Play usa ops + economy |
| **KPI** | p95 &lt; 2s en `/api/ops/status` y `/api/economy/config` |

**Gap P1:** Coach `POST /api/coach/chat` vía `apiBaseUrl()` en Play (no localhost).

**Orden FCC (post-merge):** Hook coach en Estadio; retirar `localhost:3001` en `docs/assets/js/ai_agent.js`.

---

## V5 — Play (`goalchain_webapp`)

| Campo | Valor |
|-------|-------|
| **Dueño implementación** | FCC |
| **Dueño merge** | Antigravity |
| **URL** | `play.goalchain.fun` |
| **Estado** | `done` en repo · `deploy` en Vercel/DNS |
| **KPI** | Demo runbook 5 min; build CI verde |

**Rutas verdad on-chain:** `/`, `/estadio` (bet+claim), ops panel.

**Rutas SIMULACIÓN:** `/defi`, `/club` (badges obligatorios).

**Orden Nico:** `VITE_API_BASE_URL` prod en Vercel. Una demo bet→claim grabada.

---

## V6 — Marketing (`docs/` → goalchain.fun)

| Campo | Valor |
|-------|-------|
| **Dueño** | Antigravity (CTAs) + Grok (copy EN público) |
| **Estado** | `done` CTAs Estadio Mundial |
| **KPI** | 100% CTAs transaccionales → `/go/` o play; sin txs reales en marketing |

**Regla:** Educar + hype; **nunca** implicar mainnet live sin checklist.

**Orden:** No añadir nuevos portales mock sin badge “EDUCATIVO”.

---

## V7 — Ops / agentes (`ops/hermes`)

| Campo | Valor |
|-------|-------|
| **Dueño** | Hermes (VPS) |
| **Perfil activo** | `jito-strategy` |
| **Estado** | `done` plantillas CEO; script sync discord |
| **KPI** | `#hermes` free_response; cola ≤ 3; FCC solo Mundial |

**Scripts canónicos:**
- `configure-discord-hermes-channel.sh`
- `sync-hermes-active-profile-discord.sh`
- `oa-worker` / `oa-dispatch-local.sh`

**Orden Hermes:** Ejecutar freeze FCC; un issue `mundial-mvp`; respuestas `estado` diarias pre-11-jun.

---

## V8 — Memoria (GBrain + Git)

| Campo | Valor |
|-------|-------|
| **Dueño ritual** | Todos post-merge |
| **Estado** | `done` docs; sync manual Mac↔VPS |
| **KPI** | `gbrain import ai_context docs/intake` tras cada merge a main |

**Orden CEO:** Reiniciar IDE tras cambios MCP; no confundir GBrain con hermes-vault.

---

## Matriz de dependencias (quién espera a quién)

| Bloqueado | Espera |
|-----------|--------|
| Deploy Play prod | Merge #26–#34 + creds Vercel Nico |
| Demo inversor | Deploy + faucet GCH devnet |
| Genesis Agents | Post-Mundial brief P2 |
| Mainnet GCH | `LAUNCH_READINESS_CHECKLIST.md` + auditoría |
