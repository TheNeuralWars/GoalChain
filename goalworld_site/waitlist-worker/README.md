# goalworld-waitlist Worker
Cloudflare Worker (account theneuralwars) that handles POST /api/waitlist for the landing form.
- KV `goalworld-waitlist` (id d28360813e204e2a836f3074533fa2cc): `signup:<email>` -> {email, at, country}
- Secret `RESEND_API_KEY` (send-only key, sends from nico@goalworld.fun)
- Tests: `node --test goalworld_site/waitlist-worker/`
Go-live: set secret → add route `goalworld.fun/api/waitlist*` → deploy site. Rollback: delete the route (form then 404s), `deploy_goalworld_site.sh rollback`.
