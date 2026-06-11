# Effort Estimate: ollama-hermes-agency

## Development Hours
| Task | Hours | Owner | Priority |
|------|-------|-------|----------|
| Package `install-hermes-node.sh` (one-liner: systemd, .env template, skills/, cron/, health endpoint) | 16 | FCC (opencode) | P0 |
| Client Template Skill Pack: Daily Competitor Intelligence (X-Scout + summarization → Telegram 08:00 local) | 12 | FCC (opencode) | P0 |
| Client Template Skill Pack: Legal Doc Processor (Spanish contracts → structured JSON) | 16 | FCC (opencode) | P1 |
| Client Template Skill Pack: Betting Odds Scraper (multi-book, injury alerts) | 12 | FCC (opencode) | P1 |
| Demo node deploy on Hetzner CX22 + live X-Scout + Discord bot + Telegram pings | 8 | Manager | P0 |
| Documentation + runbooks | 8 | Manager | P1 |
| **Total FCC** | **56** | | |
| **Total Manager** | **16** | | |

## Infra Cost (Monthly)
| Item | Cost |
|------|------|
| VPS (Hetzner CX22 - 2 vCPU, 4GB RAM, 40GB NVMe) | €5.83 |
| Domain/SSL | €1 |
| Monitoring | €0 (self-hosted Superpowers) |
| Backup storage (Hetzner Storage Box) | €3.50 |
| **Total per node** | **~€10.33** |

## Client Infra Cost (Monthly - Pass-through)
| Item | Cost |
|------|------|
| Mac Mini M2 (client on-prem, 16GB/512GB) | ~$600 one-time |
| Or VPS (Hetzner CX22) | €5.83/mo |
| Electricity/Internet | Client bears |

## Nico Time
- Sales calls: 2-3 per client (30 min each)
- Onboarding: 1 day per client (node setup, skill config, training)
- Ongoing: 2h/mo per client (included in retainer)
- Strategic: 4h/mo (roadmap, new verticals)

## Pricing Model
- **Setup:** $3,000 - $5,000 (depends on custom skills needed)
- **Retainer:** $500 - $1,000/mo (monitoring, updates, 1 new skill/mo, priority support)
- **Break-even:** Client 1 covers dev (56h × $100/h = $5,600) + 3 months infra
- **Target:** 5 clients by Month 3 = $2,500-5,000 MRR + $15-25K setup fees

## Revenue Projection
| Month | Clients | MRR | Setup Fees | Cumulative |
|-------|---------|-----|------------|------------|
| 1 | 0 | $0 | $0 | -$5,600 (dev) |
| 2 | 1 | $500 | $4,000 | -$1,100 |
| 3 | 3 | $1,500 | $10,000 | +$10,400 |
| 6 | 8 | $6,000 | $24,000 | +$58,000 |
| 12 | 15 | $10,000 | $15,000 | +$178,000 |