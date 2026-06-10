# Effort Estimate: ollama-hermes-agency

## Development Hours (Internal)

### Phase 1: Demo Node & Core Skill (Week 1-2)
| Task | Hours | Owner | Notes |
|------|-------|-------|-------|
| Install Ollama on VPS + pull models | 2 | Manager | `curl -fsSL https://ollama.com/install.sh \| sh && ollama pull qwen2.5:32b llama3.3:70b` |
| Configure Hermes + Ollama integration | 4 | Manager | `ollama launch hermes` ; verify skills load |
| Build "Lead Qualification" skill v1 | 8 | FCC (P1) | High-value skill; template for clients |
| Build "Content Repurposing" skill v1 | 8 | FCC (P1) | Second high-value skill |
| Set up Superpowers monitoring for demo | 2 | Manager | Economy/ops health on demo node |
| Configure oa-worker Telegram for demo | 2 | Manager | Client-facing delivery channel |
| Document demo node deployment | 4 | Manager | Runbook for client deployments |
| **Subtotal** | **30** | | |

### Phase 2: Client Deployment Automation (Week 3-4)
| Task | Hours | Owner | Notes |
|------|-------|-------|-------|
| Mac Mini deployment script | 12 | FCC (P1) | Ansible/ssh; Ollama + Hermes + skills + systemd |
| Client VPS deployment script | 8 | FCC (P1) | Hetzner/DO/AWS; Terraform + Ansible |
| GitOps skill update pipeline | 16 | FCC (P0) | FCC builds skill → PR → Antigravity merges → auto-deploy |
| Monitoring dashboard per client | 8 | FCC (P1) | Superpowers MCP + custom metrics |
| Client onboarding runbook | 6 | Manager | Discovery → pilot → retainer checklist |
| **Subtotal** | **50** | | |

### Phase 3: Productised Service Packaging (Week 5-6)
| Task | Hours | Owner | Notes |
|------|-------|-------|-------|
| Skill template library (5 core skills) | 20 | FCC (P1) | Lead gen, content, support, research, reporting |
| Pricing calculator (web) | 12 | FCC (P1) | ROI calculator for proposals |
| Proposal generator | 8 | FCC (P1) | Auto-generate from discovery inputs |
| Case study documentation | 8 | Manager | 3 pilot results + testimonials |
| Sales assets (Loom, deck, one-pager) | 6 | Manager | |
| **Subtotal** | **54** | | |

### Phase 4: Ongoing Per Client (Retainer Delivery)
| Task | Hours/Month | Owner | Notes |
|------|-------------|-------|-------|
| Monitoring response (avg) | 4 | Manager | Superpowers alerts |
| Skill tuning/updates (2/mo) | 6 | FCC (P2) | Minor adjustments |
| New skill builds (quarterly) | 16 | FCC (P1) | New workflow automation |
| Monthly report | 2 | Manager | Metrics + ROI |
| Client sync call | 2 | Manager | 30 min |
| **Subtotal/Month** | **30** | | |

## Infrastructure Costs

### Our VPS (Shared Demo + Pilot Hosting)
| Item | Monthly Cost | Notes |
|------|--------------|-------|
| Current VPS (Oracle) | $0 | Already running; spare capacity |
| Ollama models (disk) | $0 | Local storage |
| Grok API (xAI credits) | $0-50 | Free tier; recharge if needed |
| OpenRouter fallback | $0-20 | Pay per use |
| **Total** | **$0-70** | Near-zero marginal cost |

### Client Deployment Options (Client Pays)
| Option | Setup Cost (Client) | Monthly (Client) | Our Margin |
|--------|---------------------|------------------|------------|
| Our VPS (shared) | $0 | Included in retainer | 100% |
| Client Mac Mini | ~$1,500 (hardware) | $0 | 100% on service |
| Client VPS (Hetzner) | $0 | $20-50 | 100% on service |
| Dedicated Hetzner | $0 | $100-150 | 100% on service |

## Nico Time Investment

### Upfront (Weeks 1-6)
| Activity | Hours | Timing |
|----------|-------|--------|
| Review/approve skill designs | 4 | Week 1 |
| Pilot client calls (3-5) | 5 | Week 2-3 |
| Approve pricing/packaging | 2 | Week 4 |
| Review case studies | 2 | Week 5 |
| Sales strategy sync | 2 | Week 6 |
| **Total** | **15** | |

### Ongoing (Per Month)
| Activity | Hours | Notes |
|----------|-------|-------|
| Strategic client reviews (2/mo) | 2 | High-value accounts only |
| New ICP approval | 1 | New vertical/segment |
| Pricing/model changes | 1 | Quarterly |
| **Total/Month** | **4** | |

## Revenue Projection (Conservative)

| Month | Clients | Avg Retainer | Setup Fees | Monthly Revenue | Cumulative |
|-------|---------|--------------|------------|-----------------|------------|
| 1 | 0 (pilots) | - | - | $0 | -$2K (dev) |
| 2 | 1 pilot → retainer | $4,000 | $5,000 | $4,000 | +$7K |
| 3 | 2 + 1 new | $4,000 | $5,000 | $12,000 | +$31K |
| 4 | 4 | $4,500 | $5,000 | $23,000 | +$64K |
| 5 | 5 | $5,000 | $8,000 | $33,000 | +$105K |
| 6 | 7 | $5,000 | $8,000 | $43,000 | +$164K |

### Assumptions
- 30% pilot-to-retainer conversion
- 1.5 new pilots/month after month 2
- $5K avg setup, $4.5K avg retainer
- 10% monthly churn (conservative)
- Nico sells first 3; then referral + inbound

## Break-Even Analysis

| Cost Category | Month 1-6 Total |
|---------------|-----------------|
| FCC Dev (134 hrs @ $50/hr avg) | $6,700 |
| Infra (6 mo @ $70) | $420 |
| Nico time (15 + 4×5 = 35 hrs @ $200/hr) | $7,000 |
| Misc (tools, domains, Loom) | $500 |
| **Total Investment** | **$14,620** |

**Break-even: Month 2** (first retainer + setup = $9K)
**Profit by Month 6: ~$150K** (cumulative revenue - investment)

## Risk Factors
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FCC dev slower than estimated | Medium | +2-4 weeks | P0/P1 prioritization; Manager can build simple skills |
| Pilot clients don't convert | Low (30% conv) | Revenue delay | Run 3 parallel pilots; low cost |
| Grok/Ollama reliability issues | Low | Service degradation | Multi-provider fallback; local models |
| Client data privacy blockers | Medium | Deployment delay | Mac Mini local option; air-gap ready |
| Competition from agencies | Medium | Price pressure | Free infra moat; productised skills; speed |

## Next Actions (This Week)
1. [ ] Deploy Ollama + Hermes on VPS (Manager, 30 min)
2. [ ] Create FCC task for "Lead Qualification Skill" (Manager → create-task.sh)
3. [ ] Identify 3 pilot prospects (Manager + Nico)
4. [ ] Schedule discovery calls (Nico)
5. [ ] Build demo node monitoring (Superpowers MCP)