# Manager Task: [VOXLY] Demo Deployment + Live Voice Clone (P0)

## Objective
Deploy a live demo of the voice-learning engine using Nico's X/Twitter history as the voice source. Show end-to-end: ingest → profile → generate.

## Deliverables
1. **Supabase Project**: Deploy voxly schema + Edge Functions (free tier)
2. **Vercel Project**: Deploy Next.js dashboard + landing page (free tier)
3. **Live Demo**: 
   - Ingest @Nico's last 200 X posts
   - Generate 3 sample posts in his voice (match preview, player recap, betting analysis)
   - Show similarity scores
4. **Demo URL**: Shareable link for sales calls

## Technical Steps
1. `supabase login` → link to existing GoalChain project
2. `supabase db push` → apply voxly_* schema
3. `supabase functions deploy` → deploy all Edge Functions
4. `vercel link` → connect GoalChain repo (voxly/ folder)
5. `vercel env add` → add Supabase keys, Stripe keys, Hermes endpoint
6. Run ingestion script for Nico's X history
7. Test generation via dashboard
8. Record 2-min demo video

## Owner
Manager (Hermes Agent)

## Priority
P0

## Timeline
- Week 1: Deploy infra + schema
- Week 2: Ingest Nico's data + test generation
- Week 2: Polish dashboard + record demo

## Dependencies
- Voice Learning Engine (P0) - Edge Functions ready
- Supabase CLI installed
- Vercel CLI installed
- Nico's X API credentials (or manual CSV export)

## Success Criteria
- [ ] Demo URL loads < 3s
- [ ] Voice profile shows Nico's top phrases, emoji style, hook patterns
- [ ] Generated match preview sounds like Nico
- [ ] Similarity score > 0.85
- [ ] Dashboard shows real-time generation