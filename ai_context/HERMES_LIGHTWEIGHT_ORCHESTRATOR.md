# Hermes — Lightweight Orchestrator (Updated Vision)

**Estado:** Redefinido (Opción A)
**Fecha:** 2026-05-23
**Decisión:** Hermes como orquestador liviano que usa OpenClaw/Grok como motor

---

## Nueva Visión de Hermes

Hermes ya **no** es un agente pesado que intenta tener su propia API de Grok.

En cambio, Hermes actúa como un **orquestador liviano** que:

- Recibe inputs desde OpenClaw (que ya tiene Grok integrado)
- Normaliza y estructura los mensajes en briefs de intake
- Gestiona el flujo de tareas (draft → ready → assigned)
- Mantiene el digest diario y la sincronización
- Coordina el lanzamiento y revenue de agentes tokenizados

---

## Responsabilidades de Hermes (Liviano)

| Responsabilidad              | Quién lo hace                  | Nivel de automatización |
|-----------------------------|--------------------------------|--------------------------|
| Recibir mensajes (WhatsApp, voz, chat) | OpenClaw + Grok               | Alto |
| Convertir mensajes en briefs estructurados | Hermes (scripts + prompts)    | Medio-Alto |
| Priorizar y asignar tareas | Hermes (con reglas claras)    | Medio |
| Handoff a Cursor | Hermes (mensaje estándar)     | Alto |
| Generar digest diario | Hermes (cron + scripts)       | Alto |
| Gestionar agentes tokenizados | Hermes (config + revenue)     | Medio |

---

## Arquitectura Propuesta

```
WhatsApp / Voz / Chat
        ↓
OpenClaw (Grok API)
        ↓
Hermes Orchestrator (liviano)
        ↓
docs/intake/*.md + GitHub Issues
        ↓
Cursor (implementación)
```

---

## Ventajas de este enfoque

- Evitamos duplicar lógica de razonamiento (OpenClaw ya lo hace bien)
- Hermes se vuelve más fácil de mantener y tokenizar
- Podemos avanzar más rápido con la tokenización de agentes
- Reducimos complejidad de integración de APIs

---

## Próximos Pasos

1. Simplificar los scripts de Hermes para que actúen como "pegamento" entre OpenClaw y los briefs
2. Crear un prompt específico para que OpenClaw + Hermes generen briefs automáticamente
3. Avanzar con la estructura de agentes tokenizables (Hermes, Vault Sentinel, Devnet Oracle)
4. Definir cómo se va a monetizar Hermes como agente tokenizado

---

*Esta es la visión actualizada y simplificada.*
