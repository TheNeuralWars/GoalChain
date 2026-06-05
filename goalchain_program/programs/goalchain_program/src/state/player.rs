use anchor_lang::prelude::*;
use crate::constants::{SEED_PLAYER, SEED_RENTAL};

#[account]
#[derive(InitSpace)]
pub struct ParodyPlayer {
    pub owner: Pubkey,
    pub last_claim_timestamp: i64,
    #[max_len(32)]
    pub name: String,
    #[max_len(32)]
    pub player_id: String,
    pub real_world_goals: u8,
    pub real_world_assists: u8,
    pub matches_played: u8,
    pub speed: u8,
    pub shot_power: u8,
    pub base_yield_rate: u64,
    pub current_stamina: u8,
    pub is_eliminated: bool,
    pub equipped_stadium_id: Option<Pubkey>,
    pub nation_id: u8,
    pub visual_background: u8,
    pub equipped_jersey: Option<Pubkey>,
    pub equipped_boots: Option<Pubkey>,
    pub win_streak: u8,
    pub last_match_result: u8,
    pub has_shield_jersey: bool,
    pub bump: u8,
}

impl ParodyPlayer {
    pub const SEED: &'static [u8] = SEED_PLAYER;
    pub const LEN: usize = 8 + ParodyPlayer::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct RentalListing {
    pub owner: Pubkey,
    pub price_per_match: u64,
    pub current_borrower: Option<Pubkey>,
    pub is_active: bool,
}

impl RentalListing {
    pub const SEED: &'static [u8] = SEED_RENTAL;
    pub const LEN: usize = 8 + RentalListing::INIT_SPACE;
}