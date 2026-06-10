# Client Profile: ollama-hermes-agency

## Ideal Customer Profile (ICP)

### Primary Segments
| Segment | Size | Pain Point | Budget | Decision Maker |
|---------|------|------------|--------|----------------|
| **Marketing / Content Agencies** | 10-50 people | Manual content repurposing, client reporting, lead gen | $3-8K/mo | Founder / Ops Director |
| **B2B Service Firms** (consulting, legal, real estate) | 5-30 people | Lead qualification, research, document processing | $3-10K/mo | Managing Partner |
| **E-commerce Brands** | $1-50M revenue | Customer support automation, product content, competitor monitoring | $5-15K/mo | Head of Ops / CMO |
| **SaaS Companies** (Series A-B) | 20-100 people | Onboarding automation, churn reduction, feature request triage | $5-12K/mo | VP Product / CTO |

### Qualification Criteria (Must Have 3+)
- [ ] Repetitive knowledge work >20 hrs/week across team
- [ ] Clear workflow with defined inputs/outputs
- [ ] Willing to pay for time savings (not "AI curiosity")
- [ ] Technical enough to use Telegram/Slack/Discord
- [ ] Data not ultra-sensitive (or willing to run local)
- [ ] Current tool spend >$500/mo on SaaS subscriptions

### Red Flags (Disqualify)
- No defined process ("just make it smart")
- Expecting magic without process mapping
- Budget <$2K/mo for retainer
- Requiring 100% uptime SLA from day one
- No internal champion to own the workflow

## Outreach Template

### Cold Email / LinkedIn / Telegram DM
```
Subject: Cutting [Company]'s [specific workflow] from X hrs to Y mins

Hi [Name],

I noticed [Company] handles [specific workflow: e.g., "lead qualification for 200+ inbound/month"] — that's typically 15-20 hrs/week of manual review.

We build custom AI agents on **local infrastructure (Ollama + Hermes)** that automate exactly this. Key difference: **zero ongoing API costs** — runs on your hardware or our VPS.

Recent results:
- Marketing agency: 800 briefs/mo → 90% automated, £3K/mo retainer
- B2B consultancy: Lead triage 600/mo → 75% auto-routed, £5K/mo
- E-commerce: Support tickets 2K/mo → 40% auto-resolved, £4K/mo

Happy to run a free 2-week pilot on one workflow. You keep the agent, we just prove value.

Worth a 15-min call to map your highest-volume workflow?

[Calendly link]
```

### Follow-up (if no reply in 3 days)
```
Quick bump — I built a quick loom showing how we'd automate [specific workflow] for [Company]. 3 min watch: [Loom link]

No pressure — just thought the visual might help. Happy to skip the call if not a fit.
```

### Discovery Call Agenda (30 min)
1. **Current state** (10 min): Walk through the workflow end-to-end; volume, time, tools, people
2. **Pain quantification** (5 min): What breaks? What's the cost of delay/errors?
3. **Automation fit** (10 min): Which steps are deterministic vs need judgment? Show Hermes skill concept
4. **Pilot scope** (5 min): Define 1 workflow, success metric (e.g., "reduce manual review from 20h to 4h/week"), timeline

## Pilot Structure

### Free 2-Week Pilot
| Week | Deliverable |
|------|-------------|
| 1 | Workflow map + Hermes skill v1 deployed on our VPS |
| 2 | Client tests with real data; we iterate daily; metrics dashboard |
| End | Results doc: time saved, accuracy, exceptions; go/no-go for retainer |

### Success Metrics for Pilot
- **Time saved:** ≥60% reduction in manual hours
- **Accuracy:** ≥85% on deterministic steps; ≥70% on judgment steps (with human review)
- **Adoption:** Client team uses it daily without prompting
- **Exception rate:** <15% of volume needs human intervention

## Retainer Proposal Template

```
## [Client] — AI Automation Retainer

### Scope
- Workflow: [Name] — [1-line description]
- Volume: [X/month] tasks
- Systems: [CRM, email, Slack, etc.]
- Automated steps: [List]
- Human review: [Exception queue in Telegram/Slack]

### Deliverables
- Hermes skill deployed on [Client VPS / Our VPS / Client Mac Mini]
- Monitoring dashboard (Superpowers MCP)
- Weekly health report + monthly tuning
- 2x skill updates/quarter included
- Telegram/Slack/Discord access for team

### Investment
- Setup: $X,XXX (one-time, includes infra + skill build)
- Retainer: $X,XXX/mo (covers monitoring, tuning, support, 2 updates)
- Usage: Included up to [X] tasks/mo; $0.XX/task overage

### Success Guarantee
If pilot metrics not met in 60 days, reduce retainer 50% or cancel.
```

## Objection Handling

| Objection | Response |
|-----------|----------|
| "We have ChatGPT/Claude" | "Great for chat. But for *workflows* — routing, approvals, multi-system, scheduled, auditable — you need an agent runtime. Hermes gives you skills, cron, webhooks, multi-channel, GitOps. Plus zero API costs at scale." |
| "Data privacy" | "Run fully local on your Mac Mini / VPS with Ollama. Zero data leaves your network. We deploy, you own." |
| "Too expensive" | "Compare to hiring: 1 FTE = $8-12K/mo loaded. Our agent does 1 FTE of repetitive work for 30-50% of that, 24/7, no ramp. Pilot proves ROI first." |
| "We'll build internally" | "You can. But: 3 months to hire, 2 months ramp, ongoing maintenance. We ship in 2 weeks, you own the skill, we maintain infra. Focus your devs on product." |
| "Need SLA" | "We don't offer 99.99% — we offer *value delivered*. Pilot proves it. Retainer includes monitoring + 4hr response on business hours. Critical workflows get dedicated node." |

## Target List (First 20)
*To be populated with specific companies matching ICP*

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
11. 
12. 
13. 
14. 
15. 
16. 
17. 
18. 
19. 
20. 

## Tracking
| Company | Contact | Channel | Status | Pilot Start | Retainer |
|---------|---------|---------|--------|-------------|----------|
|  |  |  |  |  |  |