# GoalChain Chassis V13.0 - Blueprint de Producción 🛡️📐

Este documento contiene las coordenadas exactas de perforación y troquelado para el **Chasis V13.0 Clean**. Utilizar estos valores para generar assets de fondo, texturas y capas de efectos que deban encajar en los huecos.

## 1. Especificaciones de la Carta (Lienzo)
- **Tamaño:** 2000 x 3000 px
- **Biselado Exterior:** 15 px (4 esquinas)

## 2. Ventana Central (Fondo del Jugador)
La ventana principal donde se sitúa el crack y su fondo de rareza.
- **Coordenadas (x1, y1, x2, y2):** `(175, 525, 1825, 2375)`
- **Biselado:** 20 px
- **Comportamiento:** Híbrido (Esquinas superiores biseladas, base recta).

## 3. Paneles de Stats (Consola de Datos)
Los 4 bloques horizontales situados en la base de la carta. Todos tienen un **Biselado de 10 px**.

| Panel | Posición | Coordenadas (x1, y1, x2, y2) |
| :--- | :--- | :--- |
| **P1** | Superior Izquierda | `(167, 2476, 974, 2624)` |
| **P2** | Inferior Izquierda | `(167, 2679, 974, 2826)` |
| **P3** | Superior Derecha | `(1025, 2476, 1831, 2624)` |
| **P4** | Inferior Derecha | `(1025, 2679, 1831, 2826)` |

## 4. Guía de Capas (Z-Index)
1. **Background Layer:** Fondos de rareza (Oro, Diamante, etc.) generados usando estas coordenadas.
2. **Player Layer:** Silueta del jugador (con transparencia).
3. **Chassis Layer:** `chassis_v13_clean.png` perforado mediante el script.
4. **Text Layer:** Inyección de stats centradas en los paneles P1-P4.

---
**Nota:** Estos valores han sido refinados mediante pruebas de renderizado de alta precisión para asegurar el encaje total con el diseño original del marco.
