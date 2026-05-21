use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TokenInterface, TokenAccount, Mint, TransferChecked, Burn};
use anchor_spl::token::TokenAccount as SplTokenAccount;
use anchor_spl::associated_token::AssociatedToken;

declare_id!("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");
const SPL_STAKE_POOL_PROGRAM_ID: Pubkey = pubkey!("SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy");

/// $GCH uses 6 decimals: 1 GCH = 1_000_000 base units.
pub const GCH_LAMPORTS: u64 = 1_000_000;
pub const DEFAULT_BASE_YIELD_LAMPORTS: u64 = 100 * GCH_LAMPORTS;
pub const POTION_BURN_LAMPORTS: u64 = 100 * GCH_LAMPORTS;
pub const MAX_BASE_YIELD_LAMPORTS: u64 = 10_000 * GCH_LAMPORTS;
pub const MAX_FEE_BPS: u16 = 100; // 1% hard cap
pub const ARCHITECT_TAX_BPS: u64 = 100; // 1%
pub const BPS_DENOMINATOR: u64 = 10_000;
pub const DEFAULT_SCORE_UPDATE_COOLDOWN_SECONDS: i64 = 0;
pub const DEFAULT_MIN_EPOCH_SCORE: u64 = 1;
pub const DEFAULT_MAX_CONTRIBUTORS_PER_EPOCH: u32 = 500;

/// Maps Genesis Squad rarity tier (metadata) → daily base yield in lamports.
pub fn base_yield_for_rarity_tier(tier: u8) -> u64 {
    match tier {
        4 => 5_000 * GCH_LAMPORTS,  // mythic
        3 => 1_000 * GCH_LAMPORTS,  // legendary
        2 => 250 * GCH_LAMPORTS,    // epic
        1 => 50 * GCH_LAMPORTS,     // rare
        _ => DEFAULT_BASE_YIELD_LAMPORTS,
    }
}

#[program]
pub mod goalchain_program {
    use super::*;

    // --- CONFIG ---
    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        oracle_authority: Pubkey,
        treasury_token_account: Pubkey,
        fee_bps: u16,
        cutoff_buffer_seconds: i64,
        max_sol_per_user: u64,
        presale_active: bool,
    ) -> Result<()> {
        // límite duro para evitar configs absurdas
        require!(fee_bps <= MAX_FEE_BPS, GoalChainError::InvalidConfig); // max 1%
        require!(cutoff_buffer_seconds >= 0, GoalChainError::InvalidConfig);
        require!(cutoff_buffer_seconds <= 24 * 60 * 60, GoalChainError::InvalidConfig); // max 24h
        require!(max_sol_per_user > 0, GoalChainError::InvalidConfig);

        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.oracle_authority = oracle_authority;
        cfg.treasury_token_account = treasury_token_account;
        cfg.fee_bps = fee_bps;
        cfg.cutoff_buffer_seconds = cutoff_buffer_seconds;
        cfg.max_sol_per_user = max_sol_per_user;
        cfg.presale_active = presale_active;
        cfg.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        oracle_authority: Pubkey,
        treasury_token_account: Pubkey,
        fee_bps: u16,
        cutoff_buffer_seconds: i64,
        max_sol_per_user: u64,
        presale_active: bool,
    ) -> Result<()> {
        require!(fee_bps <= MAX_FEE_BPS, GoalChainError::InvalidConfig);
        require!(cutoff_buffer_seconds >= 0, GoalChainError::InvalidConfig);
        require!(cutoff_buffer_seconds <= 24 * 60 * 60, GoalChainError::InvalidConfig);
        require!(max_sol_per_user > 0, GoalChainError::InvalidConfig);

        let cfg = &mut ctx.accounts.config;
        cfg.oracle_authority = oracle_authority;
        cfg.treasury_token_account = treasury_token_account;
        cfg.fee_bps = fee_bps;
        cfg.cutoff_buffer_seconds = cutoff_buffer_seconds;
        cfg.max_sol_per_user = max_sol_per_user;
        cfg.presale_active = presale_active;
        Ok(())
    }

    pub fn initialize_builder_fund(
        ctx: Context<InitializeBuilderFund>,
        contributor_bps: u16,
        api_infra_bps: u16,
        marketing_bps: u16,
    ) -> Result<()> {
        let total_bps = (contributor_bps as u32)
            .checked_add(api_infra_bps as u32)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_add(marketing_bps as u32)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(total_bps == BPS_DENOMINATOR as u32, GoalChainError::InvalidBuilderFundWeights);

        let builder_fund = &mut ctx.accounts.builder_fund;
        builder_fund.admin = ctx.accounts.admin.key();
        builder_fund.config = ctx.accounts.config.key();
        builder_fund.token_mint = ctx.accounts.token_mint.key();
        builder_fund.contributor_vault = ctx.accounts.contributor_vault.key();
        builder_fund.api_infra_vault = ctx.accounts.api_infra_vault.key();
        builder_fund.marketing_vault = ctx.accounts.marketing_vault.key();
        builder_fund.contributor_bps = contributor_bps;
        builder_fund.api_infra_bps = api_infra_bps;
        builder_fund.marketing_bps = marketing_bps;
        builder_fund.total_inflow = 0;
        builder_fund.contributor_allocated = 0;
        builder_fund.api_infra_allocated = 0;
        builder_fund.marketing_allocated = 0;
        builder_fund.total_contributor_score = 0;
        builder_fund.contributor_claimed_total = 0;
        builder_fund.contributor_spent = 0;
        builder_fund.api_infra_spent = 0;
        builder_fund.marketing_spent = 0;
        builder_fund.current_epoch = 0;
        builder_fund.score_update_cooldown_seconds = DEFAULT_SCORE_UPDATE_COOLDOWN_SECONDS;
        builder_fund.min_epoch_score = DEFAULT_MIN_EPOCH_SCORE;
        builder_fund.max_contributors_per_epoch = DEFAULT_MAX_CONTRIBUTORS_PER_EPOCH;
        builder_fund.bump = ctx.bumps.builder_fund;

        emit!(BuilderFundInitialized {
            builder_fund: builder_fund.key(),
            token_mint: builder_fund.token_mint,
            contributor_bps,
            api_infra_bps,
            marketing_bps,
        });
        Ok(())
    }

    pub fn update_builder_fund_guardrails(
        ctx: Context<UpdateBuilderFundWeights>,
        score_update_cooldown_seconds: i64,
        min_epoch_score: u64,
        max_contributors_per_epoch: u32,
    ) -> Result<()> {
        require!(score_update_cooldown_seconds >= 0, GoalChainError::InvalidConfig);
        require!(min_epoch_score > 0, GoalChainError::InvalidConfig);
        require!(max_contributors_per_epoch > 0, GoalChainError::InvalidConfig);

        let builder_fund = &mut ctx.accounts.builder_fund;
        builder_fund.score_update_cooldown_seconds = score_update_cooldown_seconds;
        builder_fund.min_epoch_score = min_epoch_score;
        builder_fund.max_contributors_per_epoch = max_contributors_per_epoch;

        emit!(BuilderFundGuardrailsUpdated {
            builder_fund: builder_fund.key(),
            score_update_cooldown_seconds,
            min_epoch_score,
            max_contributors_per_epoch,
        });
        Ok(())
    }

    pub fn update_builder_fund_weights(
        ctx: Context<UpdateBuilderFundWeights>,
        contributor_bps: u16,
        api_infra_bps: u16,
        marketing_bps: u16,
    ) -> Result<()> {
        let total_bps = (contributor_bps as u32)
            .checked_add(api_infra_bps as u32)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_add(marketing_bps as u32)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(total_bps == BPS_DENOMINATOR as u32, GoalChainError::InvalidBuilderFundWeights);

        let builder_fund = &mut ctx.accounts.builder_fund;
        builder_fund.contributor_bps = contributor_bps;
        builder_fund.api_infra_bps = api_infra_bps;
        builder_fund.marketing_bps = marketing_bps;

        emit!(BuilderFundWeightsUpdated {
            builder_fund: builder_fund.key(),
            contributor_bps,
            api_infra_bps,
            marketing_bps,
        });
        Ok(())
    }

    pub fn fund_builder_fund(ctx: Context<FundBuilderFund>, amount: u64) -> Result<()> {
        require!(amount > 0, GoalChainError::InvalidConfig);
        let builder_fund = &mut ctx.accounts.builder_fund;

        let contributor_amount = ((amount as u128)
            .checked_mul(builder_fund.contributor_bps as u128)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(GoalChainError::MathOverflow)?) as u64;
        let api_infra_amount = ((amount as u128)
            .checked_mul(builder_fund.api_infra_bps as u128)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR as u128)
            .ok_or(GoalChainError::MathOverflow)?) as u64;
        let marketing_amount = amount
            .checked_sub(contributor_amount)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_sub(api_infra_amount)
            .ok_or(GoalChainError::MathOverflow)?;

        if contributor_amount > 0 {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.contributor_vault.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
            );
            token_interface::transfer_checked(cpi_ctx, contributor_amount, ctx.accounts.token_mint.decimals)?;
        }

        if api_infra_amount > 0 {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.api_infra_vault.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
            );
            token_interface::transfer_checked(cpi_ctx, api_infra_amount, ctx.accounts.token_mint.decimals)?;
        }

        if marketing_amount > 0 {
            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.payer_token_account.to_account_info(),
                    to: ctx.accounts.marketing_vault.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
            );
            token_interface::transfer_checked(cpi_ctx, marketing_amount, ctx.accounts.token_mint.decimals)?;
        }

        builder_fund.total_inflow = builder_fund
            .total_inflow
            .checked_add(amount)
            .ok_or(GoalChainError::MathOverflow)?;
        builder_fund.contributor_allocated = builder_fund
            .contributor_allocated
            .checked_add(contributor_amount)
            .ok_or(GoalChainError::MathOverflow)?;
        builder_fund.api_infra_allocated = builder_fund
            .api_infra_allocated
            .checked_add(api_infra_amount)
            .ok_or(GoalChainError::MathOverflow)?;
        builder_fund.marketing_allocated = builder_fund
            .marketing_allocated
            .checked_add(marketing_amount)
            .ok_or(GoalChainError::MathOverflow)?;

        emit!(BuilderFundFunded {
            builder_fund: builder_fund.key(),
            payer: ctx.accounts.payer.key(),
            total_amount: amount,
            contributor_amount,
            api_infra_amount,
            marketing_amount,
        });
        Ok(())
    }

    pub fn spend_builder_fund(
        ctx: Context<SpendBuilderFund>,
        bucket: BuilderFundBucket,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, GoalChainError::InvalidConfig);
        let builder_fund_info = ctx.accounts.builder_fund.to_account_info();
        let builder_fund = &mut ctx.accounts.builder_fund;

        let expected_source = match bucket {
            BuilderFundBucket::Contributors => builder_fund.contributor_vault,
            BuilderFundBucket::ApiInfra => builder_fund.api_infra_vault,
            BuilderFundBucket::Marketing => builder_fund.marketing_vault,
        };
        require_keys_eq!(ctx.accounts.source_vault.key(), expected_source, GoalChainError::InvalidBuilderFundBucket);

        let config_key = ctx.accounts.config.key();
        let seeds = &[
            b"builder_fund".as_ref(),
            config_key.as_ref(),
            &[builder_fund.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.source_vault.to_account_info(),
                to: ctx.accounts.destination_token_account.to_account_info(),
                authority: builder_fund_info,
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer,
        );
        token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;

        match bucket {
            BuilderFundBucket::Contributors => {
                builder_fund.contributor_spent = builder_fund
                    .contributor_spent
                    .checked_add(amount)
                    .ok_or(GoalChainError::MathOverflow)?;
            }
            BuilderFundBucket::ApiInfra => {
                builder_fund.api_infra_spent = builder_fund
                    .api_infra_spent
                    .checked_add(amount)
                    .ok_or(GoalChainError::MathOverflow)?;
            }
            BuilderFundBucket::Marketing => {
                builder_fund.marketing_spent = builder_fund
                    .marketing_spent
                    .checked_add(amount)
                    .ok_or(GoalChainError::MathOverflow)?;
            }
        }

        emit!(BuilderFundSpent {
            builder_fund: builder_fund.key(),
            bucket,
            amount,
            recipient: ctx.accounts.destination_token_account.key(),
        });
        Ok(())
    }

    pub fn upsert_contributor_score(
        ctx: Context<UpsertContributorScore>,
        score: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let builder_fund = &mut ctx.accounts.builder_fund;
        let contributor_score = &mut ctx.accounts.contributor_score;

        let previous_score = contributor_score.score;
        if contributor_score.builder_fund == Pubkey::default() {
            contributor_score.builder_fund = builder_fund.key();
            contributor_score.contributor = ctx.accounts.contributor.key();
            contributor_score.claimed_amount = 0;
            contributor_score.bump = ctx.bumps.contributor_score;
        } else {
            require_keys_eq!(
                contributor_score.builder_fund,
                builder_fund.key(),
                GoalChainError::InvalidContributorScore
            );
            require_keys_eq!(
                contributor_score.contributor,
                ctx.accounts.contributor.key(),
                GoalChainError::InvalidContributorScore
            );
            if builder_fund.score_update_cooldown_seconds > 0 {
                let next_allowed = contributor_score
                    .last_update_timestamp
                    .checked_add(builder_fund.score_update_cooldown_seconds)
                    .ok_or(GoalChainError::MathOverflow)?;
                require!(clock.unix_timestamp >= next_allowed, GoalChainError::ScoreUpdateCooldown);
            }
        }

        if score >= previous_score {
            let delta = score.checked_sub(previous_score).ok_or(GoalChainError::MathOverflow)?;
            builder_fund.total_contributor_score = builder_fund
                .total_contributor_score
                .checked_add(delta)
                .ok_or(GoalChainError::MathOverflow)?;
        } else {
            let delta = previous_score.checked_sub(score).ok_or(GoalChainError::MathOverflow)?;
            builder_fund.total_contributor_score = builder_fund
                .total_contributor_score
                .checked_sub(delta)
                .ok_or(GoalChainError::MathOverflow)?;
        }

        contributor_score.score = score;
        contributor_score.last_update_timestamp = clock.unix_timestamp;

        emit!(ContributorScoreUpdated {
            builder_fund: builder_fund.key(),
            contributor: contributor_score.contributor,
            score,
            total_contributor_score: builder_fund.total_contributor_score,
        });
        Ok(())
    }

    pub fn claim_contributor_rewards(ctx: Context<ClaimContributorRewards>) -> Result<()> {
        let builder_fund_info = ctx.accounts.builder_fund.to_account_info();
        let builder_fund = &mut ctx.accounts.builder_fund;
        let contributor_score = &mut ctx.accounts.contributor_score;

        require!(builder_fund.total_contributor_score > 0, GoalChainError::NoContributorScore);
        require!(contributor_score.score > 0, GoalChainError::NoContributorScore);

        let entitlement = ((builder_fund.contributor_allocated as u128)
            .checked_mul(contributor_score.score as u128)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_div(builder_fund.total_contributor_score as u128)
            .ok_or(GoalChainError::MathOverflow)?) as u64;
        let claimable = entitlement
            .checked_sub(contributor_score.claimed_amount)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(claimable > 0, GoalChainError::NoClaimableRewards);

        let config_key = ctx.accounts.config.key();
        let seeds = &[
            b"builder_fund".as_ref(),
            config_key.as_ref(),
            &[builder_fund.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.contributor_vault.to_account_info(),
                to: ctx.accounts.contributor_token_account.to_account_info(),
                authority: builder_fund_info,
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer,
        );
        token_interface::transfer_checked(cpi_ctx, claimable, ctx.accounts.token_mint.decimals)?;

        contributor_score.claimed_amount = contributor_score
            .claimed_amount
            .checked_add(claimable)
            .ok_or(GoalChainError::MathOverflow)?;
        builder_fund.contributor_claimed_total = builder_fund
            .contributor_claimed_total
            .checked_add(claimable)
            .ok_or(GoalChainError::MathOverflow)?;
        builder_fund.contributor_spent = builder_fund
            .contributor_spent
            .checked_add(claimable)
            .ok_or(GoalChainError::MathOverflow)?;

        emit!(ContributorRewardsClaimed {
            builder_fund: builder_fund.key(),
            contributor: ctx.accounts.contributor.key(),
            amount: claimable,
            claimed_total: contributor_score.claimed_amount,
        });
        Ok(())
    }

    pub fn start_contributor_epoch(
        ctx: Context<StartContributorEpoch>,
        epoch_id: u64,
        contributor_pool: u64,
    ) -> Result<()> {
        require!(contributor_pool > 0, GoalChainError::InvalidConfig);
        let clock = Clock::get()?;
        let builder_fund = &mut ctx.accounts.builder_fund;
        let epoch = &mut ctx.accounts.builder_epoch;

        let expected_epoch_id = builder_fund
            .current_epoch
            .checked_add(1)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(epoch_id == expected_epoch_id, GoalChainError::InvalidEpochId);
        require!(
            ctx.accounts.contributor_vault.amount >= contributor_pool,
            GoalChainError::InsufficientVaultBalance
        );

        epoch.builder_fund = builder_fund.key();
        epoch.epoch_id = epoch_id;
        epoch.contributor_pool = contributor_pool;
        epoch.total_score_snapshot = 0;
        epoch.contributor_count = 0;
        epoch.finalized = false;
        epoch.created_at = clock.unix_timestamp;
        epoch.finalized_at = 0;
        epoch.bump = ctx.bumps.builder_epoch;

        builder_fund.current_epoch = epoch_id;

        emit!(ContributorEpochStarted {
            builder_fund: builder_fund.key(),
            epoch_id,
            contributor_pool,
        });
        Ok(())
    }

    pub fn register_contributor_epoch_snapshot(
        ctx: Context<RegisterContributorEpochSnapshot>,
    ) -> Result<()> {
        let epoch = &mut ctx.accounts.builder_epoch;
        let snapshot = &mut ctx.accounts.epoch_contributor_snapshot;
        let contributor_score = &ctx.accounts.contributor_score;
        let builder_fund = &ctx.accounts.builder_fund;

        require!(!epoch.finalized, GoalChainError::EpochAlreadyFinalized);
        require!(contributor_score.score > 0, GoalChainError::NoEpochSnapshotScore);
        require!(
            contributor_score.score >= builder_fund.min_epoch_score,
            GoalChainError::ContributorScoreTooLow
        );
        require!(
            epoch.contributor_count < builder_fund.max_contributors_per_epoch,
            GoalChainError::EpochContributorLimitReached
        );

        snapshot.epoch = epoch.key();
        snapshot.contributor = ctx.accounts.contributor.key();
        snapshot.score = contributor_score.score;
        snapshot.bump = ctx.bumps.epoch_contributor_snapshot;

        epoch.total_score_snapshot = epoch
            .total_score_snapshot
            .checked_add(snapshot.score)
            .ok_or(GoalChainError::MathOverflow)?;
        epoch.contributor_count = epoch
            .contributor_count
            .checked_add(1)
            .ok_or(GoalChainError::MathOverflow)?;

        emit!(ContributorEpochSnapshotRegistered {
            epoch: epoch.key(),
            contributor: snapshot.contributor,
            score: snapshot.score,
        });
        Ok(())
    }

    pub fn finalize_contributor_epoch(ctx: Context<FinalizeContributorEpoch>) -> Result<()> {
        let clock = Clock::get()?;
        let epoch = &mut ctx.accounts.builder_epoch;
        require!(!epoch.finalized, GoalChainError::EpochAlreadyFinalized);
        require!(epoch.total_score_snapshot > 0, GoalChainError::NoEpochSnapshotScore);
        epoch.finalized = true;
        epoch.finalized_at = clock.unix_timestamp;

        emit!(ContributorEpochFinalized {
            epoch: epoch.key(),
            epoch_id: epoch.epoch_id,
            total_score_snapshot: epoch.total_score_snapshot,
            contributor_count: epoch.contributor_count,
        });
        Ok(())
    }

    pub fn claim_contributor_epoch(ctx: Context<ClaimContributorEpoch>) -> Result<()> {
        let clock = Clock::get()?;
        let builder_fund_info = ctx.accounts.builder_fund.to_account_info();
        let builder_fund = &mut ctx.accounts.builder_fund;
        let epoch = &ctx.accounts.builder_epoch;
        let snapshot = &ctx.accounts.epoch_contributor_snapshot;
        let claim = &mut ctx.accounts.epoch_contributor_claim;

        require!(epoch.finalized, GoalChainError::EpochNotFinalized);
        require!(snapshot.score > 0, GoalChainError::NoEpochSnapshotScore);
        require_keys_eq!(
            ctx.accounts.contributor_vault.key(),
            builder_fund.contributor_vault,
            GoalChainError::InvalidBuilderFundBucket
        );

        let contributor_vault_ta = SplTokenAccount::try_deserialize(
            &mut &ctx.accounts.contributor_vault.data.borrow()[..]
        )?;
        let contributor_token_ta = SplTokenAccount::try_deserialize(
            &mut &ctx.accounts.contributor_token_account.data.borrow()[..]
        )?;
        require_keys_eq!(
            contributor_vault_ta.mint,
            ctx.accounts.token_mint.key(),
            GoalChainError::InvalidMint
        );
        require_keys_eq!(
            contributor_token_ta.mint,
            ctx.accounts.token_mint.key(),
            GoalChainError::InvalidMint
        );
        require_keys_eq!(
            contributor_token_ta.owner,
            ctx.accounts.contributor.key(),
            GoalChainError::Unauthorized
        );

        let claim_amount = ((epoch.contributor_pool as u128)
            .checked_mul(snapshot.score as u128)
            .ok_or(GoalChainError::MathOverflow)?
            .checked_div(epoch.total_score_snapshot as u128)
            .ok_or(GoalChainError::MathOverflow)?) as u64;
        require!(claim_amount > 0, GoalChainError::NoClaimableRewards);

        let config_key = ctx.accounts.config.key();
        let seeds = &[
            b"builder_fund".as_ref(),
            config_key.as_ref(),
            &[builder_fund.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.contributor_vault.to_account_info(),
                to: ctx.accounts.contributor_token_account.to_account_info(),
                authority: builder_fund_info,
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer,
        );
        token_interface::transfer_checked(cpi_ctx, claim_amount, ctx.accounts.token_mint.decimals)?;

        claim.epoch = epoch.key();
        claim.contributor = ctx.accounts.contributor.key();
        claim.amount = claim_amount;
        claim.claimed_at = clock.unix_timestamp;
        claim.bump = ctx.bumps.epoch_contributor_claim;

        builder_fund.contributor_claimed_total = builder_fund
            .contributor_claimed_total
            .checked_add(claim_amount)
            .ok_or(GoalChainError::MathOverflow)?;
        builder_fund.contributor_spent = builder_fund
            .contributor_spent
            .checked_add(claim_amount)
            .ok_or(GoalChainError::MathOverflow)?;

        emit!(ContributorEpochClaimed {
            epoch: epoch.key(),
            contributor: claim.contributor,
            amount: claim.amount,
        });
        Ok(())
    }

    // 1. LOCKING: El usuario deposita $GCH
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;

        if user_stake.amount == 0 {
            user_stake.start_timestamp = clock.unix_timestamp;
        } else {
            require!(user_stake.unclaimed_rewards == 0, GoalChainError::MustClaimFirst);
        }

        user_stake.amount = user_stake.amount.checked_add(amount).ok_or(GoalChainError::MathOverflow)?;
        user_stake.owner = ctx.accounts.user.key();

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.stake_vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            }
        );
        token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount >= amount, GoalChainError::InsufficientFunds);
        user_stake.amount = user_stake.amount.checked_sub(amount).ok_or(GoalChainError::MathOverflow)?;

        let seeds = &[b"config".as_ref(), &[ctx.accounts.config.bump]];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.stake_vault_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer,
        );
        token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;

        Ok(())
    }

    pub fn init_parody_player(
        ctx: Context<InitializeParodyPlayer>,
        player_id: String,
        name: String,
        initial_speed: u8,
        initial_shot_power: u8,
        owner: Pubkey,
        initial_base_yield: u64,
    ) -> Result<()> {
        require!(initial_base_yield > 0, GoalChainError::InvalidConfig);
        require!(initial_base_yield <= MAX_BASE_YIELD_LAMPORTS, GoalChainError::InvalidConfig);

        let player = &mut ctx.accounts.parody_player;
        player.owner = owner;
        player.last_claim_timestamp = 0;
        player.player_id = player_id;
        player.name = name;
        player.real_world_goals = 0;
        player.real_world_assists = 0;
        player.matches_played = 0;
        player.speed = initial_speed;
        player.shot_power = initial_shot_power;
        player.base_yield_rate = initial_base_yield;
        player.current_stamina = 100;
        player.is_eliminated = false;
        player.equipped_stadium_id = None;
        player.nation_id = 0;
        player.visual_background = 0;
        player.equipped_jersey = None;
        player.equipped_boots = None;
        player.win_streak = 0;
        player.last_match_result = 0;
        player.has_shield_jersey = false;
        player.bump = ctx.bumps.parody_player;
        Ok(())
    }

    pub fn update_player_stats(
        ctx: Context<UpdatePlayerStats>,
        new_goals: u8,
        new_assists: u8
    ) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        player.real_world_goals = player.real_world_goals.checked_add(new_goals).ok_or(GoalChainError::MathOverflow)?;
        player.real_world_assists = player.real_world_assists.checked_add(new_assists).ok_or(GoalChainError::MathOverflow)?;
        player.shot_power = player.shot_power.checked_add(new_goals).ok_or(GoalChainError::MathOverflow)?;
        Ok(())
    }

    pub fn list_for_rent(ctx: Context<ListForRent>, price_per_match: u64) -> Result<()> {
        let listing = &mut ctx.accounts.rental_listing;
        listing.owner = ctx.accounts.owner.key();
        listing.price_per_match = price_per_match;
        listing.current_borrower = None;
        listing.is_active = true;
        Ok(())
    }

    pub fn rent_nft(ctx: Context<RentNft>) -> Result<()> {
        let listing = &mut ctx.accounts.rental_listing;
        require!(listing.is_active, GoalChainError::ListingNotActive);
        require!(listing.current_borrower.is_none(), GoalChainError::AlreadyRented);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.borrower_token_account.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.borrower.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            }
        );
        token_interface::transfer_checked(cpi_ctx, listing.price_per_match, ctx.accounts.token_mint.decimals)?;
        listing.current_borrower = Some(ctx.accounts.borrower.key());
        Ok(())
    }

    pub fn create_wager(ctx: Context<CreateWager>, timestamp: i64, amount: u64) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        wager.player_a = ctx.accounts.player_a.key();
        wager.amount = amount;
        wager.state = WagerState::Created;
        wager.timestamp = timestamp;
        wager.bump = ctx.bumps.wager;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.player_a_token.to_account_info(),
                to: ctx.accounts.wager_vault.to_account_info(),
                authority: ctx.accounts.player_a.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            }
        );
        token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;
        Ok(())
    }

    pub fn accept_wager(ctx: Context<AcceptWager>) -> Result<()> {
        let wager = &mut ctx.accounts.wager;
        require!(wager.state == WagerState::Created, GoalChainError::WagerNotAvailable);
        wager.player_b = Some(ctx.accounts.player_b.key());
        wager.state = WagerState::Accepted;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.player_b_token.to_account_info(),
                to: ctx.accounts.wager_vault.to_account_info(),
                authority: ctx.accounts.player_b.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            }
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
            require!(wager.state == WagerState::Accepted, GoalChainError::WagerNotReady);

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

            total_payout = wager.amount.checked_mul(2).ok_or(GoalChainError::MathOverflow)?;
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
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.wager_vault.to_account_info(),
                to: ctx.accounts.winner_token.to_account_info(),
                authority: wager_account_info,
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds
        );
        token_interface::transfer_checked(cpi_ctx, total_payout, ctx.accounts.token_mint.decimals)?;

        ctx.accounts.wager.state = WagerState::Resolved;
        Ok(())
    }

    // --- FIXTURES (MVP) ---
    pub fn initialize_fixture(
        ctx: Context<InitializeFixture>,
        match_id: String,
        team_a: String,
        team_b: String,
        start_time: i64
    ) -> Result<()> {
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

        require!(fixture.status == MatchStatus::Upcoming, GoalChainError::BettingClosed);

        let cutoff_ts = fixture
            .start_timestamp
            .checked_sub(cfg.cutoff_buffer_seconds)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(clock.unix_timestamp <= cutoff_ts, GoalChainError::BettingClosed);

        bet.owner = ctx.accounts.user.key();
        bet.fixture = fixture.key();
        bet.amount = amount;
        bet.prediction = prediction.clone();
        bet.bet_timestamp = clock.unix_timestamp;
        bet.claimed = false;

        match prediction {
            MatchResult::TeamA => fixture.pool_a = fixture.pool_a.checked_add(amount).ok_or(GoalChainError::MathOverflow)?,
            MatchResult::TeamB => fixture.pool_b = fixture.pool_b.checked_add(amount).ok_or(GoalChainError::MathOverflow)?,
            MatchResult::Draw => fixture.pool_draw = fixture.pool_draw.checked_add(amount).ok_or(GoalChainError::MathOverflow)?,
        }

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.fixture_vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            }
        );
        token_interface::transfer_checked(cpi_ctx, amount, ctx.accounts.token_mint.decimals)?;
        Ok(())
    }

    // --- JITOSOL PRESALE VAULT ($GCH LAUNCHPAD) ---
    pub fn contribute_presale(ctx: Context<ContributePresale>, amount: u64) -> Result<()> {
        let cfg = &ctx.accounts.config;
        require!(cfg.presale_active, GoalChainError::PresaleInactive);
        require!(amount > 0, GoalChainError::InvalidConfig);

        let presale = &mut ctx.accounts.presale_allocation;
        let new_total = presale
            .sol_deposited
            .checked_add(amount)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(new_total <= cfg.max_sol_per_user, GoalChainError::PresaleLimitExceeded);

        if presale.sol_deposited == 0 {
            presale.owner = ctx.accounts.user.key();
            presale.timestamp = Clock::get()?.unix_timestamp;
        }
        presale.sol_deposited = new_total;

        // Invoke Jito's Stake Pool `deposit_sol` instruction via CPI manually (avoiding dependency hell)
        let mut ix_data = vec![14]; // DepositSol discriminator
        ix_data.extend_from_slice(&amount.to_le_bytes());

        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: ctx.accounts.stake_pool_program.key(),
            accounts: vec![
                AccountMeta::new(ctx.accounts.stake_pool.key(), false),
                AccountMeta::new_readonly(ctx.accounts.withdraw_authority.key(), false),
                AccountMeta::new(ctx.accounts.reserve_stake.key(), false),
                AccountMeta::new(ctx.accounts.user.key(), true),
                AccountMeta::new(ctx.accounts.treasury_jito_ata.key(), false),
                AccountMeta::new(ctx.accounts.manager_fee_account.key(), false),
                AccountMeta::new(ctx.accounts.referral_fee_account.key(), false),
                AccountMeta::new(ctx.accounts.pool_mint.key(), false),
                AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
                AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
            ],
            data: ix_data,
        };

        let bypass_requested =
            ctx.accounts.stake_pool_program.key() == anchor_lang::solana_program::system_program::ID;
        let allow_local_bypass = !cfg!(feature = "mainnet");

        if bypass_requested {
            require!(allow_local_bypass, GoalChainError::InvalidStakePoolProgram);
            msg!("[GoalChain] Bypassing Jito CPI for localnet testing.");
            let (expected_vault, _vault_bump) = Pubkey::find_program_address(
                &[b"localnet_vault"],
                ctx.program_id,
            );
            require_keys_eq!(ctx.accounts.reserve_stake.key(), expected_vault, GoalChainError::InvalidVault);

            // Simulate SOL deposit by transferring SOL from user to reserve_stake
            let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.reserve_stake.key(),
                amount,
            );
            anchor_lang::solana_program::program::invoke(
                &transfer_ix,
                &[
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.reserve_stake.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;
        } else {
            require_keys_eq!(
                ctx.accounts.stake_pool_program.key(),
                SPL_STAKE_POOL_PROGRAM_ID,
                GoalChainError::InvalidStakePoolProgram
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.stake_pool.to_account_info(),
                    ctx.accounts.withdraw_authority.to_account_info(),
                    ctx.accounts.reserve_stake.to_account_info(),
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.treasury_jito_ata.to_account_info(),
                    ctx.accounts.manager_fee_account.to_account_info(),
                    ctx.accounts.referral_fee_account.to_account_info(),
                    ctx.accounts.pool_mint.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.stake_pool_program.to_account_info(),
                ]
            )?;
        }

        Ok(())
    }

    pub fn update_fixture_status(
        ctx: Context<UpdateFixtureStatus>,
        status: MatchStatus,
        winner: Option<MatchResult>
    ) -> Result<()> {
        // regla de consistencia mínima
        if status == MatchStatus::Completed {
            require!(winner.is_some(), GoalChainError::NoWinnerDeclared);
        }

        let fixture = &mut ctx.accounts.fixture;
        fixture.status = status;
        fixture.winner = winner;
        Ok(())
    }

    pub fn claim_bet_payout(ctx: Context<ClaimBetPayout>) -> Result<()> {
        let cfg = &ctx.accounts.config;
        let fixture_account_info = ctx.accounts.fixture.to_account_info();
        let fixture = &mut ctx.accounts.fixture;
        let bet = &mut ctx.accounts.user_bet;

        // --- hardening: validar vault PDA + mints en runtime (sin agrandar el stack de Accounts) ---
        let (expected_vault, _vault_bump) = Pubkey::find_program_address(
            &[b"fixture_vault", fixture.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(ctx.accounts.fixture_vault.key(), expected_vault, GoalChainError::InvalidVault);

        let user_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.user_token_account.data.borrow()[..])?;
        let vault_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.fixture_vault.data.borrow()[..])?;
        let treasury_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.treasury_token_account.data.borrow()[..])?;

        require_keys_eq!(user_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(vault_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(treasury_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);

        require!(fixture.status != MatchStatus::Cancelled, GoalChainError::UseRefundForCancelledFixture);
        require!(fixture.status == MatchStatus::Completed, GoalChainError::MatchNotFinished);
        require!(!bet.claimed, GoalChainError::AlreadyClaimed);

        let winning_result = fixture.winner.as_ref().ok_or(GoalChainError::NoWinnerDeclared)?;
        require!(bet.prediction == *winning_result, GoalChainError::NotAWinner);

        let winning_pool = match winning_result {
            MatchResult::TeamA => fixture.pool_a,
            MatchResult::TeamB => fixture.pool_b,
            MatchResult::Draw => fixture.pool_draw,
        };
        require!(winning_pool > 0, GoalChainError::InvalidPool);

        let total_pool = fixture
            .pool_a
            .checked_add(fixture.pool_b).ok_or(GoalChainError::MathOverflow)?
            .checked_add(fixture.pool_draw).ok_or(GoalChainError::MathOverflow)?;

        // --- payout base (sin fees) ---
        // share "bruto" del usuario sobre el total_pool (parimutuel)
        let gross_user_share = ((bet.amount as u128)
            .checked_mul(total_pool as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(winning_pool as u128).ok_or(GoalChainError::MathOverflow)?) as u64;

        // --- fee proporcional por claim ---
        // fee sobre el payout del usuario (no global), evita sobrecobro cuando reclaman múltiples ganadores.
        let user_fee = ((gross_user_share as u128)
            .checked_mul(cfg.fee_bps as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(10_000).ok_or(GoalChainError::MathOverflow)?) as u64;

        let user_net_share = gross_user_share
            .checked_sub(user_fee)
            .ok_or(GoalChainError::MathOverflow)?;
        let payout_total = user_net_share
            .checked_add(user_fee)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(vault_ta.amount >= payout_total, GoalChainError::InsufficientVaultBalance);

        fixture.total_claimed = fixture
            .total_claimed
            .checked_add(gross_user_share)
            .ok_or(GoalChainError::MathOverflow)?;
        require!(fixture.total_claimed <= total_pool, GoalChainError::InsufficientVaultBalance);

        // marcar claimed antes de transfer (ataques por reintentos no cambian estado)
        bet.claimed = true;

        // signer seeds para authority = fixture PDA
        let bump_val = fixture.bump;
        let bump_arr = [bump_val];
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"fixture",
            fixture.match_id.as_bytes(),
            &bump_arr,
        ]];

        // 1) payout neto al usuario
        let cpi_user = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.fixture_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: fixture_account_info.clone(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds,
        );
        token_interface::transfer_checked(cpi_user, user_net_share, ctx.accounts.token_mint.decimals)?;

        // 2) fee del usuario a treasury (si > 0)
        if user_fee > 0 {
            let cpi_fee = CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.fixture_vault.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: fixture_account_info.clone(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
                signer_seeds,
            );
            token_interface::transfer_checked(cpi_fee, user_fee, ctx.accounts.token_mint.decimals)?;
        }

        Ok(())
    }

    pub fn refund_bet(ctx: Context<RefundBet>) -> Result<()> {
        let fixture_account_info = ctx.accounts.fixture.to_account_info();
        let fixture = &mut ctx.accounts.fixture;
        let bet = &mut ctx.accounts.user_bet;

        require!(fixture.status == MatchStatus::Cancelled, GoalChainError::FixtureNotCancelled);
        require!(!bet.claimed, GoalChainError::AlreadyClaimed);

        let (expected_vault, _vault_bump) = Pubkey::find_program_address(
            &[b"fixture_vault", fixture.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(ctx.accounts.fixture_vault.key(), expected_vault, GoalChainError::InvalidVault);

        let user_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.user_token_account.data.borrow()[..])?;
        let vault_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.fixture_vault.data.borrow()[..])?;
        require_keys_eq!(user_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(vault_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require!(vault_ta.amount >= bet.amount, GoalChainError::InsufficientVaultBalance);

        bet.claimed = true;
        fixture.total_refunded = fixture
            .total_refunded
            .checked_add(bet.amount)
            .ok_or(GoalChainError::MathOverflow)?;

        let bump_val = fixture.bump;
        let bump_arr = [bump_val];
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"fixture",
            fixture.match_id.as_bytes(),
            &bump_arr,
        ]];

        let cpi_refund = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.fixture_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: fixture_account_info,
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds,
        );
        token_interface::transfer_checked(cpi_refund, bet.amount, ctx.accounts.token_mint.decimals)?;
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
        require_keys_eq!(ctx.accounts.fixture_vault.key(), expected_vault, GoalChainError::InvalidVault);

        let vault_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.fixture_vault.data.borrow()[..])?;
        let treasury_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.treasury_token_account.data.borrow()[..])?;
        require_keys_eq!(vault_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(treasury_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);

        if vault_ta.amount == 0 {
            return Ok(());
        }

        let bump_val = fixture.bump;
        let bump_arr = [bump_val];
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"fixture",
            fixture.match_id.as_bytes(),
            &bump_arr,
        ]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.fixture_vault.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.fixture.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds,
        );
        token_interface::transfer_checked(cpi_ctx, vault_ta.amount, ctx.accounts.token_mint.decimals)?;
        Ok(())
    }

    // ---------------- LIVE MARKETS (PARIMUTUEL) ----------------

    pub fn oracle_upsert_live_state(
        ctx: Context<OracleUpsertLiveState>,
        minute: u16,
        score_a: u8,
        score_b: u8,
        is_ht: bool,
        is_ft: bool,
    ) -> Result<()> {
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

    pub fn oracle_create_market(
        ctx: Context<OracleCreateMarket>,
        market_id: u8,
        market_type: MarketType,
        // risk params
        delay_seconds: i64,
        cooldown_seconds: i64,
        close_minute: u16,
        max_goal_diff: u8,
        require_tied: bool,
        // market routing
        token_mint: Pubkey,
    ) -> Result<()> {
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

    pub fn oracle_update_market_status(
        ctx: Context<OracleUpdateMarketStatus>,
        status: MarketStatus,
        winner: Option<MatchResult>,
    ) -> Result<()> {
        if status == MarketStatus::Resolved {
            require!(winner.is_some(), GoalChainError::NoWinnerDeclared);
            ctx.accounts.market.resolved_ts = Some(Clock::get()?.unix_timestamp);
        }
        ctx.accounts.market.status = status;
        ctx.accounts.market.winner = winner;
        Ok(())
    }

    pub fn place_market_bet(
        ctx: Context<PlaceMarketBet>,
        ticket_id: u64,
        prediction: MatchResult,
        amount: u64,
    ) -> Result<()> {
        let cfg = &ctx.accounts.config;
        let market = &mut ctx.accounts.market;
        let pos = &mut ctx.accounts.position;
        let live = &ctx.accounts.live_state;
        let clock = Clock::get()?;

        require!(market.status == MarketStatus::Open, GoalChainError::BettingClosed);
        require_keys_eq!(market.fixture, ctx.accounts.fixture.key(), GoalChainError::InvalidMarket);
        require_keys_eq!(live.fixture, ctx.accounts.fixture.key(), GoalChainError::InvalidLiveState);

        // market mint must match provided mint
        require_keys_eq!(market.token_mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);

        // window by minute
        require!(live.minute <= market.close_minute, GoalChainError::BettingClosed);

        // tied / goal-diff rules
        let diff = if live.score_a >= live.score_b { live.score_a - live.score_b } else { live.score_b - live.score_a };
        require!(diff <= market.max_goal_diff, GoalChainError::BettingClosed);
        if market.require_tied {
            require!(live.score_a == live.score_b, GoalChainError::BettingClosed);
        }

        // cooldown
        if market.last_bet_ts != 0 {
            let next_allowed = market
                .last_bet_ts
                .checked_add(market.cooldown_seconds)
                .ok_or(GoalChainError::MathOverflow)?;
            require!(clock.unix_timestamp >= next_allowed, GoalChainError::BettingClosed);
        }

        // record position (multiple tickets per user per market)
        pos.owner = ctx.accounts.user.key();
        pos.market = market.key();
        pos.ticket_id = ticket_id;
        pos.amount = amount;
        pos.prediction = prediction.clone();
        pos.bet_ts = clock.unix_timestamp;
        pos.claimed = false;
        pos.bump = ctx.bumps.position;

        // update pools
        match prediction {
            MatchResult::TeamA => market.pool_a = market.pool_a.checked_add(amount).ok_or(GoalChainError::MathOverflow)?,
            MatchResult::TeamB => market.pool_b = market.pool_b.checked_add(amount).ok_or(GoalChainError::MathOverflow)?,
            MatchResult::Draw => market.pool_draw = market.pool_draw.checked_add(amount).ok_or(GoalChainError::MathOverflow)?,
        }
        market.last_bet_ts = clock.unix_timestamp;

        // transfer into market vault
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.key(),
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

        // --- runtime hardening: market vault PDA + mint match ---
        let (expected_vault, _bump) = Pubkey::find_program_address(
            &[b"market_vault", market.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(ctx.accounts.market_vault.key(), expected_vault, GoalChainError::InvalidVault);

        let user_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.user_token_account.data.borrow()[..])?;
        let vault_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.market_vault.data.borrow()[..])?;
        let treasury_ta = SplTokenAccount::try_deserialize(&mut &ctx.accounts.treasury_token_account.data.borrow()[..])?;

        require_keys_eq!(user_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(vault_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(treasury_ta.mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);
        require_keys_eq!(market.token_mint, ctx.accounts.token_mint.key(), GoalChainError::InvalidMint);

        require!(market.status == MarketStatus::Resolved, GoalChainError::MatchNotFinished);
        require!(!pos.claimed, GoalChainError::AlreadyClaimed);

        // delay after resolution
        if let Some(resolved_ts) = market.resolved_ts {
            let unlock_ts = resolved_ts
                .checked_add(market.delay_seconds)
                .ok_or(GoalChainError::MathOverflow)?;
            require!(clock.unix_timestamp >= unlock_ts, GoalChainError::ClaimTooEarly);
        } else {
            return err!(GoalChainError::MatchNotFinished);
        }

        let winning_result = market.winner.as_ref().ok_or(GoalChainError::NoWinnerDeclared)?;
        require!(pos.prediction == *winning_result, GoalChainError::NotAWinner);

        let winning_pool = match winning_result {
            MatchResult::TeamA => market.pool_a,
            MatchResult::TeamB => market.pool_b,
            MatchResult::Draw => market.pool_draw,
        };
        require!(winning_pool > 0, GoalChainError::InvalidPool);

        let total_pool = market
            .pool_a
            .checked_add(market.pool_b).ok_or(GoalChainError::MathOverflow)?
            .checked_add(market.pool_draw).ok_or(GoalChainError::MathOverflow)?;

        let gross_user_share = ((pos.amount as u128)
            .checked_mul(total_pool as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(winning_pool as u128).ok_or(GoalChainError::MathOverflow)?) as u64;

        let user_fee = ((gross_user_share as u128)
            .checked_mul(cfg.fee_bps as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(10_000).ok_or(GoalChainError::MathOverflow)?) as u64;

        let user_net_share = gross_user_share
            .checked_sub(user_fee)
            .ok_or(GoalChainError::MathOverflow)?;

        pos.claimed = true;

        let bump_val = market.bump;
        let bump_arr = [bump_val];
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"market",
            market.fixture.as_ref(),
            &[market.market_id],
            &bump_arr,
        ]];

        // payout to user
        let cpi_user = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.market_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.market.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds,
        );
        token_interface::transfer_checked(cpi_user, user_net_share, ctx.accounts.token_mint.decimals)?;

        // fee to treasury
        if user_fee > 0 {
            let cpi_fee = CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.market_vault.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.market.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
                signer_seeds,
            );
            token_interface::transfer_checked(cpi_fee, user_fee, ctx.accounts.token_mint.decimals)?;
        }

        Ok(())
    }

    // ====================================================================
    // V2 DYNAMIC YIELD & THE ARCHITECT LOGIC
    // ====================================================================

    /// El Oráculo (Pyth/Helius) reporta acciones del Mundial en tiempo real.
    pub fn oracle_update_player_yield(
        ctx: Context<OracleUpdatePlayerYield>,
        action_type: u8, // 1: Gol, 2: Asistencia, 3: Roja, 4: Eliminación
    ) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        require!(!player.is_eliminated, GoalChainError::PlayerIsEliminated);

        match action_type {
            1 => { // Gol Real: +10% yield
                let bonus = player
                    .base_yield_rate
                    .checked_div(10)
                    .ok_or(GoalChainError::MathOverflow)?;
                player.base_yield_rate = player
                    .base_yield_rate
                    .checked_add(bonus)
                    .ok_or(GoalChainError::MathOverflow)?;
            },
            2 => { // Asistencia Real: +5% yield
                let bonus = player
                    .base_yield_rate
                    .checked_div(20)
                    .ok_or(GoalChainError::MathOverflow)?;
                player.base_yield_rate = player
                    .base_yield_rate
                    .checked_add(bonus)
                    .ok_or(GoalChainError::MathOverflow)?;
            },
            3 => { // Tarjeta Roja: -20% yield
                player.base_yield_rate = (player.base_yield_rate as u128)
                    .checked_mul(80)
                    .ok_or(GoalChainError::MathOverflow)?
                    .checked_div(100)
                    .ok_or(GoalChainError::MathOverflow)? as u64;
                player.current_stamina = 0;
            },
            4 => { // Eliminación de su País
                player.base_yield_rate = 0;
                player.is_eliminated = true;
            },
            _ => return err!(GoalChainError::InvalidActionType),
        }
        Ok(())
    }

    /// Cuando comienza un nuevo torneo (Copa América, Euro, etc.), el Oráculo
    /// "revive" a los jugadores eliminados y reinicia su Yield Base inicial.
    pub fn oracle_reset_season(
        ctx: Context<OracleUpdatePlayerYield>,
        new_base_yield: u64
    ) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        player.is_eliminated = false;
        player.base_yield_rate = new_base_yield;
        player.current_stamina = 100; // Vuelven descansados al nuevo torneo
        
        Ok(())
    }

    /// El usuario reclama su sueldo, calculado dinámicamente.
    /// El impuesto de protocolo está hard-capped al 1% para limitar capture.
    pub fn claim_daily_salary(ctx: Context<ClaimDailySalary>, _stadium_id: u16) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        let manager = &ctx.accounts.manager_state;
        let stadium = &ctx.accounts.stadium_state;

        let clock = Clock::get()?;
        let current_ts = clock.unix_timestamp;

        // 1. Enforce cooldown (24 hours)
        require!(
            current_ts >= player.last_claim_timestamp.checked_add(86400).ok_or(GoalChainError::MathOverflow)?,
            GoalChainError::ClaimTooEarly
        );

        // 2. Enforce stamina limit
        require!(player.current_stamina >= 5, GoalChainError::InsufficientStamina);

        // Update claim timestamp
        player.last_claim_timestamp = current_ts;

        let mut base_salary = player.base_yield_rate;
        if player.current_stamina < 30 {
            base_salary = base_salary.checked_div(2).ok_or(GoalChainError::MathOverflow)?; // Penalidad de fatiga (-50%)
        }

        // Mul by multipliers (represented in basis points, e.g. 10000 = 1.0x) using u128 intermediate math to prevent overflow
        let final_daily_salary = (base_salary as u128)
            .checked_mul(manager.salary_multiplier as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(10_000).ok_or(GoalChainError::MathOverflow)?
            .checked_mul(stadium.revenue_multiplier as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(10_000).ok_or(GoalChainError::MathOverflow)? as u64;

        // Founder capture hard-cap: 1% max protocol tax on salaries.
        let architect_tax = (final_daily_salary as u128)
            .checked_mul(ARCHITECT_TAX_BPS as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(10_000).ok_or(GoalChainError::MathOverflow)? as u64;
        let user_net_salary = final_daily_salary.checked_sub(architect_tax).ok_or(GoalChainError::MathOverflow)?;

        player.current_stamina = player.current_stamina.saturating_sub(5);

        let seeds = &[b"config".as_ref(), &[ctx.accounts.config.bump]];
        let signer = &[&seeds[..]];

        // 1. Pagar el 90% al Usuario
        let cpi_user = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer,
        );
        token_interface::transfer_checked(cpi_user, user_net_salary, ctx.accounts.token_mint.decimals)?;

        // 2. Pagar el impuesto (1%) al destino de tesorería comunitaria
        let cpi_architect = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.architect_pool_account.to_account_info(),
                authority: ctx.accounts.config.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer,
        );
        token_interface::transfer_checked(cpi_architect, architect_tax, ctx.accounts.token_mint.decimals)?;

        Ok(())
    }

    pub fn initialize_manager_state(
        ctx: Context<InitializeManagerState>,
        level: u8,
        salary_multiplier: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.manager_state;
        state.level = level;
        state.salary_multiplier = salary_multiplier;
        Ok(())
    }

    pub fn initialize_stadium_state(
        ctx: Context<InitializeStadiumState>,
        stadium_id: u16,
        revenue_multiplier: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.stadium_state;
        state.stadium_id = stadium_id;
        state.revenue_multiplier = revenue_multiplier;
        Ok(())
    }

    // ====================================================================
    // V2 HOOKS PARA EXPANSIÓN FUTURA (Evitando Feature Creep)
    // ====================================================================
    
    /// [HOOK] La Forja: Permitirá fusionar NFTs en el futuro
    pub fn forge_nft(_ctx: Context<FutureHook>) -> Result<()> {
        Ok(())
    }

    /// [HOOK] Préstamos de NFTs (Delegation)
    pub fn delegate_nft_for_rent(_ctx: Context<FutureHook>) -> Result<()> {
        Ok(())
    }

    pub fn feed_potion(ctx: Context<FeedPotion>) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        require!(player.current_stamina < 100, GoalChainError::StaminaAlreadyFull);

        // Burn 100 GCH (POTION_BURN_LAMPORTS; 6 decimals)
        let cpi_program = ctx.accounts.token_program.key();
        let cpi_accounts = Burn {
            from: ctx.accounts.user_token_account.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token_interface::burn(cpi_ctx, POTION_BURN_LAMPORTS)?;

        player.current_stamina = 100;
        Ok(())
    }

    pub fn equip_locker_room_item(ctx: Context<EquipLockerRoomItem>, item_type: u8) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        require_keys_eq!(player.owner, ctx.accounts.user.key(), GoalChainError::Unauthorized);
        
        let cpi_program = ctx.accounts.token_program.key();
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.user_item_wallet.to_account_info(),
            to: ctx.accounts.escrow_pda_wallet.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
            mint: ctx.accounts.item_mint.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token_interface::transfer_checked(cpi_ctx, 1, 0)?;

        match item_type {
            1 => {
                require!(player.equipped_jersey.is_none(), GoalChainError::AlreadyEquipped);
                player.equipped_jersey = Some(ctx.accounts.item_mint.key());
                player.base_yield_rate = player.base_yield_rate.checked_add(player.base_yield_rate / 10).ok_or(GoalChainError::MathOverflow)?;
            },
            2 => {
                require!(player.equipped_boots.is_none(), GoalChainError::AlreadyEquipped);
                player.equipped_boots = Some(ctx.accounts.item_mint.key());
                player.speed = player.speed.saturating_add(5);
            },
            3 => {
                require!(!player.has_shield_jersey, GoalChainError::AlreadyEquipped);
                player.has_shield_jersey = true;
            },
            _ => return err!(GoalChainError::InvalidItemType),
        }

        Ok(())
    }

    pub fn unequip_locker_room_item(ctx: Context<UnequipLockerRoomItem>, item_type: u8) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        require_keys_eq!(player.owner, ctx.accounts.user.key(), GoalChainError::Unauthorized);
        
        let player_id_bytes = player.player_id.as_bytes();
        let seeds = &[
            b"player",
            player_id_bytes,
            &[player.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_program = ctx.accounts.token_program.key();
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.escrow_pda_wallet.to_account_info(),
            to: ctx.accounts.user_item_wallet.to_account_info(),
            authority: player.to_account_info(),
            mint: ctx.accounts.item_mint.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token_interface::transfer_checked(cpi_ctx, 1, 0)?;

        match item_type {
            1 => {
                require!(player.equipped_jersey == Some(ctx.accounts.item_mint.key()), GoalChainError::InvalidItemType);
                player.equipped_jersey = None;
                player.base_yield_rate = player.base_yield_rate.checked_mul(10).ok_or(GoalChainError::MathOverflow)?.checked_div(11).ok_or(GoalChainError::MathOverflow)?;
            },
            2 => {
                require!(player.equipped_boots == Some(ctx.accounts.item_mint.key()), GoalChainError::InvalidItemType);
                player.equipped_boots = None;
                player.speed = player.speed.saturating_sub(5);
            },
            3 => {
                require!(player.has_shield_jersey, GoalChainError::InvalidItemType);
                player.has_shield_jersey = false;
            },
            _ => return err!(GoalChainError::InvalidItemType),
        }

        Ok(())
    }

    pub fn golden_recall(ctx: Context<GoldenRecall>) -> Result<()> {
        let listing = &mut ctx.accounts.rental_listing;
        require!(listing.is_active, GoalChainError::ListingNotActive);
        
        if let Some(borrower) = listing.current_borrower {
            require_keys_eq!(ctx.accounts.borrower_token_account.owner, borrower, GoalChainError::Unauthorized);

            let penalty = listing.price_per_match.checked_div(2).ok_or(GoalChainError::MathOverflow)?;

            if penalty > 0 {
                let cpi_ctx = CpiContext::new(
                    ctx.accounts.token_program.key(),
                    TransferChecked {
                        from: ctx.accounts.owner_token_account.to_account_info(),
                        to: ctx.accounts.borrower_token_account.to_account_info(),
                        authority: ctx.accounts.owner.to_account_info(),
                        mint: ctx.accounts.token_mint.to_account_info(),
                    }
                );
                token_interface::transfer_checked(cpi_ctx, penalty, ctx.accounts.token_mint.decimals)?;
            }
        }

        listing.current_borrower = None;
        listing.is_active = false;
        Ok(())
    }
}

// ---------------- CONFIG ACCOUNTS ----------------

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub admin: Pubkey,
    pub oracle_authority: Pubkey,
    pub treasury_token_account: Pubkey,
    pub fee_bps: u16,
    pub cutoff_buffer_seconds: i64,
    pub max_sol_per_user: u64,
    pub presale_active: bool,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalConfig::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized,
    )]
    pub config: Account<'info, GlobalConfig>,
}

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

#[account]
#[derive(InitSpace)]
pub struct EpochContributorSnapshot {
    pub epoch: Pubkey,
    pub contributor: Pubkey,
    pub score: u64,
    pub bump: u8,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum BuilderFundBucket {
    Contributors,
    ApiInfra,
    Marketing,
}

#[event]
pub struct BuilderFundInitialized {
    pub builder_fund: Pubkey,
    pub token_mint: Pubkey,
    pub contributor_bps: u16,
    pub api_infra_bps: u16,
    pub marketing_bps: u16,
}

#[event]
pub struct BuilderFundWeightsUpdated {
    pub builder_fund: Pubkey,
    pub contributor_bps: u16,
    pub api_infra_bps: u16,
    pub marketing_bps: u16,
}

#[event]
pub struct BuilderFundGuardrailsUpdated {
    pub builder_fund: Pubkey,
    pub score_update_cooldown_seconds: i64,
    pub min_epoch_score: u64,
    pub max_contributors_per_epoch: u32,
}

#[event]
pub struct BuilderFundFunded {
    pub builder_fund: Pubkey,
    pub payer: Pubkey,
    pub total_amount: u64,
    pub contributor_amount: u64,
    pub api_infra_amount: u64,
    pub marketing_amount: u64,
}

#[event]
pub struct BuilderFundSpent {
    pub builder_fund: Pubkey,
    pub bucket: BuilderFundBucket,
    pub amount: u64,
    pub recipient: Pubkey,
}

#[event]
pub struct ContributorScoreUpdated {
    pub builder_fund: Pubkey,
    pub contributor: Pubkey,
    pub score: u64,
    pub total_contributor_score: u64,
}

#[event]
pub struct ContributorRewardsClaimed {
    pub builder_fund: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub claimed_total: u64,
}

#[event]
pub struct ContributorEpochStarted {
    pub builder_fund: Pubkey,
    pub epoch_id: u64,
    pub contributor_pool: u64,
}

#[event]
pub struct ContributorEpochSnapshotRegistered {
    pub epoch: Pubkey,
    pub contributor: Pubkey,
    pub score: u64,
}

#[event]
pub struct ContributorEpochFinalized {
    pub epoch: Pubkey,
    pub epoch_id: u64,
    pub total_score_snapshot: u64,
    pub contributor_count: u32,
}

#[event]
pub struct ContributorEpochClaimed {
    pub epoch: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct InitializeBuilderFund<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        init,
        payer = admin,
        space = 8 + BuilderFund::INIT_SPACE,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        init,
        payer = admin,
        seeds = [b"builder_vault", builder_fund.key().as_ref(), b"contributors"],
        bump,
        token::mint = token_mint,
        token::authority = builder_fund
    )]
    pub contributor_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = admin,
        seeds = [b"builder_vault", builder_fund.key().as_ref(), b"api_infra"],
        bump,
        token::mint = token_mint,
        token::authority = builder_fund
    )]
    pub api_infra_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = admin,
        seeds = [b"builder_vault", builder_fund.key().as_ref(), b"marketing"],
        bump,
        token::mint = token_mint,
        token::authority = builder_fund
    )]
    pub marketing_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBuilderFundWeights<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.admin == admin.key() @ GoalChainError::Unauthorized,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
}

#[derive(Accounts)]
pub struct FundBuilderFund<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        mut,
        constraint = payer_token_account.owner == payer.key() @ GoalChainError::Unauthorized,
        constraint = payer_token_account.mint == token_mint.key() @ GoalChainError::InvalidMint,
    )]
    pub payer_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = contributor_vault.key() == builder_fund.contributor_vault @ GoalChainError::InvalidBuilderFundBucket
    )]
    pub contributor_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = api_infra_vault.key() == builder_fund.api_infra_vault @ GoalChainError::InvalidBuilderFundBucket
    )]
    pub api_infra_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = marketing_vault.key() == builder_fund.marketing_vault @ GoalChainError::InvalidBuilderFundBucket
    )]
    pub marketing_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(constraint = token_mint.key() == builder_fund.token_mint @ GoalChainError::InvalidMint)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct SpendBuilderFund<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.admin == admin.key() @ GoalChainError::Unauthorized,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        mut,
        constraint = source_vault.mint == token_mint.key() @ GoalChainError::InvalidMint
    )]
    pub source_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = destination_token_account.mint == token_mint.key() @ GoalChainError::InvalidMint
    )]
    pub destination_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(constraint = token_mint.key() == builder_fund.token_mint @ GoalChainError::InvalidMint)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct UpsertContributorScore<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.admin == admin.key() @ GoalChainError::Unauthorized,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    /// CHECK: contributor identity target for score assignment
    pub contributor: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + ContributorScore::INIT_SPACE,
        seeds = [b"contributor_score", builder_fund.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub contributor_score: Account<'info, ContributorScore>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimContributorRewards<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        mut,
        seeds = [b"contributor_score", builder_fund.key().as_ref(), contributor.key().as_ref()],
        bump = contributor_score.bump,
        constraint = contributor_score.builder_fund == builder_fund.key() @ GoalChainError::InvalidContributorScore,
        constraint = contributor_score.contributor == contributor.key() @ GoalChainError::InvalidContributorScore
    )]
    pub contributor_score: Account<'info, ContributorScore>,
    #[account(
        mut,
        constraint = contributor_vault.key() == builder_fund.contributor_vault @ GoalChainError::InvalidBuilderFundBucket,
        constraint = contributor_vault.mint == token_mint.key() @ GoalChainError::InvalidMint
    )]
    pub contributor_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = contributor_token_account.owner == contributor.key() @ GoalChainError::Unauthorized,
        constraint = contributor_token_account.mint == token_mint.key() @ GoalChainError::InvalidMint
    )]
    pub contributor_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(constraint = token_mint.key() == builder_fund.token_mint @ GoalChainError::InvalidMint)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
#[instruction(epoch_id: u64)]
pub struct StartContributorEpoch<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.admin == admin.key() @ GoalChainError::Unauthorized,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        init,
        payer = admin,
        space = 8 + BuilderContributorEpoch::INIT_SPACE,
        seeds = [b"builder_epoch", builder_fund.key().as_ref(), epoch_id.to_le_bytes().as_ref()],
        bump
    )]
    pub builder_epoch: Account<'info, BuilderContributorEpoch>,
    #[account(
        mut,
        constraint = contributor_vault.key() == builder_fund.contributor_vault @ GoalChainError::InvalidBuilderFundBucket
    )]
    pub contributor_vault: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterContributorEpochSnapshot<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.admin == admin.key() @ GoalChainError::Unauthorized,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        mut,
        constraint = builder_epoch.builder_fund == builder_fund.key() @ GoalChainError::InvalidEpochId
    )]
    pub builder_epoch: Account<'info, BuilderContributorEpoch>,
    /// CHECK: contributor identity target for snapshot
    pub contributor: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"contributor_score", builder_fund.key().as_ref(), contributor.key().as_ref()],
        bump = contributor_score.bump,
        constraint = contributor_score.builder_fund == builder_fund.key() @ GoalChainError::InvalidContributorScore,
        constraint = contributor_score.contributor == contributor.key() @ GoalChainError::InvalidContributorScore
    )]
    pub contributor_score: Account<'info, ContributorScore>,
    #[account(
        init,
        payer = admin,
        space = 8 + EpochContributorSnapshot::INIT_SPACE,
        seeds = [b"epoch_contributor", builder_epoch.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub epoch_contributor_snapshot: Account<'info, EpochContributorSnapshot>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeContributorEpoch<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.admin == admin.key() @ GoalChainError::Unauthorized,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        mut,
        constraint = builder_epoch.builder_fund == builder_fund.key() @ GoalChainError::InvalidEpochId
    )]
    pub builder_epoch: Account<'info, BuilderContributorEpoch>,
}

#[derive(Accounts)]
pub struct ClaimContributorEpoch<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"builder_fund", config.key().as_ref()],
        bump = builder_fund.bump,
        constraint = builder_fund.config == config.key() @ GoalChainError::InvalidConfig
    )]
    pub builder_fund: Account<'info, BuilderFund>,
    #[account(
        constraint = builder_epoch.builder_fund == builder_fund.key() @ GoalChainError::InvalidEpochId
    )]
    pub builder_epoch: Account<'info, BuilderContributorEpoch>,
    #[account(
        seeds = [b"epoch_contributor", builder_epoch.key().as_ref(), contributor.key().as_ref()],
        bump = epoch_contributor_snapshot.bump,
        constraint = epoch_contributor_snapshot.epoch == builder_epoch.key() @ GoalChainError::InvalidEpochSnapshot,
        constraint = epoch_contributor_snapshot.contributor == contributor.key() @ GoalChainError::InvalidEpochSnapshot
    )]
    pub epoch_contributor_snapshot: Account<'info, EpochContributorSnapshot>,
    #[account(
        init,
        payer = contributor,
        space = 8 + EpochContributorClaim::INIT_SPACE,
        seeds = [b"epoch_claim", builder_epoch.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub epoch_contributor_claim: Account<'info, EpochContributorClaim>,
    /// CHECK: validated manually against mint and builder fund vault key in handler
    #[account(mut)]
    pub contributor_vault: UncheckedAccount<'info>,
    /// CHECK: validated manually against contributor owner + mint in handler
    #[account(mut)]
    pub contributor_token_account: UncheckedAccount<'info>,
    #[account(constraint = token_mint.key() == builder_fund.token_mint @ GoalChainError::InvalidMint)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

// ---------------- EXISTING ACCOUNTS ----------------

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(init_if_needed, payer = user, space = 8 + UserStake::INIT_SPACE, seeds = [b"stake", user.key().as_ref()], bump)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)] pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"stake_vault", token_mint.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = config
    )]
    pub stake_vault_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        mut,
        seeds = [b"stake", user.key().as_ref()],
        bump,
        constraint = user_stake.owner == user.key()
    )]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)] pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"stake_vault", token_mint.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = config
    )]
    pub stake_vault_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct UserStake { pub owner: Pubkey, pub amount: u64, pub start_timestamp: i64, pub unclaimed_rewards: u64 }

#[derive(Accounts)]
#[instruction(player_id: String)]
pub struct InitializeParodyPlayer<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(init, payer = admin, space = 8 + ParodyPlayer::INIT_SPACE, seeds = [b"player", player_id.as_bytes()], bump)]
    pub parody_player: Account<'info, ParodyPlayer>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlayerStats<'info> {
    #[account(mut)] pub oracle_authority: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)] pub parody_player: Account<'info, ParodyPlayer>,
}

#[account]
#[derive(InitSpace)]
pub struct ParodyPlayer {
    pub owner: Pubkey,
    pub last_claim_timestamp: i64,
    #[max_len(32)] pub name: String,
    #[max_len(32)] pub player_id: String,
    pub real_world_goals: u8, pub real_world_assists: u8, pub matches_played: u8, pub speed: u8, pub shot_power: u8,
    
    // --- V2 Dynamic Yield Fields ---
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

#[derive(Accounts)]
pub struct ListForRent<'info> {
    #[account(mut)] pub owner: Signer<'info>,
    #[account(init, payer = owner, space = 8 + RentalListing::INIT_SPACE, seeds = [b"rental", parody_player_mint.key().as_ref()], bump)]
    pub rental_listing: Account<'info, RentalListing>,
    /// CHECK: The mint of the parody player NFT
    pub parody_player_mint: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RentNft<'info> {
    #[account(mut)] pub borrower: Signer<'info>,
    #[account(mut)] pub rental_listing: Account<'info, RentalListing>,
    #[account(mut)] pub borrower_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)] pub owner_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct RentalListing { pub owner: Pubkey, pub price_per_match: u64, pub current_borrower: Option<Pubkey>, pub is_active: bool }

#[derive(Accounts)]
#[instruction(timestamp: i64)]
pub struct CreateWager<'info> {
    #[account(mut)]
    pub player_a: Signer<'info>,

    #[account(
        init,
        payer = player_a,
        space = 8 + Wager::INIT_SPACE,
        seeds = [b"wager", player_a.key().as_ref(), timestamp.to_le_bytes().as_ref()],
        bump
    )]
    pub wager: Account<'info, Wager>,

    #[account(mut)]
    pub player_a_token: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = player_a,
        seeds = [b"wager_vault", wager.key().as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = wager
    )]
    pub wager_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptWager<'info> {
    #[account(mut)] pub player_b: Signer<'info>,
    #[account(mut)] pub wager: Account<'info, Wager>,
    #[account(mut)] pub player_b_token: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)] pub wager_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct ResolveWager<'info> {
    #[account(mut)] pub oracle_authority: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)] pub wager: Account<'info, Wager>,
    #[account(mut)] pub wager_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = winner_token.mint == token_mint.key() @ GoalChainError::InvalidMint,
    )]
    pub winner_token: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct Wager { pub player_a: Pubkey, pub player_b: Option<Pubkey>, pub amount: u64, pub timestamp: i64, pub bump: u8, pub state: WagerState }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum WagerState { Created, Accepted, Resolved }

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct InitializeFixture<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle)]
    pub config: Account<'info, GlobalConfig>,
    #[account(init, payer = oracle_authority, space = 8 + Fixture::INIT_SPACE, seeds = [b"fixture", match_id.as_bytes()], bump)]
    pub fixture: Account<'info, Fixture>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)] pub fixture: Account<'info, Fixture>,
    #[account(init, payer = user, space = 8 + UserBet::INIT_SPACE, seeds = [b"bet", user.key().as_ref(), fixture.key().as_ref()], bump)]
    pub user_bet: Account<'info, UserBet>,
    #[account(mut)] pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(init_if_needed, payer = user, token::mint = token_mint, token::authority = fixture, seeds = [b"fixture_vault", fixture.key().as_ref()], bump)]
    pub fixture_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFixtureStatus<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub fixture: Account<'info, Fixture>,
}

#[derive(Accounts)]
pub struct ClaimBetPayout<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub fixture: Account<'info, Fixture>,
    #[account(mut, constraint = user_bet.owner == user.key() && user_bet.fixture == fixture.key())]
    pub user_bet: Account<'info, UserBet>,

    /// CHECK: Validado manualmente contra token_mint en el handler
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,

    /// CHECK: Validado manualmente (PDA + mint) en el handler
    #[account(mut)]
    pub fixture_vault: UncheckedAccount<'info>,

    #[account(mut, constraint = treasury_token_account.key() == config.treasury_token_account @ GoalChainError::InvalidTreasury)]
    /// CHECK: Validado manualmente contra token_mint en el handler
    pub treasury_token_account: UncheckedAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

// ---------------- LIVE MARKETS ACCOUNTS ----------------

#[derive(Accounts)]
pub struct OracleUpsertLiveState<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle,
    )]
    pub config: Account<'info, GlobalConfig>,

    pub fixture: Account<'info, Fixture>,

    #[account(
        init_if_needed,
        payer = oracle_authority,
        space = 8 + LiveMatchState::INIT_SPACE,
        seeds = [b"live_state", fixture.key().as_ref()],
        bump
    )]
    pub live_state: Account<'info, LiveMatchState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(market_id: u8)]
pub struct OracleCreateMarket<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle,
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        init,
        payer = oracle_authority,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", fixture.key().as_ref(), &[market_id]],
        bump
    )]
    pub market: Account<'info, Market>,

    pub fixture: Account<'info, Fixture>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OracleUpdateMarketStatus<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle,
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
#[instruction(ticket_id: u64)]
pub struct PlaceMarketBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    pub fixture: Account<'info, Fixture>,

    #[account(seeds = [b"live_state", fixture.key().as_ref()], bump = live_state.bump)]
    pub live_state: Account<'info, LiveMatchState>,

    #[account(
        init,
        payer = user,
        space = 8 + MarketPosition::INIT_SPACE,
        seeds = [
            b"position",
            user.key().as_ref(),
            market.key().as_ref(),
            &ticket_id.to_le_bytes(),
        ],
        bump
    )]
    pub position: Account<'info, MarketPosition>,

    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        token::mint = token_mint,
        token::authority = market,
        seeds = [b"market_vault", market.key().as_ref()],
        bump
    )]
    pub market_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimMarketPayout<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(seeds = [b"config"], bump = config.bump)]
    pub config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        constraint = position.owner == user.key() && position.market == market.key() @ GoalChainError::Unauthorized,
    )]
    pub position: Account<'info, MarketPosition>,

    /// CHECK: validated by runtime checks (mint + ownership) in handler
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,

    /// CHECK: validated by PDA + mint in handler
    #[account(mut)]
    pub market_vault: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = treasury_token_account.key() == config.treasury_token_account @ GoalChainError::InvalidTreasury
    )]
    /// CHECK: validated by runtime mint check in handler
    pub treasury_token_account: UncheckedAccount<'info>,

    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

// ---------------- CORE TYPES (FIXTURES) ----------------

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

// ---------------- LIVE MARKETS TYPES ----------------

#[account]
#[derive(InitSpace)]
pub struct LiveMatchState {
    pub fixture: Pubkey,
    pub minute: u16,
    pub score_a: u8,
    pub score_b: u8,
    pub is_ht: bool,
    pub is_ft: bool,
    pub last_update_ts: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MarketType {
    MatchResultLive,
    NextGoal,
    Custom,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MarketStatus {
    Open,
    Closed,
    Resolved,
    Cancelled,
}

// Add a stable byte identifier used in PDA seeds to support multiple markets per fixture.
// This is stored on-chain and reused for signer seeds.

#[account]
#[derive(InitSpace)]
pub struct Market {
    pub fixture: Pubkey,
    /// Stable market identifier used for PDA derivation (0-255).
    pub market_id: u8,
    pub market_type: MarketType,
    pub status: MarketStatus,
    pub token_mint: Pubkey,

    // risk params
    pub delay_seconds: i64,
    pub cooldown_seconds: i64,
    pub close_minute: u16,
    pub max_goal_diff: u8,
    pub require_tied: bool,

    // pools
    pub pool_a: u64,
    pub pool_b: u64,
    pub pool_draw: u64,

    // resolution
    pub winner: Option<MatchResult>,
    pub last_bet_ts: i64,
    pub resolved_ts: Option<i64>,

    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct MarketPosition {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub ticket_id: u64,
    pub amount: u64,
    pub prediction: MatchResult,
    pub bet_ts: i64,
    pub claimed: bool,
    pub bump: u8,
}

// ====================================================================
// V2 ACCOUNTS & CONTEXTS
// ====================================================================

#[derive(Accounts)]
pub struct OracleUpdatePlayerYield<'info> {
    #[account(mut)]
    pub oracle_authority: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.oracle_authority == oracle_authority.key() @ GoalChainError::UnauthorizedOracle,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub parody_player: Account<'info, ParodyPlayer>,
}

#[derive(Accounts)]
#[instruction(stadium_id: u16)]
pub struct ClaimDailySalary<'info> {
    #[account(
        mut,
        constraint = parody_player.owner == user.key() @ GoalChainError::Unauthorized
    )]
    pub parody_player: Account<'info, ParodyPlayer>,
    #[account(
        seeds = [b"manager", user.key().as_ref()],
        bump
    )]
    pub manager_state: Account<'info, ManagerState>,
    #[account(
        seeds = [b"stadium", stadium_id.to_le_bytes().as_ref()],
        bump
    )]
    pub stadium_state: Account<'info, StadiumState>,
    #[account(mut)]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        constraint = architect_pool_account.key() == config.treasury_token_account @ GoalChainError::InvalidTreasury
    )]
    pub architect_pool_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = config
    )]
    pub vault_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeManagerState<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + ManagerState::INIT_SPACE,
        seeds = [b"manager", user.key().as_ref()],
        bump
    )]
    pub manager_state: Account<'info, ManagerState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(stadium_id: u16)]
pub struct InitializeStadiumState<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized,
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(
        init,
        payer = admin,
        space = 8 + StadiumState::INIT_SPACE,
        seeds = [b"stadium", stadium_id.to_le_bytes().as_ref()],
        bump
    )]
    pub stadium_state: Account<'info, StadiumState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FutureHook<'info> {
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct FeedPotion<'info> {
    #[account(mut)]
    pub parody_player: Account<'info, ParodyPlayer>,
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct EquipLockerRoomItem<'info> {
    #[account(mut)]
    pub parody_player: Account<'info, ParodyPlayer>,
    pub item_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub user_item_wallet: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = item_mint,
        associated_token::authority = parody_player,
    )]
    pub escrow_pda_wallet: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnequipLockerRoomItem<'info> {
    #[account(
        mut,
        seeds = [b"player", parody_player.player_id.as_bytes()],
        bump = parody_player.bump,
    )]
    pub parody_player: Account<'info, ParodyPlayer>,
    pub item_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub user_item_wallet: InterfaceAccount<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = item_mint,
        associated_token::authority = parody_player,
    )]
    pub escrow_pda_wallet: InterfaceAccount<'info, TokenAccount>,
    
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct GoldenRecall<'info> {
    #[account(
        mut,
        constraint = rental_listing.owner == owner.key() @ GoalChainError::Unauthorized,
    )]
    pub rental_listing: Account<'info, RentalListing>,
    #[account(mut)]
    pub owner_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub borrower_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ManagerState {
    pub level: u8,
    pub salary_multiplier: u64,
}

#[account]
#[derive(InitSpace)]
pub struct StadiumState {
    pub stadium_id: u16,
    pub revenue_multiplier: u64,
}

#[derive(Accounts)]
pub struct ContributePresale<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, GlobalConfig>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + PresaleAllocation::INIT_SPACE,
        seeds = [b"presale", user.key().as_ref()],
        bump
    )]
    pub presale_allocation: Account<'info, PresaleAllocation>,

    // Where the minted JitoSOL will go (GoalChain Treasury JitoSOL ATA)
    #[account(mut)]
    pub treasury_jito_ata: InterfaceAccount<'info, TokenAccount>,

    // --- Jito Stake Pool CPI Accounts ---
    #[account(mut)]
    /// CHECK: Jito Stake Pool
    pub stake_pool: UncheckedAccount<'info>,
    
    #[account(mut)]
    /// CHECK: Jito Withdraw Authority
    pub withdraw_authority: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Reserve Stake
    pub reserve_stake: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Manager Fee Account
    pub manager_fee_account: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Referral Fee Account
    pub referral_fee_account: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: JitoSOL Pool Mint
    pub pool_mint: UncheckedAccount<'info>,

    /// CHECK: The SPL Stake Pool Program
    pub stake_pool_program: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub fixture: Account<'info, Fixture>,
    #[account(mut, constraint = user_bet.owner == user.key() && user_bet.fixture == fixture.key())]
    pub user_bet: Account<'info, UserBet>,
    /// CHECK: validated manually against token mint
    #[account(mut)]
    pub user_token_account: UncheckedAccount<'info>,
    /// CHECK: validated manually by PDA + mint
    #[account(mut)]
    pub fixture_vault: UncheckedAccount<'info>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct SweepFixtureDust<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.admin == admin.key() @ GoalChainError::Unauthorized
    )]
    pub config: Account<'info, GlobalConfig>,
    #[account(mut)]
    pub fixture: Account<'info, Fixture>,
    /// CHECK: validated manually by PDA + mint
    #[account(mut)]
    pub fixture_vault: UncheckedAccount<'info>,
    #[account(mut, constraint = treasury_token_account.key() == config.treasury_token_account @ GoalChainError::InvalidTreasury)]
    /// CHECK: validated manually against token mint
    pub treasury_token_account: UncheckedAccount<'info>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct PresaleAllocation {
    pub owner: Pubkey,
    pub sol_deposited: u64,
    pub timestamp: i64,
}

// ---------------- ERRORS ----------------

#[error_code]
pub enum GoalChainError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Unauthorized oracle")]
    UnauthorizedOracle,
    #[msg("Invalid config")]
    InvalidConfig,
    #[msg("Must claim first")]
    MustClaimFirst,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Listing not active")]
    ListingNotActive,
    #[msg("Already rented")]
    AlreadyRented,
    #[msg("Wager not available")]
    WagerNotAvailable,
    #[msg("Wager not ready")]
    WagerNotReady,
    #[msg("Winner token account does not match the declared wager winner")]
    InvalidWagerWinner,
    #[msg("Betting closed")]
    BettingClosed,
    #[msg("Match not finished")]
    MatchNotFinished,
    #[msg("No winner declared")]
    NoWinnerDeclared,
    #[msg("Not a winner")]
    NotAWinner,
    #[msg("Already claimed")]
    AlreadyClaimed,
    #[msg("Invalid pool")]
    InvalidPool,
    #[msg("Invalid vault")]
    InvalidVault,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid treasury")]
    InvalidTreasury,
    #[msg("Invalid market config")]
    InvalidMarketConfig,
    #[msg("Invalid market")]
    InvalidMarket,
    #[msg("Invalid live state")]
    InvalidLiveState,
    #[msg("Presale is not active")]
    PresaleInactive,
    #[msg("Presale contribution exceeds max per user")]
    PresaleLimitExceeded,
    #[msg("Invalid stake pool program")]
    InvalidStakePoolProgram,
    #[msg("Fixture is not cancelled")]
    FixtureNotCancelled,
    #[msg("Cancelled fixtures must be refunded, not claimed")]
    UseRefundForCancelledFixture,
    #[msg("Insufficient vault balance")]
    InsufficientVaultBalance,
    #[msg("Claim too early")]
    ClaimTooEarly,
    #[msg("Player is eliminated")]
    PlayerIsEliminated,
    #[msg("Invalid action type from oracle")]
    InvalidActionType,
    #[msg("Stamina already full")]
    StaminaAlreadyFull,
    #[msg("Golden Recall penalty required")]
    GoldenRecallPenaltyRequired,
    #[msg("Invalid item type")]
    InvalidItemType,
    #[msg("Item already equipped")]
    AlreadyEquipped,
    #[msg("Insufficient stamina")]
    InsufficientStamina,
    #[msg("Invalid builder fund weights")]
    InvalidBuilderFundWeights,
    #[msg("Invalid builder fund bucket")]
    InvalidBuilderFundBucket,
    #[msg("Invalid contributor score account")]
    InvalidContributorScore,
    #[msg("No contributor score available")]
    NoContributorScore,
    #[msg("No claimable rewards")]
    NoClaimableRewards,
    #[msg("Invalid epoch id")]
    InvalidEpochId,
    #[msg("Epoch already finalized")]
    EpochAlreadyFinalized,
    #[msg("Epoch not finalized")]
    EpochNotFinalized,
    #[msg("Missing epoch snapshot score")]
    NoEpochSnapshotScore,
    #[msg("Invalid epoch snapshot")]
    InvalidEpochSnapshot,
    #[msg("Contributor score update is in cooldown")]
    ScoreUpdateCooldown,
    #[msg("Contributor score below minimum threshold")]
    ContributorScoreTooLow,
    #[msg("Epoch contributor limit reached")]
    EpochContributorLimitReached,
}
