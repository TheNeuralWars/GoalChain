use anchor_lang::prelude::*;
use crate::constants::{
    SEED_BUILDER_FUND, SEED_BUILDER_VAULT, SEED_CONTRIBUTOR_SCORE,
    SEED_BUILDER_EPOCH, SEED_EPOCH_CONTRIBUTOR, SEED_EPOCH_CLAIM,
};

#[account]
#[derive(InitSpace)]
pub struct BuilderFund {
    pub admin: Pubkey,
    pub config: Pubkey,
    pub token_mint: Pubkey,
    pub contributor_vault: Pubkey,
    pub api_infra_vault: Pubkey,
    pub marketing_vault: Pubkey,
    pub contributor_bps: u16,
    pub api_infra_bps: u16,
    pub marketing_bps: u16,
    pub total_inflow: u64,
    pub contributor_allocated: u64,
    pub api_infra_allocated: u64,
    pub marketing_allocated: u64,
    pub total_contributor_score: u64,
    pub contributor_claimed_total: u64,
    pub contributor_spent: u64,
    pub api_infra_spent: u64,
    pub marketing_spent: u64,
    pub current_epoch: u64,
    pub score_update_cooldown_seconds: i64,
    pub min_epoch_score: u64,
    pub max_contributors_per_epoch: u32,
    pub bump: u8,
}

impl BuilderFund {
    pub const SEED: &'static [u8] = SEED_BUILDER_FUND;
    pub const LEN: usize = 8 + BuilderFund::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct ContributorScore {
    pub builder_fund: Pubkey,
    pub contributor: Pubkey,
    pub score: u64,
    pub claimed_amount: u64,
    pub last_update_timestamp: i64,
    pub bump: u8,
}

impl ContributorScore {
    pub const SEED: &'static [u8] = SEED_CONTRIBUTOR_SCORE;
    pub const LEN: usize = 8 + ContributorScore::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct BuilderContributorEpoch {
    pub builder_fund: Pubkey,
    pub epoch_id: u64,
    pub contributor_pool: u64,
    pub total_score_snapshot: u64,
    pub contributor_count: u32,
    pub finalized: bool,
    pub created_at: i64,
    pub finalized_at: i64,
    pub bump: u8,
}

impl BuilderContributorEpoch {
    pub const SEED: &'static [u8] = SEED_BUILDER_EPOCH;
    pub const LEN: usize = 8 + BuilderContributorEpoch::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct EpochContributorSnapshot {
    pub epoch: Pubkey,
    pub contributor: Pubkey,
    pub score: u64,
    pub bump: u8,
}

impl EpochContributorSnapshot {
    pub const SEED: &'static [u8] = SEED_EPOCH_CONTRIBUTOR;
    pub const LEN: usize = 8 + EpochContributorSnapshot::INIT_SPACE;
}

#[account]
#[derive(InitSpace)]
pub struct EpochContributorClaim {
    pub epoch: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub claimed_at: i64,
    pub bump: u8,
}

impl EpochContributorClaim {
    pub const SEED: &'static [u8] = SEED_EPOCH_CLAIM;
    pub const LEN: usize = 8 + EpochContributorClaim::INIT_SPACE;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum BuilderFundBucket {
    Contributors,
    ApiInfra,
    Marketing,
}