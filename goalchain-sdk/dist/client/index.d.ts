import { Connection, PublicKey } from '@solana/web3.js';
export type FixtureStatus = 'upcoming' | 'live' | 'completed' | 'cancelled' | 'unknown';
export type MarketStatus = 'active' | 'closed' | 'settled' | 'cancelled' | 'unknown';
export type PredictionSide = 'A' | 'B' | 'Draw';
type WalletLike = {
    publicKey: PublicKey | null;
    signTransaction?: (...args: any[]) => Promise<any>;
    signAllTransactions?: (...args: any[]) => Promise<any>;
};
export interface FixtureView {
    pubkey: string;
    matchId: string;
    teamA: string;
    teamB: string;
    poolA: number;
    poolB: number;
    poolDraw: number;
    status: FixtureStatus;
}
export interface MarketView {
    pubkey: string;
    marketId: number;
    marketType: string;
    status: MarketStatus;
    teamA?: string;
    teamB?: string;
    question?: string;
    poolA: number;
    poolB: number;
    poolDraw: number;
    totalPool: number;
    startTime?: number;
    endTime?: number;
}
export interface PositionView {
    pubkey: string;
    market: string;
    owner: string;
    side: 'A' | 'B' | 'Draw';
    amountBaseUnits: number;
    claimed: boolean;
}
export interface UserBetView {
    pubkey: string;
    fixture: string;
    amountBaseUnits: number;
    claimed: boolean;
    prediction: PredictionSide | 'unknown';
}
export interface UserChainStats {
    totalBets: number;
    totalVolumeBaseUnits: number;
    claimedBets: number;
    openBets: number;
    stakedAmountBaseUnits: number;
    unclaimedRewardsBaseUnits: number;
}
export declare function fetchFixtures(connection: Connection): Promise<FixtureView[]>;
export declare function fetchMarkets(connection: Connection): Promise<MarketView[]>;
export declare function fetchUserBets(connection: Connection, owner: PublicKey): Promise<UserBetView[]>;
export declare function fetchUserPositions(connection: Connection, owner: PublicKey): Promise<PositionView[]>;
export declare function placeFixtureBet(params: {
    connection: Connection;
    wallet: WalletLike;
    fixture: PublicKey;
    side: PredictionSide;
    amountUi: string;
}): Promise<string>;
export declare function placeMarketBet(params: {
    connection: Connection;
    wallet: WalletLike;
    market: PublicKey;
    side: 'A' | 'B' | 'Draw';
    amountUi: string;
}): Promise<string>;
export declare function claimFixturePayout(params: {
    connection: Connection;
    wallet: WalletLike;
    fixture: PublicKey;
}): Promise<string>;
export declare function claimMarketPayout(params: {
    connection: Connection;
    wallet: WalletLike;
    market: PublicKey;
    position: PublicKey;
}): Promise<string>;
export declare function refundFixtureBet(params: {
    connection: Connection;
    wallet: WalletLike;
    fixture: PublicKey;
}): Promise<string>;
export declare function claimWinnings(params: {
    connection: Connection;
    wallet: WalletLike;
    type: 'fixture' | 'market';
    fixtureOrMarket: PublicKey;
    position?: PublicKey;
}): Promise<string>;
export declare function getClaimableMarkets(connection: Connection, owner: PublicKey): Promise<{
    fixtures: (FixtureView & {
        userBet: UserBetView;
    })[];
    markets: (MarketView & {
        position: PositionView;
    })[];
}>;
export declare function getMarketStatus(connection: Connection, marketPubkey: PublicKey): Promise<MarketView | null>;
export declare function getFixtureStatus(connection: Connection, fixturePubkey: PublicKey): Promise<FixtureView | null>;
export declare function fetchUserChainStats(connection: Connection, owner: PublicKey): Promise<UserChainStats>;
export {};
