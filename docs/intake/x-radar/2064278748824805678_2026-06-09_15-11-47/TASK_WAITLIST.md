# FCC Task: [VOXLY] Waitlist Landing Page + Analytics (P1)

## Issue Spec for GitHub

**Title:** `[OPENCODE] [VOXLY] Waitlist Landing Page + Analytics`
**Labels:** `agent:opencode`, `priority:P1`, `status:ready`, `source:manager`

## Objective
Build the public waitlist landing page with tier pricing, email capture, referral system, and analytics dashboard.

## Key Features
- **Landing Page**: Hero, demo video/GIF, feature breakdown, social proof (320 waitlist, $72K ARR)
- **Tier Selection**: Founder $39 → Base $47 → Pro $97 → B2B $2K (contact sales)
- **Email Capture**: Supabase Auth magic link → waitlist table with position
- **Referral System**: Unique ref codes, milestone rewards (skip queue at 3/5/10 refs)
- **Analytics Dashboard**: Signups/day, conversion funnel, referral viral coefficient, source attribution
- **Automated Emails**: Welcome, position updates, launch announcement (Resend)

## Technical Stack
- **Frontend**: Next.js (Vercel) + React + Tailwind + Framer Motion
- **Backend**: Supabase Edge Functions + Auth + Database
- **Email**: Resend API
- **Analytics**: Custom events → Supabase → Recharts dashboard

## Owner
opencode (FCC)

## Priority
P1

## Context
Voxly-track. Replicates Voxly's 320 waitlist → 300 paying conversion model.

## Implementation Notes
- FCC tier: sonnet (OpenRouter coder)
- Estimated: 8 hours
- Deploy to Vercel preview → custom domain