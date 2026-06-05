// Live markets instructions
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked, Burn};
use crate::state::live_market::LiveMatchState;
use crate::state::market::{Market, MarketStatus, MarketType, MarketPosition, MatchResult};
use crate::state::fixture::Fixture;
use crate::errors::GoalChainError;
use crate::constants::{BPS_DENOMINATOR};
use crate::utils::split_fee_amounts;

pub fn oracle_upsert_live_state(ctx: Context<OracleUpsertLiveState>, minute: u16, score_a: u8, score_b: u8, is_ht: bool, is_ft: bool) -> Result<()> {
    let live = &mut ctx.accounts.live_state;
    live.fixture = ctx.accounts.fixture.key();
    live.minute = minute;
    live.score_a = score_a;
    live.score_b = score_b;
    live.is_ht = is_ht;
    live.is_ft = is_ft;
    live.last_update_ts = Clock::get()?.unix_timestamp;
    live.bump = ctx.bumps.live_state;
    Ok(())
}

pub fn oracle_create_market(ctx: Context<OracleCreateMarket>, market_id: u8, market_type: MarketType, delay_seconds: i64, cooldown_seconds: i64, close_minute: u16, max_goal_diff: u8, require_tied: bool, token_mint: Pubkey) -> Result<()> {
    require!(delay_seconds >= 0, GoalChainError::InvalidMarketConfig);
    require!(cooldown_seconds >= 0, GoalChainError::InvalidMarketConfig);

    let m = &mut ctx.accounts.market;
    m.fixture = ctx.accounts.fixture.key();
    m.market_id = market_id;
    m.market_type = market_type;
    m.status = MarketStatus::Open;
    m.token_mint = token_mint;

    m.delay_seconds = delay_seconds;
    m.cooldown_seconds = cooldown_seconds;
    m.close_minute = close_minute;
    m.max_goal_diff = max_goal_diff;
    m.require_tied = require_tied;

    m.pool_a = 0;
    m.pool_b = 0;
    m.pool_draw = 0;
    m.winner = None;
    m.last_bet_ts = 0;
    m.resolved_ts = None;
    m.bump = ctx.bumps.market;
    Ok(())
}

pub fn oracle_update_market_status(ctx: Context<OracleUpdateMarketStatus>, status: MarketStatus, winner: Option<MatchResult>) -> Result<()> {
    if status == MarketStatus::Resolved {
        require!(winner.is_some(), GoalChainError::NoWinnerDeclared);
        ctx.accounts.market.resolved_ts = Some(Clock::get()?.unix_timestamp);
    }
    ctx.accounts.market.status = status;
    ctx.accounts.market.winner = winner;
    Ok(())
}

pub fn place_market_bet(ctx: Context<PlaceMarketBet>, ticket_id: u64, prediction: MatchResult, amount: u64) -> Result<()> {
    let cfg = &ctx.accounts.config;
    let market = &mut ctx.accounts.market;
    let pos = &mut ctx.accounts.position;
    let live = &ctx.accounts.live_state;
    let clock = Clock::get()?;

    require!(
        market.status == MarketStatus::Open,
        GoalChainError::BettingClosed
    );
    require_keys_eq!(
        market.fixture,
        ctx.accounts.fixture.key(),
        GoalChainError::InvalidMarket
    );
    require_keys_eq!(
        live.fixture,
        ctx.accounts.fixture.key(),
        GoalChainError::InvalidLiveState
    );
    require_keys_eq!(
        market.token_mint,
        ctx.accounts.token_mint.key(),
        GoalChainError::InvalidMint
    );
    require!(
        live.minute <= market.close_minute,
        GoalChainError::BettingClosed
    );

    let diff = if live.score_a >= live.score_b {
        live.score_a - live.score_b
    } else {
        live.score_b - live.score_a
    };
    require!(diff <= market.max_goal_diff, GoalChainError::BettingClosed);
    if market.require_tied {
        require!(live.score_a == live.score_b, GoalChainError::BettingClosed);
    }

    if market.last_bet_ts != 0 {
        let next_allowed = market
            .last_bet_ts
            .checked_add(market.cooldown_seconds)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(
            clock.unix_timestamp >= next_allowed,
            GoalChainError::BettingClosed
        );
    }

    pos.owner = ctx.accounts.user.key();
    pos.market = market.key();
    pos.ticket_id = ticket_id;
    pos.amount = amount;
    pos.prediction = prediction.clone();
    pos.bet_ts = clock.unix_timestamp;
    pos.claimed = false;
    pos.bump = ctx.bumps.position;

    match prediction {
        MatchResult::TeamA => {
            market.pool_a = market
                .pool_a
                .checked_add(amount)
                .ok_or(GoalChainError::MathOverflow)?
        }
        MatchResult::TeamB => {
            market.pool_b = market
                .pool_b
                .checked_add(amount)
                .ok_or(GoalChainError::MathOverflow)?
        }
        MatchResult::Draw => {
            market.pool_draw = market
                .pool_draw
                .checked_add(amount)
                .ok_or(GoalChainError::MathOverflow)?
        }
    }
    market.last_bet_ts = clock.unix_timestamp;

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.market_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
        },
    );
    token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;

    let _ = cfg;
    Ok(())
}

pub fn claim_market_payout(ctx: Context<ClaimMarketPayout>) -> Result<()> {
    let cfg = &ctx.accounts.config;
    let market = &ctx.accounts.market;
    let pos = &mut ctx.accounts.position;
    let clock = Clock::get()?;

    let (expected_vault, _bump) =
        Pubkey::find_program_address(&[b"market_vault", market.key().as_ref()], ctx.program_id);
    require_keys_eq!(
        ctx.accounts.market_vault.key(),
        expected_vault,
        GoalChainError::InvalidVault
    );

    // ... validation logic similar to fixture claims
    // truncated for brevity - full implementation in original lib.rs
    Ok(())
}
