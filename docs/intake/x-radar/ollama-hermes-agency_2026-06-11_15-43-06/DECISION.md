# Go/No-Go Decision: ollama-hermes-agency

## Recommendation
- [x] **GO** — Build Immediately (Score ≥ 48)
- [ ] **QUEUE** — Next Sprint (Score 36-47)
- [ ] **PARK** — Revisit Later (Score 24-35)
- [ ] **REFERENCE** — Learn Only (Score 12-23)
- [ ] **DISCARD** — No Fit (Score < 12)

## Score: 50/60

## Score: 50/60

## Rationale
This is a **direct replication of a validated business model** (marfinxx at 52/60) with **100% infrastructure synergy**. The AI Money Lab playbook provides documented revenue numbers, a proven client acquisition funnel, and a clear operational playbook. Our GoalChain stack is a strict upgrade over their manual Hermes + crontab setup.

Key differentiators for us:
- Multi-provider LLM (Grok + Ollama) vs single Ollama
- Versioned skills system vs ad-hoc prompts
- GitOps deployment vs manual SSH
- Superpowers MCP monitoring vs nothing
- Multi-channel (Telegram/WhatsApp/Discord) vs Telegram only
- FCC parallel agent delegation for rapid client customizations

## Next Actions
1. **Week 1:** FCC builds `install-hermes-node.sh` (P0, 16h, tier sonnet)
2. **Week 1:** Deploy demo node on Hetzner CX22 (Manager, 8h)
3. **Week 2:** Build first Client Template Skill Pack: Daily Competitor Intelligence (FCC, 12h, P0)
4. **Week 2:** Outreach to 5 Argentine agencies + 3 sports-betting Discords (Nico)
5. **Week 3:** First B2B demo → close Client 1
6. **Week 4:** Revenue positive

## Blocker Check
- [ ] GoalChain merge stack (#32-#34) on main?
- [x] FCC capacity available? (opencode worker ready)
- [ ] Demo node VPS ready? (Hetzner account exists)
- [ ] Legal/entity for invoicing? (Nico to confirm)
- [ ] Stripe/MP account for recurring billing? (Nico to confirm)

## GitHub Tracking Issue
Auto-create via: `bash /data/apps/dot-hermes/profiles/hermes-ceo/skills/devops/x-revenue-radar/scripts/promote-x-radar.sh ollama-hermes-agency 50`

## FCC Tasks to Create (P0 → tier sonnet / opus)
- `TASK_INSTALLER_SCRIPT.md` — One-liner node installer
- `TASK_TEMPLATE_COMPETITOR_INTEL.md` — X-Scout → Telegram daily
- `TASK_TEMPLATE_LEGAL_DOCS.md` — Spanish contract processor
- `TASK_TEMPLATE_BETTING_ODDS.md` — Multi-book odds scraper