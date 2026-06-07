# OA Proposal — Issue #381

## Title
[OPENCODE] [OPENCODE] Oracle & Program: Comment cleanup — dead code, obsolete logs, hardcoded IDs

## Source
GitHub issue #381

## Objective
## Objective
## Objective
Sweep and remove dead code, commented-out blocks, and obsolete logs from Oracle and Program.

## Scope
### Oracle (goalchain_oracle/src/)
**Delete / Archive:**
- `initialize_mainnet.ts` → move to `_archive/`
- `migrate_config.ts` → move to `_archive/`
- `mint_to_user.ts` → move to `_archive/`
- `mint_gate.ts` → verify if used, else archive

**Remove commented code:**
- `contributor_epoch_hook.ts` lines 1-30 (old epoch logic)
- `scraper/fixtureOracle.ts` any `// await this.initialize...`
- `vault_crank.ts` lines 88-107 (dotenv in try/catch)
- `vault_crank.ts` lines 163-170 (SystemProgram.transfer fallback burn)
- All CLI commands: remove `--program-id` default option (use constant)

**Downgrade logs:**
- `[ScraperService] Discovering fixtures...` → debug level
- `[Priority Fees] Non-Helius RPC...` → debug level
- `[Oracle] ✅ Fixture initialized...` → info level, structured JSON
- `fakeTx()` dry-run IDs → prefix with `dryrun_`

### Program (goalchain_program/)
**Remove from lib.rs:**
- Lines 897-920: Old fee split comments (superseded by utils::split_fee_amounts)
- Any unused `SEED_*` constants in constants.rs

**Verify moved code removed:**
- Old `claim_bet_payout` impl in lib.rs (now in claims.rs)
- Old account structs in lib.rs (now in state/*.rs)
- Re-exports in fixture/mod.rs reflect current modules

### Cleanup Automation:
Add npm script to goalchain_oracle/package.json:
```json
"check:clean": "grep -r "FbDhM4it" src/ --include="*.ts" | grep -v constants/ || echo "CLEAN""
```

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-381` and close draft PR.
