# Spike Proposal: Webapp Polish & AI Integrations
**Branch:** `exp/antigravity-webapp-polish`  
**Priority:** P2  
**Implementer:** Antigravity (Google AI)  
**Status:** Spike Proposed (Awaiting Review)

---

## 1. Approach & Accomplishments

This spike implements a comprehensive frontend aesthetic and functional upgrade for the GoalChain transactional dashboard. It adds DeFi-style widgets, live commentator logic, and automated bots without changing the blockchain smart contracts or backend API structures.

### A. Glassmorphism & UI System Polish (`index.css` & components)
* **Design Tokens:** Expanded `src/index.css` to add dark glassmorphic card classes (`.glass-card`), neon dropshadow borders (`btn-neon-green`, `btn-neon-red`), and typography alignments using *Outfit* and *Plus Jakarta Sans*.
* **Interactive Range Sliders:** Overrode standard browser styling for range inputs with a glowing neon purple track and green thumb.
* **Holographic Rarity Cards:** Created `.card-rarity-gold`, `.card-rarity-silver`, and `.card-rarity-bronze` borders. Added a custom linear sheen gradient (`@keyframes holo-shimmer`) that shines dynamically when hover is active on Gold cards.
* **Badges:** Added outlined badges with micro-glows (`🥅 Goal`, `💸 Bet`, `⚖️ Oracle`) for live match actions.

### B. Client-Side AI Commentator ("Enzo Bit") (`AICommentator.tsx`)
* **Simulated WebGPU Compilation:** Simulates local binary downloads and WebGPU neural compiling before transitioning to the commentator dashboard to show local AI capabilities.
* **Native Web Speech TTS:** Integrates the browser's native `window.speechSynthesis` engine to speak live commentaries in Spanish/local voices.
* **Visual soundwaves:** Renders digital vector lines that animate via `@keyframes soundwave-bounce` when speech synthesis is talking.
* **Event-Driven Commentary:** Listens to `goalchain-event` window signals. When a goal, bet, or resolve occurs, Enzo Bit speaks an enthusiastic sports commentary out loud and logs it to a scrolling chat panel.

### C. Swarm Vaults Widget (`SwarmVaults.tsx`)
* **Strategy Cards:** Renders conservative (Sentinel), balanced (Arbitrageur), and degen (Orchestrator) automated staking strategies.
* **SVG Stacked Allocator:** Renders a stacked bar chart displaying asset distributions (e.g. Drift Hedging, Jupiter LP, Cash reserves) that transitions widths using smooth CSS animations.
* **Swarm Console Feed:** Renders a mock CLI console showing background agent logs (rebalancing, scanning volatility spreads) appending every 6 seconds.
* **Interaction:** Supports deposits, withdrawals, and wallet deductions, emitting window events that Enzo Bit narrate.

### D. AI Vibe-Trading Bots (`TradingTerminal.tsx`)
* **Terminal Tabs:** Toggles between Manual derivatives orders and autonomous AI Vibe Bots.
* **Vibe Sentiment Gauge:** Renders a semi-circular SVG dial gauge. A mechanical needle rotates and bounces smoothly via `cubic-bezier` transitions to track market sentiment (0-100%).
* **Autonomous Strategies:** 
  - *El Toro Sentimental* (Long specialist): opens virtual 5x Longs when sentiment > 65%.
  - *El Oso Analítico* (Short specialist): opens virtual 5x Shorts when sentiment < 35%.
* **Corrective Sentiment Fallback:** Closing trades adjusts sentiment towards neutral (-8% for Toro close, +8% for Oso close) to simulate market cooling and prevent loops.
* **Vibe Transaction Ledger:** A scrolling console printing bot trades, entry prices, P&L, and timestamps.
* **Loop Prevention:** Added strict keyword filters ignoring events with `🤖` or `Vibe-Bot` to stop commentator-bot infinite loops.

### E. Social Video Post-Production (`scripts/post_produce_reel.py`)
* Compiles the Hyperframes video alert, calls local Kokoro TTS to generate voiceovers, mixes them in FFmpeg with stadium crowd noise (volume ducked to `0.08`), and auto-publishes to Discord.

---

## 2. Risks & Rollback Analysis

| Risk Area | Severity | Mitigation Plan |
|-----------|----------|-----------------|
| **Blockchain Impact** | Zero | The spike does not call or modify Solana program instructions. Wallet balance deductions and open positions are completely virtual and mocked locally in state. |
| **API/Database Overhead** | Zero | All features run client-side. There is no state stored in the backend database. |
| **Browser Speech Lockups** | Low | Native Speech Synthesis can occasionally lock up in older browsers. We resolved this by calling `window.speechSynthesis.cancel()` before every speech queue and providing an interactive mute toggle. |
| **Looping Feedback** | Low | Loops where comments trigger bot trades are blocked by keyword exclusions (`🤖` / `Vibe-Bot`) in the event listeners. |
| **Asset Download Size** | Low | The Kokoro voice assets download (~27MB) is localized to the command-line video script; browser users only load local system TTS voices. |

### Rollback Plan
If Cursor or Nico decide to discard these features:
1. Run `git checkout main`
2. Run `git branch -D exp/antigravity-webapp-polish`
3. Delete the local compiled outputs in `scripts/marketing/video-automation/assets/` if they are not tracked.
4. No migrations or contract upgrades are required.

---

## 3. Proposed PR Diff Summary

```diff
 goalchain_webapp/index.html                         |   3 +
 goalchain_webapp/src/index.css                      | 210 +++++++++++++++++++++
 goalchain_webapp/src/ui/AICommentator.tsx           | 335 +++++++++++++++++++++++++++++
 goalchain_webapp/src/ui/App.tsx                     |  12 +-
 goalchain_webapp/src/ui/FixturesPanel.tsx           |  10 +-
 goalchain_webapp/src/ui/LiveEventFeed.tsx           |  22 +-
 goalchain_webapp/src/ui/SquadGallery.tsx            |  44 ++--
 goalchain_webapp/src/ui/SwarmVaults.tsx             | 250 +++++++++++++++++++++++
 goalchain_webapp/src/ui/TradingTerminal.tsx         | 340 +++++++++++++++++++++++++++++++-
 scripts/post_produce_reel.py                        | 165 ++++++++++++++++
 scripts/oracle_scraper.py                           | 145 ++++++++++++++++
```
