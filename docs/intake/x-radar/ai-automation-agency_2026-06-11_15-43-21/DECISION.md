# Go/No-Go Decision: ai-automation-agency

## Recommendation
[x] **QUEUE** — Next Sprint (Score 36-47) — Build Immediately (Score ≥ 48)
- [x] **QUEUE** — Next Sprint (Score 36-47)
- [ ] **PARK** — Revisit Later (Score 24-35)
- [ ] **REFERENCE** — Learn Only (Score 12-23)
- [ ] **DISCARD** — No Fit (Score < 12)

## Score: 41/60

## Score: 41/60

## Rationale
**Validated model (Voxly 53/60 → $72K ARR in 3 months)** with clear path to revenue. However, **lower infra synergy (7/10)** because base stack differs (Supabase/Vercel/Next.js vs our Hermes/GoalChain), and **competitive market** (many "AI content" startups). Our unique moat is **GoalChain sports/crypto native data + on-chain verification** — something no competitor has.

Best approach: **Build as GoalChain product extension** — reuse webapp, SDK, on-chain program; add voice engine + multi-platform delivery. This transforms a generic "AI content SaaS" into a **vertical-specific platform with proprietary data**.

## Next Actions
1. **Week 1-2:** FCC builds Core Voice Engine (P0, 20h, tier opus)
2. **Week 2-3:** FCC builds GoalChain Sports Data Plugin + On-chain Verification (P0, 32h)
3. **Week 2:** Deploy live demo on Supabase/Vercel free tiers (Manager, 16h)
4. **Week 1:** Nico starts outreach to 25 contacts (5 verticals × 5 each)
5. **Week 4:** First B2B demo → close Client 1
6. **Week 8:** 3 B2B signed = $6K MRR

## Blocker Check
- [ ] GoalChain merge stack (#32-#34) on main? (needed for on-chain verification)
- [x] FCC capacity available? (opus for voice engine, sonnet for rest)
- [ ] Demo infra ready? (Supabase/Vercel free tiers + Hetzner demo node)
- [ ] Stripe account for B2B subscriptions? (Nico to confirm)
- [ ] Legal entity for contracts? (Nico to confirm)
- [ ] X history export for Nico voice clone demo? (or API access)

## GitHub Tracking Issue
Auto-create via: `bash /data/apps/dot-hermes/profiles/hermes-ceo/skills/devops/x-revenue-radar/scripts/promote-x-radar.sh ai-automation-agency 41`

## FCC Tasks to Create (P0 → tier opus / sonnet)
- `TASK_VOICE_ENGINE.md` — Core voice learning (opus, 20h)
- `TASK_MULTI_PLATFORM.md` — 6-platform adapters + Hermes skills + cron (sonnet, 16h)
- `TASK_B2B_DASHBOARD.md` — Team workspace, usage analytics, Stripe Connect (sonnet, 12h)
- `TASK_WAITLIST.md` — Landing page, tier pricing, referral system, email automation (sonnet, 8h)
- `TASK_SPORTS_PLUGIN.md` — GoalChain match data → content templates (sonnet, 16h)
- `TASK_ONCHAIN_VERIFY.md` — Publish hashes → GoalChain program → verify (sonnet, 16h)
- `TASK_DEMO_DEPLOY.md` — Live demo on Supabase/Vercel (Manager, 16h)