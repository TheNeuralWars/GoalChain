# ⚽ Registro Maestro de Jugadores: GoalChain Genesis Squad

Este documento contiene la estructura oficial de los 1,248 jugadores del Mundial 2026. La base de datos completa reside en `assets/data/players.json`.

## 1. Atributos por Jugador
Cada cromo contiene los siguientes metadatos:
- **ID:** Único correlativo (1-1248).
- **Parody Name:** Nombre Web3 (ej: Lionel Bitcoin).
- **País:** Una de las 48 naciones clasificadas.
- **Rareza:** Mythic, Legendary, Epic, Rare, Common.
- **Stats:** Atk, Def, Hype (0-99).
- **Biometría:** Altura y Peso.

## 2. Estructura de Contrato (Actualizado)
Hemos integrado datos salariales reales para dar profundidad al ecosistema:
- **Real World Salary:** Referencia salarial actual (ej: €130M para Mythics).
- **Match Salary ($GCH):** Pago por partido disputado en el Mundial.
- **Clauses:** Primas por titularidad, goles (no-penalti) y vallas invictas.

## 3. Ejemplo de Registro (Top Tier)
```json
{
    "id": 1,
    "name": "Lionel Bitcoin",
    "country": "Argentina",
    "rarity": "mythic",
    "contract": {
        "realSalary": "€130M+",
        "matchSalary": 5000,
        "clauses": ["Bono Titularidad (+25%)", "Bono Goles No-Penalti"]
    }
}
```

## 4. Distribución de Rarezas (Supply)
- **Mythics (5):** 1/1 ediciones únicas.
- **Legendaries (45):** 10 copias por jugador.
- **Epics (200):** 100 copias por jugador.
- **Rares (400):** 500 copias por jugador.
- **Commons (598):** 1000 copias por jugador.
