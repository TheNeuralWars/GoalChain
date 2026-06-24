# Marketing Pipeline — README

24/7 autonomous short-form video pipeline that produces 9:16 content for two
accounts and pushes to Buffer (TikTok, YouTube Shorts, Instagram Reels).

Owner: **Hermes Manager** (this profile). Co-author /**handoff**: Antigravity.

Latest entry points:
- `pipeline_daemon.py` — PM2 process supervisor. Self-heals on boot:
  reconstructs `runs.json` from filesystem, prunes stuck `generating` runs.
- `grok_super_pipeline.py` — single-run driver. Builds trend topic, A/B
  variants, hashtags, story arc, image+video, captions (optional), and
  pushes to Buffer with smart scheduling.
- `trend_researcher.py` — produces planned entries in `runs.json` by asking
  Grok for HCMT-flavoured topics around the World Cup 2026 player universe.
- `schedule_optimizer.py` — peak-window calculator + Buffer queue aware.
  Adds LATAM (UTC-3) loop with hype-sequencing offsets per platform.
- `reconstruct_runs.py` — reverse mode. Replays filesystem to `runs.json` so
  the database always catches back up after a wipe.
- `ab_tester.py` — Hook/CTA A/B variant allocator.
- `story_arc.py` — multi-episode narrative thread allocator.
- `hashtag_researcher.py` — player-aware hashtag set mixer.
- `quality_scorer.py` — pre-flight check (warn-only).
- `captions_burnin.py` — ffmpeg drawtext caption renderer (off by default).
- `pipeline_health.py` — diagnostic endpoint. Useful to enable in
  `goalchain_api` as `GET /api/marketing/pipeline/health`.

## Daily operating loop

1. After 06:00 UTC, daemon checks if any channel in Buffer queue has fewer
   than 5 pending posts. If so:
2. Spawns `trend_researcher.py` to append 5 planned entries per account.
3. Picks `needed = 5 - pending_count` plans per account and triggers
   `grok_super_pipeline.run_pipeline()` sequentially.
4. Each run locks `~/.grok/sessions/` for itself, generates fresh image +
   video, optionally burns in captions, then prompts the smart scheduler to
   schedule in Buffer.
5. `runs.json` records topic, variants, arc + episode, hashtags, quality
   score, captions status, scheduled time.
6. On next heartbeat tick (10s) `daemon_status.json` is refreshed.
7. If a manual `trigger.json` appears, the daemon handles `research`,
   `generate_planned`, or default `generate` actions.

## Environment switches

```dotenv
BUFFER_TOKEN=...
BUFFER_ORG_ID=6a2816a912de31678241942c
MAX_GROK_GENERATIONS_PER_DAY=40
CAPTIONS_ENABLED=false           # flip true after ffmpeg is installed
BRAND_SAFETY_ENABLED=false        # not wired yet — see BLOQUE D stub
```

## Filesystem layout

```
/data/apps/GoalChain/
├── data/marketing_pipeline/
│   ├── runs.json                 (commited, source of truth for the API)
│   ├── daemon_status.json        (gitignored, heartbeat)
│   ├── schedule_preview.json     (gitignored, served by API)
│   ├── cost_guard.json           (gitignored, daily counter)
│   ├── arc_state.json            (gitignored, story arcs)
│   ├── hashtag_history.json      (gitignored, rotation)
│   ├── trigger.json              (gitignored, manual queue)
│   ├── last_auto_queue_date.txt  (commited, daily refil marker)
│   ├── logs/                     (gitignored, per-run logs)
│   ├── *.mp4 *.png *.jpg         (gitignored, raw media)
├── scripts/video_automation/
│   ├── *.py                      (the actual pipeline)
│   └── MARKETING_CHANGELOG.md    (this file's companion doc)
└── /home/ubuntu/scratch/grok_batches/batch_01/outputs/
    ├── grok_img_<ts>_*.png        (raw images Grok saves / ping)
    └── grok_vid_<ts>_*.mp4        (raw videos)
```

## What to do if something breaks

| Symptom                                       | Diagnostic                        | Action                                                                |
| --------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| Daemon not in `pm2 list`                      | `pm2 list \| grep video`          | `pm2 start scripts/video_automation/pipeline_daemon.py --name hermes-video-daemon` |
| `Buffer 429` consumes too much Grok quota     | `schedule_preview.json` shows `pending_in_queue=0` everywhere | Wait until rate-limit window resets, **don't poll Buffer**: daemon auto-falls-back to local heuristics |
| `runs.json` `wiped` or `corrupt`              | daemon logs an error              | restart daemon — `reconstruct_runs.py` will rehydrate from mp4/png |
| `cost_guard.json` blocks refill               | `cat data/marketing_pipeline/cost_guard.json`              | Bump `MAX_GROK_GENERATIONS_PER_DAY` in `.env` if next day is critical; **or** reset the counter file. |
| A video published without captions            | `captions_render.status != "ok"`  | Check ffmpeg path (`which ffmpeg`); enable `CAPTIONS_ENABLED=true`.               |

## How to debug a single run

```bash
cd /data/apps/GoalChain
# 1. Check what was attempted
tail -100 data/marketing_pipeline/logs/run_<id>.log
# 2. Check what Buffer saw
cat data/marketing_pipeline/runs.json | jq ".[] | select(.id=="\"<run_id>\"")"
# 3. Manually replay (won't republish; just prints prompts to check Grok intent)
python3 scripts/video_automation/grok_super_pipeline.py \
   --account GoalChainSol --auto-topic --run-id dryrun_$(date +%s)
```

## Owner certificate

I, Hermes Manager, commit to keeping this module operational as a long-term
asset. I maintain CHANGELOG.md, monitor `goalchain_ops.pulse`, escalate to
Nico only when the module requires a steer (live-mode change, threshold
change, automation consent).
