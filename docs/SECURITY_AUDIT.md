# GoalChain Security Audit (Internal)

**Fecha:** 2026-05-21  
**Versión:** 1.1  
**Estado:** 🟡 En hardening P0 (completado técnicamente, pendiente cierre operativo)

---

## 1) Estado técnico del contrato

- `GlobalConfig`, control de `admin` y `oracle_authority` activos.
- Validaciones críticas de winner/mint/PDA aplicadas en flows de wager, fixture y live market.
- Matemática protegida con `checked_*` en rutas de stake, pools, payouts y fees.
- Presale endurecida: `presale_active`, `max_sol_per_user` y validación de `stake_pool_program`.
- Parimutuel endurecido: `refund_bet` para `Cancelled`, `sweep_fixture_dust` y chequeos de balance de vault.

## 2) Pipeline IDL / frontend

- IDL generado por Anchor sincronizado a:
  - `goalchain-sdk/src/goalchain_program.json`
  - `goalchain-sdk/dist/goalchain_program.json`
  - `docs/assets/js/generated/goalchain_program.idl.json`
- Script de sincronización: `scripts/sync-idl.sh`.
- CI agrega verificación de sync IDL tras `anchor build --ignore-keys`.

## 3) Estado de riesgos residual

- **Resuelto en P0:** auth básica, payout claims, vault separation, presale guardrails, refunds cancelados.
- **Pendiente fase siguiente:** multisig para admin/oracle, rotación de llaves operativas, runbook de incidentes.
- **Pendiente operativo:** checklist formal de deploy firmado por dos reviewers.

## 4) Conclusión

El contrato quedó en estado **apto para continuar desarrollo y validación en devnet** con controles P0 aplicados.  
Para considerar “production-ready” faltan cierres de gobernanza/operación (multisig + procedimientos de deploy).
