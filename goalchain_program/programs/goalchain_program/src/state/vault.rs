use crate::constants::{
    SEED_STAKE_VAULT, SEED_FIXTURE_VAULT, SEED_MARKET_VAULT,
    SEED_WAGER_VAULT, SEED_BUILDER_VAULT, SEED_LOCALNET_VAULT,
};

/// Vault PDA seeds - no dedicated account structs, these are token account PDAs
/// Used by instructions for vault authority derivation

pub const STAKE_VAULT_SEED: &[u8] = SEED_STAKE_VAULT;
pub const FIXTURE_VAULT_SEED: &[u8] = SEED_FIXTURE_VAULT;
pub const MARKET_VAULT_SEED: &[u8] = SEED_MARKET_VAULT;
pub const WAGER_VAULT_SEED: &[u8] = SEED_WAGER_VAULT;
pub const BUILDER_VAULT_SEED: &[u8] = SEED_BUILDER_VAULT;
pub const LOCALNET_VAULT_SEED: &[u8] = SEED_LOCALNET_VAULT;