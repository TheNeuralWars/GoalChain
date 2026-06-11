# Go/No-Go Decision: sovereign-ai-deployment

## Recommendation
[x] **QUEUE** — Next Sprint (Score 36-47) — Build Immediately (Score ≥ 48)
- [x] **QUEUE** — Next Sprint (Score 36-47)
- [ ] **PARK** — Revisit Later (Score 24-35)
- [ ] **REFERENCE** — Learn Only (Score 12-23)
- [ ] **DISCARD** — No Fit (Score < 12)

## Score: 45/60

## Score: 45/60

## Rationale
High-value enterprise model with **strong market proof (20+ deployments, published unit economics)** and **high infra synergy**. However, **longer sales cycle (3-6 months)**, **higher operational burden (6-9 weeks → we target 2-3)**, and **higher dev investment (112h FCC)** push this to "Queue for Next Sprint" rather than immediate build.

Key advantages over MindMap Digital:
- 3x faster deployment via standardized skills + installer
- FCC parallel agents reduce marginal customization cost
- Multi-provider LLM flexibility
- GoalChain stack adds monitoring + multi-channel + GitOps "for free"

Best approach: **Build installer + compliance skill packs in Q3, sales outreach in parallel, target first deployment Q4**.

## Next Actions
1. **Q3 Week 1-2:** FCC builds `install-hermes-node.sh` enterprise variant (P0, 24h, tier opus)
2. **Q3 Week 2-4:** FCC builds 4 Compliance Skill Packs (P0/P1, 68h total)
3. **Q3 Week 1:** Nico starts outreach to 5 target accounts (parallel)
4. **Q3 Week 4:** Deploy hardened demo node with compliance evidence demo
5. **Q4:** First paid deployment

## Blocker Check
- [ ] GoalChain merge stack (#32-#34) on main?
- [x] FCC capacity available? (opus tier for compliance packs)
- [ ] Demo node hardware ready? (Mac Mini M4 or Hetzner dedicated)
- [ ] Legal/entity for enterprise contracts? (Nico to confirm — may need SA/SpA)
- [ ] Compliance counsel? (External for SOC2/GDPR/HIPAA/MiCA validation)
- [ ] Insurance? (Professional liability for enterprise)

## GitHub Tracking Issue
Auto-create via: `bash /data/apps/dot-hermes/profiles/hermes-ceo/skills/devops/x-revenue-radar/scripts/promote-x-radar.sh sovereign-ai-deployment 45`

## FCC Tasks to Create (P0 → tier opus / sonnet)
- `TASK_INSTALLER_ENTERPRISE.md` — Hardened node installer with VPN/hardening
- `TASK_SKILL_SOC2.md` — SOC2 evidence generator
- `TASK_SKILL_GDPR.md` — DPIA automation
- `TASK_SKILL_HIPAA.md` — Audit logger
- `TASK_SKILL_MICA.md` — Crypto asset reporting
- `TASK_FLEET_MANAGER.md` — Multi-node Ansible + skills sync