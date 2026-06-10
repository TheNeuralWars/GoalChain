# X Radar Scorecard: sovereign-ai-deployment

**Source:** https://www.mindmapdigital.ai/sovereign-ai
**Author:** MindMap Digital (enterprise sovereign AI deployments)
**Date Analyzed:** 2026-06-10

## Scores
| Criterion | Score (0-10) | Notes |
|-----------|--------------|-------|
| Speed to Revenue | 6 | 6-9 week deployments; enterprise sales cycle 3-6 months |
| Infra Synergy | 9 | Kubernetes, vLLM, pgvector/Qdrant, local embeddings — we have VPS, can add K8s; Hermes skills for orchestration |
| Market Proof | 9 | 20+ sovereign deployments; West African Bank, Pan-African Bank (6M users); SAMA/RBI/EU AI Act compliance |
| Recurring Revenue | 8 | $15-50K/project + $3-8K/mo support; regulated = sticky |
| Operational Burden | 5 | High: requires K8s, GPUs, SIEM integration, compliance mapping, 45-day hypercare |
| Differentiation | 8 | Air-gap native; open-weights on customer hardware; audit trails in client SIEM; unit economics beat cloud |

| **TOTAL** | **45/60** |  |

## Verdict
⭐⭐⭐⭐ (45/60) — **Queue for Next Sprint** — Spec + demo node

### Why this scores 45/60
- **Massive market tailwind** — Regulators (SAMA, RBI, EU AI Act, DPDP) mandating sovereign AI
- **Unit economics inverted** — On-prem now cheaper than cloud API at >200M tokens/mo
- **High differentiation** — True air-gap, not BYOK; open weights + customer-controlled hardware
- **Our stack maps well** — vLLM + local models + orchestration + monitoring = Hermes skills territory
- **BUT:** Long sales cycle, high operational complexity, needs GPU hardware

### Action
1. Create intake package (this folder)
2. Build demo: vLLM + Llama 3.3 8B on VPS (or rent A100 for demo)
3. Create Hermes skill for "Sovereign RAG Deployment"
4. Target 1 pilot with regulated SMB (fintech, healthtech, legaltech)
5. Partner with hardware provider (Hetzner GPU, Mac Mini cluster) for client deployments
6. Create GitHub issue for FCC to build deployment automation