# TODO — GoalWorld site (for Nico)

Items that need a human decision or a real-world fact. Nothing here may appear on
the public pages until resolved.

## Legal (lawyer review)

- [ ] `privacy.html` and `terms.html` are plain-language drafts (October 2026),
      not legal advice. Have a lawyer review before launch. Replace "contact
      Nico Pez on X" with a real contact email if one is created.
- [ ] Confirm jurisdiction / governing law wording for `terms.html`.
- [ ] The press-kit usage grant ("you may use these assets in coverage") should
      become a proper trademark/brand-use policy if the brand grows.

## Community links

- [ ] Discord invite `https://discord.gg/nzjHNBfSh` (referenced by the old pages)
      is DEAD (Discord API returns "Unknown Invite"). Create a fresh invite and
      add it to the footer/community section, or drop Discord entirely.
- [ ] `https://x.com/GoalChainDotFun` (referenced by old pages) returns 404 —
      either the handle changed or the account is gone. Confirm the project's X
      handle before linking it.
- [ ] `https://instagram.com/goalchain.fun` (old pages) — unverified (redirects
      to a login wall). Confirm before linking.

## Product facts

- [ ] **Book 1 (`book.html`) launch waitlist / email capture**: No verified backend email capture exists on `origin/main` yet (`docs/reader.html` PR #880 only stored emails in browser `localStorage` with no backend, and `origin/feat/goalworld-waitlist` Cloudflare Worker + KV + Resend is unmerged and pending Stream S6 `WAITLIST_PLAN.md` provider decision + privacy review). Until Nico approves and deploys a live waitlist endpoint, `/book.html#notify` uses the honest CTA *"Follow @nicopez on X for the launch"*.
- [ ] **Book 1 (`book.html`) Kindle purchase link, pricing & Kindle Unlimited confirmation**: Once Gate 3 store setup, final cover, pricing (manifest draft: $0.99 / $2.99 USD), and Kindle Unlimited enrollment (currently marked *"planned, not verified"*) are live and approved by Nico, replace the disabled *"Coming soon to Kindle"* button on `goalworld_site/src/pages/book.html` with the verified live store URL.
- [ ] **Sync `docs/reader.html` & `docs/go/reader/books-data.json` with v7 manuscript**: `docs/reader.html` currently serves a pre-v7 Prologue + Chapter 1 draft with canon contradictions (see `/workspace/fc-day/S2_LANDING_REPORT.md`) and unverified pricing/KU claims.
- [ ] Any date for Book 2 (Earth's New Song) publication — the roadmap
      intentionally shows no dates.
- [ ] A press contact email (currently X DM only).
- [ ] If/when the Discord or newsletter returns, replace the FAQ answer
      "How do I get in touch?".

## Ops (tracked in the launch report, not blocking)

- [ ] Apply the proposed Caddyfile diff (404.html via `handle_errors`, cache
      headers for `/assets/*`) — see `docs/LAUNCH_REPORT.md`.
- [ ] Post-merge check: `https://docs.goalchain.fun/` 301s to `goalworld.fun`
      while `https://docs.goalchain.fun/data/burn_tracker.json` still returns JSON.
