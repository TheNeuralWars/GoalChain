use anchor_lang::prelude::*;
use pyth_sdk_solana::load_price_feed_from_account_info;

declare_id!("GoalChainVault11111111111111111111111111111");

/// DRAFT SCAFFOLD: GoalChain Oracle & Dynamic Yield Engine
/// Este contrato muestra cómo la arquitectura integra datos del mundo real
/// (Oracle) y calcula el "Yield" diario de forma componible.

#[program]
pub mod goalchain_oracle_engine {
    use super::*;

    /// Ejecutada por el Oráculo/Backend cuando ocurre una acción en un partido real.
    pub fn update_player_performance(
        ctx: Context<UpdatePerformance>,
        action_type: u8, // 1: Gol, 2: Asistencia, 3: Tarjeta Roja, 4: Eliminación
    ) -> Result<()> {
        let player_state = &mut ctx.accounts.player_nft_state;

        // Validar que el jugador no esté eliminado
        require!(!player_state.is_eliminated, CustomError::PlayerIsEliminated);

        match action_type {
            // ⚽ GOL MARCADO (+10% Yield)
            1 => {
                player_state.base_yield_rate = player_state.base_yield_rate.checked_add(10).unwrap();
                // Aquí iría la lógica CPI para emitir el "Instant Airdrop Bonus" al owner actual
                msg!("¡GOL! El sueldo del jugador {} ha subido un 10%", player_state.player_id);
            },
            // 🎯 ASISTENCIA (+5% Yield)
            2 => {
                player_state.base_yield_rate = player_state.base_yield_rate.checked_add(5).unwrap();
            },
            // 🟥 TARJETA ROJA (Slash: -20% Yield, 0 Stamina)
            3 => {
                player_state.base_yield_rate = player_state.base_yield_rate.saturating_sub(20);
                player_state.current_stamina = 0;
                msg!("¡ROJA! El jugador {} ha sido penalizado severamente.", player_state.player_id);
            },
            // ☠️ ELIMINACIÓN DEL TORNEO (Muerte Súbita)
            4 => {
                player_state.base_yield_rate = 0;
                player_state.is_eliminated = true;
                msg!("ELIMINACIÓN. El NFT {} ya no emitirá tokens.", player_state.player_id);
            },
            _ => return err!(CustomError::InvalidActionType),
        }

        Ok(())
    }

    /// Ejecutada por el usuario cuando reclama su sueldo ($GCH) en "The Vault".
    /// Aquí se ve la Matemática de Composabilidad: Jugador + Manager + Estadio
    pub fn claim_daily_salary(ctx: Context<ClaimSalary>) -> Result<()> {
        let player = &mut ctx.accounts.player_nft_state;
        let manager = &ctx.accounts.manager_nft_state;
        let stadium = &ctx.accounts.stadium_nft_state;

        // 1. Verificación de Energía (Stamina)
        // Si la energía es menor a 30, sufre un -50% de penalización en la emisión.
        let mut base_salary = player.base_yield_rate as f64;
        if player.current_stamina < 30 {
            base_salary = base_salary * 0.5; // Penalidad por cansancio extremo
            msg!("⚠️ El jugador está exhausto. Penalización de 50% aplicada al sueldo.");
        }

        // 2. Aplicar "Manager Salary Boost" (ej: Level 12 Manager da 1.15x)
        let boosted_salary = base_salary * manager.salary_multiplier;

        // 3. Aplicar "Stadium Multiplier" (ej: Estadio Mythic da 1.10x)
        let final_daily_salary = boosted_salary * stadium.revenue_multiplier;

        // 4. Decadencia de energía diaria
        player.current_stamina = player.current_stamina.saturating_sub(5);

        msg!("💰 Salario procesado: {} $GCH a transferir.", final_daily_salary);
        
        // (Lógica de transferencia de Token Mint a la wallet del usuario iría aquí)

        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdatePerformance<'info> {
    #[account(mut)]
    pub player_nft_state: Account<'info, PlayerState>,
    // En producción se requiere la firma del Authority del Oráculo
    pub oracle_authority: Signer<'info>, 
}

#[derive(Accounts)]
pub struct ClaimSalary<'info> {
    #[account(mut)]
    pub player_nft_state: Account<'info, PlayerState>,
    pub manager_nft_state: Account<'info, ManagerState>,
    pub stadium_nft_state: Account<'info, StadiumState>,
    pub user: Signer<'info>,
}

#[account]
pub struct PlayerState {
    pub player_id: u16,
    pub base_yield_rate: u64,
    pub current_stamina: u8,
    pub is_eliminated: bool,
    // ID del estadio equipado en este momento
    pub equipped_stadium_id: Option<Pubkey>, 
}

#[account]
pub struct ManagerState {
    pub level: u8,
    pub salary_multiplier: f64, // Ej: 1.15 para Infinity Elite
}

#[account]
pub struct StadiumState {
    pub stadium_id: u16,
    pub revenue_multiplier: f64, // Ej: 1.10 para Mythic
}

#[error_code]
pub enum CustomError {
    #[msg("Este jugador ya fue eliminado del torneo.")]
    PlayerIsEliminated,
    #[msg("Acción de Oráculo inválida.")]
    InvalidActionType,
}
