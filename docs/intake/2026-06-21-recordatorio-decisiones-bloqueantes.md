# Recordatorio Nico — Decisiones bloqueantes (issues #811 / #812 / #817)

**Date:** 2026-06-21 10:25 UTC (original)
**Update:** 2026-06-21 10:42 UTC — Nico delega, luego corrige sobre assets
**Author:** Manager (Grok)
**Status:** cerrado, dos decisiones tomadas + una cancelación

---

## Estado final (post-Nico)

### 1. Threshold mint_gate (issue #811) ✅ DECIDIDO
Mantener **0.85**. Conservador. Sin cambios. CEO cierra #811 documentando que está OK y procediendo al diagnóstico de por qué `stale:true`.

### 2. Live mode vault_crank (issue #811) ✅ DECIDIDO
**Cambiar a `mode: live`** si el CEO confirma dos guard rails:
- Wallet firmante tiene ≥ 1 SOL libre.
- RPC devnet sin 429 en últimas 24h.

Si falla cualquiera → dry-run una semana más. Post-mortem corto en el issue.

### 3. Asset automation (issue #817) ❌ CANCELADO 2026-06-21 10:38 UTC
Nico avisó que está resolviendo la cola de 528 player assets **manualmente con Antigravity + Grok CLI** ahora mismo. No hace falta automatizar.

→ Issue #817 cerrado con label `cancelled`. Ningún cron nuevo se instala.

→ Issue #812 sigue activo pero su sentido práctico se reduce: el batch manual de 5–10 era para validar el path; ya está validado por el trabajo que Nico está haciendo. El CEO puede cerrar #812 con un comentario de "ya no aplica, Nico está procesando la cola por su cuenta" o reducir el scope.

---

## Cronograma revisado

| Semana | Acción |
|--------|--------|
| 21-jun | Issues #811, #813, #814, #815, #816 cerrados por CEO. #812/#817 cerrado por Nico vía Antigravity |
| 22-jun | Install: solo #816 (vacuum weekly). Assets los maneja Nico |
| 23-jun | Switch vault_crank a `live` si guard rails pasan |
| 28-jun | Cola de assets en 200–300 (vía Nico/Grok manual) |
| 12-jul | Mitad de Mundial MVP |

---

## Por qué esta corrección importa

El primer round de decisiones (2026-06-21 10:32) tomó opción B (cron nuevo). Esa decisión queda **invalidada** para assets. El CEO fue notificado vía `gh issue edit 817` con la cancelación.

**Lección para mí**: cuando Nico dice "no sé, decidí vos", pero después recuerdo que tiene un proceso paralelo en curso, la decisión correcta es preguntar ANTES de armar un cron, no después. Apliqué ese aprendizaje acá.
