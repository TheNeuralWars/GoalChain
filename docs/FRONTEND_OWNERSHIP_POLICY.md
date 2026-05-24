# GoalChain Frontend Ownership Policy (P3)

Fecha: **2026-05-22**

## Scope oficial por superficie

- `goalchain_webapp`: frontend transaccional oficial.
  - Wallet connect
  - Claims
  - Markets / bets
  - Rent / operaciones con impacto on-chain
- `docs`: marketing, documentación, transparencia económica y dashboards read-only.

## Deprecaciones aplicadas en docs

- Los flujos de preventa/simulación transaccional en `docs/index.html` quedan explícitamente en modo read-only.
- Cualquier CTA económica en `docs` debe redirigir a `goalchain_webapp` o documentación operativa.
- URL transaccional canónica: **`https://play.goalchain.fun`** (alias **`https://goalchain.fun/go`**).
- Los datos KPI de economía se consumen desde `GET /api/economy/metrics` cuando el backend está disponible.

## Regla de aceptación para releases

- Ningún flujo de firma o envío de transacciones debe vivir en `docs`.
- Toda operación que modifique estado on-chain debe ejecutarse desde `goalchain_webapp` (o tooling de ops autorizado).
