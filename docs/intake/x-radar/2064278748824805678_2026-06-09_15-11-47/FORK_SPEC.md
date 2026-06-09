# Fork Spec: 2064278748824805678

## Their Stack
- **Model:** Claude Code (Sonnet 4) via Anthropic API
- **Orchestration:** Claude Code CLI + custom CLAUDE.md rules (30+ rules evolved)
- **Database/Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- **Frontend/Hosting:** Vercel (Next.js, TypeScript, auto-deploy)
- **Scheduling/Automation:** Supabase cron + Edge Functions + Vercel cron
- **Delivery:** Web app (multi-platform content generation)
- **Pricing:** B2B $2,000/mo/contract + Self-serve $39-97/mo (waitlist tiers)
- **Key Differentiator:** "Learns your voice" from published history — no re-explaining per session

## Our Upgraded Stack (GoalChain Infra Applied)
| Layer | Their Choice | Our Choice | Why |
|-------|--------------|------------|-----|
| **LLM** | Claude Code (Sonnet 4) | **Hermes Agent + Grok + Ollama local** | Multi-provider, $0 API cost option, data sovereignty |
| **Orchestration** | CLAUDE.md rules + Claude Code CLI | **Hermes skills system + FCC (opencode) delegation** | Versioned, testable, portable skills; parallel agents |
| **Database** | Supabase (managed PostgreSQL) | **Supabase (keep) + GoalChain on-chain data** | Same reliability, add sports/crypto native data |
| **Frontend** | Vercel + Next.js | **Vercel + GoalChain webapp (React/TS)** | Reuse webapp; add Hermes dashboard |
| **Scheduling** | Supabase cron + Vercel cron | **Hermes cronjobs + systemd timers** | GitOps, observable, portable across nodes |
| **Mobile/Delivery** | Web app only | **Telegram + WhatsApp + Discord + Web** | Multi-channel approvals, richer UX |
| **Monitoring** | Vercel analytics + Supabase logs | **Superpowers MCP + GoalChain health checks** | Live economy/ops health + on-chain metrics |
| **Updates** | Git push → Vercel auto-deploy | **GitOps (git pull → systemctl reload)** | Zero-downtime, auditable, scalable |
| **AI Dev Workflow** | Solo + Claude Code | **Manager (Grok) + FCC (opencode) + Antigravity (merge)** | Parallel, reviewed, production-grade |

## Synergy Opportunities for GoalChain
1. **Voxly → GoalChain Content Engine**: Auto-generate match previews, player recaps, betting analysis for Discord/Telegram
2. **Voice Learning → Coach/Manager Personas**: Each GoalChain "coach" learns user's communication style
3. **B2B Sales Motion**: Same $2K/mo B2B model for sports orgs / betting syndicates / fantasy platforms
4. **Waitlist → Community Building**: 320 signups from build-in-public; replicate for GoalChain alpha
