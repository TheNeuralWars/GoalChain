# x-Scout (Hermes Scouting Agent)

x-Scout is a modular agent designed to scan Twitter (X) and open-source GitHub repositories for Web3, Solana, and AI agent developments. It filters, scores, and synthesizes these developments into actionable markdown reports (radars) published directly to active channels.

## Stylistic reference
- Accounts like @dexteraisol are monitored for tone and style inspiration.

## Execution
- Runs via chronojobs or systemd timers (`install-hermes-x-scout-timer.sh`).
- Core engine: `ops/hermes/oa-x-scout-run.py` & `ops/hermes/oa-x-scout-discord.py`.
