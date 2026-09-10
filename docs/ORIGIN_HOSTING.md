# goalworld.fun Origin Hosting (2026-09-10)

How the public site is served, after the migration away from GitHub Pages.

## Architecture

```
visitor → Cloudflare edge (TLS, cache, WAF)
            └── Cloudflare Tunnel "goalworld-well" (3fff93be-42c3-42a5-9ab9-5717aea36ba6)
                  └── cloudflared on the VPS (token: ~/.cloudflared/goalworld-well.token)
                        └── https://127.0.0.1:443  (Caddy container `twenty-caddy`)
                              └── /srv/goalworld  ← bind mount of /data/apps/GoalChain/_site_public
```

- **This host has no usable public ingress on 80/443** (egress IP differs from the old
  `89.168.20.135` records, which no longer answer). Anything that must be public goes
  through the tunnel — that is how `well`, `fit` and `lukoo` were already served.
- **Certificate:** Caddy issues Let's Encrypt certs for `goalworld.fun` and `www.goalworld.fun`
  via **ACME DNS-01** (Cloudflare API), so Cloudflare can run this zone in **Full** without
  pushing DNS away from the proxy. The Caddy image is custom-built (`caddy-cf:2.11.3`,
  `caddy-dns/cloudflare`) — see `/data/apps/twenty/caddy-cf/Dockerfile`.
- The container needs `--dns 1.1.1.1`: Docker's embedded resolver returns SERVFAIL for the
  SOA lookups the DNS-01 provider uses for zone detection.

## Serving rule: never serve `docs/` directly

`docs/` is the repository's working tree and contains internal material. Caddy serves
**`/data/apps/GoalChain/_site_public`**, produced by:

```
python3 scripts/pages/stage_public_tree.py --src docs --dst _site_public.new
python3 scripts/pages/guard_published_tree.py --root _site_public.new --patterns docs
rsync -a --delete _site_public.new/ _site_public/
```

`docs/.assetsignore` is the single source of truth for what is public; `docs/_config.yml`
mirrors the literal entries for the GitHub Pages build; `scripts/pages/check_ignore_sync.py`
fails if the two lists drift.

## Deploy

`goalworld-origin-deploy.timer` (user unit, every 5 min) runs
`scripts/pages/deploy_origin.sh`: pull `origin/main`, rebuild the staged tree, rsync it
**into** the served directory. Caddy picks up static changes with no reload.

> **Do not delete/recreate `_site_public`.** It is a docker bind mount; replacing the
> directory leaves the running container pointing at the old inode and the site serves an
> empty tree. The script stages into `_site_public.new` and rsyncs in place for this reason.

## Rollback

1. **DNS:** point `goalworld.fun`/`www` back at `theneuralwars.github.io` (proxied) — the
   GitHub Pages build still exists and still excludes the internal docs.
2. **Container:** `docker rm -f twenty-caddy && docker rename twenty-caddy-old-<ts> twenty-caddy && docker start twenty-caddy`
   (the pre-migration container is kept under that name; the previous Caddyfile is
   `Caddyfile.bak-<ts>`).

## Notes / follow-ups

- `crm.goalchain.fun`, `crm.goalworld.fun` and `api.goalchain.fun` are DNS-only A records to
  `89.168.20.135`, which **does not answer** — they are unreachable from the Internet. They
  are served correctly by Caddy on this host locally, so the fix is to put them on the same
  tunnel instead of that stale address.
