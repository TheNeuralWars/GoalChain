# 🎨 GoalChain Art Pipeline (V13.0)

Este documento detalla el orden de ensamblaje y las especificaciones técnicas de los activos visuales.

## 📏 Especificaciones Técnicas
- **Resolución:** 2000 x 3000 px (Relación 2:3).
- **Formato Final:** PNG 
- **Espacio de Color:** sRGB.

## 🥪 El Sistema de Capas (Stack Order)

| Capa # | Nombre | Descripción | Requisito |
| :--- | :--- | :--- | :--- |
| **L5 (Top)** | **Stats & Text** | Texto dinámico inyectado (Stats, Nombre, Rarity). | Transparente |
| **L4** | **Branding** | Logo de GoalChain y Bandera de la Nación. | PNG con Alpha |
| **L3** | **Chassis** | **Master Frame V13.0** (Cromo/Plata). | PNG con Alpha |
| **L2** | **Player** | Figura del jugador con fondo eliminado. | PNG con Alpha |
| **L1 (Base)** | **Background** | Fondo de rareza (Común, Oro, Platino, Diamante). | Sólido |


## 📐 Reglas de Composición Técnica (Safe Zones)

Para que el jugador (L2) encaje perfectamente bajo el Chassis (L3), se deben seguir estas reglas en la generación:

1. **Alineación Vertical:** El centro de masa del jugador debe situarse en el cuadrante superior medio.
2. **Safe Zone Inferior:** El **30% inferior de la imagen** debe dejarse libre de elementos críticos. Este espacio es donde el Chassis proyecta las estadísticas y el nombre.
3. **Escala del Sujeto:** El jugador debe ocupar aproximadamente el 75% del ancho total para dejar aire en los bordes y evitar que el marco corte los hombros o brazos.
4. **Perspectiva "Low-Angle":** La cámara debe estar situada a ras de suelo mirando hacia arriba, para que la base del jugador se alinee con la base del marco.

## 🛠️ Herramientas de Ensamblaje
- **Local:** Script de Python usando la librería `Pillow` para composición masiva.
- **On-chain:** Renderizado dinámico vía servidor para actualizaciones de stats sin cambiar el NFT.
