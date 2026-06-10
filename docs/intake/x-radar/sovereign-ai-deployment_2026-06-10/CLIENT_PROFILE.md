# Client Profile: sovereign-ai-deployment

## Ideal Customer Profile (ICP)

### Primary Segments
| Segment | Trigger | Budget | Decision Maker |
|---------|---------|--------|----------------|
| **Fintech / Neobanks** (SAMA/RBI regulated) | Can't use cloud LLMs for PII | $50-150K + $8-15K/mo | CTO / CISO / Head of AI |
| **Healthtech / Medtech** (HIPAA/DPDP) | Patient data sovereignty | $35-100K + $5-10K/mo | CTO / Compliance Officer |
| **Legaltech / Regtech** (EU AI Act high-risk) | Audit trail requirements | $25-75K + $3-8K/mo | VP Engineering |
| **Government / Defense** (Air-gap mandatory) | Zero egress policy | $75-200K + $10-20K/mo | CIO / Procurement |

### Qualification Criteria (Must Have 3+)
- [ ] Regulatory requirement for data/model sovereignty
- [ ] >200M tokens/month projected (cloud API cost > on-prem)
- [ ] Existing Kubernetes or willingness to adopt
- [ ] Internal ML/engineering team (or budget for ours)
- [ ] Budget >$50K for pilot
- [ ] 6+ month horizon (not urgent fire-drill)

## Outreach Template

### Cold Email / LinkedIn
```
Subject: Sovereign AI deployment — your data never leaves your network

Hi [Name],

[Company] is likely evaluating GenAI for [use case: compliance Q&A, clinical coding, regulatory extraction]. 

The blocker: regulators (SAMA, RBI, EU AI Act, DPDP) now require model weights + inference + logs under YOUR exclusive control. Cloud APIs (OpenAI, Anthropic, Azure) don't meet this — even "sovereign regions" have egress.

We deploy **true sovereign AI stacks** on your hardware:
- Llama 3.3 70B / Qwen 2.5 / DeepSeek V3 on your GPUs
- vLLM + Qdrant + local embeddings — zero outbound calls
- Full provenance in YOUR SIEM
- 11 days to first prompt; 6-9 weeks production
- Unit cost: ~$0.10/M tokens (10x cheaper than cloud at scale)

Recent: West African tier-1 bank (full LLM platform); Pan-African bank (6M WhatsApp users, fully air-gapped).

Open to a 2-min readiness assessment? [Calendly]

Best,
[Name]
```

### Discovery Call (45 min)
1. **Regulatory landscape** — Which frameworks apply? (SAMA, RBI, EU AI Act, DPDP, HIPAA)
2. **Use case** — What workflow has regulated data blocking cloud AI?
3. **Volume** — Monthly tokens? Current cloud spend?
4. **Infrastructure** — K8s? GPUs? Bare metal? Cloud?
5. **Team** — Internal ML ops? Need our hypercare?
6. **Timeline** — When must this be production?

## Pilot Structure

### "Sovereign AI Readiness Assessment" ($5K, 1 week)
- Regulatory gap analysis
- Infrastructure audit (K8s, GPUs, SIEM, IdP)
- Use case prioritization + ROI model
- Reference architecture + cost model
- Go/no-go for pilot

### Pilot Deployment (6-9 weeks, $35-75K)
| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| 1. Cluster provisioning | Week 1-2 | K8s + GPUs + storage + IdP |
| 2. Stack deployment | Week 3-4 | vLLM + Qdrant + embeddings + Hermes |
| 3. Corpus + Evals | Week 5-6 | First domain corpus + eval harness |
| 4. Hypercare + Rollout | Week 7-9 | Phased rollout (5% → 20% → 100%) |

## Retainer Scope
- Model upgrades (Llama 3.3 → 3.4, etc.)
- Corpus updates + re-indexing
- Eval regression testing
- Performance tuning (throughput, latency)
- Compliance evidence updates
- 4hr response SLA (business hours)

## Objection Handling

| Objection | Response |
|-----------|----------|
| "We'll wait for Azure/AWS sovereign" | "BYOK ≠ sovereign. Regulators want model weights + inference + logs on YOUR hardware. Azure/AWS don't ship weights to your DC with perpetual license." |
| "Too expensive" | "At 200M+ tokens/mo, on-prem is CHEAPER than cloud API. We model your unit economics — if cloud wins, we'll tell you." |
| "No GPU expertise" | "We operate for 30-45 days hypercare. Then retainer. Or we run on Hetzner GPUs you don't manage." |
| "Need it in 4 weeks" | "Do the $5K assessment first. If infrastructure ready, we can do 4-week compressed pilot on Hetzner A100." |
| "Data too sensitive for you to see" | "We never see it. Deploy air-gapped. Evals on synthetic data. You own everything end-to-end." |

## Target List (First 10)
*Regulated companies with public AI initiatives*

1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 