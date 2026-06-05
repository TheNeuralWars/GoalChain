use anchor_lang::prelude::*;
use crate::constants::{SEED_MANAGER, SEED_STADIUM, SEED_MANAGER_DAILY_CLAIM};

#[account]
#[derive(InitSpace)]
pub struct ManagerState {
    pub level: u8,
    pub salary_multiplier: u64,
}

impl ManagerState {
    pub const SEED: &'static [u8] = SEED_MANAGER;
    pub const LEN: usize = 8 + ManagerState::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct ManagerDailyClaim {
    pub owner: Pubkey,
    pub day_id: i64,
    pub claim_count: u8,
    pub bump: u8,
}

impl ManagerDailyClaim {
    pub const SEED: &'static [u8] = SEED_MANAGER_DAILY_CLAIM;
    pub const LEN: usize = 8 + ManagerDailyClaim::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct StadiumState {
    pub stadium_id: u16,
    pub revenue_multiplier: u64,
}

impl StadiumState {
    pub const SEED: &'static [u8] = SEED_STADIUM;
    pub const LEN: usize = 8 + StadiumState::INIT_SPACE;
}