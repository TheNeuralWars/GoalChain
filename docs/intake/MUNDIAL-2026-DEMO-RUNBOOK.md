# Mundial 2026 — Demo devnet (5 min)

- **Task Created:** https://github.com/TheNeuralWars/GoalChain/issues/271
- **Task Status:** ready

**Owner:** Nico (CEO) · **Support:** Hermes / Antigravity

## Prerequisites

- Phantom (or compatible) on **Solana devnet**
- `goalchain_webapp` built or deployed (`play.goalchain.fun` or `npm run dev`)
- API reachable: `https://crm.goalchain.fun/goalchain-api` or local `goalchain_api` on `:3001`
- Devnet GCH in wallet (faucet / team mint)

## Steps

1. Open **Play** → connect wallet (devnet).
2. Home: confirm **Economía canónica** banner loads (API `/api/economy/config`).
3. **Estadio** → list fixtures on-chain.
4. Enter amount → **place bet** on upcoming/live fixture → confirm in Explorer.
5. Oracle completes fixture (or ops runs `goalchain_oracle` scraper with `isFt: true` in `scripts/oracle_match_state.json`).
6. Refresh Estadio → **Cobrar ganancia** (`claim_bet_payout`) on completed fixture.
7. Perfil: on-chain stats show bets/claims (no mock-dominant balance).

## Cancelled fixture path

If fixture status is **cancelled**, use **Reembolsar apuesta** (`refund_bet`) instead of claim.

## Honesty check

- DeFi / Club tabs show **SIMULACIÓN** badge.
- DeFi TVL on home says **demo**.

## Smoke CI

```bash
bash goalchain_webapp/scripts/smoke-devnet.sh
```
