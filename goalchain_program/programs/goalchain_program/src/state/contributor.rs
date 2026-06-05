use anchor_lang::prelude::*;
use crate::constants::SEED_CONTRIBUTOR_SCORE;

/// ContributorScore is defined in builder_fund.rs to keep builder fund logic cohesive.
/// This file exists for API consistency and re-exports the type.

pub use crate::state::builder_fund::ContributorScore;

/// Additional contributor-related constants
pub const CONTRIBUTOR_SCORE_SEED: &[u8] = SEED_CONTRIBUTOR_SCORE;