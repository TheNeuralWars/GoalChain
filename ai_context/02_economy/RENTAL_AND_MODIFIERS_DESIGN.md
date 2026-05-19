# 🏆 GoalChain: Rental, Synergy, Locker Room, & Stadium Composability Blueprint (V2.0)

Este documento detalla el diseño conceptual, las mecánicas de juego, el impacto en la economía circular ($GCH) y las especificaciones técnicas para la implementación del sistema de alquileres, modificadores dinámicos por rendimiento, licencias de países, vestuarios y estadios.

---

## 1. El Motor de Sueldo Variable & Momentum (Win/Loss Modifiers)

La economía de GoalChain es una "economía viva". Conectar los salarios de los jugadores directivos directamente con sus resultados en el Mundial real crea un bucle de retroalimentación inmediato entre el fútbol real y el mercado financiero del juego.

### A. Fórmula del Multiplicador de Rendimiento
El sueldo base de un jugador ($Player\_Base\_Yield$) se ajustará después de cada partido de su selección mediante un modificador de **Momentum** y **Rachas (Streaks)**:

$$\text{Player\_Yield} = \text{Player\_Default\_Base} \times (1 + M_{\text{match}} + S_{\text{streak}})$$

Donde:
*   **$M_{\text{match}}$ (Modificador del Último Partido):**
    *   **Victoria:** $+15\%$ al sueldo base del jugador para el siguiente ciclo.
    *   **Empate:** $+0\%$ (sin cambios).
    *   **Derrota:** $-10\%$ al sueldo base.
*   **$S_{\text{streak}}$ (Modificador de Racha):**
    *   Si la selección acumula victorias consecutivas, se activa un boost acumulativo:
        *   **Racha de 2 victorias:** $+5\%$
        *   **Racha de 3 victorias:** $+10\%$
        *   **Racha de 4+ victorias:** $+20\%$ (Modo *On Fire* 🔥).
    *   **Corte de Racha:** Cualquier derrota o empate resetea el $S_{\text{streak}}$ a $0\%$.
    *   **Eliminatoria directa (Knockouts):** Si el país pierde en octavos/cuartos/semis, la selección queda eliminada. El sueldo cae a $0$ de manera definitiva (Death Pledge), a menos que el jugador tenga equipados ciertos cosméticos protectores (ver Sección 4).

### B. El Bucle de Especulación
Este sistema introduce la **especulación deportiva** en el mercado de NFTs. Si un usuario prevé que *Francia* va a ganarle a un rival débil en la próxima fecha, el precio de alquiler de Mbappé subirá en el mercado secundario. Los mánagers alquilarán jugadores buscando rentabilizar el costo del alquiler con el boost del sueldo post-partido.

---

## 2. Mercado de Alquileres de NFTs (Rent-to-Earn)

Para evitar que los coleccionistas con decenas de jugadores dejen sus activos inactivos, implementamos un sistema de alquileres flexible.

### A. Tipos de Contrato de Alquiler
1.  **Alquiler por Partido (Match-to-Match Rental):** 
    *   El contrato se firma por un solo partido de la selección del jugador.
    *   Termina automáticamente en el momento en que el Oráculo resuelve la fixture correspondiente y se procesan los sueldos del día del partido.
    *   Ideal para especulación rápida.
2.  **Alquiler por Ciclo / Días (Time-Locked Rental):**
    *   El dueño define un período en días (ej. 3 días, 7 días).
    *   Los fondos de alquiler se bloquean en un escrow inteligente y se liberan al dueño prorrateadamente o al final del período.

### B. Mecánicas Avanzadas
*   **Contraofertas (Bidding Market):** Los inquilinos pueden enviar ofertas personalizadas sobre un jugador que está listado para alquiler (ej. *"Te ofrezco 150 $GCH por el partido contra Brasil en lugar de los 200 que pides"*).
*   **Pre-Contratos a Futuro (Future Booking Queue):** 
    *   Un jugador que ya está alquilado puede volver a listarse en el mercado para el "siguiente ciclo".
    *   Un tercer usuario puede pagar por adelantado para asegurar al jugador una vez que expire el contrato actual. Esto crea una **cola de reservas** en el contrato inteligente.
*   **Prórrogas (Extensions):** El inquilino actual tiene prioridad para solicitar una extensión del contrato 12 horas antes de que expire. El dueño debe aprobarla. Si el dueño no responde, el contrato finaliza.
*   **Cláusula de Rescisión Dorada (Golden Recall Clause):**
    *   Si el dueño quiere recuperar a su jugador antes de tiempo (por ejemplo, porque metió un hat-trick y quiere usarlo en su Starting XI), puede ejecutar una cancelación inmediata **pagando una penalización en $GCH al inquilino** (equivalente al 50% del valor total del alquiler restante). Esto actúa como sumidero (burn) de tokens y compensa al inquilino.

---

## 3. Licencias de Selecciones (Nation Licenses) & Precios Dinámicos

Las Selecciones (Nations) se convierten en activos macro dentro del ecosistema, actuando como multiplicadores grupales.

### A. Adquisición y Utilidad
*   Las **Nation Licenses** son NFTs especiales de tirada limitada que los usuarios pueden comprar desde el inicio del juego.
*   **Efecto Sinergia:** Poseer la Licencia de *España* en la misma wallet otorga un boost permanente del $+10\%$ en stats y $+5\%$ en sueldo a todos los jugadores de la selección española que tengas en tu Starting XI.
*   Las sinergias se acumulan si alineas a múltiples jugadores de la misma selección:
    *   **3 Jugadores del mismo país:** $+5\%$ stats.
    *   **5 Jugadores del mismo país:** $+12\%$ stats.
    *   **11 Jugadores del mismo país (Full Squad):** $+25\%$ stats + Bonus de Sinergia de Sueldo del $+15\%$.
    *   *Nota:* Los jugadores alquilados **sí** aplican a este boost, permitiendo a mánagers temporales completar sinergias específicas para jornadas clave.

### B. Bonding Curve & FOMO Olímpico (Precios Dinámicos)
Las licencias iniciales se venden a un precio base (ej. $100$ $GCH$ o $0.5$ $SOL$). El precio de mint de nuevas licencias del pool oficial escala algorítmicamente según el desempeño del país:
*   **Cada victoria en el Mundial:** El precio base del mint del país sube un $15\%$ (reflejando la demanda y el FOMO).
*   **Derrota:** El precio baja un $5\%$ (estabilización).
*   **Campeón del Mundo:** El precio se congela en su máximo histórico y el pool oficial se cierra permanentemente. A partir de ahí, solo se pueden comprar en el mercado secundario.

$$\text{Mint\_Price} = \text{Base\_Price} \times (1.15)^{\text{Wins}} \times (0.95)^{\text{Losses}}$$

---

## 4. Vestuarios (Locker Room) & Personalización Permanente

Los jugadores del Genesis Squad se mintean inicialmente con un "kit básico negro" (ropa interior). Para completarlos, los mánagers compran equipamiento y vestuario de su respectiva selección.

```
+-------------------------------------------------------------+
|                     VESTUARIOS (SKINS)                      |
|                                                             |
|   [ Camiseta Oficial ]  --> Modificación de Metadata        |
|   [ Botines de Élite ]  --> Fusión y Quema Permanente (Burn) |
|   [ Brazalete Capitán]  --> Incremento Eterno de Stats      |
+-------------------------------------------------------------+
```

### A. Mecánica de Integración y Fusión Permanente
*   Los vestuarios (Camisetas, Pantalones, Botines) son NFTs consumibles.
*   Al equipar un vestuario a un jugador, **el NFT del vestuario se QUEMA (Burn)** y sus propiedades se fusionan permanentemente con el NFT del jugador.
*   Esta fusión actualiza de forma irreversible la metadata on-chain del jugador:
    *   **Atributo Visual:** El campo `visual_skin` cambia de `"undergarment_black"` a `"argentina_home_2026"`. La interfaz web/3D renderizará la camiseta sobre el modelo del jugador.
    *   **Atributo Estadístico:** Otorga un boost plano y permanente a los stats (ej. Camiseta Oficial: $+5$ de Stamina Máxima; Botines de Oro: $+5$ de Potencia de Tiro).
    *   **Atributo Económico:** Incrementa de forma fija el multiplicador de sueldo base en un $+3\%$.

### B. Utilidad Defensiva (La Camiseta de la Suerte)
*   Podemos agregar un tipo de Vestuario Legendario: **"La Camiseta Histórica"**.
*   **Efecto Escudo (Shield):** Si la selección del jugador es eliminada del Mundial, en lugar de que su sueldo caiga a $0$ de forma permanente (Death Pledge), tener equipada la Camiseta Histórica protege al NFT, permitiéndole mantener un **$15\%$ de su sueldo base** como "Leyenda Retirada". Esto añade un valor de cobertura financiero altísimo a los cosméticos.

---

## 5. Estadios (Stadium Composability)

Los Estadios son NFTs de gran valor que definen la "localía" del juego y fomentan la composabilidad cruzada.

### A. Compatibilidad de Fondo (Home Field Advantage)
Cada jugador NFT tiene en su arte visual y metadata un "Fondo" específico (ej. Fondo de Ciudad, Estadio del Desierto, Estadio de Nieve).
*   Si un mánager posee un **Estadio NFT** de tipo *"Desierto"* y equipa en su Starting XI a jugadores que tengan el fondo *"Desierto"*, se activa el **Efecto Localía (Home Field Advantage)**.
*   **Multiplicador:** El boost de sueldo que da el estadio aumenta de $1.05x$ a $1.15x$ para esos jugadores específicos.
*   Los NFTs de Estadios "hablan" con los de los jugadores leyendo mutuamente sus campos de metadata en el momento de calcular el cobro de recompensas en el contrato inteligente.

---

## 6. Opciones Adicionales para Completar la Dinámica

### A. El Tablón del Especulador (Speculator's Stock Ticker)
Una sección en el Dashboard de la WebApp con estética premium (gráficas en tiempo real, luces neón verdes y rojas) que muestre:
*   Los jugadores más alquilados en las últimas 24 horas.
*   Las selecciones con las mayores rachas activas.
*   Las variaciones de precios en las licencias de selecciones.
*   Esto transforma el juego en un "Fantasy Football Manager" combinado con un simulador de bolsa deportiva de alta velocidad.

### B. Química de Clubes (Club Synergy Expansion)
Aunque el Mundial de selecciones es el foco del juego en 2026, los jugadores pertenecen a clubes en su vida cotidiana.
*   Si alineas jugadores que juegan en el mismo club real (ej. Messi, Busquets, Jordi Alba en el Inter Miami), se activa la **Química de Club** (ej. $+3\%$ en la precisión de pases y $+2\%$ de sueldo).

### C. Depósitos de Garantía de Estamina (Stamina Security Deposit)
Para evitar que un inquilino alquile un jugador, juegue 3 partidos, le agote la estamina a $0$ y lo devuelva inservible al dueño:
*   Al alquilar, se requiere un pequeño depósito de garantía en $GCH$.
*   Si el inquilino devuelve al jugador con menos de $80$ de estamina, el costo de las pociones necesarias para restaurarlo al $100\%$ se deduce automáticamente de su depósito y se entrega al dueño.

---

## 7. Plan de Implementación Técnica en Solana (Anchor)

Para implementar esto en los contratos inteligentes de `goalchain_program`:

### A. Modificaciones a Estructuras Existentes

```rust
use anchor_lang::prelude::*;

#[account]
pub struct ParodyPlayer {
    pub owner: Pubkey,
    pub name: String,                    // 32 bytes max
    pub player_id: String,                  // 32 bytes max
    pub real_world_goals: u8,
    pub real_world_assists: u8,
    pub matches_played: u8,
    pub speed: u8,
    pub shot_power: u8,
    pub stamina: u8,                     // 0 a 100
    pub max_stamina: u8,                 // Modificado por Locker Room
    pub base_yield_rate: u64,            // Recompensa base en lamports / GCH
    pub is_eliminated: bool,             // Death Pledge
    
    // --- V3 Customization & Rental Systems ---
    pub nation_id: u8,                   // Sinergias de Licencia de País
    pub visual_background: u8,           // Relación de Localía con Estadio
    pub equipped_jersey: Option<Pubkey>,  // NFT de Camiseta Quemado/Fusionado
    pub equipped_boots: Option<Pubkey>,   // NFT de Botines Quemado/Fusionado
    pub win_streak: u8,                  // Streak de victorias acumulado
    pub last_match_result: u8,           // 1: Victoria, 2: Empate, 3: Derrota
    pub has_shield_jersey: bool,         // Salvaguarda del 15% del Yield ante Eliminación
}

#[account]
pub struct RentalListing {
    pub owner: Pubkey,
    pub price_per_match: u64,
    pub current_borrower: Option<Pubkey>,
    pub rental_end_timestamp: i64,
    pub next_borrower: Option<Pubkey>,   // Reservas a futuro
    pub golden_recall_penalty: u64,      // Multa por cancelar el alquiler (ej: 50%)
    pub is_active: bool,
}

#[account]
pub struct NationLicenseState {
    pub country_id: u8,
    pub name: String,
    pub wins: u16,
    pub losses: u16,
    pub is_champion: bool,
    pub supply: u32,
}
```

### B. Funciones e Instrucciones Detalladas en Rust

```rust
#[error_code]
pub enum SimulatorError {
    #[msg("Estamina insuficiente para jugar.")]
    InsufficientStamina,
    #[msg("El jugador ya tiene estamina al máximo.")]
    StaminaAlreadyFull,
    #[msg("El jugador ha sido eliminado y no tiene escudo protector.")]
    PlayerIsEliminated,
    #[msg("Cláusula de rescisión dorada: Penalidad de GCH requerida.")]
    GoldenRecallPenaltyRequired,
    #[msg("Licencia de País agotada en este pool.")]
    LicensePoolSoldOut,
}

// 1. Alimentar con Poción de Estamina (Burns 10 $GCH)
pub fn feed_potion(ctx: Context<FeedPotion>) -> Result<()> {
    let player = &mut ctx.accounts.player;
    require!(player.stamina < player.max_stamina, SimulatorError::StaminaAlreadyFull);
    
    // Ejecutar quema de 10 $GCH usando token::burn en el pool oficial
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = token::Burn {
        mint: ctx.accounts.gch_mint.to_account_info(),
        from: ctx.accounts.user_token_wallet.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, 10_000_000)?; // 10 GCH (con 6 decimales)

    player.stamina = player.max_stamina;
    Ok(())
}

// 2. Fusión de Ítem del Vestuario (Burns cosmetic NFT)
pub fn fuse_locker_room_item(ctx: Context<FuseLockerRoomItem>, item_type: u8) -> Result<()> {
    let player = &mut ctx.accounts.player;
    
    // Validar y quemar el NFT del ítem cosmético (Camiseta, Botines, etc.)
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = token::Burn {
        mint: ctx.accounts.item_mint.to_account_info(),
        from: ctx.accounts.user_item_wallet.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, 1)?; // Quemar el NFT único del ítem (1 unidad)

    match item_type {
        1 => { // Camiseta Argentina
            player.equipped_jersey = Some(ctx.accounts.item_mint.key());
            player.max_stamina = player.max_stamina.saturating_add(5);
            player.stamina = player.max_stamina; // Restauración
        },
        2 => { // Botines de Oro
            player.equipped_boots = Some(ctx.accounts.item_mint.key());
            player.speed = player.speed.saturating_add(8);
        },
        3 => { // Brazalete Capitán (Shield Effect)
            player.has_shield_jersey = true;
        },
        _ => {}
    }
    
    // Aumentar tasa base en 3% permanentemente
    player.base_yield_rate = player.base_yield_rate.saturating_add(player.base_yield_rate * 3 / 100);
    
    Ok(())
}

// 3. Cláusula de Rescisión Dorada (Golden Recall)
pub fn golden_recall(ctx: Context<GoldenRecall>) -> Result<()> {
    let listing = &mut ctx.accounts.listing;
    let player = &mut ctx.accounts.player;
    
    require!(listing.is_active, SimulatorError::InsufficientStamina);
    
    // Transferir multa del dueño al inquilino (50% del precio pactado)
    let penalty = listing.price_per_match / 2;
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.owner_token_wallet.to_account_info(),
        to: ctx.accounts.borrower_token_wallet.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, penalty)?;

    // Terminar alquiler inmediatamente
    listing.current_borrower = None;
    listing.next_borrower = None;
    listing.is_active = false;
    
    // El jugador vuelve a ser controlable por el dueño
    player.owner = listing.owner;
    
    Ok(())
}
```

---

> [!NOTE]
> Estas mecánicas aumentan la utilidad del token $GCH al agregar nuevos sumideros fuertes (compra de skins, licencias de países con precios dinámicos y penalizaciones por estamina en alquileres) y estimulan un mercado secundario sumamente competitivo.
