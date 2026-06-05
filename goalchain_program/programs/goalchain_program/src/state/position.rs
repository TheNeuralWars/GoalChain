use anchor_lang::prelude::*;
use crate::constants::SEED_POSITION;

#[account]
#[derive(InitSpace)]
pub struct MarketPosition {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub ticket_id: u64,
    pub amount: u64,
    pub prediction: crate::state::fixture::MatchResult,
    pub bet_ts: i64,
    pub claimed: bool,
    pub bump: u8,
}

impl MarketPosition {
    pub const SEED: &'static [u8] = SEED_POSITION;
    pub const LEN: usize = 8 + MarketPosition::INIT_SPACE;
}