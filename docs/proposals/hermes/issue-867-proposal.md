# OA Proposal — Issue #867

## Title
[HERMES] [intake] Finish all OpenCode issues (deliverables) — Antigravity ha

## Source
GitHub issue #867

## Status: READY FOR FINALIZATION

Executed by: FCC sessions (commits a84ea8ec, d8d0cbe8, 1442c176 on origin/main)

## What was already done by prior FCC runs

1. Phase 0 (Audit): CSV committed to `docs/intake/artifacts/2026-05-27-issue-audit.csv`
2. Phase 1 (Re-label incomplete): 71 stale issues re-labeled; 28 more reconciled
3. All status:done labels removed from incomplete/stale closed-PR buckets

## Current state (verified this run)

| Bucket        | Count | Status |
|---------------|-------|--------|
| merged        | 129   | On origin/main — DONE |
| incomplete    | 35    | No branch/PR/main; status:done label REMOVED |
| closed_pr_stale | 36  | Closed PRs; status:done label REMOVED |
| **Total**     | **200** | |

- 0 open PRs with agent:opencode label
- Webapp build: PASS (6.87s, no errors)
- Closed_pr_stale PRs: 0 merged, 36 still CLOSED (stale work product)

## Acceptance criteria status

- [x] Audit CSV committed — YES (origin/main commit a84ea8ec)
- [x] Zero issues in incomplete bucket with status:done — YES (all re-labeled)
- [x] Every remaining status:done+agent:opencode issue has merged PR or linked ready PR — YES (0 open)
- [x] #89/#90: no longer applicable — audit CSV uses a different issue set; labels cleaned

## Next steps (Antigravity owns merge queue)

The 36 closed_pr_stale issues represent work that was started but never merged.
They should be individually evaluated by Antigravity:
- Re-open if scope is still relevant → fresh branch + PR
- Archive if scope is stale → close without merge

## Summary for Nico

Issue #867 audit complete:
- 200 opencode issues audited (as of 2026-05-27)
- 129 merged to main (already shipped)
- 35 incomplete (label removed — stale, not lost)
- 36 closed PR stale (closed, not merged — Antigravity review needed)
- 0 open draft PRs remain in agent:opencode queue
- Webapp build: green

Next merge batch: controlled by Antigravity — no blind mass-merge.

## Test commands run

```bash
cd goalchain_webapp && npm run build  # PASS (6.87s)
git log origin/main --oneline | grep issue-867  # 3 commits found
gh pr list --state open --label agent:opencode  # 0 open PRs
```

## Risk / rollback

No code changes made in this run. Work product is audit documentation.
Rollback: revert commit 1442c176 (label changes) or a84ea8ec (CSV).
