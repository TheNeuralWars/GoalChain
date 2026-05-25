# Play deploy guide (`play.goalchain.fun`) — B-001

Guía paso a paso para publicar el webapp transaccional en Vercel.

## Qué vas a lograr

| URL | Origen | Estado tras completar |
|-----|--------|------------------------|
| `https://play.goalchain.fun` | Vercel (`goalchain_webapp/`) | Webapp transaccional live |
| `https://goalchain.fun/go` | GitHub Pages (`docs/go/`) | Redirect → play (ya en repo) |
| `https://goalchain.fun` | GitHub Pages (`docs/`) | Marketing read-only (ya live) |

---

## Prerrequisitos

- Cuenta en [vercel.com](https://vercel.com) (login con GitHub).
- Acceso admin al repo `TheNeuralWars/GoalChain` en GitHub.
- Acceso al DNS de `goalchain.fun` (Cloudflare, Namecheap, etc.).

---

## Paso 1 — Importar proyecto en Vercel

1. Entrá a [vercel.com/new](https://vercel.com/new).
2. **Import Git Repository** → elegí `TheNeuralWars/GoalChain`.
3. En **Configure Project**, abrí **Root Directory** → Edit → seleccioná **`goalchain_webapp`**.
4. Verificá que Vercel detecte **Framework: Vite** (viene de `goalchain_webapp/vercel.json`).

### Build settings (deben coincidir con `vercel.json`)

| Campo | Valor |
|-------|-------|
| Install Command | `npm install && npm --prefix ../goalchain-sdk install && npm --prefix ../goalchain-sdk run build` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. **Environment Variables** (Production):

| Variable | Valor sugerido |
|----------|----------------|
| `VITE_API_BASE_URL` | **`https://crm.goalchain.fun/goalchain-api`** o déjala **vacía** (el build usa ese default). No uses `https://api.goalchain.io` hasta que exista DNS — rompe el panel Ops con *Failed to fetch*. |
| `VITE_RPC_URL` | `https://api.devnet.solana.com` (devnet) o tu RPC Helius/QuickNode |
| `VITE_MARKETING_URL` | `https://goalchain.fun` — base para enlaces del menú **Explorar** / **Recursos** |

6. Click **Deploy** y esperá el primer build verde.

---

## Paso 2 — Dominio custom `play.goalchain.fun`

1. En Vercel → tu proyecto → **Settings** → **Domains**.
2. Agregá: `play.goalchain.fun`.
3. Vercel te muestra un registro DNS. Típicamente:

```
Tipo: CNAME
Nombre: play
Valor: cname.vercel-dns.com
```

4. En tu panel DNS de `goalchain.fun`, creá ese CNAME.
5. Esperá propagación (5–30 min, a veces hasta 1 h).
6. Vercel marcará el dominio como **Valid**.

---

## Paso 3 — Verificación

```bash
# Redirect marketing (GitHub Pages)
curl -sI https://goalchain.fun/go/ | grep -i location

# Play app
curl -sI https://play.goalchain.fun/ | head -5
```

En el navegador:

1. Abrí `https://goalchain.fun` → botón **ABRIR DASHBOARD** → debe ir a `/go/` y redirigir a play.
2. Abrí `https://play.goalchain.fun` → conectá Phantom en **Devnet** → ves fixtures / ops panel.

---

## Paso 4 — Deploy automático

Cada push a `main` que toque `goalchain_webapp/**` dispara redeploy en Vercel (si el proyecto está linked al repo).

Para forzar redeploy manual: Vercel → Deployments → **Redeploy**.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| **Deployment Blocked** — commit author sin acceso (Hobby + repo privado) | No hace falta Pro. Los commits deben usar el **email de GitHub del dueño del proyecto Vercel** (ej. `217240408+TheNeuralWars@users.noreply.github.com`). En tu Mac: `git config user.email "…"` y volvé a pushear, o Deploy Hook del dueño en Vercel → Settings → Git. |
| Build falla `@goalchain/sdk` | Confirmá Root Directory = `goalchain_webapp` y que `installCommand` buildea el SDK (ver `vercel.json`). |
| Página en blanco en rutas | `vercel.json` ya incluye rewrite SPA a `index.html`. |
| Ops panel "API offline" | Levantá `goalchain_api` público y seteá `VITE_API_BASE_URL` en Vercel → Redeploy. |
| Wallet no conecta | Phantom debe estar en **Devnet**; el webapp usa devnet por defecto. |

---

## Rollback

Vercel → Deployments → deployment anterior → **Promote to Production**.
