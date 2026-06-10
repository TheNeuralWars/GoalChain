# OA Proposal — Issue #528

## Title
[MONEY-PRINTER] Buffer.com / Hootsuite API Keys for Auto-Publishing

## Source
GitHub issue #528

## Objective
## Objective
Configure social media scheduling APIs for auto-publishing pipeline.

## Context
- Plan: docs/implementation-plans/money-printer-goalchain-plan.md
- Publisher (issue #522) needs Buffer.com or Hootsuite API
- Alternative: Native platform APIs (more complex, rate limited)

## Deliverables
1. Add BUFFER_API_KEY / HOOTSUITE_API_KEY to config.env
2. Publisher script uses configured provider
3. Fallback chain: Buffer → Hootsuite → Native APIs

## Setup (User Action)
- **Buffer**: https://buffer.com/developers/api → Create app → Get access token
- **Hootsuite**: https://developer.hootsuite.com/ → Create app → Get token
- Prefer Buffer (simpler, generous free tier)

## Verification
{"error":"invalid_request","error_description":"Auth header found that doesn't start with \"Bearer\""}

## Priority: P1 — Phase 2 (Day 3-4)
EOF

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-528` and close draft PR.
