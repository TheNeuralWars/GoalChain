# 📈 Setup: Mean Reversion en SOL Spot (Solana Mainnet)

Este documento define las reglas algorítmicas obligatorias para el bot de trading `@trader` operando en la cuenta de prueba Canary.

---

## 🎯 1. Filosofía del Setup
El precio de SOL en temporalidades cortas (15m / 1h) tiende a sobre-extenderse violentamente debido al apalancamiento en exchanges de derivados. Cuando el mercado agota la liquidez de un extremo, el retroceso hacia la media ponderada por volumen (VWAP) ofrece una ventaja estadística comprobada de más del 55%.

---

## 🔍 2. Gatillos de Entrada (Entry Trigger)

Una orden de COMPRA solo es válida si se cumplen **las 4 condiciones simultáneamente**:

1. **RSI (14 periodos en 15m):** Debe estar en zona de sobreventa extrema:
   $$\text{RSI}_{15m} \le 30.0$$
2. **Desviación de Bandas de Bollinger (20, 2):** El precio actual debe cotizar por debajo de la banda inferior:
   $$\text{Price} < \text{BB}_{\text{lower}}$$
3. **Filtro de Tendencia Mayor (1h):** La media móvil exponencial EMA 200 en 1h debe mantener pendiente neutral o positiva (no operar rebotes en caída libre macro).
4. **Filtro de Congestión en Solana:** La tarifa media de prioridad en la red no debe superar los 50.000 micro-lamports por Compute Unit (evitar operar cuando las comisiones devoren el margen).

---

## ⚖️ 3. Gestión de Salida (Exit Rules)

* **Take-Profit Principal (TP1):** 50% de la posición se cierra al tocar la Media Móvil Central (SMA 20) en 15m (captura de reversión típica: +1.2% a +1.8%).
* **Take-Profit Final (TP2):** 50% restante se cierra al tocar la Banda de Bollinger superior o tras 8 velas consecutivas de 15m (Time-based Exit).
* **Hard Stop-Loss (SL):** Innegociable. Se ubica exactamente a **1.5 veces el ATR (Average True Range)** por debajo del mínimo reciente:
   $$\text{SL} = \text{Entry} - (1.5 \times \text{ATR}_{15m})$$
   *Pérdida máxima permitida por trade: 2.5% del capital asignado.*

---

## 🛑 4. Reglas de No-Operar (Blackout Windows)

El bot debe suspender entradas 60 minutos antes y 30 minutos después de:
* Publicación de datos de inflación de EE.UU. (CPI / PPI).
* Decisiones de tipos de interés de la Reserva Federal (FOMC).
* Desbloqueos masivos de tokens o liquidaciones anunciadas.
