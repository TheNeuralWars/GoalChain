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
