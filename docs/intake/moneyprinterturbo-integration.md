# Intake: MoneyPrinterTurbo Integration for GoalChain Economy Funding

**Source:** User (Nico) — direct proposal
**Date:** 2026-06-09
**Priority:** P0 — revenue bootstrap for project
**Tags:** economy, content-automation, funding, bootstrap, football-niche

---

## Overview

Integrate [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) (MIT licensed, 82k⭐) into GoalChain's autonomous operations as a **content factory** that generates football/soccer short-form videos, publishes to monetizable platforms, and funnels revenue into the GoalChain treasury to fund development at launch.

## Why This Fits GoalChain

| GoalChain Mission | MoneyPrinterTurbo Capability |
|-------------------|------------------------------|
| "Change the story of football/soccer forever" | Auto-generate football content at scale |
| "Revolutionize betting and playing around it" | Betting insights, match analysis, player stats videos |
| Autonomous, self-maintained machine | Full MVC + REST API + batch generation, zero human loop |
| Decentralized finance enrichment | Revenue → treasury → staking rewards, dev fund, buybacks |

## Technical Integration Plan

### 1. Deploy MoneyPrinterTurbo on VPS (Docker)
```bash
# On VPS (~/hermes workspace)
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo
cp config.example.toml config.toml
# Configure: Pexels API, LLM provider (AIHubMix/OpenRouter), TTS (Edge TTS free)
docker compose up -d
# API at http://VPS_IP:8080/docs | WebUI at :8501
```

### 2. Football Content Pipeline (Automated)
- **Input sources:** Fixture APIs (football-data.org, API-Football), on-chain GoalChain match markets, trending X topics
- **Content types:**
  - Match previews/predictions (betting angle)
  - Player performance analysis (NFT player cards tie-in)
  - Tactical breakdowns
  - "GoalChain Alpha" market signals explained simply
- **Generation:** Batch 10-20 videos/day via REST API, pick best 3-5
- **Publishing:** YouTube Shorts API, TikTok API, Instagram Reels API (via scheduler)

### 3. Monetization Funnels
| Channel | Mechanism | Revenue Target |
|---------|-----------|----------------|
| YouTube Shorts | AdSense (Shorts Fund + ads) | $500-2000/mo at scale |
| TikTok | Creator Fund + LIVE gifts | $200-1000/mo |
| Affiliate | Betting platforms, crypto exchanges | Variable, high upside |
| Sponsorships | Football/crypto brands | $1000+/deal at 10k+ subs |
| GoalChain native | Drive traffic to webapp, referral codes | Direct user acquisition |

### 4. Treasury Integration
- Revenue collection → multisig treasury (Gnosis Safe)
- Allocation: 40% dev fund, 30% staking rewards, 20% buyback/burn, 10% ops
- Transparent on-chain reporting via GoalChain indexer

## Configuration Requirements

### API Keys Needed (add to `config.toml` + Hermes Vault)
- `pexels_api_keys` — free, royalty-free footage
- `llm_provider` + key — **AIHubMix** (sponsor, 700+ models, free tier) or **OpenRouter** (Nemotron-3-Ultra free)
- `edge_tts` — free, no key needed (default)
- Optional: `azure` TTS V2 for higher quality

### VPS Resources (current Oracle Cloud)
- 4-8 CPU cores, 16-24 GB RAM — sufficient for batch generation
- GPU not required (cloud LLMs/TTS offload compute)
- Storage: ~50 GB for temp video files

## Automation Architecture (Hermes-native)

```
Cron (every 6h) → Fetch fixtures/trending topics
      ↓
MoneyPrinterTurbo API → Generate 15 videos (batch)
      ↓
Quality filter (duration, subtitle sync, relevance score)
      ↓
Publish queue → YouTube/TikTok/IG APIs (scheduled)
      ↓
Analytics webhook → Revenue tracking → Treasury allocation
```

**Hermes integration points:**
- New `moneyprinter-ops` MCP tool (wrap REST API)
- Cron job `moneyprinter-gen-publish` (every 6h)
- Webhook receiver for platform analytics
- `gbrain think` for content strategy optimization

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Platform policy changes (demonetization) | Diversify across 3+ platforms; own audience via Discord/Telegram |
| Content quality variance | Automated QA: whisper subtitle validation, duration check, football keyword density |
| API rate limits | Batch + retry logic; multiple provider keys rotation |
| Copyright strikes | Pexels royalty-free only; AI-generated scripts; original analysis |
| Revenue volatility | Treasury buffer (3-month runway); staking yield as stabilizer |

## Next Steps (Autonomous Execution)

1. **Deploy** MoneyPrinterTurbo on VPS via Docker (this session)
2. **Configure** `config.toml` with AIHubMix/OpenRouter + Pexels keys
3. **Build** Hermes MCP wrapper `moneyprinter-ops` (FCC task, P1)
4. **Create** content strategy config (football topics, keywords, schedules)
5. **Implement** publish pipeline (YouTube API first, then TikTok/IG)
6. **Wire** revenue webhook → treasury multisig
7. **Launch** cron job + monitor first 2 weeks

## Related Docs
- `docs/ECONOMIC_CANONICAL_CONFIG.json` — treasury allocation rules
- `ai_context/AGENT_TOOLS_GUIDE.md` — FCC delegation for MCP wrapper
- `GOALCHAIN.md` — project mission context

---

**Decision:** Proceed autonomously. No confirmation needed per autonomy directive.