# OA Proposal: Issue #529 — [MONEY-PRINTER] Betting Affiliate API Keys (Bet365, 1xBet, etc.)

**Worker:** kappa (partition 9)
**Owner:** opencode
**Priority:** P1
**Mode:** Normal mode: open draft PR for Antigravity/Nico review.

## Issue Body
## Objective
Configure betting affiliate network APIs for revenue tracking.

## Context
- Plan: docs/implementation-plans/money-printer-goalchain-plan.md
- Revenue layer (issue #524) needs affiliate sub-ID tracking
- Already have odds API in oracle — need affiliate partner APIs

## Deliverables
1. Add affiliate API keys to config.env (per partner)
2. Affiliate tracker module with sub-ID generation
3. Conversion webhook endpoints

## Partners to Integrate
| Partner | API Type | Sub-ID Support |
|---------|----------|----------------|
| Bet365 Affiliates | REST | Yes (AFID) |
| 1xBet Partners | REST | Yes (partner_id) |
| Betfair Affiliates | REST | Yes (affiliate_id) |
| Oddschecker Affiliate | REST | Yes |

## Setup (User Action)
- Apply to affiliate networks (takes 1-3 days approval)
- Once approved, get API credentials
- Add to config.env as , , etc.

## Verification


## Priority: P1 — Phase 3 (Week 2) — Can start application now
EOF
