# goalchain_webapp — dependency notes

## Web-only wallet stack

This app only uses **Phantom** on desktop web. We depend on `@solana/wallet-adapter-phantom` instead of `@solana/wallet-adapter-wallets` (meta-package that pulled Particle/Keystone, `uuidv4`, and hundreds of extra packages).

## React 18

- Pinned: `react` / `react-dom` **18.3.1**
- `overrides` force `@types/react` **18.3.18** so optional `react-native` peers from Solana mobile adapters do not install React 19 types (breaks `tsc`).

## Vite stub

`vite.config.ts` aliases `react-native` → `src/stubs/empty.ts` so the optional mobile wallet path is not bundled.

## Clean install

```bash
cd ../goalchain-sdk && npm run build
cd ../goalchain_webapp
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Before vs after (approx.)

| Metric | Before (`wallet-adapter-wallets`) | After (`wallet-adapter-phantom`) |
|--------|-----------------------------------|----------------------------------|
| Packages audited | ~1088 | ~455 |
| Vite transform modules | ~5342 | ~465 |
| `uuidv4` in tree | yes (Particle) | no |
