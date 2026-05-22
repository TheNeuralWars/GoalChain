# GoalChain — Devnet Release Checklist

Checklist operativo para publicar una nueva versión del programa en devnet con el Program ID oficial:

- `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`

---

## 0) Precondiciones (obligatorias)

- [ ] Tienes `goalchain_program/target/deploy/goalchain_program-keypair.json` **oficial**.
- [ ] Tienes la wallet de `upgrade authority` correcta en `~/.config/solana/id.json` (o `-k <path>`).
- [ ] Tu rama incluye fixes P0 y tests pasando.
- [ ] 2 reviewers aprobaron cambios y release plan.

Comandos rápidos:

```bash
solana config get
solana address
solana program show FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg --url devnet
```

Verifica que `Authority` coincida con la wallet que usarás para desplegar.

---

## 1) Hygiene de entorno

- [ ] Herramientas instaladas (`rustc`, `solana`, `anchor`, `node`, `npm`).
- [ ] `anchor --version` compatible con el repo (`1.0.2`).
- [ ] `solana config set --url devnet`.
- [ ] Wallet fondeada en devnet para fees de deploy/upgrade.

```bash
rustc --version
solana --version
anchor --version
node --version
npm --version
solana config set --url devnet
solana airdrop 2
```

---

## 2) Build + test local antes de tocar devnet

- [ ] Build del programa limpio.
- [ ] Suite Anchor local en verde.
- [ ] IDL generado actualizado.

```bash
cd goalchain_program
export CARGO_TARGET_DIR="$(pwd)/target"
anchor build --ignore-keys
anchor test --skip-build --validator legacy
cd ..
bash scripts/sync-idl.sh
bash scripts/sync-idl.sh --check
```

---

## 3) Verificación de artefactos release

- [ ] `goalchain_program/target/deploy/goalchain_program.so` generado en esta corrida.
- [ ] `goalchain_program/target/idl/goalchain_program.json` synced a SDK/docs.
- [ ] No hay stubs/manual IDL drift en frontend.

```bash
ls -lh goalchain_program/target/deploy/goalchain_program.so
ls -lh goalchain_program/target/idl/goalchain_program.json
```

---

## 4) Deploy / Upgrade en devnet

- [ ] Confirmaste nuevamente Program ID y authority.
- [ ] Ejecutaste deploy usando devnet.

```bash
cd goalchain_program
anchor deploy --provider.cluster devnet
```

Si usas wallet explícita:

```bash
anchor deploy --provider.cluster devnet --provider.wallet ~/.config/solana/id.json
```

---

## 5) Validación post-deploy (smoke checks)

- [ ] Programa visible en devnet.
- [ ] `Last Deployed In Slot` cambió.
- [ ] `Authority` sigue correcta.
- [ ] Read path on-chain (fixture/live) responde desde frontend/app scripts.

```bash
solana program show FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg --url devnet
```

Checks funcionales mínimos:

- [ ] `initialize_fixture` (oracle autorizado).
- [ ] `place_bet` y `claim_bet_payout`.
- [ ] `contribute_presale` respeta `presale_active` y `max_sol_per_user`.
- [ ] flujo `Cancelled` + `refund_bet`.

---

## 6) Publicación SDK/frontend/docs

- [ ] Commit incluye IDL sync (`goalchain-sdk` + `docs/assets/js/generated`).
- [ ] CI en verde (`goalchain-program-idl` + jobs dependientes).
- [ ] `docs/AUDIT_STATE_2026-05-11.md` y `docs/SECURITY_AUDIT.md` actualizados si cambió alcance.

---

## 7) Rollback / contingencia

Si algo sale mal:

- [ ] No tocar Program ID.
- [ ] Corregir en rama nueva.
- [ ] Rebuild + retest.
- [ ] Re-upgrade con misma authority.

Recordatorio:

- El rollback en Solana upgradeable es **otro upgrade** a un binario anterior válido.
- Nunca ejecutar `anchor keys sync` en ramas de release devnet/mainnet.

---

## 8) Mint gate runbook (pause / resume)

Objetivo: estandarizar la operación cuando el ratio de sostenibilidad se desbalancea.

### Entradas obligatorias

- `emit_7d_gch`
- `burn_7d_gch`
- `ratio = burn_7d_gch / emit_7d_gch`
- salida del script: `goalchain_oracle/src/mint_gate.ts`

### Comando de evaluación

```bash
cd goalchain_oracle
npm run mint-gate
```

Opcional:

```bash
MINT_GATE_CSV_PATH="../docs/data/tokenomics_scenarios.csv" MINT_GATE_WINDOW_DAYS=7 npm run mint-gate
```

### Política operativa

- `ratio < 0.85`:
  - [ ] Pausar mint 48h (acción multisig)
  - [ ] Publicar incidente económico en Discord/X
  - [ ] Activar campaña de sinks (stamina/events)
- `0.85 <= ratio <= 1.20`:
  - [ ] Mint permitido con límite conservador definido por gate
- `ratio > 1.20`:
  - [ ] Mint solo con revisión manual de treasury lead + protocol lead

### Responsables

- **Executor:** Treasury lead
- **Approver A/B:** 2 firmantes multisig
- **Comms:** Community/Marketing lead
- **Postmortem:** Protocol lead

### Evidencias mínimas por operación

- [ ] JSON de salida de `mint_gate`
- [ ] Tx hash (si hubo mint/pause update)
- [ ] Captura de balances relevantes
- [ ] Mensaje público de estado

### Rollback de pausa

- [ ] Re-ejecutar `mint_gate` con datos actualizados
- [ ] Validar ratio en banda operativa
- [ ] Aprobar reanudación por 2/3 multisig
- [ ] Comunicar reapertura y límites
