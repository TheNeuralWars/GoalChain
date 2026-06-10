# OA Proposal — Issue #524

## Title
[MONEY-PRINTER] Revenue Layer: Affiliate + Referral Tracking

## Source
GitHub issue #524

## Objective
## Objective
Implement monetization: Affiliate betting tracking + GoalChain referral program + on-chain attribution.

## Context
- Plan: docs/implementation-plans/money-printer-goalchain-plan.md
- Odds API already integrated in GoalChain oracle
- GoalChain SDK has referral code generation
- On-chain program tracks referrer → referee

## Deliverables
1. Affiliate module: ops/content-flywheel/scripts/affiliate_tracker.py
2. Referral integration: Extend goalchain-sdk with video attribution
3. Revenue dashboard: Extend analytics dashboard with $ metrics

## Affiliate Tracking
- Partner: Betting affiliate networks (Bet365, 1xBet, etc. — via API or sub-ID)
- UTM params: utm_source=video&utm_medium={platform}&utm_campaign=affiliate_{partner}
- Track: Click → Signup → First Deposit → Revenue share
- Payout: Monthly, automated via partner API

## GoalChain Referral Program
- Video CTA includes unique referral code (from script metadata)
- On-chain: referrer field in CreateMatch / JoinMatch txs
- Reward: $GC tokens (vested) + NFT badge for referrer
- Dashboard: Referral tree, earnings, conversion funnel

## Verification
Test affiliate click tracking with curl to play.goalchain.fun with ref params.

## Priority: P1 — Phase 3 (Week 2)

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-524` and close draft PR.
