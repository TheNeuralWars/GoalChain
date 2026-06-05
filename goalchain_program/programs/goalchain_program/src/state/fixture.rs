use anchor_lang::prelude::*;
use crate::constants::{SEED_FIXTURE, SEED_BET, SEED_FIXTURE_VAULT};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MatchStatus {
    Upcoming,
    Live,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MatchResult {
    TeamA,
    TeamB,
    Draw,
}

#[account]
#[derive(InitSpace)]
pub struct Fixture {
    #[max_len(64)]
    pub match_id: String,
    #[max_len(32)]
    pub team_a: String,
    #[max_len(32)]
    pub team_b: String,
    pub start_timestamp: i64,
    pub pool_a: u64,
    pub pool_b: u64,
    pub pool_draw: u64,
    pub total_claimed: u64,
    pub total_refunded: u64,
    pub status: MatchStatus,
    pub winner: Option<MatchResult>,
    pub bump: u8,
}

impl Fixture {
    pub const SEED: &'static [u8] = SEED_FIXTURE;
    pub const LEN: usize = 8 + Fixture::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct UserBet {
    pub owner: Pubkey,
    pub fixture: Pubkey,
    pub amount: u64,
    pub prediction: MatchResult,
    pub bet_timestamp: i64,
    pub claimed: bool,
}

impl UserBet {
    pub const SEED: &'static [u8] = SEED_BET;
    pub const LEN: usize = 8 + UserBet::INIT_SPACE;
}