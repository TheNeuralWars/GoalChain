# Go/No-Go Decision: ollama-hermes-agency

## Decision: ✅ GO — Build Immediately

**Score:** 51/60 (⭐⭐⭐⭐⭐)
**Date:** 2026-06-10
**Decider:** Nico (pending review)

## Score: 51/60

## Score: 51/60

## Rationale

### Strengths (Why GO)
1. **Exact infrastructure match** — We already run Hermes on VPS; Ollama is one command; skills are markdown
2. **Zero marginal cost** — Free local models + Grok free tier = near-infinite margins
3. **Proven market** — 3,000+ community; multiple £15K-50K/mo documented cases
4. **Recurring revenue model** — Retainers $3-8K/mo; productised $10-25K packages
5. **Differentiation moat** — Free infra vs competitors' $1,100/mo tool costs; Telegram-native premium delivery
6. **Speed to revenue** — First pilot in 2 weeks; retainer by week 4-6
7. **Scalable** — Productised skills → FCC builds → GitOps deploy → repeat

### Risks (Managed)
| Risk | Mitigation |
|------|------------|
| FCC capacity | P0/P1 prioritization; Manager can build simple skills; start with 2 core skills |
| Client acquisition | Nico sells first 3; then referral/inbound; free pilot lowers barrier |
| Technical reliability | Multi-provider (Grok + Ollama + OpenRouter); local fallback; monitoring |
| Data privacy objections | Mac Mini local deployment option; air-gap capable |

### Opportunity Cost
- **Alternative:** Build GoalChain webapp features / Solana program work
- **Comparison:** This generates cash flow in 30 days; GoalChain features are longer-term
- **Synergy:** Skills built here (content, research, monitoring) reuse in GoalChain ops
- **Recommendation:** Run in parallel — FCC on agency skills (P1), FCC on GoalChain (P0)

## Execution Plan

### Week 1 (Jun 10-16): Foundation
- [ ] Deploy Ollama + Hermes on VPS (Manager)
- [ ] Create FCC tasks for 2 core skills (Lead Qualification, Content Repurposing)
- [ ] Set up Superpowers monitoring on demo node
- [ ] Nico: Identify 3 pilot prospects

### Week 2 (Jun 17-23): Pilot Launch
- [ ] Skills v1 deployed on demo node
- [ ] Discovery calls with 3 pilots (Nico)
- [ ] Pilot agreements signed (free 2-week)
- [ ] FCC: Mac Mini deployment script

### Week 3-4 (Jun 24-Jul 7): Pilot Execution
- [ ] Daily iteration with pilot clients
- [ ] Metrics tracking (time saved, accuracy, adoption)
- [ ] FCC: Client VPS deployment automation
- [ ] Prepare retainer proposals

### Week 5-6 (Jul 8-21): Convert & Package
- [ ] Pilot results → case studies
- [ ] Convert pilots to retainers (target 2/3)
- [ ] Productise 5 core skills
- [ ] Sales assets ready
- [ ] Scale outreach to 20 targets

## Resource Allocation

| Resource | Allocation | Duration |
|----------|------------|----------|
| FCC (Nemotron/NVIDIA) | P1: 2 skills + deployment scripts | 4 weeks |
| FCC (Sonnet/OpenRouter) | P1: Skill templates, pricing calc | 2 weeks |
| Manager (Grok) | Orchestration, pilots, monitoring, sales | Ongoing |
| Nico | Pilot calls, closings, strategy | 15 hrs upfront, 4 hrs/mo |

## Success Criteria (Month 2)
- [ ] 2+ pilot clients converted to retainer
- [ ] $8K+/mo recurring revenue
- [ ] 2 core skills production-ready
- [ ] Deployment automation working (Mac Mini + VPS)
- [ ] Positive pilot testimonials

## Go/No-Go Gate (End of Week 4)
**If:** <1 pilot converts OR skills not working OR Nico blocks
**Then:** PARK — revisit when GoalChain revenue stable

**If:** ≥2 pilots convert OR strong inbound interest
**Then:** SCALE — hire sales support; build skill factory

---

**Approval:**
- [ ] Nico: `manager: approve x-radar ollama-hermes-agency`
- [ ] Manager: Execute plan above

**Next Review:** 2026-07-08 (Week 4 gate)