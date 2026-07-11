# OA Proposal — Issue #867

## Title
[HERMES] [intake] Finish all OpenCode issues (deliverables) — Antigravity ha

## Source
GitHub issue #867

## Objective
Audit all status:done + agent:opencode issues, identify stale ones (no deliverable), re-queue them for OA processing.

## Audit Results (2026-07-11 — live verification vs origin/main)

| Bucket | Count | Meaning |
|--------|-------|---------|
| merged | 129 | Has commit on origin/main — truly closed |
| closed_pr_stale | 36 | Had PR (closed), code may exist on branch, needs re-queue |
| incomplete | 35 | No branch, no PR, no main commit — needs full implementation |
| **Total stale** | **71** | All re-labeled: status:done removed, status:ready added |

### Closed PR stale items (36)
323, 332, 372, 378, 466, 471, 472, 478, 479, 480, 481, 482, 483, 484, 485, 486, 500, 503, 507, 509, 510, 512, 513, 514, 520, 527, 530, 532, 535, 537, 538, 734, 738, 785, 789, 790

### Truly incomplete items (35)
290, 291, 306, 308, 310, 311, 313, 315, 317, 322, 324, 325, 330, 373, 375, 376, 377, 381, 382, 469, 474, 476, 477, 505, 506, 508, 515, 519, 521, 526, 536, 539, 733, 736, 747

### Priority breakdown of incomplete (P0/P1)
P0: 290 (Discord+Zealy), 306/308/310/311/313 (Oracle modules), 315/317/322/324/325/330 (Program modules)
P1: 747 (Polymarket Bot executor), 733 (NFT Marketplace treasury bug), 736 (TradingTerminal decomposition)

## Actions Taken (FCC — this session)

1. Phase 0 complete: docs/intake/artifacts/2026-05-27-issue-audit.csv updated with 200-issue live audit
2. Phase 1 complete: All 71 stale issues re-labeled (status:done removed, status:ready added)
3. Intake marker docs/intake/2026-05-27-finish-all-opencode-issues-antigravity.md left open (OA work pending)
4. GitHub issue #867: Comment added with summary

## Next Steps (Antigravity / OA Workers)

1. OA workers (alpha–omega) pick up the 71 status:ready + agent:opencode issues
2. For closed_pr_stale: check if branch code is salvageable before re-implementing
3. For incomplete: full FCC implementation from scratch
4. Phase 4 (merge plan) deferred until OA queue processes all 71

## Risks
- OA workers may hit rate limits re-implementing 71 stale items
- Some closed_pr_stale branches may have diverged significantly from main
- Recommendation: batch by priority (P0 first), max 5 concurrent OA workers per priority tier

## Rollback
- To revert re-labeling: gh issue edit N --remove-label status:ready --add-label status:done
- No code changes to main — all work is GitHub label management + audit documentation
