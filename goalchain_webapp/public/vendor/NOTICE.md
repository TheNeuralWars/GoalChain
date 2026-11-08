# Vendored third-party scripts

Byte-identical copies of the pinned CDN builds previously loaded by
`classic-dashboard.html`, vendored so the page has no render-blocking
third-party dependencies.

| File | Package | Upstream | License |
|---|---|---|---|
| `solana-web3.iife.min.js` | `@solana/web3.js@1.98.2` | https://unpkg.com/@solana/web3.js@1.98.2/lib/index.iife.min.js | MIT — see `LICENSE-solana-web3.txt` |
| `confetti.browser.min.js` | `canvas-confetti@1.9.3` | https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js | ISC — see `LICENSE-canvas-confetti.txt` |

To update: re-download the pinned upstream file, replace it here, and keep the
license files in sync. `@coral-xyz/anchor` remains a lazy on-demand import from
esm.sh (loaded only when a wallet action needs it) — not vendored.
