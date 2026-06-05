use anchor_lang::prelude::*;
use crate::constants::SEED_PLAYER_MATCH;

#[account]
#[derive(InitSpace)]
pub struct PlayerMatchRecord {
    pub player: Pubkey,
    pub fixture: Pubkey,
    pub applied: bool,
    pub bump: u8,
}

impl PlayerMatchRecord {
    pub const SEED: &'static [u8] = SEED_PLAYER_MATCH;
    pub const LEN: usize = 8 + PlayerMatchRecord::INIT_SPACE;
}