# OA Proposal — Issue #357

## Title
[OPENCODE] [DRAFT] Dexter Superpowers: GitHub, Hermes/FCC, On-Chain, Superpowers, X Search, Workers

## Source
GitHub issue #357

## Objective
## Objective
# Dexter Superpowers - Add Missing Capabilities

## Objective
Make Dexter a fully autonomous agent with ALL capabilities: GitHub delegation, Hermes/FCC integration, On-chain GoalChain tools, Hermes superpowers, X search, and worker triggering.

## Priority: P0 (Architecture/Refactor) - Use Opus/Nemotron tier

## Current State
Dexter has: Finance, Web, Filesystem, Memory, Cron, Heartbeat, Skills
Missing: GitHub, Hermes/FCC delegation, On-chain, Superpowers, X search (needs token), Worker triggering

## Required Tools to Add

### 1. GitHub Tool (`github-tool`)
**Location:** `src/tools/github/`
**Capabilities:**
- `create_issue` - Create GitHub issues with labels, assignees, body
- `create_agent_opencode_issue` - Specialized for `agent:opencode` label with proper format
- `get_issue` - Read issue details
- `list_issues` - Filter by labels, state
- `comment_issue` - Add comments
- `create_pr` - Create pull requests
- `get_pr` - Read PR details, check CI status
- `merge_pr` - Merge when checks pass
- Uses `gh` CLI or GitHub REST API (PAT from env)

### 2. Hermes Delegate Tool (`hermes-delegate-tool`)
**Location:** `src/tools/hermes/`
**Capabilities:**
- `delegate_to_fcc` - Create `agent:opencode` task via `create-task.sh` or webhook
- `trigger_x_scout` - Call `https://127.0.0.1:8644/webhooks/goalchain-alpha-push` with `{message}`
- `enqueue_oa_worker` - POST to `http://127.0.0.1:3456/webhook` with Discord-style payload
- `call_superpower` - Call MCP `goalchain-ops` tools (ops_status, economy_health, onchain_program_info)
- `get_hermes_status` - Check Hermes services, cron jobs, credentials
- Uses Hermes API key from env/profile

### 3. GoalChain On-Chain Tool (`goalchain-onchain-tool`)
**Location:** `src/tools/solana/` (extend existing)
**Capabilities:**

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-357` and close draft PR.
