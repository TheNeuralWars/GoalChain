# OA Proposal — Issue #93

## Title
[Manager] Enable full Discord channel posting capability

## Source
GitHub issue #93

## Objective
## Problem
The GoalChain Manager (Hermes + Grok session) cannot post messages in Discord channels (lounge, #openclaw-chat, active-research, etc.), even after:
- Message Content Intent enabled in Discord Developer Portal
- Bot granted full permissions + role in the server
- Gateway restarted

The Manager can only read messages sent directly to it and reply in the current conversation. It cannot use send_message or equivalent to post in channels.

## Current Config (from investigation)
- messaging toolset: enabled
- Discord config: allowed_channels: '*', require_mention: true, free_response_channels set
- No obvious permission errors in logs

## Goal
Make it possible for the Manager to send messages in Discord channels (especially lounge and research channels) without requiring a mention or manual posting by the owner.

## Requirements
- Investigate why outbound posting is blocked
- Update config or adapter if needed
- Verify by posting a test message (e.g. GM) in the lounge channel
- Respect existing channel_prompts (English only in public GoalChain channels)

## Priority
P1 — blocks daily workflow, X-Scout publishing, and research thread management.

Owner: Manager (Grok)
Related: X-Scout personalization task

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-93` and close draft PR.
