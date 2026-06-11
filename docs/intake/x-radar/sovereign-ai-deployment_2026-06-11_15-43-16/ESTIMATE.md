# Effort Estimate: sovereign-ai-deployment

## Development Hours
| Task | Hours | Owner | Priority |
|------|-------|-------|----------|
| Package `install-hermes-node.sh` (enterprise: systemd, .env template, skills/, cron/, health endpoint, VPN, hardening) | 24 | FCC (opencode) | P0 |
| Compliance Skill Pack: SOC2 Evidence Generator | 20 | FCC (opencode) | P0 |
| Compliance Skill Pack: GDPR/Ley 25.326 Automated DPIA | 16 | FCC (opencode) | P0 |
| Compliance Skill Pack: HIPAA/Ley 26.529 Audit Logger | 16 | FCC (opencode) | P1 |
| Compliance Skill Pack: MiCA/Crypto Asset Reporting | 16 | FCC (opencode) | P1 |
| Multi-node Fleet Manager (Ansible + Hermes skills sync) | 20 | FCC (opencode) | P1 |
| Demo node (hardened) deploy + compliance demo docs | 12 | Manager | P0 |
| Documentation + runbooks + compliance evidence templates | 16 | Manager | P1 |
| **Total FCC** | **112** | | |
| **Total Manager** | **28** | | |

## Infra Cost (Monthly - Per Client Node)
| Item | Cost |
|------|------|
| Hardware (Mac Mini M4 24GB/512GB) | ~$1,300 one-time (client pays) |
| Or Hetzner Dedicated (AX52 - 8c/64GB/2TB NVMe) | €82/mo |
| VPN/Network (Tailscale/ZeroTier) | €0-5/mo |
| Backup (Hetzner Storage Box) | €10/mo |
| Monitoring/Alerting | €0 (self-hosted) |
| **Total per node** | **~€92-97/mo** |

## Client Investment Model
- **Deployment Fee:** $50K-200K (covers engineering, hardening, compliance config, training)
- **Managed Services:** $2,000-5,000/mo (monitoring, updates, compliance evidence, priority support, new skills)
- **Contract:** 12-36 months typical
- **Gross Margin:** ~70% after engineering allocation

## Nico Time
- Technical sales: 3-5 calls per client (CTO/CISO/Compliance)
- Contract negotiation: Legal review (external counsel recommended)
- Onboarding: 2-3 weeks (hardware ship/rack, config, compliance validation)
- Ongoing: 4h/mo per client (quarterly reviews, roadmap, compliance updates)

## Revenue Projection (Conservative)
| Quarter | Deployments | Deploy Revenue | MRR (Managed) | Cumulative |
|---------|-------------|----------------|---------------|------------|
| Q1 | 0 | $0 | $0 | -$28,000 (dev: 112h×$200 + 28h×$150) |
| Q2 | 1 | $100K | $3,500 | +$75,500 |
| Q3 | 2 | $150K | $7,000 | +$232,500 |
| Q4 | 3 | $200K | $10,500 | +$443,000 |
| Year 2 | 8 | $500K | $28,000 | +$1.2M |

## Key Risk: Sales Cycle
- Enterprise sales: 3-6 months from first call to signed contract
- Mitigation: Start outreach NOW, parallel with dev
- Mitigation: Leverage Nico's network + build-in-public content