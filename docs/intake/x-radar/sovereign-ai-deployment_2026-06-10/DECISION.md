# Go/No-Go Decision: sovereign-ai-deployment

## Decision: ⏳ QUEUE FOR NEXT SPRINT — Spec + Demo Node

**Score:** 45/60 (⭐⭐⭐⭐)
**Date:** 2026-06-10
**Decider:** Nico (pending review)

## Rationale

### Strengths
1. **Regulatory tailwind** — SAMA, RBI, EU AI Act, DPDP mandating sovereign AI
2. **Economics inverted** — On-prem cheaper than cloud at >200M tokens/mo
3. **High differentiation** — True air-gap (not BYOK); open weights on customer hardware
4. **Our stack relevance** — vLLM + local models + orchestration = Hermes skills
5. **Sticky revenue** — Regulated clients don't churn; multi-year contracts

### Concerns (Why Not "Build Immediately")
1. **Sales cycle 3-6 months** — Enterprise procurement; compliance reviews
2. **High operational complexity** — K8s, GPUs, SIEM, compliance mapping
3. **Hardware dependency** — Need A100/H100 or Mac Mini clusters
4. **Nico bandwidth** — Requires deep technical + compliance conversations
5. **Competition** — MindMap Digital, Abacus, TRD Sovereign established

### Strategic Fit
- **GoalChain synergy:** Deployment skills, monitoring, GitOps reusable
- **Cash flow:** Lumpy (large projects); not monthly recurring like agency
- **Team growth:** Would need dedicated DevOps/MLOps hire

## Recommended Path

### Sprint 1 (Jul 2026): Demo + Spec
- [ ] Deploy demo node: vLLM + Llama 3.3 8B + Qdrant on Hetzner A100
- [ ] Build Hermes RAG + Eval + Compliance skills
- [ ] Document deployment runbook
- [ ] Run 1 paid assessment ($5K) with warm prospect

### Sprint 2 (Aug 2026): Pilot Decision Gate
**If:** Assessment converts to pilot AND demo works reliably
**Then:** Allocate FCC P0 for deployment automation; queue pilot

**If:** No conversion OR demo unreliable
**Then:** PARK — revisit Q4 when regulatory deadlines closer (EU AI Act Aug 2026)

## Resource Allocation (Sprint 1 Only)

| Resource | Allocation | Duration |
|----------|------------|----------|
| FCC (Nemotron) | P1: vLLM + RAG + Eval skills | 3 weeks |
| Manager | Demo ops, compliance templates, assessment | 2 weeks |
| Nico | 2-3 assessment calls | Week 2-3 |
| Infra | Hetzner A100 (1 month) | $1,600 |

## Success Criteria (Sprint 1 End)
- [ ] Demo node: ingest corpus → query → eval pass
- [ ] Egress blocking verified
- [ ] SIEM webhook demo working
- [ ] 1 paid assessment completed
- [ ] Runbook documented for client deploy

## Go/No-Go Gate (End of Sprint 1)
**Proceed to Pilot IF:**
- [ ] Assessment → pilot conversion
- [ ] Demo node stable 2+ weeks
- [ ] FCC deployment automation 50%+

**PARK IF:**
- [ ] No assessment interest after 5 outreaches
- [ ] Demo node reliability <95%
- [ ] Nico / FCC capacity blocked by GoalChain

---

**Approval:**
- [ ] Nico: `manager: queue x-radar sovereign-ai-deployment`
- [ ] Manager: Execute Sprint 1 plan

**Next Review:** 2026-07-31 (Sprint 1 gate)