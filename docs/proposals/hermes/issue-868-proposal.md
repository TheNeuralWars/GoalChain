# Proposal: Issue #868 — X Repost Monitor: Extract Signals & Act

## Issue
Voice task from Nico: "controla todos los repost de @goalworldsol y @goalworlddotfun en X.
Extrae las cosas que nos podrian ser utiles, y utilizalas, aplicalas."

## Diagnosis of existing code

`ops/hermes/oa-x-repost-monitor.py` (311 lines) already:
- Fetches retweets (what the accounts retweeted) via X API v2 `/users/{id}/retweets`
- Deduplicates via `seen_ids` state
- Writes markdown reports to `docs/x-reposts/`

**Critical gap**: `parse_retweet()` line 250 hardcodes `"original_author": "via retweet"` — the
original tweet author and full text are never fetched. Reports show no useful content.

## Proposed implementation

### 1. Add `get_tweet_detail()` — fetch full original tweet
New function that calls `GET /2/tweets/{id}` with `tweet.fields=created_at,public_metrics,author_id`
and `expansions=author_id` + `user.fields=username,name,public_metrics`. This resolves the original
author from each retweet's `referenced_tweets[].id`.

### 2. Add signal extraction engine
A new module (`ops/hermes/oa_x_signals.py`) with:
- **Signal classifiers**: competitor, KOL/influencer, news/alpha, tech/Web3, engagement (high RTs/Likes)
- **Keyword matching** against GoalWorld-relevant topics: Solana, Web3, football/soccer,
  prediction markets, NFT, DeFi, AI agents, #BuildInPublic
- **Output**: structured JSON file `~/.hermes/oa/state/x-signals-<YYYY-MM-DD>.json`
- Each signal: `{id, type, username, text, rt_count, like_count, url, ts, action_tags:[]}`

### 3. Extend `oa-x-repost-monitor.py` to integrate signals
After parsing each new retweet:
(a) Fetch original tweet detail via `get_tweet_detail()`
(b) Pass to signal extractor
(c) If signals found, write JSON and set a flag
(d) On exit: if new signals exist, trigger routing

### 4. Signal routing (action layer)
New script `ops/hermes/oa_x_signal_router.py`:
- Reads latest `x-signals-*.json`
- Categorizes: high-engagement → post to Discord `#🍻 degen-locker-room` via
  `oa-discord-research-publisher.py`, KOL → tag social agent, alpha/tech → append
  to `docs/ai-radar-<UTC>.md` (used by oa-x-scout-run.py)

## Files to touch

| File | Change |
|------|--------|
| `ops/hermes/oa-x-repost-monitor.py` | Add `get_tweet_detail()`, call it in main loop, extract signals |
| `ops/hermes/oa_x_signals.py` | NEW — signal classifier engine |
| `ops/hermes/oa_x_signal_router.py` | NEW — action/routing layer |
| `ops/hermes/install-hermes-x-repost-monitor-timer.sh` | Update ExecStart if needed (no change expected) |
| `docs/x-reposts/` | Reports dir (already in code) |
| `docs/proposals/hermes/issue-868-proposal.md` | This file |

## Risks & Regressions

- **API rate limits**: X API v2 free tier = 180 requests/15min. Adding a detail call per
  new retweet could hit limit. Mitigation: batch detail fetches, cap at 10 per run,
  add 1s delay between calls. Existing rate-limit handling preserved.
- **No auth regression**: OAuth1 flow unchanged; all existing credential handling preserved.
- **State file format**: Adding new fields to state JSON is backward-compatible (unused keys ignored).
- **Execution time**: Extra API calls add ~2-5s per new retweet. Timer interval unchanged (2h).
- **Signal routing failures**: If Discord/HTTP routing fails, script logs error and exits 0
  (monitoring never breaks). No rollback needed for external service outages.

## Rollback

```bash
# Restore oa-x-repost-monitor.py to prior state
cd /data/apps/GoalChain && git checkout HEAD -- ops/hermes/oa-x-repost-monitor.py
# Remove new files
rm -f ops/hermes/oa_x_signals.py ops/hermes/oa_x_signal_router.py
```

## Test commands

```bash
# Dry run (no API calls)
python3 ops/hermes/oa-x-repost-monitor.py --dry-run

# Unit test signal classifier
python3 -c "
from ops.hermes.oa_x_signals import classify_signal
tests = [
    ('Solana is going to 500', 'competitor'),
    ('Check this AI agent framework', 'tech'),
    ('GoalChain looking strong today', 'competitor'),
    ('Built a prediction market onchain', 'alpha'),
]
for text, expected in tests:
    r = classify_signal({'text': text, 'username': 'test'})
    assert r['type'] == expected, f'FAIL: {text} -> {r[\"type\"]} != {expected}'
print('All signal tests PASS')
"

# Full run (requires env vars)
X_API_KEY=... X_API_SECRET=... X_ACCESS_TOKEN=... X_ACCESS_SECRET=... \
  python3 ops/hermes/oa-x-repost-monitor.py

# Check output
ls docs/x-reposts/
cat ~/.hermes/oa/state/x-signals-$(date +%Y-%m-%d).json 2>/dev/null || echo "No signals today"
```

## Implementation order

1. `oa_x_signals.py` — pure Python, no external deps beyond stdlib + requests (already installed)
2. `oa-x-repost-monitor.py` — add `get_tweet_detail()`, wire signal extraction
3. `oa_x_signal_router.py` — minimal routing to Discord + AI radar doc
4. Run tests above
5. Update GitHub issue with results

## Branch / PR

Direct main mode (`cambio urgente`). No feature branch. Write final state to issue comment.