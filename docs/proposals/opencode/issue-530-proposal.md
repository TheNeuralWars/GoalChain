# OA Proposal — Issue #530

## Title
[OPENCODE] [P0] Comprehensive Web Refactor

## Source
Local queue (autonomous mode)

## Objective
## Objective
# OBJECTIVE
Complete overhaul of GoalChain web presence (Play app + marketing site alignment) fixing 10 critical areas reported by owner. This is a P0 architecture/refactor task — use Nemotron 3 Ultra (opus tier) via NVIDIA NIM.

# REPOSITORY
- Primary: `~/hermes/workspace/GoalChain/goalchain_webapp` (React + Vite + TypeScript, Play app at play.goalchain.fun)
- Marketing site: Separate deployment at `goalchain.fun` (static HTML/CSS/JS, likely in `docs/` or external repo)
- Both must be consistent. Changes in Play app i18n/components should mirror marketing site.

# ISSUES TO FIX (10 AREAS)

## 1. X-SCOUT BOT POSTS — HARDCODED SPANISH IN EN SITE
**Location:** `goalchain_webapp/src/ui/DashboardGrid.tsx` lines 149-168
**Problem:** Two X-Scout posts hardcoded in Spanish, appear on English site.
**Fix:** Move post content to i18n (`en.json` / `es.json`), render via `useTranslation`. Add keys:
- `xscout_post_1_meta`, `xscout_post_1_text`
- `xscout_post_2_meta`, `xscout_post_2_text`
- Future-proof: make posts data-driven (array in JSON) so new posts can be added without code changes.

## 2. PITCH / FEATURE CARDS — ADD MORE ADVANTAGE ELEMENTS
**Current:** 5 pillars (Predictive Markets, Real Economy, 3D Cards, PvP Minigames, 100% On-Chain) in i18n keys `pitch_feat1-5_t/d`.
**Desired:** Expand each card with more detail on competitive advantages vs other projects. Add sub-bullets or expandable details per pillar.
**Example additions per pillar:**
- Predictive Markets: "No house edge", "Instant settlement", "Composable with DeFi"
- Real Economy: "Revenue-backed vault (Jito/mSOL)", "Governance-controlled fees", "Builder fund transparency"
- 3D Cards: "Dynamic stats from real matches", "Stamina mechanic = token sink", "Genesis scarcity (100 only)"
- PvP Minigames: "Skill-based, not luck", "Daily challenges = retention", "Tournament prizepools from protocol fees"
- 100% On-Chain: "Anchor/Rust audited", "No admin keys for odds", "Oracle-verified results"
**Deliverable:** Update i18n JSONs + create reusable `FeatureCard` component used by both Play app and marketing site.

## 3. ZEALY QUESTS — XP NOT SYNCING TO REAL USER POINTS
**Location:** Likely marketing site (`goalchain.fun/#social`) or a component not yet in Play app.
**Problem:** "YOUR ZEALY XP 1,650" shows static/mock data, not real user's Zealy XP.
**Fix:**
- Create `ZealyService` in `goalchain_webapp/src/lib/zealyClient.ts` with:
  - `fetchUserXP(walletAddress: string): Promise<number>` — calls Zealy API (needs `VITE_ZEALY_API_KEY`)
  - `fetchLeaderboard(limit: number): Promise<ZealyUser[]>` — for leaderboard
  - `generateReferralLink(walletAddress: string): string`
- Connect wallet → fetch real XP → display. Cache with 5-min TTL.
- Add "Sync Now" button for manual refresh.

## Priority
P0

## Labels
status:ready,source:manager,agent:opencode,priority:P0,

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-530`.
