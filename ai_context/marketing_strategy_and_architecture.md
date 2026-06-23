# Marketing Automation Architecture & Strategy Roadmap

> Source: Antigravity walkthrough 2026-06-23 + Hermes Manager audit 2026-06-23.
> Owner: `hermes-manager` (this file is the canonical handoff doc).

This document outlines the technical architecture of the Hermes Autonomous
Marketing Machine built for GoalChain, defines the content narrative framework,
and details the strategic roadmap to turn this setup into a highly monetizable
football media operation that drives user acquisition and liquidity to the
GoalChain protocol on Solana.

---

## 1. System Architecture & Technical Setup

24/7 autonomous content production and publishing pipeline that runs entirely
on the project host (this VPS), decoupling generation from any developer
machine.

```
[ Buffer Queue < 5 ]
        |
        v
[ Daily Refill (after 06:00 UTC) ]
        |
        v
[ trend_researcher.py ]  -- Grok CLI -->  5 ideas per account
        |
        v
[ runs.json planned entries       ]  (queue)
        |
        v
[ grok_super_pipeline.py sequential trigger ]
        |
        +--->  Grok image-quality       (one unique 9:16 vertical starter)
        +--->  Grok video               (animates that image)
        |
        v
[ /pilot/grok_vid_*.mp4 ]  via Caddy static route
        |
        v
[ schedule_optimizer.py ]  LATAM peak windows, 3h gap, Buffer queue aware
        |
        v
[ Buffer GraphQL createPost ]   scheduledAt staggered (TikTok -> IG -> YT)
        |
        v
[ Express API /api/marketing/schedule-preview ]
        |
        v
[ Vercel play.goalchain.fun/marketing-control ]
```

### Key Components

- **PM2 Daemon** (`pipeline_daemon.py`) — runs continuously (process
  `hermes-video-daemon`). Each morning after 06:00 UTC, it checks if any
  Buffer channel has fewer than 5 pending posts and triggers refill if so.
  Heartbeat keeps `daemon_status.json` fresh every 10s.
- **Trend Researcher** (`trend_researcher.py`) — researches World Cup 2026
  storylines, player archetypes, and betting psychology. Emits strict JSON
  with visual prompts and Spanish captions; now reads recent topics to avoid
  repetition.
- **Asset Generation Pipeline** (`grok_super_pipeline.py`)
  - Grok image generation restricted to `/home/ubuntu/.grok/sessions/` to
    guarantee a fresh unique asset per run.
  - Grok video animation produces 9:16 vertical mp4.
  - `normalize_prompts` maps any of Grok's key variants
    (`copy`, `caption`, `text`, `texto`, ...) into the canonical `post_text`,
    so posts are never scheduled empty.
- **Smart Scheduler** (`schedule_optimizer.py`) — calculates LATAM-UTC-3
  peak windows, applies hype staggering (TikTok -> IG +2h -> YT +4h), and
  pulls Buffer's pending posts to avoid over-booking.
- **Reverse Proxy** (Caddy) — serves `/pilot/*` as `video/mp4` with byte
  ranges from the local outputs dir on the host.
- **Web Dashboard** (`MarketingControlCenter.tsx`) — feed gallery at
  `https://play.goalchain.fun/marketing-control`: 9:16 cards, scheduled
  times in ART (UTC-3), inline comment steering, manual trigger.

---

## 2. Content Niche & Narrative Framework

The channel must move away from generic crypto jargon and focus entirely on
football culture and fan psychology, using GoalChain as the natural
resolution to real-world emotional dilemmas.

### Hook-Context-Mechanism-Twist (HCMT) Framework

Every video follows:

| Phase    | Duration | Objective                                                       |
| -------- | -------- | --------------------------------------------------------------- |
| Hook     | 0-3s     | Extreme scroll-stopper. Player name + poléemica.                 |
| Context  | 3-15s    | Emotional/Historical reality (fan losing money to the heart).   |
| Mechanism| 15-45s   | Bridge: GoalChain on Solana turns emotional talk into stakeable logic. |
| Twist    | 45-60s   | Irony + CTA to `goalchain.fun`.                                  |

### Account Segmentation

- **NicoPezDorado (TikTok)** — raw fan experience, promises made in bars,
  human side of gambling psychology.
- **GoalChainSol (YouTube Shorts + Reels)** — protocol mechanics, Solana
  speed/transparency, historical parodies (Messi, CR7, Mbappé).

### Player Universe (`WORLD_CUP_2026_PLAYERS`)

Anchor set in `trend_researcher.py`: Messi (last WC), Mbappé (RM pressure),
CR7 (final shot), Haaland (Norway OUT — best striker on planet not going),
Pedri & Yamal (youth), Vinícius Jr. (favoritism curse), Bellingham
("Coming home" meme), Julián Álvarez (silent hero), Gakpo (outsider 2022),
VAR (millimeter heartbreak), Morocco 2022, Suárez (2010 hands).

`TOPICS_TO_AVOID`: Maracanazo, Maracanã 1950, stadium fallback, sala de
mando (over-used in early batches).

---

## 3. Monetization & Growth Roadmap

```
Phase 1: organic reach        Phase 2: product integration       Phase 3: protocol loop
 [ 0-5k followers ]       -->    [ 5k-25k followers ]        -->   [ 25k+ followers ]
  - High-frequency posts         - CTAs into the app                - Sponsored campaigns
  - Trending audio overlays      - Live prediction challenges       - $GCH token utility burn
```

### Phase 1 — Seed Organic Reach (current)

- Maintain 2-3 posts/day per channel.
- Trending audio overlays (manual in app until automated in Phase 3).
- Hashtag rotation against LATAM trending pool (TikTok Creative Center).

### Phase 2 — Product & Solana Integration

- Bridge viewers to active players with challenges ("If Lamine Yamal scores,
  I stake my word — contract live on GoalChain").
- QR / shortlink in caption to route traffic to GoalChain dApp.

### Phase 3 — Monetization & Protocol Loop

- Sponsored prediction markets for Solana sports projects.
- Sponsorship revenue converted to $GCH + burned via the Vault crank (sync
  with `goalchain-economy-health`'s `vault_buyback_coverage` KPI).

---

## 4. Operational Guardrails (added 2026-06-23 by Hermes Manager)

These rules come from the Bloque A/B/C/D plan that the Manager is shipping
this week. They sit on top of the Antigravity pipeline.

1. **Secret hygiene** — `BUFFER_TOKEN` and `BUFFER_ORG_ID` live only in
   `.env`. `.env.example` is the canonical template.
2. **Hetzner legacy removed** — scripts run locally on this host only; the
   `windows -> hetzner` branch was removed (security theatre fix on issue
   from #828 family).
3. **`.gitignore` for generated assets** — `data/marketing_pipeline/*.mp4`,
   `*.png`, logs and heartbeat are not committed. Source of truth is the
   filesystem + `reconstruct_runs.py`.
4. **Stuck `generating` runs** — auto-pruned after 6h in `generating`
   status. (See Bloque B.)
5. **Per-session image lock** — `grok_super_pipeline.py` writes a tmp
   marker before clearing `~/.grok/sessions/` to avoid stealing another
   in-flight generation. (See Bloque B.)
6. **Empty-prompt rejection** — if Grok response has empty `image_prompt`
   or `video_prompt`, the plan is dropped, not silently saved.
7. **Cost guard** — `MAX_GROK_GENERATIONS_PER_DAY` in `.env` (default 40)
   blocks the daemon from triggering more generations than budget.
8. **Healthcheck endpoint** — `GET /api/marketing/pipeline/health` returns
   heartbeat age, last refill, last publish, queue counts. Manager pings
   every 5 min via Watchdog.

---

## 5. Long-Term Vision (3-12 months)

| Milestone | Trigger signal                                              |
| --------- | ----------------------------------------------------------- |
| 5k subs   | One organic video crosses 50k views with >4% save rate.     |
| 25k subs  | 3 weeks of avg >3% engagement rate per channel.             |
| First dApp conversion | 1 video-attributed wallet stake per week. |
| Sponsored market | First 3rd-party Solana project pays for a featured market. |
| $GCH burn | The first sponsored market fee actually burns.               |

When all 5 are green, the channel graduates from "media experiment" to
"GoalChain acquisition engine" — and the protocol loop component of the
economy is live.

---

*Last updated 2026-06-23 by `hermes-manager`. Comment or @-mention in
`#dev-room` if any of this is wrong.*
