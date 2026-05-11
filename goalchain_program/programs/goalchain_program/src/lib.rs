use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, TokenInterface, TokenAccount, Mint, TransferChecked};

declare_id!("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

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
    ) -> Result<()> {
        // límite duro para evitar configs absurdas
        require!(fee_bps <= 2_000, GoalChainError::InvalidConfig); // max 20%
        require!(cutoff_buffer_seconds >= 0, GoalChainError::InvalidConfig);
        require!(cutoff_buffer_seconds <= 24 * 60 * 60, GoalChainError::InvalidConfig); // max 24h

        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.oracle_authority = oracle_authority;
        cfg.treasury_token_account = treasury_token_account;
        cfg.fee_bps = fee_bps;
        cfg.cutoff_buffer_seconds = cutoff_buffer_seconds;
        cfg.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        oracle_authority: Pubkey,
        treasury_token_account: Pubkey,
        fee_bps: u16,
        cutoff_buffer_seconds: i64,
    ) -> Result<()> {
        require!(fee_bps <= 2_000, GoalChainError::InvalidConfig);
        require!(cutoff_buffer_seconds >= 0, GoalChainError::InvalidConfig);
        require!(cutoff_buffer_seconds <= 24 * 60 * 60, GoalChainError::InvalidConfig);

        let cfg = &mut ctx.accounts.config;
        cfg.oracle_authority = oracle_authority;
        cfg.treasury_token_account = treasury_token_account;
        cfg.fee_bps = fee_bps;
        cfg.cutoff_buffer_seconds = cutoff_buffer_seconds;
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
                to: ctx.accounts.vault_token_account.to_account_info(),
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
        Ok(())
    }

    pub fn init_parody_player(
        ctx: Context<InitializeParodyPlayer>,
        player_id: String,
        name: String,
        initial_speed: u8,
        initial_shot_power: u8
    ) -> Result<()> {
        let player = &mut ctx.accounts.parody_player;
        player.player_id = player_id;
        player.name = name;
        player.real_world_goals = 0;
        player.real_world_assists = 0;
        player.matches_played = 0;
        player.speed = initial_speed;
        player.shot_power = initial_shot_power;
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

    pub fn resolve_wager(ctx: Context<ResolveWager>, _winner_is_a: bool) -> Result<()> {
        // (fuera de scope MVP) - se deja igual, pero protegido por config oracle
        let total_payout;
        let player_a_key;
        let timestamp_bytes;
        let bump_val;
        let wager_account_info = ctx.accounts.wager.to_account_info();

        {
            let wager = &ctx.accounts.wager;
            require!(wager.state == WagerState::Accepted, GoalChainError::WagerNotReady);
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
        let fixture = &ctx.accounts.fixture;
        let bet = &mut ctx.accounts.user_bet;

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

        // fee total en bps (ej: 1000 = 10%)
        let fee_total = ((total_pool as u128)
            .checked_mul(cfg.fee_bps as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(10_000).ok_or(GoalChainError::MathOverflow)?) as u64;

        let net_pool = total_pool.checked_sub(fee_total).ok_or(GoalChainError::MathOverflow)?;

        let user_share = ((bet.amount as u128)
            .checked_mul(net_pool as u128).ok_or(GoalChainError::MathOverflow)?
            .checked_div(winning_pool as u128).ok_or(GoalChainError::MathOverflow)?) as u64;

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

        // 1) payout al usuario
        let cpi_user = CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            TransferChecked {
                from: ctx.accounts.fixture_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.fixture.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
            },
            signer_seeds,
        );
        token_interface::transfer_checked(cpi_user, user_share, ctx.accounts.token_mint.decimals)?;

        // 2) fees a treasury (si fee_total > 0)
        if fee_total > 0 {
            let cpi_fee = CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                TransferChecked {
                    from: ctx.accounts.fixture_vault.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.fixture.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                },
                signer_seeds,
            );
            token_interface::transfer_checked(cpi_fee, fee_total, ctx.accounts.token_mint.decimals)?;
        }

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

// ---------------- EXISTING ACCOUNTS ----------------

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(init_if_needed, payer = user, space = 8 + UserStake::INIT_SPACE, seeds = [b"stake", user.key().as_ref()], bump)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut)] pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)] pub vault_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)] pub user: Signer<'info>,
    #[account(mut, constraint = user_stake.owner == user.key())]
    pub user_stake: Account<'info, UserStake>,
}

#[account]
#[derive(InitSpace)]
pub struct UserStake { pub owner: Pubkey, pub amount: u64, pub start_timestamp: i64, pub unclaimed_rewards: u64 }

#[derive(Accounts)]
#[instruction(player_id: String)]
pub struct InitializeParodyPlayer<'info> {
    #[account(mut)] pub admin: Signer<'info>,
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
    #[max_len(32)] pub name: String,
    #[max_len(32)] pub player_id: String,
    pub real_world_goals: u8, pub real_world_assists: u8, pub matches_played: u8, pub speed: u8, pub shot_power: u8,
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
    #[account(mut)] pub player_a: Signer<'info>,
    #[account(init, payer = player_a, space = 8 + Wager::INIT_SPACE, seeds = [b"wager", player_a.key().as_ref(), timestamp.to_le_bytes().as_ref()], bump)]
    pub wager: Account<'info, Wager>,
    #[account(mut)] pub player_a_token: InterfaceAccount<'info, TokenAccount>,
    #[account(init, payer = player_a, seeds = [b"wager_vault", wager.key().as_ref()], bump, token::mint = token_mint, token::authority = wager)]
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
    #[account(mut)] pub winner_token: InterfaceAccount<'info, TokenAccount>,
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
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub fixture_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(mut, constraint = treasury_token_account.key() == config.treasury_token_account @ GoalChainError::InvalidTreasury)]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
#[derive(InitSpace)]
pub struct Fixture {
    #[max_len(64)] pub match_id: String,
    #[max_len(64)] pub team_a: String,
    #[max_len(64)] pub team_b: String,
    pub pool_a: u64,
    pub pool_b: u64,
    pub pool_draw: u64,
    pub status: MatchStatus,
    pub winner: Option<MatchResult>,
    pub start_timestamp: i64,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MatchStatus { Upcoming, Live, Completed, Cancelled }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MatchResult { TeamA, TeamB, Draw }

#[error_code]
pub enum GoalChainError {
    #[msg("Claim rewards first.")] MustClaimFirst,
    #[msg("Insufficient funds.")] InsufficientFunds,
    #[msg("Unauthorized.")] Unauthorized,
    #[msg("Unauthorized oracle.")] UnauthorizedOracle,
    #[msg("Listing not active.")] ListingNotActive,
    #[msg("Already rented.")] AlreadyRented,
    #[msg("Wager not available.")] WagerNotAvailable,
    #[msg("Wager not ready.")] WagerNotReady,
    #[msg("Match finished.")] MatchAlreadyFinished,
    #[msg("Match NOT finished.")] MatchNotFinished,
    #[msg("Already claimed.")] AlreadyClaimed,
    #[msg("No winner declared.")] NoWinnerDeclared,
    #[msg("Not a winner.")] NotAWinner,
    #[msg("Math overflow/underflow.")] MathOverflow,
    #[msg("Betting is closed for this fixture.")] BettingClosed,
    #[msg("Invalid pool.")] InvalidPool,
    #[msg("Invalid config.")] InvalidConfig,
    #[msg("Invalid treasury token account.")] InvalidTreasury,
}
