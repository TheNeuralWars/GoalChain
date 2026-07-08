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

## 5) AI Agent Skills Security (SkillSpector integration - issue #845, voice xq)

- Skills (SKILL.md, ~/.claude/skills/ used by FCC/hermes-ceo/gstack) run privileged; 26%+ known to carry risks per NVIDIA research.
- Recommendation (thin, optional): `pip install skillspector` (or uv tool / docker) then `skillspector scan ./skills/ --no-llm` or on git URL before adopting voice-intake skills or community packs.
- Supports exact format: SKILL.md dirs, single files. MCP mode for future runtime gating in hermes.
- Add to install flows as guarded optional (no dep breakage).
- See: https://github.com/nvidia/skillspector (static 68 patterns + LLM, SARIF, baseline suppression).
- Applies to: skill-creator, skillpack-*, install-hermes-*, voice-note-ingest inputs.
- No change to current behavior; manual/ CI step for new skills only. English docs.

(Added per META thin integration; reversible.)
