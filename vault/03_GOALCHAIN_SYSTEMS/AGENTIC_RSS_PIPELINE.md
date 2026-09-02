# 📡 Lector RSS Agéntico & Pipeline "LLM-Wiki" para Obsidian

Documento técnico y de arquitectura para la ingesta autónoma, filtrado semántico y destilación de noticias en la Bóveda de Obsidian mediante el patrón **"LLM-Wiki" de Andrej Karpathy**.

---

## 🏛️ 1. ¿Qué es un Lector RSS Agéntico?

A diferencia de un lector RSS tradicional (donde el humano acumula cientos de artículos no leídos que saturan la memoria), un **Lector RSS Agéntico** es un pipeline autónomo en segundo plano:

```
[ Fuentes RSS / Atom / Substack ] 
              │
              ▼
[ Ingesta Raw (JSON / Markdown) ] ───► Carpeta `vault/raw/` (Temporal / Cache)
              │
              ▼
[ Filtro Semántico LLM (Grok/Gemini) ]
  • ¿Afecta a la liquidez de Solana?
  • ¿Es un nuevo algoritmo de Amazon KDP?
  • ¿Es una noticia macro (CPI/FOMC)?
              │
              ▼
[ Síntesis Atómica Destilada ] ──────► Carpeta `vault/wiki/` (Notas interconectadas permanentes)
              │
              ▼
[ Notificación de Señal Limpia ] ───► Ping a Discord `#hermes` / gBrain Memory
```

---

## 📂 2. La Arquitectura Karpathy ("LLM-Wiki Pattern")

Para evitar que la bóveda de Obsidian se contamine con "ruido" o basura de internet, se aplica la separación estricta:

1. **`vault/raw/` (Borradores crudos):** Los feeds se descargan aquí como texto plano o JSON con fecha y fuente. Las IAs lo leen, pero tú nunca necesitas abrir esta carpeta.
2. **`vault/wiki/` (Conocimiento destilado):** El agente extrae solo los **hechos permanentes (Facts)** y crea fichas de 1 página con:
   * **Resumen ejecutivo de 3 viñetas.**
   * **Impacto directo en GoalChain** (ej: *"Solana actualiza el scheduler de prioridad -> afecta la latencia de Jupiter"*).
   * **Backlinks a notas existentes** (`[[SETUP_MEAN_REVERSION_SOL]]`, etc.).

---

## 🛰️ 3. Fuentes RSS de Alto Valor Recomendadas

### A. Ecosistema Solana & DeFi:
* **Solana Foundation Blog & Core Releases:** `https://solana.com/news/rss`
* **Helius Developer Blog:** `https://www.helius.dev/blog/rss.xml`
* **Jito Labs Updates:** `https://www.jito.network/blog/rss/`

### B. Macroeconomía & Cripto Trading:
* **CoinDesk & Cointelegraph Markets:** `https://www.coindesk.com/arc/outboundfeeds/rss/`
* **Federal Reserve Press Releases (FOMC):** `https://www.federalreserve.gov/feeds/press_all.xml`

### C. Amazon KDP & Publicación Digital:
* **Kindlepreneur / Publishing Insights:** `https://kindlepreneur.com/feed/`
* **Publishers Weekly (Sci-Fi & Fantasy Category):** `https://www.publishersweekly.com/pw/feeds/rss/index.html`

---

## ⚙️ 4. Automatización con Hermes en VPS

Un cronjob ligero de Python (`feedparser` + llamada local a LLM) puede correr una vez cada 6 horas en el servidor de Oracle Cloud:
1. Extrae los últimos 5 artículos por feed.
2. Filtra por palabras clave de impacto (`Solana`, `Jupiter`, `KDP`, `Kindle`, `FOMC`, `Cyberpunk`).
3. Si el artículo tiene una puntuación de relevancia $> 7/10$, redacta una nota Markdown atómica y la guarda en `vault/wiki/news/`.
4. Hace commit y push automático a GitHub, apareciendo mágicamente en tu Obsidian en local.
