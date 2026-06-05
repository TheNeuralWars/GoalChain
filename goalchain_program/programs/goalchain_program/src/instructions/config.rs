// Config instructions
use anchor_lang::prelude::*;
use crate::state::config::GlobalConfig;
use crate::errors::GoalChainError;
use crate::constants::{MAX_FEE_BPS, BPS_DENOMINATOR, DEFAULT_FEE_BURN_BPS, DEFAULT_FEE_JACKPOT_BPS};

pub fn initialize_config(ctx: Context<InitializeConfig>, oracle_authority: Pubkey, treasury_token_account: Pubkey, jackpot_token_account: Pubkey, fee_bps: u16, cutoff_buffer_seconds: i64, max_sol_per_user: u64, presale_active: bool) -> Result<()> {
    require!(fee_bps <= MAX_FEE_BPS, GoalChainError::InvalidConfig);
    require!(cutoff_buffer_seconds >= 0, GoalChainError::InvalidConfig);
    require!(
        cutoff_buffer_seconds <= 24 * 60 * 60,
        GoalChainError::InvalidConfig
    );
    require!(max_sol_per_user > 0, GoalChainError::InvalidConfig);
    let fee_stream_bps = (DEFAULT_FEE_BURN_BPS as u32)
        .checked_add(DEFAULT_FEE_JACKPOT_BPS as u32)
        .ok_or(GoalChainError::MathOverflow)?;
    require!(
        fee_stream_bps <= BPS_DENOMINATOR as u32,
        GoalChainError::InvalidConfig
    );

    let cfg = &mut ctx.accounts.config;
    cfg.admin = ctx.accounts.admin.key();
    cfg.oracle_authority = oracle_authority;
    cfg.treasury_token_account = treasury_token_account;
    cfg.jackpot_token_account = jackpot_token_account;
    cfg.fee_bps = fee_bps;
    cfg.fee_burn_bps = DEFAULT_FEE_BURN_BPS;
    cfg.fee_jackpot_bps = DEFAULT_FEE_JACKPOT_BPS;
    cfg.max_starters_per_manager = crate::constants::DEFAULT_MAX_STARTERS_PER_MANAGER;
    cfg.cutoff_buffer_seconds = cutoff_buffer_seconds;
    cfg.max_sol_per_user = max_sol_per_user;
    cfg.presale_active = presale_active;
    cfg.bump = ctx.bumps.config;
    Ok(())
}

pub fn update_config(ctx: Context<UpdateConfig>, oracle_authority: Pubkey, treasury_token_account: Pubkey, jackpot_token_account: Pubkey, fee_bps: u16, cutoff_buffer_seconds: i64, max_sol_per_user: u64, presale_active: bool) -> Result<()> {
    require!(fee_bps <= MAX_FEE_BPS, GoalChainError::InvalidConfig);
    require!(cutoff_buffer_seconds >= 0, GoalChainError::InvalidConfig);
    require!(
        cutoff_buffer_seconds <= 24 * 60 * 60,
        GoalChainError::InvalidConfig
    );
    require!(max_sol_per_user > 0, GoalChainError::InvalidConfig);
    let fee_stream_bps = (ctx.accounts.config.fee_burn_bps as u32)
        .checked_add(ctx.accounts.config.fee_jackpot_bps as u32)
        .ok_or(GoalChainError::MathOverflow)?;
    require!(
        fee_stream_bps <= BPS_DENOMINATOR as u32,
        GoalChainError::InvalidConfig
    );

    let cfg = &mut ctx.accounts.config;
    cfg.oracle_authority = oracle_authority;
    cfg.treasury_token_account = treasury_token_account;
    cfg.jackpot_token_account = jackpot_token_account;
    cfg.fee_bps = fee_bps;
    cfg.cutoff_buffer_seconds = cutoff_buffer_seconds;
    cfg.max_sol_per_user = max_sol_per_user;
    cfg.presale_active = presale_active;
    Ok(())
}
