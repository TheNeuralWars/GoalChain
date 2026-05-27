# Directivas operativas — por agente y CEO

**Vigencia:** Mundial 2026 (hasta 2026-06-11)  
**Hub:** [`ai_context/MASTER_PLAN.md`](../../ai_context/MASTER_PLAN.md)

Copiar/pegar en Discord `#hermes`, issues GitHub o handoffs.

---

## CEO — Nico

### Comandos (solo estos en público/privado con Hermes)

```
prioridad
estado
dispatch antigravity merge stack 26-34
dispatch opencode deploy vercel play mundial
empresa: estado cola FCC y demo Mundial
grafo: partnerships API y monetización post-Mundial
```

`empresa:` / `grafo:` invocan LangGraph en loopback (`ops/hermes/call-langgraph.sh`). Hermes publica el `summary`; no auto-crea issues salvo confirmación + `dispatch`.

### Órdenes esta semana

| # | Orden | Criterio de éxito |
|---|-------|-------------------|
| C1 | Aprobar merge secuencial **#26→#34** (Antigravity) | `main` actualizado |
| C2 | **Una** demo devnet bet→claim en &lt; 5 min | Runbook completado |
| C3 | Reiniciar **Cursor + Antigravity** tras GBrain MCP | MCP responde en IDE |
| C4 | Rotar tokens Discord/X si hubo exposición en chat | Portal developer |
| C5 | No aprobar scope fuera de [`HERMES-MUNDIAL-SCOPE-FREEZE.md`](../intake/HERMES-MUNDIAL-SCOPE-FREEZE.md) | Hermes rechaza intake |

### No hacer (CEO lazy)

- Editar YAML Hermes en VPS manualmente (pedir a Hermes script)
- Mergear PRs (Antigravity)
- Prometer mainnet o APY DeFi en redes

---

## Hermes — CTO ops (VPS)

### Órdenes inmediatas

| # | Orden |
|---|-------|
| H1 | Congelar FCC #95–#99; un solo issue `mundial-mvp` desde [`MUNDIAL-2026-MVP.md`](../intake/MUNDIAL-2026-MVP.md) |
| H2 | Responder `estado` con: merge stack, cola FCC, health `crm.goalchain.fun/goalchain-api`, hint fixture demo |
| H3 | Tras cambio Discord: `bash ops/hermes/sync-hermes-active-profile-discord.sh` + restart gateway |
| H4 | Rechazar intake DeFi real / Genesis / video automation con link a scope freeze |
| H5 | Post-merge: recordar ritual `gbrain import ai_context docs/intake` en mensaje a Nico + Antigravity |

### Plantilla respuesta `estado`

```
[Manager] Mundial MVP: coded on main (pending your merge/deploy).
Merge: PRs #26-#34 — Antigravity queue.
FCC: frozen batch; active track MUNDIAL-2026-MVP.
Play API: https://crm.goalchain.fun/goalchain-api/health
Next: CEO demo devnet — docs/intake/MUNDIAL-2026-DEMO-RUNBOOK.md
```

---

## Antigravity — Integrador (Mac)

| # | Orden |
|---|-------|
| A1 | **P0:** Merge #26→#34 en orden; CI verde cada uno |
| A2 | Verificar `npm run build` webapp + `npm run lint` oracle tras merge |
| A3 | Deploy Play si Nico entrega Vercel env (`VITE_API_BASE_URL` prod) |
| A4 | No competir con FCC en mismos archivos; revisar draft PR Mundial |
| A5 | Post-merge: `gbrain import ai_context docs/intake` |
| A6 | Mantener `oracle_record_match` en path FT; no activar vault crank execute |

---

## FCC — Factory (`agent:opencode`)

| # | Orden |
|---|-------|
| F1 | Solo trabajo desde [`MUNDIAL-2026-MVP.md`](../intake/MUNDIAL-2026-MVP.md) allowed files |
| F2 | Draft PR; **no merge** |
| F3 | Skills: frontend-design en webapp; gstack review antes de PR |
| F4 | Tests: `npm run build` + `bash goalchain_webapp/scripts/smoke-devnet.sh` |
| F5 | Post-merge P1: coach API en Play (`apiBaseUrl`) — nuevo brief Hermes |

---

## Grok — Review

| # | Orden |
|---|-------|
| G1 | Review packet MVP: riesgos economía, copy EN público, claims prohibidos |
| G2 | Validar que PARAMETER_EXCELLENCE no contradice docs marketing |
| G3 | No commit; entregar comentarios en issue o PR |

---

## Cursor — Draft

| # | Orden |
|---|-------|
| CU1 | Spikes solo `exp/cursor-*`; no merge sin OK Antigravity |
| CU2 | Mantener MASTER_PLAN y governance docs sincronizados con implementación |
| CU3 | No tocar economy on-chain ni Hermes VPS |

---

## Ritual post-merge (todos)

```bash
git pull origin main
gbrain import ai_context docs/intake
# VPS si discord cambió:
bash ~/hermes/workspace/GoalChain/ops/hermes/sync-hermes-active-profile-discord.sh
systemctl --user restart hermes-gateway
```

---

## 5) FutureHook Placeholder Guards (#129)

Las instrucciones `forge_nft` y `delegate_nft_for_rent` en el smart contract Anchor de Solana utilizan el contexto `FutureHook`. 

> [!NOTE]
> **Estado de Producción:** Estas instrucciones son marcadores de posición (`Ok(())` no-op) reservados para expansiones de la Fase V2. Están desactivadas para reducir la superficie de ataque y el riesgo operativo en mainnet. Ninguna dApp ni bot debe intentar firmar o invocar estas instrucciones.

