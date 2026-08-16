# Decisión de Arquitectura: Expansión de GoalWorld a la Liga de Fantasía & Autoedición Web3

**Fecha**: 2026-08-02  
**Autor**: NicoPez / Antigravity Agent  
**Estatus**: Aprobado & Desplegado en WebApp  

---

## 🔮 Visión General

**GoalWorld** evoluciona para integrar el **Apoyo a Mundos de Fantasía y Escritores Literarios** (de cualquier escala), estructurando la literatura bajo la metáfora del fútbol (*The Lore & Fantasy League*).

### 🏛️ Los Pilares de la Expansión

1. **El Espejo del Fútbol (Ligas de Fantasía & Lore)**:
   - **Ligas de Universos**: Ranking de mundos literarios por temporadas (*Aethelgard*, *NecroCyber 2099*, *Crónicas de Eldoria*).
   - **Pases de Temporada / Abonados**: Suscripciones comunitarias que desbloquean capítulos anticipados, arte conceptual y votaciones de trama.
   - **Cartas de Personajes y Reliquias**: NFTs coleccionables en la red Solana con micro-gas.

2. **Alternativa a Amazon KDP (Autoedición Web3 Directa)**:
   - **90%+ de Regalías**: Pagos instantáneos en SOL/USDC directamente al monedero del autor.
   - **Lectura por Capítulos (Pay-Per-Chapter)**: Serialización con micro-transacciones directas.
   - **Ediciones de Colección & Mercado Secundario**: Regalías perpetuas del 5%-10% en reventas de libros coleccionables.

3. **Hermes Co-Writer & Lore Suite**:
   - **Lore Guard Agent**: Chequeo de consistencia cronológica e inconsistencias en la narrativa.
   - **Maquetación Automática**: Formateo a EPUB/PDF/Markdown.
   - **PR & Promoción**: Generación de teasers e hilos de promoción en Discord, X/Twitter y Mattermost.

---

## 📂 Archivos Creados e Integrados

- **Componente UI**: [GoalWorldPortal.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/GoalWorldPortal.tsx)
- **Ruta**: `/goalworld` registrada en [App.tsx](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/ui/App.tsx)
- **Navegación**: Ícono 🔮 en [playNav.ts](file:///c:/Users/NicoPez/goalchain/goalchain_webapp/src/config/playNav.ts)
- **Traducciones**: Claves `route_goalworld` y `nav_goalworld` en `translations.ts`, `en.json` y `es.json`.

---

## 🤖 Directiva para Agentes Hermes & gBrain

Todos los agentes de Hermes (Manager, CEO, PR y Lore Agents) deben registrar esta nueva vertiente en su memoria activa (vía `gbrain import ai_context docs/intake`):

- Reconocer que **GoalWorld** contempla tanto la predicción deportiva como la **Liga de Universos de Fantasía & Autoedición**.
- Responder a peticiones de escritores ayudándolos a publicar, estructurar pases de temporada y promocionar sus reinos narrativos.
