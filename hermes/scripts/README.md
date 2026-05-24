# Hermes Scripts

Scripts livianos para que Hermes funcione como orquestador usando OpenClaw/Grok como motor.

## Scripts disponibles

### `create-brief.js`

Convierte un mensaje recibido (desde WhatsApp/OpenClaw) en un brief estructurado en `docs/intake/`.

**Uso:**
```bash
node create-brief.js "mensaje del usuario" [P0|P1|P2]
```

**Ejemplo:**
```bash
node create-brief.js "Quiero que el webapp muestre transacciones en devnet" P1
```

Esto genera un archivo como:
`docs/intake/2026-05-23-webapp-devnet-transactions.md`

---

## Integración con OpenClaw

Cuando OpenClaw reciba un mensaje por WhatsApp, puede llamar a este script de dos formas:

1. **Directamente** (si OpenClaw puede ejecutar comandos):
   ```bash
   node /path/to/hermes/scripts/create-brief.js "mensaje recibido"
   ```

2. **Vía archivo temporal** (más simple):
   - OpenClaw escribe el mensaje en un archivo temporal
   - Un cron o watcher ejecuta el script con ese mensaje

---

## Próximos scripts planeados

- `daily-digest.js` — Genera el digest diario de PRs y briefs
- `update-brief-status.js` — Cambia el status de un brief (draft → ready → assigned)
- `handoff-to-cursor.js` — Genera el mensaje de handoff para Cursor
