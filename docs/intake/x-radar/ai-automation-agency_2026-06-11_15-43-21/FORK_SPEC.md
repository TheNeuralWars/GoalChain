# Fork Spec: ai-automation-agency

## Their Stack (Agent OS / rustyhand / Voxly / Latenode)
- Model: Claude Code (Sonnet 4) + OpenAI/Anthropic APIs
- Orchestration: CLAUDE.md rules + Claude Code CLI
- Database: Supabase (PostgreSQL)
- Frontend: Vercel + Next.js
- Scheduling: Supabase cron + Vercel cron
- Delivery: Web app only
- Pricing: $39-97/mo self-serve + $2K/mo B2B

## Our Upgraded Stack (GoalChain Native)
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| LLM | Claude Code (cloud) | Hermes Agent + Grok + Ollama local | Multi-provider, $0 API cost, data sovereignty |
| Orchestration | CLAUDE.md + CLI | Hermes skills system + FCC (opencode) delegation | Versioned, testable, portable skills; parallel agents |
| Database | Supabase | Supabase (keep) + GoalChain on-chain data | Same reliability, add sports/crypto native data |
| Frontend | Vercel + Next.js | Vercel + GoalChain webapp (React/TS) | Reuse webapp; add Hermes dashboard |
| Scheduling | Supabase/Vercel cron | Hermes cronjobs + systemd timers | GitOps, observable, portable across nodes |
| Mobile/Delivery | Web app only | Telegram + WhatsApp + Discord + Web | Multi-channel approvals, richer UX |
| Monitoring | Vercel analytics | Superpowers MCP + GoalChain health checks | Live economy/ops health + on-chain metrics |
| Updates | Git push → Vercel | GitOps (git pull → systemctl reload) | Zero-downtime, auditable, scalable |
| AI Dev Workflow | Solo + Claude Code | Manager (Grok) + FCC (opencode) + Antigravity (merge) | Parallel, reviewed, production-grade |
| **Unique Moat** | Voice learning | **GoalChain Sports/Crypto Data + On-chain Verification** | Native data no competitor has |

## Synergy Opportunities for GoalChain
| Opportunity | Description | Effort | Revenue Potential |
|-------------|-------------|--------|-------------------|
| **GoalChain Content Engine** | Auto-generate match previews, player recaps, betting analysis for Discord/Telegram | 20h FCC | $2K/mo B2B (sportsbooks, fantasy) |
| **Voice Learning → Coach Personas** | Each GoalChain "coach" learns user's communication style | 20h FCC | $500-1000/mo per creator |
| **B2B Sales Motion** | Same $2K/mo model for sports orgs / betting syndicates / fantasy platforms | 12h FCC + Nico sales | $6K MRR (3 clients) |
| **On-chain Verification** | Publish AI output hashes to GoalChain program for audit trail | 16h FCC | Premium differentiator |
| **Waitlist → Community** | Replicate 320 signups build-in-public for GoalChain alpha | 8h FCC + Nico | 100+ alpha users |

## Stack Mapping (Voxly → GoalChain)
| Layer | Voxly | GoalChain Upgrade |
|-------|-------|-------------------|
| LLM | Claude Code | Hermes + Grok + Ollama |
| Orchestration | CLAUDE.md | Skills + FCC |
| Database | Supabase | Supabase + On-chain |
| Frontend | Next.js/Vercel | Webapp + Dashboard |
| Scheduling | Platform cron | Hermes cronjobs |
| Delivery | Web | Multi-channel (TG/WA/DC) |
| Monitoring | Platform logs | Superpowers MCP |
| Updates | Auto-deploy | GitOps |