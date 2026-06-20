# OA Proposal: Issue #1 — [TEST] Add health endpoint to webapp

**Worker:** beta (partition 1)
**Owner:** opencode
**Priority:** P0
**Mode:** Normal mode: committed locally to branch, validated and merged locally by reviewer.

## Issue Body
Add a simple /health endpoint to the GoalChain webapp that returns JSON {status: 'ok', timestamp: ISO}. Files to modify: goalchain_webapp/src/main.tsx or create a new route. Verify with npm run build.
