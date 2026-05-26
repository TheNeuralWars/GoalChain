# Parámetros de excelencia — GCH, NFT, fees

**Fuente contractual:** `docs/ECONOMIC_CANONICAL_CONFIG.json` (v1.0.0-p0)  
**Principio:** En Mundial **no cambiar** números on-chain sin brief P0 + CEO `cambio urgente`. Este doc separa **validado P0** vs **propuesta post-Mundial**.

---

## 1. Token GCH (red y unidad)

| Parámetro | Valor actual | Evaluación | Acción Mundial | Acción post-Mundial |
|-----------|--------------|------------|----------------|---------------------|
| `token_decimals` | 6 | Estándar Solana SPL | Mantener | Mantener |
| `gch_lamports` | 1_000_000 | 1 GCH = 10^6 lamports; claro | Mantener | Mantener |
| `program_id` | devnet FbDh… | Correcto para demo | Mantener devnet | Mainnet deploy = nuevo brief + audit |

**Excelencia:** Una sola definición de “1 GCH” en UI, docs y oracle (ya alineado vía lamports).

---

## 2. Fees y sinks (demanda codiciada de GCH)

| Parámetro | Valor actual | % / efecto | Evaluación |
|-----------|--------------|------------|------------|
| `max_fee_bps` | 100 | 1% cap en claims | Conservador; bueno para confianza inicial |
| `architect_tax_bps` | 100 | 1% arquitecto | OK si visible en docs públicos EN |
| Split claim (on-chain) | burn 40 / jackpot 40 / treasury 20 del fee | Quema + jackpot narrativo | **Fortaleza principal GCH** — destacar en marketing educativo |

**Propuesta post-Mundial (requiere simulación + Grok):**
- Subir `max_fee_bps` solo si `scripts/tokenomics_simulation.py` muestra ratio burn/emit estable 7d.
- Publicar dashboard burn/emit en Play (ya parcial vía mint gate ops).

**Orden Antigravity:** No tocar `max_fee_bps` antes del 11-jun sin datos de simulación.

---

## 3. Yields NFT por rareza (valor futuro del jugador)

| Rareza | Lamports/día (canonical) | GCH/día (6 dec) | Rol económico |
|--------|--------------------------|-----------------|---------------|
| unknown | 100_000_000 | 100 | Baseline |
| rare | 50_000_000 | 50 | Entry |
| epic | 250_000_000 | 250 | Mid |
| legendary | 1_000_000_000 | 1_000 | Premium |
| mythic | 5_000_000_000 | 5_000 | Escasez extrema |

| Parámetro | Valor | Evaluación |
|-----------|-------|------------|
| `max_base_yield_lamports` | 10_000_000_000 | Tope anti-inflación — **mantener** |
| `potion_burn_lamports` | 100_000_000 | Sink de uso (100 GCH) — OK P0 |
| `default_base_yield_lamports` | 100_000_000 | Coherente con unknown | Mantener |

**Excelencia NFT:** El valor no es “precio de piso” sino **yield modulado por oracle** (`oracle_yield_policy`):

| Evento | % sobre base yield |
|--------|-------------------|
| Gol | +10% |
| Asistencia | +5% |
| Roja | -20% |
| Eliminación | yield → 0 |

**Orden oracle:** Siempre aplicar stats vía `recordPlayerMatch` + `updatePlayerStats`; nunca mint sintético de yield en UI.

**Propuesta post-Mundial:**
- Publicar “yield apy equivalente” solo como **estimación** con disclaimer SIMULACIÓN si no está on-chain live.
- Genesis squad: cap global de starters (`max_starters_per_manager` on-chain) — UI read-only primero.

---

## 4. Política de honestidad (legal + marca)

| Regla | Implementación |
|-------|----------------|
| Mock sin badge | Prohibido en Play (Trading, Vaults, Squad) |
| Mainnet | No prometer hasta `LAUNCH_READINESS_CHECKLIST.md` ≥ 80% |
| APY DeFi | Eliminar cifras fijas en dashboard (hecho: “TVL demo”) |
| Educación GCH | Marketing: utilidad + quema; no “moon guaranteed” |

---

## 5. Checklist de ajuste (cuando CEO apruebe cambio numérico)

1. Editar `ECONOMIC_CANONICAL_CONFIG.json` + bump `config_version`
2. PR `goalchain_program` si el contrato debe reflejar defaults
3. Regenerar / verificar IDL en `goalchain-sdk`
4. `goalchain_oracle` rarityYield (auto-load JSON)
5. `goalchain_api` economy endpoints
6. Play `EconomyConfigBanner` muestra nueva versión
7. Grok review copy público EN
8. `IMPLEMENTATION_STATUS.md` + entrada en `docs/intake/`

---

## 6. Narrativa “codiciada” (comunicación, no parámetro)

Mensajes permitidos (EN en público):
- “Fees on winning claims recycle GCH through burn and community jackpot.”
- “Player NFT yield reacts to real match events verified by the oracle.”
- “Devnet demo; mainnet follows security checklist.”

Mensajes prohibidos:
- Guaranteed returns / APY fijo en vaults mock
- Mainnet live sin auditoría
- Infinite mint / forge activo
