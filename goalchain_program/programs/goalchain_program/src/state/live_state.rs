use anchor_lang::prelude::*;
use crate::constants::SEED_LIVE_STATE;

#[account]
#[derive(InitSpace)]
pub struct LiveMatchState {
    pub fixture: Pubkey,
    pub minute: u16,
    pub score_a: u8,
    pub score_b: u8,
    pub is_ht: bool,
    pub is_ft: bool,
    pub last_update_ts: i64,
    pub bump: u8,
}

impl LiveMatchState {
    pub const SEED: &'static [u8] = SEED_LIVE_STATE;
    pub const LEN: usize = 8 + LiveMatchState::INIT_SPACE;
}