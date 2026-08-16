# OA Proposal — Issue #867 (Refined)
## [HERMES] [intake] Finish all OpenCode issues (deliverables) — Antigravity ha

## Source
GitHub issue #867 | Owner: Hermes | Priority: P1

## Context
FCC session: Free Claude Code / Nemotron-3-Ultra-Free
CONSTRAINT: No todowrite tool. No write_file >50 lines in one call.
Model: auto/best-vision | Provider: custom (Oracle ARM64 VPS)

## What Was Already Done (previous rounds)

| Commit | Work |
|--------|------|
| 4b4841b2 | Phase 0 audit: CSV with 71 stale items identified |
| d8d0cbe8 | .done marker closed, 28 stale issues reconciled |
| a84ea8ec | 71 stale issues re-labeled in GitHub |
| a89f368f | Proposal updated, audit final state documented |
| 3583ca40 | 5 P1 deliverables closed (config_version, CI job, smoke-devnet, seedDemoPlayers) |

## Current State Audit (HEAD = origin/main = 3583ca40)

```
Total items in CSV:        201
Bucket "merged":           ~190  (have main commit evidence)
Bucket "incomplete":        19   (no branch/PR/main)
Bucket "closed_pr_stale":   10   (PR closed without merge)
Bucket "draft_ok":           0   (no open draft PRs for opencode issues)
```

### Incomplete Items (19) — no branch on origin
| Issue | Title | Priority | Assessment |
|-------|-------|----------|------------|
| #290 | Discord Community Agent + Zealy | P0 | Deprecated — community bot already integrated via hermes/ |
| #291 | test | P2 | Noise — close |
| #306-313 | Oracle modularization (6 issues) | P0 | OUTDATED — oracle already built with current structure |
| #315 | Create packages/program + Cargo | P0 | OUTDATED — anchor program at goalchain_program/ |
| #317 | Extract state module | P0 | PARTIAL — anchor lib.rs exists, struct extraction outdated |
| #322 | Extract builder_fund instructions | P0 | Needs anchor expertise — defer to Antigravity |
| #324 | Extract betting instructions | P0 | Needs anchor expertise — defer to Antigravity |
| #325 | Extract live_market instructions | P0 | Needs anchor expertise — defer to Antigravity |
| #330 | Rewrite lib.rs as module declarations | P0 | PARTIAL — lib.rs exists, modularization may conflict |
| #373 | Webapp Integration (Storybook, Vitest) | P0 | Valid but large — defer |
| #375 | HyperFrames Video Pipeline | P0 | GTM item — out of scope for tech deliverable |
| #376 | Oracle: Constants single source | P0 | Valid — check if constants.ts exists on main |
| #377 | Oracle: Priority fees v2 | P0 | Superseded by #787/#791 (merged) |
| #381 | Oracle & Program comment cleanup | P0 | Valid cleanup — low risk, defer |
| #382 | Program full test suite | P0 | Valid — defer to Antigravity |
| #469 | Jito/MEV Strategic Roadmap | P0 | Superseded by #757 (merged) |
| #474 | JitoSOL yield on treasury | P1 | Valid P1 — defer |
| #476 | Jito/MEV observability dashboard | P1 | Valid P1 — defer |
| #477 | DontFront.me MEV protection | P1 | Third-party — close as out-of-scope |

### Closed PR Stale (10) — PR closed without merge to main
| Issue | Title | PR | Action |
|-------|-------|----|--------|
| #323 | Fixture instructions (6) | #408 | OUTDATED — anchor program evolved |
| #332 | Full test suite | #492 | OUTDATED — test approach changed |
| #372 | Webapp legacy cleanup | #557 | PARTIALLY DONE — #698 (EN localization) merged |
| #378 | Vault crank v2 | #391 | SUPERSEDED by #752/#754 (merged) |
| #466 | README Open Source section | #496 | P2 noise — close |
| #471 | Priority Fees v2 module | #493 | SUPERSEDED by #787/#791 (merged) |
| #472 | MEV-protected bet settlement | #499 | SUPERSEDED by #781/#772 (merged) |
| #478 | IDL generation + sync | #491 | SUPERSEDED by #331 (merged) |
| #479 | Fixture instructions (6) | #495 | OUTDATED — same as #323 |
| #785 | OpenTelemetry + Prometheus | #801 | P2 — defer |
| #789 | Standardize Logging (Winston/Pino) | #802 | P2 — defer |
| #790 | Document .env.example | #803 | P2 — defer |

## OA Plan

### Step 1: Update CSV with final bucket classification
Update `docs/intake/artifacts/2026-05-27-issue-audit.csv` with new bucket:
- `outdated_superseded` for items whose work was done in later merged PRs
- `defer_to_antigravity` for large anchor/Solana refactors needing specialized review
- `close_noise` for test/noise items

### Step 2: Close noisy/no-op GitHub issues
Use gh issue close for:
- #291 (test noise)
- #466 (README P2 noise)
- #477 (third-party, out of scope)

### Step 3: Update issue labels (gh issue edit)
Mark defer items with `status:deferred` + `owner:antigravity`
Mark outdated items with `status:outdated` + `no-action`

### Step 4: Verify current main state (no regression)
```
cd goalchain_webapp && npm run build
cd goalchain_oracle && npx tsc --noEmit
cd goalchain_api && npx tsc --noEmit
```

### Step 5: Open documentation commit
Commit updated CSV + summary markdown to docs/intake/artifacts/

## Files to Touch
- `docs/intake/artifacts/2026-05-27-issue-audit.csv` (update buckets)
- `docs/intake/artifacts/2026-07-11-issue-867-finalization.md` (new summary)
- No code files — all work is metadata/documentation

## Risk Assessment
- Risk: LOW — only touching docs/metadata, no code changes
- Rollback: `git revert HEAD` — removes finalization commit only
- Regressions: none — no functional code touched

## Verification Commands
```
# Build webapp
cd goalchain_webapp && npm run build

# Type-check oracle
cd goalchain_oracle && npx tsc --noEmit

# Type-check api
cd goalchain_api && npx tsc --noEmit
```

## Residual Items (deferred to Antigravity)
- #317, #322, #324, #325, #330 — anchor program modularization (P0, needs Anchor expertise)
- #373 — Webapp integration testing (P0, large)
- #474, #476 — Jito treasury yield + observability (P1)
- #785, #789, #790 — telemetry/logging/env docs (P2, defer)