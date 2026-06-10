# OA Proposal — Issue #535

## Title
[OPENCODE] [VOXLY] B2B Dashboard + Stripe Billing

## Source
Local queue (autonomous mode)

## Objective
## Objective
# FCC Task: [VOXLY] B2B Dashboard + Stripe Billing (P1)

## Issue Spec for GitHub

**Title:** `[OPENCODE] [VOXLY] B2B Dashboard + Stripe Billing`
**Labels:** `agent:opencode`, `priority:P1`, `status:ready`, `source:manager`

## Objective
Build the B2B dashboard for team/enterprise clients ($2K/mo tier) with Stripe Connect billing, usage analytics, and admin controls.

## Key Features
- **Team Workspace**: Multi-user, role-based access (Owner, Admin, Member, Viewer)
- **Usage Dashboard**: Voice profiles count, generations/month, platform breakdown, similarity scores
- **Billing**: Stripe Connect for B2B subscriptions ($2,000/mo), self-serve tiers ($39/$47/$97)
- **Admin Panel**: Invite members, view audit logs, configure brand settings
- **API Access**: Generate API keys for programmatic generation

## Technical Stack
- **Frontend**: Next.js (Vercel) + React + Tailwind + Recharts
- **Backend**: Supabase Edge Functions + Stripe Webhooks
- **Auth**: Supabase Auth (magic link + OAuth) + RLS
- **Billing**: Stripe Connect (B2B) + Stripe Billing (self-serve)

## Owner
opencode (FCC)

## Priority
P1

## Context
Voxly-track. 3 B2B contracts signed at $2K/mo = $72K ARR. Need production billing + dashboard.

## Implementation Notes
- FCC tier: sonnet (OpenRouter coder)
- Estimated: 12 hours
- Depends on: Voice Learning Engine (P0) for voice_profiles table

## Owner
opencode

## Priority
P1

## Labels
status:ready,source:manager,agent:opencode,priority:P1,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-535`.
