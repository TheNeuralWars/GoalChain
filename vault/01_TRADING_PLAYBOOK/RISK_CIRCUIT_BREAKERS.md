# 🛡️ Disyuntores de Riesgo y Hard Kill-Switches

La supervivencia de la cuenta precede a cualquier ganancia. Este documento define los límites matemáticos que el bot **no puede sobrepasar bajo ninguna circunstancia**.

---

## 🔒 1. Parámetros de la Cuenta Canary ($50 USD en SOL)

| Parámetro | Límite Máximo | Acción en caso de Infracción |
| :--- | :--- | :--- |
| **Tamaño Máximo por Trade** | 10% del balance ($5 USD) | Rechazo automático de la orden. |
| **Posiciones Simultáneas** | 1 posición única | Bloqueo de nuevas señales. |
| **Pérdida Máxima por Día** | 5% del capital total ($2.50 USD) | **KILL-SWITCH**: Apagado automático por 24 horas. |
| **Slippage Tolerado en DEX** | 0.5% en Jupiter Aggregator | Cancelación inmediata de la transacción. |
| **Apalancamiento Permitido** | **1x (Spot Puro)** | Prohibición absoluta de margen/futuros. |

---

## ⚡ 2. Protocolo de Kill-Switch Autónomo

Si el circuito de seguridad detecta una pérdida acumulada del 5% en la ventana móvil de 24 horas:
1. Cancela todas las órdenes pendientes en el libro de órdenes / DEX.
2. Vende la posición activa a precio de mercado si el Stop-Loss falló.
3. Escribe un log de emergencia con timestamp y firma de error en `/data/hermes-home/logs/trader/kill_switch.log`.
4. Emite un ping de alta prioridad al canal `#hermes` en Discord.
5. Pone el proceso daemon en estado `DORMANT` durante 24 horas.
