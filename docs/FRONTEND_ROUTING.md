# Frontend routing (marketing vs transactional)

## Canonical URLs

| Surface | URL | Package | Role |
|--------|-----|---------|------|
| Marketing / read-only | `https://goalchain.fun` | `docs/` | Landing, docs, dashboards informativos |
| Transactional webapp | `https://play.goalchain.fun` | `goalchain_webapp/` | Wallet, apuestas, claims, perfil on-chain |
| Short alias | `https://goalchain.fun/go` | `docs/go/index.html` | Redirect permanente → `play.goalchain.fun` |
| Legacy path | `https://goalchain.fun/app.html` | `docs/app.html` | Redirect permanente → `play.goalchain.fun` |

## Ownership rules

- **`docs/`** no ejecuta transacciones reales. CTAs de juego/apuestas apuntan a `/go/` o `play.goalchain.fun`.
- **`goalchain_webapp/`** es el único cliente transaccional soportado en devnet/mainnet.

## Deploy

### Marketing (`docs/`)

GitHub Pages via `.github/workflows/goalchain-ci-cd.yml` → dominio `goalchain.fun`.

### Play (`goalchain_webapp/`)

Vercel project con **Root Directory** = `goalchain_webapp`.

1. Import repo en Vercel.
2. Set custom domain: `play.goalchain.fun` (CNAME → Vercel).
3. Optional: add redirect rule on DNS/hosting so `goalchain.fun/go` stays on GitHub Pages (already handled by `docs/go/index.html`).

Config: `goalchain_webapp/vercel.json`.

**Detailed step-by-step:** [`docs/PLAY_DEPLOY_GUIDE.md`](PLAY_DEPLOY_GUIDE.md)

## Shared constant

Browser-side play URL for docs redirects: `docs/assets/js/play_url.js` (`GOALCHAIN_PLAY_URL`).
