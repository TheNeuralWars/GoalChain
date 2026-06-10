# Issue #528: [MONEY-PRINTER] Buffer.com / Hootsuite API Keys for Auto-Publishing

## Source
Local queue (autonomous FIFO mode)

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

## Priority
P1

## Labels
P1,status:ready,agent:opencode,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-528`.
