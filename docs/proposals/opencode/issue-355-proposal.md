# OA Proposal — Issue #355

## Title
[OPENCODE] [GTM] Telegram Bot Slash Commands - earnings, jackpot, lineup, bet

## Source
GitHub issue #355

## Objective
## Objective
Extend the existing Telegram voice listener (telegram_voice_listener.py) with slash commands for GTM engagement: /earnings, /jackpot, /lineup, /bet. Drives webapp traffic and proves real-time on-chain data.

## Context
- Existing: /data/apps/hermes/scripts/telegram_voice_listener.py (handles voice notes + chat intake)
- Bot token configured in HERMES config (Telegram integration active)
- Public Dashboard API (issue #354) will provide the data endpoints
- Webapp: goalchain_webapp/ (React/Vite, port 5173)

## Required Commands
/earnings [wallet] — Shows 24h/7d/30d  earned, rank, top players
/jackpot — Current jackpot total (USD + ), growth today, % to next milestone
/lineup [wallet] — Current Starting XI, health %, projected earnings next matchday
/bet — Deep link to webapp penalty betting page with pre-filled referral
/stats — Global stats: active users, total burns, volume, inflation rate

## Technical Notes
- Use python-telegram-bot v20+ Application.add_handler(CommandHandler)
- Fetch data from localhost:3001/api/v1/gtm/* (issue #354)
- Cache responses 30s to avoid hammering API
- Error handling: friendly messages if API down, wallet not found
- Rate limit: 10 commands/min per user
- Webapp deep links: https://goalchain.app/bet?ref={telegram_id}

## Verification
- /jackpot returns formatted message with current numbers
- /earnings with valid wallet shows earnings breakdown
- /lineup shows player cards with health/stats
- /bet returns clickable webapp button
- No crashes on malformed input

## Skill Hints
- Follow gstack investigate workflow for bug hunt (root cause, max 3 fixes)
- goalchain_api lint: npm run lint (tsc --noEmit) for any shared types
- Python lint: ruff check .

## Workflow
- One implementer only
- Branch naming: exp/opencode-*
- Draft PR for Antigravity/Nico review

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-355` and close draft PR.
