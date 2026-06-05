// Fixture instructions
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked, Mint, TokenAccount, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::fixture::{Fixture, MatchStatus, MatchResult, UserBet};
use crate::state::live_market::LiveMatchState;
use crate::state::market::{Market, MarketStatus, MarketType, MarketPosition};
use crate::errors::GoalChainError;
use crate::constants::{BPS_DENOMINATOR, SPL_STAKE_POOL_PROGRAM_ID, GCH_LAMPORTS};
use crate::utils::split_fee_amounts;

pub fn initialize_fixture(ctx: Context<InitializeFixture>, match_id: String, team_a: String, team_b: String, start_time: i64) -> Result<()> {
    let fixture = &mut ctx.accounts.fixture;
    fixture.match_id = match_id;
    fixture.team_a = team_a;
    fixture.team_b = team_b;
    fixture.start_timestamp = start_time;
    fixture.pool_a = 0;
    fixture.pool_b = 0;
    fixture.pool_draw = 0;
    fixture.total_claimed = 0;
    fixture.total_refunded = 0;
    fixture.status = MatchStatus::Upcoming;
    fixture.winner = None;
    fixture.bump = ctx.bumps.fixture;
    Ok(())
}

pub fn place_bet(ctx: Context<PlaceBet>, prediction: MatchResult, amount: u64) -> Result<()> {
    let cfg = &ctx.accounts.config;
    let fixture = &mut ctx.accounts.fixture;
    let bet = &mut ctx.accounts.user_bet;
    let clock = Clock::get()?;

    require!(
        fixture.status == MatchStatus::Upcoming,
        GoalChainError::BettingClosed
    );

    let cutoff_ts = fixture
        .start_timestamp
        .checked_sub(cfg.cutoff_buffer_seconds)
        .ok_or(GoalChainError::MathOverflow)?;
    require!(
        clock.unix_timestamp <= cutoff_ts,
        GoalChainError::BettingClosed
    );

    bet.owner = ctx.accounts.user.key();
    bet.fixture = fixture.key();
    bet.amount = amount;
    bet.prediction = prediction.clone();
    bet.bet_timestamp = clock.unix_timestamp;
    bet.claimed = false;

    match prediction {
        MatchResult::TeamA => {
            fixture.pool_a = fixture
                .pool_a
                .checked_add(amount)
                .ok_or(GoalChainError::MathOverflow)?
        }
        MatchResult::TeamB => {
            fixture.pool_b = fixture
                .pool_b
                .checked_add(amount)
                .ok_or(GoalChainError::MathOverflow)?
        }
        MatchResult::Draw => {
            fixture.pool_draw = fixture
                .pool_draw
                .checked_add(amount)
                .ok_or(GoalChainError::MathOverflow)?
        }
    }

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.fixture_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
        },
    );
    token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;
    Ok(())
}

pub fn update_fixture_status(ctx: Context<UpdateFixtureStatus>, status: MatchStatus, winner: Option<MatchResult>) -> Result<()> {
    if status == MatchStatus::Completed {
        require!(winner.is_some(), GoalChainError::NoWinnerDeclared);
    }

    let fixture = &mut ctx.accounts.fixture;
    fixture.status = status;
    fixture.winner = winner;
    Ok(())
}
