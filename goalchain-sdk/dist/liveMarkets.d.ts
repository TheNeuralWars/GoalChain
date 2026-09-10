import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { BN, Wallet as AnchorWallet } from '@coral-xyz/anchor';
export interface LiveMarketBetParams {
    wallet: AnchorWallet;
    marketPda: PublicKey;
    amount: number | BN;
    side: 'teamA' | 'teamB' | 'draw';
}
export interface ClaimLiveMarketParams {
    wallet: AnchorWallet;
    marketPda: PublicKey;
}
export interface LiveMarketInfo {
    marketPda: PublicKey;
    fixturePda: PublicKey;
    marketId: number;
    marketType: 'matchResultLive' | 'nextGoal' | 'custom';
    status: 'open' | 'closed' | 'resolved' | 'cancelled';
    tokenMint: PublicKey;
    poolA: BN;
    poolB: BN;
    poolDraw: BN;
    winner: 'teamA' | 'teamB' | 'draw' | null;
    closeMinute: number;
    maxGoalDiff: number;
    requireTied: boolean;
    delaySeconds: BN;
    cooldownSeconds: BN;
    lastBetTs: BN;
    resolvedTs: BN | null;
    bump: number;
}
export interface UserLiveBetInfo {
    positionPda: PublicKey;
    marketPda: PublicKey;
    owner: PublicKey;
    ticketId: BN;
    amount: BN;
    prediction: 'teamA' | 'teamB' | 'draw';
    betTs: BN;
    claimed: boolean;
    bump: number;
}
/**
 * Derive the live state PDA for a fixture
 */
export declare function getLiveStatePda(fixturePda: PublicKey): [PublicKey, number];
/**
 * Derive the market PDA
 */
export declare function getMarketPda(fixturePda: PublicKey, marketId: number): [PublicKey, number];
/**
 * Derive the market vault PDA
 */
export declare function getMarketVaultPda(marketPda: PublicKey): [PublicKey, number];
/**
 * Derive the user position PDA for a live market bet
 */
export declare function getPositionPda(user: PublicKey, marketPda: PublicKey, ticketId: BN): [PublicKey, number];
/**
 * Derive the config PDA
 */
export declare function getConfigPda(): [PublicKey, number];
/**
 * Place a live market bet
 */
export declare function placeLiveMarketBet(wallet: AnchorWallet, marketPda: PublicKey, amount: number | BN, side: 'teamA' | 'teamB' | 'draw'): Promise<Transaction>;
/**
 * Claim live market winnings
 */
export declare function claimLiveMarketWinnings(wallet: AnchorWallet, marketPda: PublicKey): Promise<Transaction>;
/**
 * Fetch all live markets with open status
 */
export declare function fetchLiveMarkets(connection: Connection): Promise<LiveMarketInfo[]>;
/**
 * Fetch user's live market bets (positions)
 */
export declare function fetchUserLiveBets(connection: Connection, wallet: PublicKey): Promise<UserLiveBetInfo[]>;
