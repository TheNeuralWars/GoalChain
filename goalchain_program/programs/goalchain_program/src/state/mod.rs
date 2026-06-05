//! GoalChain Program State Module
//!
//! Contains all account structs and related types for the GoalChain Solana program.

pub mod config;
pub mod builder_fund;
pub mod fixture;
pub mod live_state;
pub mod market;
pub mod position;
pub mod player;
pub mod player_match;
pub mod vault;
pub mod stake_pool;
pub mod reward_pool;
pub mod contributor;

// Re-export all account structs
pub use config::GlobalConfig;
pub use builder_fund::{
    BuilderFund, ContributorScore, BuilderContributorEpoch,
    EpochContributorSnapshot, EpochContributorClaim, BuilderFundBucket,
};
pub use fixture::{Fixture, MatchStatus, MatchResult, UserBet};
pub use live_state::LiveMatchState;
pub use market::{Market, MarketType, MarketStatus};
pub use position::MarketPosition;
pub use player::{ParodyPlayer, RentalListing};
pub use player_match::PlayerMatchRecord;
pub use stake_pool::UserStake;
pub use reward_pool::{ManagerState, ManagerDailyClaim, StadiumState};