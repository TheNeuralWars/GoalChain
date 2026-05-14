# 🎨 GoalChain Art Pipeline (V13.0)

Este documento detalla el orden de ensamblaje y las especificaciones técnicas de los activos visuales.

## 📏 Especificaciones Técnicas
- **Resolución:** 2000 x 3000 px (Relación 2:3).
- **Formato Final:** WebP (optimizado para carga rápida) o PNG (para calidad máxima).
- **Espacio de Color:** sRGB.

## 🥪 El Sistema de Capas (Stack Order)

| Capa # | Nombre | Descripción | Requisito |
| :--- | :--- | :--- | :--- |
| **L5 (Top)** | **Stats & Text** | Texto dinámico inyectado (Stats, Nombre, Rarity). | Transparente |
| **L4** | **Branding** | Logo de GoalChain y Bandera de la Nación. | PNG con Alpha |
| **L3** | **Chassis** | **Master Frame V13.0** (Cromo/Plata). | PNG con Alpha |
| **L2** | **Player** | Figura del jugador con fondo eliminado. | PNG con Alpha |
| **L1 (Base)** | **Background** | Fondo de rareza (Común, Oro, Platino, Diamante). | Sólido |

## 🛠️ Herramientas de Ensamblaje
- **Local:** Script de Python usando la librería `Pillow` para composición masiva.
- **On-chain:** (Opcional) Renderizado dinámico vía servidor para actualizaciones de stats sin cambiar el NFT.
