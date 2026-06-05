// Claim instructions
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked, Burn, Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::fixture::{Fixture, MatchStatus, MatchResult, UserBet};
use crate::state::market::{Market, MarketStatus, MarketPosition};
use crate::errors::GoalChainError;
use crate::constants::{BPS_DENOMINATOR};
use crate::utils::split_fee_amounts;

pub fn claim_bet_payout(ctx: Context<ClaimBetPayout>) -> Result<()> {
    let cfg = &ctx.accounts.config;
    let fixture_account_info = ctx.accounts.fixture.to_account_info();
    let fixture = &mut ctx.accounts.fixture;
    let bet = &mut ctx.accounts.user_bet;

    let (expected_vault, _vault_bump) = Pubkey::find_program_address(
        &[b"fixture_vault", fixture.key().as_ref()],
        ctx.program_id,
    );
    require_keys_eq!(
        ctx.accounts.fixture_vault.key(),
        expected_vault,
        GoalChainError::InvalidVault
    );

    // ... full claim logic from original lib.rs
    Ok(())
}

pub fn refund_bet(ctx: Context<RefundBet>) -> Result<()> {
    let fixture_account_info = ctx.accounts.fixture.to_account_info();
    let fixture = &mut ctx.accounts.fixture;
    let bet = &mut ctx.accounts.user_bet;

    require!(
        fixture.status == MatchStatus::Cancelled,
        GoalChainError::FixtureNotCancelled
    );
    require!(!bet.claimed, GoalChainError::AlreadyClaimed);

    let (expected_vault, _vault_bump) = Pubkey::find_program_address(
        &[b"fixture_vault", fixture.key().as_ref()],
        ctx.program_id,
    );
    require_keys_eq!(
        ctx.accounts.fixture_vault.key(),
        expected_vault,
        GoalChainError::InvalidVault
    );

    // ... full refund logic from original lib.rs
    Ok(())
}

pub fn sweep_fixture_dust(ctx: Context<SweepFixtureDust>) -> Result<()> {
    let fixture = &ctx.accounts.fixture;

    require!(
        fixture.status == MatchStatus::Completed || fixture.status == MatchStatus::Cancelled,
        GoalChainError::MatchNotFinished
    );

    let (expected_vault, _vault_bump) = Pubkey::find_program_address(
        &[b"fixture_vault", fixture.key().as_ref()],
        ctx.program_id,
    );
    require_keys_eq!(
        ctx.accounts.fixture_vault.key(),
        expected_vault,
        GoalChainError::InvalidVault
    );

    // ... full sweep logic
    Ok(())
}
