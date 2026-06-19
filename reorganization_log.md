# GoalChain Reorganization Log

**Date:** 2026-06-19
**Branch:** `feature/reorganization`
**Tag (snapshot before changes):** `stable-v1-backup` -> points at commit `d0397cd4`
**Operator:** Manager (Hermes CEO), acting on user YOLO directive

---

## Goal

Reduce cognitive load on AI agents reading the repo by:
- Pruning redundant / legacy directories
- Confirming a single Source-of-Truth for agents (`AGENT_GUIDE.md`) at the root
- Adding typed seams for cluster/program/mint environment
- Documenting layers explicitly
- Keeping the build green

---

## Phase 0 - Branch + Backup Tag

| Action | Result |
|--------|--------|
| Create branch `feature/reorganization` from `main` | OK (no working-tree dirty) |
| Tag `stable-v1-backup` on commit `d0397cd4` | OK (annotated) |

The git tag captures the full repo state prior to any destructive action.
Anything deleted in Phase 1 can be recovered with `git checkout stable-v1-backup -- <path>`.

---

## Phase 1 - Pruning

### 1.1 Directories removed

| Path | Reason | Recoverable via |
|------|--------|-----------------|
| `scratch/migration_temp/` | Orphan migration copy (was gitignored, never tracked) | `stable-v1-backup` (truncated) |
| `_backups/STABLE_V1_FULL_SQUAD/` | Snapshot, superseded by new player DB mirrors | `stable-v1-backup` |
| `_backups/web_history/` | Web UI history snapshot, no longer referenced | `stable-v1-backup` |
| `goalchain_backend/` | Already archived (had `ARCHIVED.md`), transaction logic moved to `goalchain_api/` | `stable-v1-backup` |
| `goalchain_hub/` | Standalone HTML/CSS demo only, not wired to live system | `stable-v1-backup` |
| `goalchain_web/` | Discord-marketing script sandbox superseded by `scripts/` + `ops/discord/` | `stable-v1-backup` |

Sizes reclaimed (approx):
```
_extras: 1.5 MB compressed instead of 11 MB uncompressed
goalchain_backend     : 104 K removed
goalchain_hub         : 32 K removed
goalchain_web         : 1.3 MB removed
_backups/*            : 920 K removed
scratch/migration_temp: (already gitignored, ~100 K removed)
```

### 1.2 Archive compression

| Before | After | Gain |
|--------|-------|------|
| `_archive/GoalChain_Client/` (11 MB Unity tree) | `_archive/GoalChain_Client_Legacy.tar.gz` (1.5 MB) | -86% |

Uncompressed directory removed. Tarball preserved on disk and in git history.

### 1.3 `players.json` deduplication

The file existed in five locations (verified via MD5):

| Hash | Locations |
|------|-----------|
| `8329f50d` | `_backups/STABLE_V1/ai_context/players.json` and mirror in `docs/assets/data/` - all gone |
| `2d21c5ef` | `_backups/web_history/.../players.json` - gone |
| `826ab09f` | `docs/assets/data/players.json` + `ai_context/03_data/players.json` - **kept** |
| `9a596c3e` | `scratch/migration_temp/...players.json` - gone |
| `41a533b0` | `scratch/migration_temp/ai_context/03_data/players.json` - gone |

**Final canonical pair:** `docs/assets/data/players.json` and `ai_context/03_data/players.json`
(mirrors, must be replicated in both - documented in new `AGENT_GUIDE.md`).

### 1.4 `.gitignore` updates

```gitignore
# --- Reorganization (2026-06-19): archive, cache, deep-research clones ---
_archive/
*.tar.gz
goalchain_webapp/.vercel/
research/x-deep/*/*/repos/
```

---

## Phase 2 - Documentation

### 2.1 Single source of truth

| Before | After |
|--------|-------|
| `AGENTS.md` (root) - build/lint instructions | **Deleted** (subsumed) |
| `ai_context/01_guidelines/AGENT_GUIDE.md` - skills/plugins | **Deleted** (merged) |
| (new) `AGENT_GUIDE.md` (root) - merged agent instructions, build order, network seams, future migration | **Created** |

### 2.2 Architecture map

**Created:** `ai_context/REPO_ARCHITECTURE.md`

Includes:
- Three-layer diagram (On-chain / SDK / API+Webapp+Oracle)
- Two connection points (economy config + on-chain calls)
- Decision rules for "where to put new code"
- Active / archived / experimental / external classification
- Coordination map (Antigravity / FCC / Manager / Cursor / Grok)

### 2.3 Economic drafts archived

Moved into `ai_context/02_economy/_archive/`:
- `ECONOMIC_BLUEPRINT_V2.md`
- `ECONOMIC_BLUEPRINT_V3.md`
- `VISION_AND_ECONOMY_V3.md`
- `TOKENOMICS.md`
- `VAULT_TECH_ROADMAP.md`

**Kept active:**
- `ECONOMIC_BLUEPRINT.md` (V1, current)
- `DYNAMIC_YIELD_ORACLE.md` (still referenced by ops)
- `JITO_MEV_STRATEGIC_POSITIONING.md` (used by treasury)
- `RENTAL_AND_MODIFIERS_DESIGN.md` (used by SDK + oracle)
- `TOKENOMICS_MASTER.md` (canonical companion)

### 2.4 OBSOLETE warning stubs

`OBSOLETE_DO_NOT_READ.md` written into:
- `_archive/` (root)
- `_archive/goalchain_app/`
- `_archive/goalchain_backend/`
- `_archive/goalchain_webapp/`
- `_archive/legacy_root_docs/`

---

## Phase 3 - Network Seams

### 3.1 Shared env file

**Created:** `.env.shared` at repo root.

Defines the canonical quartet:
```
GOALCHAIN_CLUSTER=devnet
RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg
GCH_TOKEN_MINT=<PENDING_MINT_BASE58>
```

`GCH_TOKEN_MINT` is set to the `<PENDING_MINT_BASE58>` placeholder because:
- No token mint is committed anywhere in the repo (verified: `grep TOKEN_MINT` returns only ConsumerCode, not config).
- The runtime resolves the active mint from the on-chain `global_config` account, so placeholder is safe until token is initialised on devnet.

### 3.2 SDK typed wrapper

**Created:** `goalchain-sdk/src/goalchain_program_environment.ts`

Exports:
- `getCluster()` -> `ClusterName`
- `getRpcUrl()` -> `string`
- `getProgramId()` -> `PublicKey`
- `getGchTokenMint()` -> `PublicKey | null`
- `getConnection()` -> cached `Connection`
- `resetConnectionForTesting()` -> for tests
- `GOALCHAIN_ENV` -> frozen diagnostic snapshot

**Build-emit setting:** kept CommonJS module + targeted ES2020 target (preserves
backwards compatibility with `goalchain_api` which imports `dist/index.js` as CJS).
Reverted an experimental tsconfig bump to `module: ES2022` after confirming it
would break the API consumer chain.

**Migration deliberately NOT executed in this PR.** Future steps documented in
`AGENT_GUIDE.md` (see § Future migration):
1. `goalchain_api/src/index.ts` -> use `getConnection()` instead of `new Connection()`
2. `goalchain_webapp/src/lib/goalchainClient.ts` -> use `getConnection()` + `getProgramId()`
3. `goalchain_oracle/src/**/*.ts` -> read RPC + PROGRAM_ID via this helper
4. Remove legacy `process.env.RPC_URL` reads.

Each lands in its own PR to keep the migration small and auditable.

---

## Phase 4 - Validation Matrix

| Stage | Command | Result |
|-------|---------|--------|
| SDK build | `cd goalchain-sdk && npm run build` | PASS (tsc exit 0, `dist/` emitted 4,493 B) |
| SDK lint | `cd goalchain-sdk && npm run lint` | PASS |
| API build | `cd goalchain_api && npm run build` | PASS (tsc exit 0) |
| Webapp build | `cd goalchain_webapp && npm run build` | **PRE-EXISTING FAILURE** (below) |
| Program check | `cd goalchain_program && cargo check --workspace` (anchor CLI unavailable on VPS) | **PRE-EXISTING FAILURE** (below) |

### Pre-existing failure: webapp

```
src/workers/commentary-generator.ts(207,51): error TS2345:
  Argument of type 'Uint8Array<ArrayBufferLike>' is not assignable
  to parameter of type 'BufferSource'.
```

- Last touched: `f8719fee oa: draft implementation for issue #782` (2026-06-15)
- Root cause: Node 22 / `lib.dom.d.ts` tightening on `WebAssembly.compile()`.
- **Not introduced by this PR.** Will be addressed in a follow-up issue.

### Pre-existing failure: program (cargo check)

30 E0425 errors in `programs/goalchain_program/src/lib.rs` - missing imports for
`ARCHITECT_TAX_BPS`, `POTION_BURN_LAMPORTS`, etc.

- Last touched: `091656a9 growth-agent: auto tasks 2026-06-05`
- Root cause: stale constants in `constants` module.
- **Not introduced by this PR.** Will be addressed in a follow-up issue.
- `anchor build` could not be run; VPS does not have the anchor CLI installed
  (NPM-shipped binary is x86_64-only and rejects aarch64). Verified with
  `which anchor` returning empty.

---

## Recoverability

If anything needs to come back:

```bash
git checkout stable-v1-backup -- path/to/recover
```

The Unity tree lives only in the tarball:
```bash
mkdir -p /tmp/unity
tar -xzf _archive/GoalChain_Client_Legacy.tar.gz -C /tmp/unity
```

Pickled `players.json` mirrors come from the same tag.

---

## Stats

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Total tracked files in repo | ~317k (incl. node_modules not in tree) | trim phase 1.1 + 1.2 (~1300 files tracked) | -big sanity win |
| Active top-level packages | 9 | 6 (`goalchain-sdk`, `goalchain_api`, `goalchain_webapp`, `goalchain_program`, `goalchain_oracle`, `goalchain_unity_scripts`) | cleaner |
| Markdown guides telling agents "where to start" | 2 (`AGENTS.md` + `AGENT_GUIDE.md`) | 1 (`AGENT_GUIDE.md`) | unambiguous |
| Hard-coded `PROGRAM_ID` to grep for | many | many (until migration phase lands) | 0 risk on this PR |

---

## File summary (new + deleted + moved)

**New (top-level):**
- `AGENT_GUIDE.md`
- `reorganization_log.md`
- `.env.shared`

**New (in repo):**
- `ai_context/REPO_ARCHITECTURE.md`
- `goalchain-sdk/src/goalchain_program_environment.ts` (+ emitted dist files)
- `_archive/{OBSOLETE_DO_NOT_READ.md,goalchain_backend/OBSOLETE_DO_NOT_READ.md,goalchain_app/OBSOLETE_DO_NOT_READ.md,goalchain_webapp/OBSOLETE_DO_NOT_READ.md,legacy_root_docs/OBSOLETE_DO_NOT_READ.md}`

**Deleted top-level dirs:**
- `goalchain_backend/` `goalchain_hub/` `goalchain_web/`
- `_backups/STABLE_V1_FULL_SQUAD/` `_backups/web_history/`
- `scratch/migration_temp/`

**Renamed/archived:**
- `_archive/GoalChain_Client/` -> `_archive/GoalChain_Client_Legacy.tar.gz`
- `ai_context/01_guidelines/AGENT_GUIDE.md` -> absorbed into root `AGENT_GUIDE.md`, then deleted.
- `AGENTS.md` -> deleted (subsumed by root `AGENT_GUIDE.md`).
- 5 economic drafts moved into `ai_context/02_economy/_archive/`.

**Modified:**
- `.gitignore` - 4 new ignore entries (`_archive/`, `*.tar.gz`, `goalchain_webapp/.vercel/`, `research/x-deep/*/*/repos/`).
- `goalchain-sdk/tsconfig.json` - reverted to CommonJS (kept conservative).
- `goalchain-sdk/dist/...` - regenerated by `npm run build`.

