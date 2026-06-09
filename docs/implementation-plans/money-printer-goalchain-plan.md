# GoalChain Money Printer — Content Flywheel Implementation Plan

**Objective**: Deploy a fully-automated, football-native short-video factory from Day 1, leveraging existing GoalChain infra (Grok Imagine, ElevenLabs, FAL, X-Scout, Hermes workers) to drive traffic → players → revenue.

**Target Launch**: Tomorrow (Day 1 content generation)

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GOALCHAIN MONEY PRINTER FLYWHEEL                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │  X-SCOUT     │───▶│  SCRIPT GEN  │───▶│ VIDEO PIPE   │───▶│ BUFFER   │  │
│  │  (football   │    │  (Grok +     │    │  (Imagine +  │    │  (local  │  │
│  │   trends,    │    │   lore ctx)  │    │   TTS +     │    │   MP4s)  │  │
│  │   fixtures)  │    │              │    │   stock)    │    │          │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └────┬─────┘  │
│                                                                    │        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │        │
│  │  ANALYTICS   │◀───│  DISTRIBUTE  │◀───│  QA GATE     │◀────────┘        │
│  │  (views,     │    │  (TikTok,    │    │  (auto +     │                  │
│  │   CTR, conv) │    │   Reels,     │    │   human)     │                  │
│  └──────────────┘    │   Shorts)    │    └──────────────┘                  │
│         ▲            └──────────────┘                                       │
│         │                                                                    │
│         └──────────────┐                                                     │
│                        ▼                                                     │
│              ┌──────────────────┐                                           │
│              │  REVENUE LAYER   │                                           │
│              │  (affiliate,     │                                           │
│              │   referrals,     │                                           │
│              │   sponsors)      │                                           │
│              └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## EXISTING INFRASTRUCTURE INVENTORY (Zero New Cost)

| Component | Status | Purpose in Pipeline |
|-----------|--------|---------------------|
| **Grok Imagine (image)** | ✅ Working | Thumbnails, B-roll clips, 2k quality |
| **Grok Imagine (video)** | ✅ Working | 720p video clips, $0.05/s via SuperGrok |
| **ElevenLabs TTS** | ✅ Free tier | Voiceover (10k chars/mo free) |
| **FAL.ai key** | ✅ Configured | Backup video gen, upscaling |
| **Canva API** | ✅ Configured | Templates, branding overlay |
| **X-Scout** | ✅ Running 24/7 | Football trends, fixtures, player data |
| **Hermes Workers (α-κ)** | ✅ 10 FCC workers | Parallel video rendering |
| **marketing-active profile** | ✅ Configured | Grok Imagine toolset enabled |
| **player-images profile** | ✅ Configured | Video generation toolset enabled |
| **Discord channels** | ✅ Active | Distribution (genesis-lounge, degen-locker-room) |
| **528 player database** | ✅ Live | UGC content, referral codes |
| **GoalChain SDK/API** | ✅ Deployed | Referral tracking, on-chain verification |

---

## PHASE 1: CORE PIPELINE (Day 1-2) — FULL AUTOMATION

### 1.1 Script Generation Engine (`goalchain-script-gen`)
**Skill**: `creative/goalchain-script-gen`
**Inputs**: X-Scout radar output + fixtures + lore bible + betting odds
**Outputs**: Structured script JSON (scenes, narration, visual prompts, CTAs)

```python
# Script schema
{
  "id": "gc_20260610_001",
  "theme": "world_cup_2026_qualifiers_betting",
  "angle": "underdog_value_bets",
  "duration_sec": 45,
  "scenes": [
    {"idx": 0, "type": "hook", "narration": "...", "visual_prompt": "...", "duration": 3},
    {"idx": 1, "type": "data", "narration": "...", "visual_prompt": "...", "duration": 8},
    {"idx": 2, "type": "lore", "narration": "...", "visual_prompt": "...", "duration": 10},
    {"idx": 3, "type": "cta", "narration": "...", "visual_prompt": "...", "duration": 5}
  ],
  "metadata": {"x_scout_source": "radar_20260610_0600", "affiliate_tag": "GC_WC26"}
}
```

**Templates** (rotate daily):
- `betting_angle` — Value bets, odds analysis, sharp money
- `player_spotlight` — Rising star, lava legion lore, stats
- `match_preview` — Fixture breakdown, prediction market
- `lore_deep_dive` — Lava Legion origin, faction wars, NFT utility
- `tutorial` — How to play GoalChain, wallet setup, first match

### 1.2 Video Render Pipeline (`goalchain-video-render`)
**Skill**: `creative/goalchain-video-render`
**Workers**: 10 FCC workers (α-κ) parallel, 1 video each
**Stages**:
1. **Visual generation** — Grok Imagine video (720p) per scene prompt
2. **TTS generation** — ElevenLabs per narration line (voice: "Adam" or "Rachel")
3. **Stock footage** — Pexels API (free) for B-roll gaps
4. **Assembly** — ffmpeg concat + subtitles + branding + music
5. **Output** — MP4 (1080x1920, 30fps, H.264, <50MB)

**Quality gates** (auto):
- Duration ±5% of target
- Audio loudness -14 LUFS
- Brand watermark present
- CTA frame at end (play.goalchain.fun + referral code)

### 1.3 Scheduler & Orchestrator (`goalchain-content-scheduler`)
**Cron**: `hermes-cron` every 4 hours (6 videos/day target)
**State machine**: `pending → scripting → rendering → qa → buffered → published → analyzed`
**Storage**: `~/hermes/content-buffer/` (local MP4s + metadata JSON)

---

## PHASE 2: DISTRIBUTION & ANALYTICS (Day 3-7)

### 2.1 Multi-Platform Publisher (`goalchain-publisher`)
**Platforms**: TikTok, Instagram Reels, YouTube Shorts, X (video)
**API**: Buffer.com / Hootsuite / native APIs (rotate to avoid rate limits)
**Scheduling**: Optimal times per platform (learned from analytics)
**CTA rotation**:.play.goalchain.fun / referral codes / Discord invite

### 2.2 Analytics Engine (`goalchain-content-analytics`)
**Metrics**: Views, watch time, CTR, conversion (click → play.goalchain.fun), referral signups
**Attribution**: UTM params per video + platform
**Feedback loop**: Top 20% scripts → fine-tune Grok prompts

---

## PHASE 3: MONETIZATION & OPTIMIZATION (Week 2+)

### 3.1 Revenue Layer
- **Affiliate betting** — Odds API integration, track clicks → deposits
- **Referral program** — On-chain verified, $GC rewards
- **Sponsorships** — When >10k followers/platform
- **NFT drops** — Exclusive video NFTs for holders

### 3.2 Optimization
- A/B test hooks, thumbnails, CTAs
- Grok prompt evolution (RL from analytics)
- UGC integration — Best player clips → remix

---

## GREEK TEAM INTEGRATION (Day 1)

### Shared Repository Structure
```
GoalChain/
├── ops/
│   └── content-flywheel/
│       ├── scripts/
│       │   ├── script_gen.py          # Grok + X-Scout → scripts
│       │   ├── video_render.py        # Imagine + TTS + ffmpeg
│       │   ├── publisher.py           # Multi-platform posting
│       │   └── analytics.py           # Metrics collection
│       ├── skills/
│       │   ├── goalchain-script-gen/
│       │   ├── goalchain-video-render/
│       │   ├── goalchain-publisher/
│       │   └── goalchain-content-analytics/
│       ├── config/
│       │   ├── script_templates.json
│       │   ├── video_presets.json
│       │   └── platform_specs.json
│       └── cron/
│           └── content-scheduler.yaml
```

### Collaboration Protocol
| Greek Team | GoalChain Team | Channel |
|------------|----------------|---------|
| Video editing expertise | Football data + prompts | `#dev-room` |
| Platform growth tactics | Lore + betting angles | `#marketing-active` |
| Analytics dashboards | On-chain attribution | Shared Notion |

---

## DAY 1 EXECUTION CHECKLIST

| Task | Owner | Status |
|------|-------|--------|
| Pexels API key added to config.env | Manager | ⏳ Pending |
| Test Grok Imagine video (30s) end-to-end | Manager | ⏳ Pending |
| Test ElevenLabs TTS quality | Manager | ⏳ Pending |
| Create `goalchain-script-gen` skill | FCC (P0) | 📋 Issue created |
| Create `goalchain-video-render` skill | FCC (P0) | 📋 Issue created |
| Create `content-scheduler` cron job | Manager | 📋 Issue created |
| First video rendered & buffered | System | 🎯 Target: Tomorrow |

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Grok Imagine rate limits | 10 workers stagger requests; fallback to FAL.ai |
| ElevenLabs free tier exhausted | Batch TTS; cache common phrases; upgrade if needed |
| Platform API bans | Rotate Buffer/Hootsuite/native; human review gate |
| Content quality variance | Auto-QA gates + human spot-check 20% |
| Copyright claims | Pexels (royalty-free) + AI-generated only; no user content |

---

## SUCCESS METRICS (Week 1)

| Metric | Target |
|--------|--------|
| Videos generated/day | 6 |
| Videos published/day | 4 (after QA) |
| Total views (Week 1) | 50k+ |
| CTR to play.goalchain.fun | 2%+ |
| New player signups | 50+ |
| Cost/video | <$2 (SuperGrok covered) |