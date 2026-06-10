# Effort Estimate: sovereign-ai-deployment

## Development Hours (Internal)

### Phase 1: Demo Stack (Week 1-3)
| Task | Hours | Owner |
|------|-------|-------|
| Rent Hetzner A100 (1 month) | 2 | Manager |
| Deploy vLLM + Llama 3.3 8B + Qdrant | 16 | FCC (P1) |
| Local embeddings (bge-m3 via Ollama) | 8 | FCC (P1) |
| Hermes RAG skill (ingest, query, eval) | 16 | FCC (P1) |
| Namespace egress blocking demo | 8 | FCC (P1) |
| SIEM webhook integration (mock) | 8 | FCC (P1) |
| Documentation + runbook | 8 | Manager |
| **Subtotal** | **66** | |

### Phase 2: Deployment Automation (Week 4-6)
| Task | Hours | Owner |
|------|-------|-------|
| K8s cluster provisioning skill (Terraform/Ansible) | 24 | FCC (P0) |
| vLLM + Qdrant + embeddings deploy skill | 20 | FCC (P0) |
| Corpus ingestion pipeline skill | 16 | FCC (P1) |
| Eval harness skill (RAGAS + custom) | 16 | FCC (P1) |
| Compliance mapping templates (SAMA, RBI, EU AI Act, DPDP) | 20 | Manager |
| Client handover runbook | 8 | Manager |
| **Subtotal** | **104** | |

### Phase 3: Per-Client Delivery (Ongoing)
| Task | Hours/Client | Notes |
|------|--------------|-------|
| Assessment (1 week) | 20 | $5K paid |
| Pilot deployment (6-9 weeks) | 120 | Split across team |
| Hypercare (30-45 days) | 60 | Embedded engineer |
| Monthly retainer | 30/mo | Monitoring, tuning, updates |

## Infrastructure Costs

### Demo (1 month)
| Item | Cost |
|------|------|
| Hetzner A100 80GB (1 month) | ~$1,500 |
| Storage + network | ~$100 |
| **Total** | **~$1,600** |

### Per Client (Client Pays)
| Profile | Hardware | Monthly (Client) |
|---------|----------|------------------|
| SMB | Mac Mini M4 Max (96GB) | $0 (client owns) |
| Mid-market | Hetzner 2x A100 | ~$2,500 |
| Enterprise | Customer DC | $0 (client owns) |

## Nico Time Investment

| Phase | Hours | Timing |
|-------|-------|--------|
| Compliance template review | 8 | Week 1-2 |
| Pilot client calls | 6 | Week 3-4 |
| Architecture approvals | 4 | Week 2 |
| Hypercare oversight (per client) | 4/mo | Ongoing |
| **Upfront** | **18** | |
| **Ongoing/client** | **4/mo** | |

## Revenue Projection

| Quarter | Assessments | Pilots | Enterprise | Revenue |
|---------|-------------|--------|------------|---------|
| Q3 2026 | 3 ($15K) | 1 ($50K) | 0 | $65K |
| Q4 2026 | 3 ($15K) | 2 ($100K) | 1 ($100K) | $215K |
| Q1 2027 | 2 ($10K) | 2 ($100K) | 2 ($300K) | $410K |

### Retainer Base (Growing)
- Q3: 1 client × $5K = $5K/mo
- Q4: 3 clients × $5K = $15K/mo
- Q1: 5 clients × $8K = $40K/mo

## Break-Even
- Demo infra: $1,600
- Dev (170 hrs @ $50) = $8,500
- Nico (18 hrs @ $200) = $3,600
- **Total: ~$13,700**
- **Break-even: 1 assessment + 1 pilot = $55K**

## Risk Factors
| Risk | Probability | Mitigation |
|------|-------------|------------|
| Long sales cycle (3-6 mo) | High | Paid assessment ($5K) qualifies early |
| GPU availability | Medium | Mac Mini alternative; Hetzner usually has A100 |
| Compliance complexity | High | Template library; partner with specialists |
| Client team capability | Medium | 45-day hypercare; retainer model |
| Competition (MindMap, Abacus) | Medium | Our stack = Hermes + GitOps + multi-channel; faster deploy |

## Next Actions
1. [ ] Rent Hetzner A100 for demo (Manager)
2. [ ] FCC task: vLLM + Qdrant + Hermes RAG skill (P1)
3. [ ] Build compliance template library (Manager)
4. [ ] Identify 3 assessment prospects (Nico)