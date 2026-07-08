# Postiz Integration for GoalChain Social

**Status:** analyzed + minimal integration (2026-07). Per issue #844 voice task.

## Why Postiz
- Unified scheduler + AI for 30+ platforms (X primary for GoalChain).
- Agentic MCP + SDK + REST: fits Hermes (opencode/FCC, social agent).
- Self-host (docker-compose) or cloud; AGPL-3 open.
- Complements: replaces custom rotation in x_daily_post.sh optionally; adds calendar, analytics, cross-post.
- No scraping; official OAuth.

## Quick Integration (API / SDK)
Use Node SDK or REST (Postiz API key from self-host or cloud).

Example (Node, from goalchain_api style):
```ts
import { Postiz } from '@postiz/node';
// const postiz = new Postiz({ apiKey: process.env.POSTIZ_API_KEY });
await postiz.posts.create({ content: tweet, platforms: ['x'], scheduledAt: '...' });
```

REST curl (scheduling):
```bash
curl -X POST https://your-postiz/api/posts \
  -H "Authorization: Bearer $POSTIZ_KEY" \
  -d '{"content":"...", "platforms":["x"], "scheduledAt":"..."}'
```

MCP for agents (Hermes): expose /mcp ; agents discover tools for draft/schedule. See docs.postiz.com/mcp .

## GoalChain Mapping
Current angles (x_daily_post.sh): zealy_push, player_spotlight, vault_mechanics, presale_urgency, wc_2026_hook...
- Map to Postiz "tags" or "categories" for rotation/analytics.
- Content gen stays in GoalChain (English-only per CLAUDE.md marketing rules).
- Scheduler: call Postiz instead of direct x_budget_poster.py (add optional env POSTIZ_ENABLED).
- Video automation: use Postiz for scheduled UGC.

## Self-Host Notes (VPS)
- docker-compose up (Postgres+Redis+Temporal).
- Expose /mcp for hermes-ceo.
- Low cost; sponsor options (Hostinger etc.).
- Keep separate from GoalChain secrets (use ~/.hermes/credentials/postiz.env pattern).

## Caveats + Rules
- Never commit keys/.env.
- Start optional (feature flag OFF).
- Preserve 1-post/day budget invariant.
- Test dry runs always.
- Future: full hermes MCP client.

See: ops/x/x_daily_post.sh , goalchain_api/src/scripts/test_twitter.ts , CLAUDE.md (social), docs/intake/*MUNDIAL*.
Integration owner: Antigravity after FCC draft.

## Sources
- https://github.com/gitroomhq/postiz-app (README, docs)
- https://docs.postiz.com (MCP, API)
- GoalChain social surface analysis.