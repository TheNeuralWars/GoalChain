"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiveStatePda = getLiveStatePda;
exports.getMarketPda = getMarketPda;
exports.getMarketVaultPda = getMarketVaultPda;
exports.getPositionPda = getPositionPda;
exports.getConfigPda = getConfigPda;
exports.placeLiveMarketBet = placeLiveMarketBet;
exports.claimLiveMarketWinnings = claimLiveMarketWinnings;
exports.fetchLiveMarkets = fetchLiveMarkets;
exports.fetchUserLiveBets = fetchUserLiveBets;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const index_1 = require("./index");
function getProvider(connection, wallet) {
    return new anchor_1.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
}
function getProgram(connection, wallet) {
    const provider = getProvider(connection, wallet);
    return new anchor_1.Program(require('./goalchain_program.json'), provider);
}
/**
 * Derive the live state PDA for a fixture
 */
function getLiveStatePda(fixturePda) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.LIVE_STATE), fixturePda.toBuffer()], index_1.PROGRAM_ID);
}
/**
 * Derive the market PDA
 */
function getMarketPda(fixturePda, marketId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.MARKET), fixturePda.toBuffer(), Buffer.from([marketId])], index_1.PROGRAM_ID);
}
/**
 * Derive the market vault PDA
 */
function getMarketVaultPda(marketPda) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.MARKET_VAULT), marketPda.toBuffer()], index_1.PROGRAM_ID);
}
/**
 * Derive the user position PDA for a live market bet
 */
function getPositionPda(user, marketPda, ticketId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.POSITION), user.toBuffer(), marketPda.toBuffer(), ticketId.toArrayLike(Buffer, 'le', 8)], index_1.PROGRAM_ID);
}
/**
 * Derive the config PDA
 */
function getConfigPda() {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(index_1.SEEDS.CONFIG)], index_1.PROGRAM_ID);
}
/**
 * Place a live market bet
 */
async function placeLiveMarketBet(wallet, marketPda, amount, side) {
    const connection = wallet.adapter?.connection ?? wallet.provider?.connection;
    if (!connection) {
        throw new Error('Wallet must have a connection');
    }
    const program = getProgram(connection, wallet);
    const configPda = getConfigPda()[0];
    const amountBn = typeof amount === 'number' ? new anchor_1.BN(amount) : amount;
    // Fetch market to get fixture
    const marketAccount = await program.account.market.fetch(marketPda);
    const fixturePda = marketAccount.fixture;
    // Derive live state PDA
    const [liveStatePda] = getLiveStatePda(fixturePda);
    // Get or create ticket ID - using timestamp as ticket ID for uniqueness
    const ticketId = new anchor_1.BN(Date.now());
    // Derive position PDA
    const [positionPda] = getPositionPda(wallet.publicKey, marketPda, ticketId);
    // Derive market vault PDA
    const [marketVaultPda] = getMarketVaultPda(marketPda);
    // Token mint from market
    const tokenMint = marketAccount.tokenMint;
    // User's token account
    const userTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenMint, wallet.publicKey, true);
    const predictionMap = { teamA: { teamA: {} }, teamB: { teamB: {} }, draw: { draw: {} } };
    const tx = await program.methods
        .placeLiveMarketBet(ticketId, predictionMap[side], amountBn)
        .accounts({
        user: wallet.publicKey,
        config: configPda,
        market: marketPda,
        fixture: fixturePda,
        live_state: liveStatePda,
        position: positionPda,
        user_token_account: userTokenAccount,
        market_vault: marketVaultPda,
        token_mint: tokenMint,
        token_program: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        system_program: new web3_js_1.PublicKey('11111111111111111111111111111111'),
    })
        .transaction();
    return tx;
}
/**
 * Claim live market winnings
 */
async function claimLiveMarketWinnings(wallet, marketPda) {
    const connection = wallet.adapter?.connection ?? wallet.provider?.connection;
    if (!connection) {
        throw new Error('Wallet must have a connection');
    }
    const program = getProgram(connection, wallet);
    const configPda = getConfigPda()[0];
    // Fetch market
    const marketAccount = await program.account.market.fetch(marketPda);
    // Find user's positions for this market
    const positions = await program.account.marketPosition.all([
        { memcmp: { offset: 8 + 32, bytes: wallet.publicKey.toBase58() } }, // owner field
    ]);
    const userPositions = positions.filter(p => p.account.market.equals(marketPda));
    if (userPositions.length === 0) {
        throw new Error('No position found for this market and user');
    }
    // Find unclaimed position
    const unclaimedPosition = userPositions.find(p => !p.account.claimed);
    if (!unclaimedPosition) {
        throw new Error('No unclaimed winnings found');
    }
    const positionPda = unclaimedPosition.publicKey;
    // Derive market vault PDA
    const [marketVaultPda] = getMarketVaultPda(marketPda);
    const tokenMint = marketAccount.tokenMint;
    const userTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenMint, wallet.publicKey, true);
    // Treasury and jackpot accounts from config
    const configAccount = await program.account.globalConfig.fetch(configPda);
    const treasuryTokenAccount = configAccount.treasuryTokenAccount;
    const jackpotTokenAccount = configAccount.treasuryTokenAccount;
    const tx = await program.methods
        .claimLiveMarketWinnings()
        .accounts({
        user: wallet.publicKey,
        config: configPda,
        market: marketPda,
        position: positionPda,
        user_token_account: userTokenAccount,
        market_vault: marketVaultPda,
        treasury_token_account: treasuryTokenAccount,
        jackpot_token_account: jackpotTokenAccount,
        token_mint: tokenMint,
        token_program: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    })
        .transaction();
    return tx;
}
/**
 * Fetch all live markets with open status
 */
async function fetchLiveMarkets(connection) {
    const program = new anchor_1.Program(require('./goalchain_program.json'), { connection });
    const markets = await program.account.market.all();
    return markets
        .filter(m => m.account.status.open)
        .map(m => ({
        marketPda: m.publicKey,
        fixturePda: m.account.fixture,
        marketId: m.account.marketId,
        marketType: m.account.marketType.matchResultLive ? 'matchResultLive' :
            m.account.marketType.nextGoal ? 'nextGoal' : 'custom',
        status: m.account.status.open ? 'open' :
            m.account.status.closed ? 'closed' :
                m.account.status.resolved ? 'resolved' : 'cancelled',
        tokenMint: m.account.tokenMint,
        poolA: m.account.poolA,
        poolB: m.account.poolB,
        poolDraw: m.account.poolDraw,
        winner: m.account.winner?.teamA ? 'teamA' :
            m.account.winner?.teamB ? 'teamB' :
                m.account.winner?.draw ? 'draw' : null,
        closeMinute: m.account.closeMinute,
        maxGoalDiff: m.account.maxGoalDiff,
        requireTied: m.account.requireTied,
        delaySeconds: m.account.delaySeconds,
        cooldownSeconds: m.account.cooldownSeconds,
        lastBetTs: m.account.lastBetTs,
        resolvedTs: m.account.resolvedTs,
        bump: m.account.bump,
    }));
}
/**
 * Fetch user's live market bets (positions)
 */
async function fetchUserLiveBets(connection, wallet) {
    const program = new anchor_1.Program(require('./goalchain_program.json'), { connection });
    const positions = await program.account.marketPosition.all([
        { memcmp: { offset: 8 + 32, bytes: wallet.toBase58() } }, // owner field
    ]);
    return positions.map(p => ({
        positionPda: p.publicKey,
        marketPda: p.account.market,
        owner: p.account.owner,
        ticketId: p.account.ticketId,
        amount: p.account.amount,
        prediction: p.account.prediction.teamA ? 'teamA' :
            p.account.prediction.teamB ? 'teamB' : 'draw',
        betTs: p.account.betTs,
        claimed: p.account.claimed,
        bump: p.account.bump,
    }));
}
