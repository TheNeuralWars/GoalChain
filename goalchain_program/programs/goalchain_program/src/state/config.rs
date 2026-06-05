use anchor_lang::prelude::*;
use crate::constants::SEED_CONFIG;

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub oracle_authority: Pubkey,
    pub treasury_token_account: Pubkey,
    pub jackpot_token_account: Pubkey,
    pub fee_bps: u16,
    pub fee_burn_bps: u16,
    pub fee_jackpot_bps: u16,
    pub max_starters_per_manager: u8,
    pub cutoff_buffer_seconds: i64,
    pub max_sol_per_user: u64,
    pub presale_active: bool,
    pub bump: u8,
}

impl GlobalConfig {
    pub const SEED: &'static [u8] = SEED_CONFIG;
    pub const LEN: usize = 8 + GlobalConfig::INIT_SPACE;
}