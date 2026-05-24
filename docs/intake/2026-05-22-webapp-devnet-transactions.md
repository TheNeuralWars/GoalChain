# Conectar goalchain_webapp a flujos reales en Devnet (MVP)

- **Status:** done
- **Priority:** P1
- **Owner (implementer):** cursor
- **Reviewers:** grok
- **Created:** 2026-05-22
- **PR:** pending merge (`feat/webapp-devnet-mvp`)
- **Play URL:** `https://play.goalchain.fun` (alias `goalchain.fun/go`) — ver `docs/FRONTEND_ROUTING.md`

## Canonical brief

Este es el **único brief activo** para transacciones devnet en el webapp.

Briefs duplicados (no usar):

| File | Status |
|------|--------|
| `2026-05-23-quiero-que-el-webapp-muestre-transacciones-en-devnet.md` | **cancelled** — redirige aquí |

## Objective

Reemplazar datos y acciones simuladas en `goalchain_webapp` por lectura on-chain y al menos una transacción firmada real en Devnet (`place_bet`), alineada con `docs/FRONTEND_OWNERSHIP_POLICY.md`.

## Context

- `goalchain_webapp` ya usa wallet adapter en Devnet (`App.tsx`) pero `FixturesPanel` y `TradingTerminal` son mock/simulación.
- `@goalchain/sdk` expone `PROGRAM_ID`, `idl`, `SEEDS`; la integración transaccional vive en el webapp, no en `docs`.
- API ya expone `GET /api/economy/config` (útil para banner de reglas y drift check).
- Bloquea release readiness: checklist §1 “wallet, claims, markets” en `docs/LAUNCH_READINESS_CHECKLIST.md`.
- PRs de infra (#32–#34) pueden mergearse en paralelo; este brief no toca oracle video ni health alerts.

Referencias:

- `docs/EXECUTION_BACKLOG_90D.md` — webapp como cliente transaccional oficial
- `docs/issues/ATOMIC_ISSUES_90D.md` — tipo `webapp`
- `ai_context/AGENT_ORCHESTRATION.md` — handoff Hermes → Cursor

## Allowed files

- `goalchain_webapp/src/**` (nuevos `lib/` o `hooks/` permitidos)
- `goalchain_webapp/.env.example` (nuevo)
- `goalchain_webapp/vite.config.ts` (solo si hace falta env)
- `goalchain_webapp/package.json` (solo deps ya usadas: anchor, sdk, web3)
- `goalchain-sdk/src/index.ts` (solo helpers PDA/tx mínimos si faltan — coordinar diff pequeño)

## Out of scope

- `docs/**` (salvo enlace en PR description, no en este diff)
- `goalchain_program/**`, cambios de economía on-chain
- `goalchain_oracle/**`, `goalchain_api/**` (no añadir endpoints nuevos en este MVP)
- `TradingTerminal` bots / perps simulados (dejar mock con badge “simulation”)
- `AICommentator`, `SwarmVaults` — sin txs en este brief
- Mainnet, presale, mint gate automation
- Antigravity merge directo — solo PR revisado por Cursor

## Acceptance criteria

### Infra cliente

- [ ] Variables documentadas en `.env.example`: `VITE_RPC_URL`, `VITE_API_BASE_URL`, `VITE_PROGRAM_ID` (default = SDK `PROGRAM_ID` devnet)
- [ ] Hook o módulo `useGoalchainProgram()` (Anchor + wallet) reutilizable en paneles

### Lectura

- [ ] `FixturesPanel` lista fixtures desde Devnet (`program.account.fixture.all()` o filtro por `config` PDA), sin array mock hardcoded
- [ ] Estados vacío/error: wallet desconectada, RPC caído, sin fixtures — mensajes UX claros (ES/EN consistente con UI actual)
- [ ] Banner o footer muestra snapshot de `GET /api/economy/config` cuando `VITE_API_BASE_URL` está definido; degradación graceful si API offline

### Transacción MVP

- [ ] Botón apostar en fixture dispara `place_bet` real con monto mínimo de prueba (input o preset documentado en PR)
- [ ] Tx: loading → success (signature link a explorer devnet) o error Anchor parseado (sin `alert()` genérico como único feedback)
- [ ] Tras tx exitosa, pools del fixture se refrescan

### Calidad

- [ ] `npm run build` en `goalchain_webapp` sin errores TS
- [ ] Sin secretos en repo; `.env` local gitignored
- [ ] Paneles no transaccionales siguen marcados como simulación donde aplique

### Opcional (si hay tiempo en la misma PR, no bloqueante)

- [ ] `claim_daily_salary` o `claim_bet_payout` en UI secundaria si existe fixture resuelto en devnet

## Test commands

```bash
# SDK
cd goalchain-sdk && npm run build

# Webapp
cd goalchain_webapp && npm install && npm run build

# Dev manual (requiere Phantom en Devnet + SOL de faucet)
cd goalchain_webapp && npm run dev
# 1) Conectar wallet
# 2) Ver fixtures on-chain (o mensaje si no hay)
# 3) place_bet en fixture abierto → confirmar en explorer
```

```bash
# API opcional (otra terminal)
cd goalchain_api && RPC_URL=https://api.devnet.solana.com npm start
curl -s "$VITE_API_BASE_URL/api/economy/config" | head
```

```bash
# Smoke programa (si dudas de IDL/cuentas)
cd goalchain_program && anchor build
```

## Risks and rollback

- **Risk:** Cuentas devnet desincronizadas (config/fixture/mint) → txs fallan con errores crípticos.
- **Mitigación:** Mostrar `programId` + cluster en UI debug; documentar en PR qué fixtures de devnet usar.
- **Risk:** Drift entre `ECONOMIC_CANONICAL_CONFIG.json` y on-chain.
- **Mitigación:** Comparar campos clave del banner API vs constantes mostradas; no hardcodear fees en UI.
- **Rollback:** Revert PR; webapp vuelve a mock (comportamiento anterior).

## Implementation notes (Cursor)

1. Crear `goalchain_webapp/src/lib/anchor.ts` — `Program<GoalchainProgram>` con `useAnchorWallet` + `Connection`.
2. PDAs: usar `SEEDS` del SDK; copiar derivación de tests (`goalchain_program/tests/goalchain_program.ts`) para `fixture`, `user_bet`, `fixture_vault`.
3. `place_bet`: validar wallet, side, amount en token base del protocolo (leer de config account on-chain).
4. No refactor masivo de CSS/componentes; mínimo diff en `FixturesPanel.tsx`.

## Notes for other agents

- **Hermes:** Al crear follow-ups, usar nuevos archivos en `docs/intake/` para claims/markets/rent — no ampliar scope de este brief. Actualizar status aquí cuando PR abra.
- **Grok:** Revisar solo seguridad UX (montos, mensajes de error, no filtrar keys) y copy de “Official Transactional Frontend”.
- **Antigravity:** Spike UI opcional en `exp/antigravity-webapp-devnet` — no editar `FixturesPanel` en paralelo con Cursor.

## Hermes server checklist (24/7)

Cuando este brief pase a `assigned`:

1. Postear en Slack/intake: link a este archivo + owner Cursor.
2. Recordar variables de entorno en el server de Hermes (solo lectura): `GOALCHAIN_REPO_PATH`, health `GET /api/economy/health` post-merge #34.
3. Al cerrar PR: cambiar **Status** → `done` y pegar URL del PR abajo.

**PR:** _pendiente_
