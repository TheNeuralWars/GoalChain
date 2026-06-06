# OA Proposal — Issue #348

## Title
[OPENCODE] Webapp: Legacy cleanup - remove Spanish strings, delete deprecated files, fix hardcoded values

## Source
GitHub issue #348

## Objective
## Objective
Comprehensive legacy cleanup in goalchain_webapp/:

## Scope
### 1. Remove ALL Spanish strings (grep -r for Spanish words)
Search and replace in ALL .tsx/.ts/.css files:
- "GOLEADOR" → "TOP SCORER"
- "PORTERO" → "GOALKEEPER"
- "DEFENSA" → "DEFENDER"
- "CENTROCAMPISTA" → "MIDFIELDER"
- "DELANTERO" → "FORWARD"
- "TITULAR" → "STARTER"
- "SUPLENTE" → "BENCH"
- "LESIONADO" → "INJURED"
- "SANCIONADO" → "SUSPENDED"
- "ESTADIO" → "STADIUM"
- "CLUB" → "CLUB" (keep)
- "LIGA" → "LEAGUE"
- "PAIS" / "NACIONALIDAD" → "COUNTRY"
- "EQUIPO" → "TEAM"
- "JUGADOR" → "PLAYER"
- "RARO" / "COMUN" / "LEGENDARIO" → "RARE" / "COMMON" / "LEGENDARY"
- "APUESTA" → "BET"
- "GANANCIA" → "PROFIT"
- "PERDIDA" → "LOSS"
- "RENDIMIENTO" → "YIELD"
- "STAKING" → "STAKING" (keep)
- "RECOMPENSA" → "REWARD"
- "LOGRO" → "ACHIEVEMENT"
- "NIVEL" → "LEVEL"
- "EXPERIENCIA" → "EXPERIENCE"
- "SALUD" / "ESTADO" → "HEALTH" / "STATUS"
- "ACTIVO" / "INACTIVO" → "ACTIVE" / "INACTIVE"
- "CARGANDO" → "LOADING"
- "ERROR" → "ERROR" (keep)
- "EXITO" → "SUCCESS"
- "ADVERTENCIA" → "WARNING"
- "CONECTAR" → "CONNECT"
- "DESCONECTAR" → "DISCONNECT"
- "GUARDAR" → "SAVE"

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #348
