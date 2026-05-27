# X-Scout — Mundial 2026 Competitor Research Cadence

**Issue:** [#152](https://github.com/TheNeuralWars/GoalChain/issues/152)  
**Backlog ID:** 44  
**Priority:** P2  
**Epic:** —  
**Status:** active  
**Generated:** 2026-05-27

---

## Objective

Define the recurring research cadence for X-Scout during the Mundial 2026 window — what to monitor, how often, and how findings are published to Discord.

---

## Research Scope

### Competitors to Monitor

| Project | Category | Watch for |
|---------|----------|-----------|
| Sorare | Fantasy / NFT | New season launches, token activity |
| Chiliz / Fan Tokens | Fan engagement | CHZ price, club token launches |
| Axie Infinity | P2E mechanics | Economy adjustments, user count |
| DraftKings / FanDuel | Web2 sports betting | Promo mechanics, Mundial odds |
| Overtime Markets | Solana sports betting | TVL, fixture support, model changes |

### Mundial-specific signals
- Official FIFA betting volume data (if public)
- Web3 sports gaming announcements during tournament
- Influencer coverage of Solana gaming projects
- New competitor launches targeting the same Mundial window

---

## Cadence

| Schedule | Task | Output |
|----------|------|--------|
| Every 2 hours | X-Scout radar scan (automated via `oa-x-scout-run.sh`) | Discord `#active-research` post if score ≥ threshold |
| Daily (09:30 UTC) | Synthesis digest | `ai_context/x-scout/daily-digest-YYYY-MM-DD.md` |
| Weekly (Monday 12:00 UTC) | Weekly wrap-up | Discord `#active-research` thread summary |
| Pre-match (2h before KO) | Match-specific intel sweep | Odds movements, liquidity signals |

### Cron configuration (VPS)

```bash
# Every 2 hours — radar scan
OA_SCOUT_RADAR_CRON="15 */2 * * *"

# Daily synthesis at 09:30 UTC
OA_SCOUT_SYNTH_CRON="30 9 * * *"

# Weekly wrap-up Monday 12:00 UTC
OA_SCOUT_WEEKLY_CRON="0 12 * * 1"

# Pre-match: configured per fixture in oracle records
```

Set in `~/hermes/config.env` (already templated in `config.env.example`).

---

## Quality Filters

Posts to Discord only if:
- `score ≥ OA_SCOUT_SCORE_MIN` (default: 28, range: 24–34)
- Content is not an `ai-radar-*.md` file (those belong to X-Scout, not OA worker)
- Cooldown since last post: ≥ 2 hours (prevents spam)

Tune with:

```bash
bash ops/hermes/optimize-openclaw-scout.sh
```

---

## Output Channels

| Channel | Content | Config key |
|---------|---------|-----------|
| `#active-research` (forum) | Full radar posts | `DISCORD_RESEARCH_CHANNEL_ID` |
| `#oa-research-live` | Digest summaries | `DISCORD_OA_RESEARCH_CHANNEL_ID` (issue #42) |

---

## Acceptance Criteria

- [x] `ai_context/x-scout/scout_config.json` present (added in issue #89)
- [x] `ai_context/x-scout/README.md` present
- [ ] `OA_SCOUT_RADAR_CRON` set in VPS `config.env`
- [ ] At least one test scan executed: `bash ~/hermes/scripts/oa-x-scout-run.sh`
- [ ] Discord `#active-research` receives at least one post during the Mundial window
- [ ] This cadence document reviewed and approved by Nico

---

## Dependencies

- Issue #42 — OA research Discord channel (provides `DISCORD_OA_RESEARCH_CHANNEL_ID`) ✅
- Issue #89 — x-Scout initial config ✅
