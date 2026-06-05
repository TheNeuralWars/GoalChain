use anchor_lang::prelude::*;
use crate::constants::{SEED_STAKE, SEED_STAKE_VAULT};

#[account]
#[derive(InitSpace)]
pub struct UserStake {
    pub owner: Pubkey,
    pub amount: u64,
    pub start_timestamp: i64,
    pub unclaimed_rewards: u64,
}

impl UserStake {
    pub const SEED: &'static [u8] = SEED_STAKE;
    pub const LEN: usize = 8 + UserStake::INIT_SPACE;
}