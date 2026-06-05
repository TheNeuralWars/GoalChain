// Wager instructions
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TransferChecked};
use crate::state::wager::{Wager, WagerState};
use crate::errors::GoalChainError;
use crate::constants::{BPS_DENOMINATOR};

pub fn create_wager(ctx: Context<CreateWager>, timestamp: i64, amount: u64) -> Result<()> {
    let wager = &mut ctx.accounts.wager;
    wager.player_a = ctx.accounts.player_a.key();
    wager.amount = amount;
    wager.state = WagerState::Created;
    wager.timestamp = timestamp;
    wager.bump = ctx.bumps.wager;

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.player_a_token.to_account_info(),
            to: ctx.accounts.wager_vault.to_account_info(),
            authority: ctx.accounts.player_a.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
        },
    );
    token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;
    Ok(())
}

pub fn accept_wager(ctx: Context<AcceptWager>) -> Result<()> {
    let wager = &mut ctx.accounts.wager;
    require!(
        wager.state == WagerState::Created,
        GoalChainError::WagerNotAvailable
    );
    wager.player_b = Some(ctx.accounts.player_b.key());
    wager.state = WagerState::Accepted;

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.player_b_token.to_account_info(),
            to: ctx.accounts.wager_vault.to_account_info(),
            authority: ctx.accounts.player_b.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
        },
    );
    token_interface::transfer_checked(cpi_ctx, wager.amount, ctx.accounts.token_mint.decimals)?;
    Ok(())
}

pub fn resolve_wager(ctx: Context<ResolveWager>, winner_is_a: bool) -> Result<()> {
    let total_payout;
    let player_a_key;
    let timestamp_bytes;
    let bump_val;
    let wager_account_info = ctx.accounts.wager.to_account_info();

    {
        let wager = &ctx.accounts.wager;
        require!(
            wager.state == WagerState::Accepted,
            GoalChainError::WagerNotReady
        );

        let expected_winner = if winner_is_a {
            wager.player_a
        } else {
            wager.player_b.ok_or(GoalChainError::InvalidWagerWinner)?
        };
        require_keys_eq!(
            ctx.accounts.winner_token.owner,
            expected_winner,
            GoalChainError::InvalidWagerWinner
        );
        require_keys_eq!(
            ctx.accounts.winner_token.mint,
            ctx.accounts.token_mint.key(),
            GoalChainError::InvalidMint
        );

        total_payout = wager
            .amount
            .checked_mul(2)
            .ok_or(GoalChainError::MathOverflow)?;
        player_a_key = wager.player_a;
        timestamp_bytes = wager.timestamp.to_le_bytes();
        bump_val = wager.bump;
    }

    let bump_array = [bump_val];
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"wager",
        player_a_key.as_ref(),
        timestamp_bytes.as_ref(),
        &bump_array,
    ]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.wager_vault.to_account_info(),
            to: ctx.accounts.winner_token.to_account_info(),
            authority: wager_account_info,
            mint: ctx.accounts.token_mint.to_account_info(),
        },
        signer_seeds,
    );
    token_interface::transfer_checked(cpi_ctx, total_payout, ctx.accounts.token_mint.decimals)?;

    ctx.accounts.wager.state = WagerState::Resolved;
    Ok(())
}
