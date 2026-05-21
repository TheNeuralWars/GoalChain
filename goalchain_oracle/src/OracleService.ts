import type { Program } from "@coral-xyz/anchor";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
// @ts-ignore
import { GoalchainProgram } from "../../goalchain_program/target/types/goalchain_program";
import { getPriorityFeeInstructions } from "./priorityFees.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class OracleService {
    public connection: Connection;
    public wallet: anchor.Wallet;
    public provider: anchor.AnchorProvider;
    public program: Program<GoalchainProgram>;

    // PDAs
    public configPda: PublicKey;

    constructor(
        rpcUrl: string,
        keypairPathOrWallet: string | anchor.Wallet,
        programIdStr: string = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg"
    ) {
        this.connection = new Connection(rpcUrl, "confirmed");
        
        // Load oracle wallet (file path fallback or secure custom wallet injection)
        if (typeof keypairPathOrWallet === "string") {
            const resolvedPath = keypairPathOrWallet.startsWith("~") 
                ? keypairPathOrWallet.replace("~", process.env.HOME || "") 
                : keypairPathOrWallet;
            const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolvedPath), "utf8"));
            const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
            this.wallet = new anchor.Wallet(keypair);
        } else {
            this.wallet = keypairPathOrWallet;
        }

        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {
            commitment: "confirmed",
        });
        anchor.setProvider(this.provider);

        // Load IDL and Program (requires the IDL JSON or TS type from the Rust build)
        const idl = JSON.parse(fs.readFileSync(path.join(__dirname, "../../goalchain_program/target/idl/goalchain_program.json"), "utf8"));
        const programId = new PublicKey(programIdStr);
        this.program = new anchor.Program(idl, this.provider) as unknown as Program<GoalchainProgram>;

        [this.configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], this.program.programId);
    }

    /**
     * Helper to wrap instruction execution with dynamic Helius priority fees and blockhash management.
     */
    private async sendWithPriorityFees(
        methodBuilder: any,
        keysForPriorityEstimate: PublicKey[],
        computeUnitsLimit: number = 200000
    ): Promise<string> {
        const instruction = await methodBuilder.instruction();
        const accountKeys = keysForPriorityEstimate.map(k => k.toBase58());
        const priorityFeeIxs = await getPriorityFeeInstructions(this.connection, accountKeys, computeUnitsLimit);

        const tx = new Transaction();
        tx.add(...priorityFeeIxs, instruction);
        
        const latestBlockhash = await this.connection.getLatestBlockhash();
        tx.recentBlockhash = latestBlockhash.blockhash;
        tx.feePayer = this.wallet.publicKey;

        const signedTx = await this.wallet.signTransaction(tx);
        const rawTx = signedTx.serialize();
        
        const txid = await this.connection.sendRawTransaction(rawTx, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
        });
        
        await this.connection.confirmTransaction({
            signature: txid,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        }, "confirmed");
        
        return txid;
    }

    /**
     * Synchronizes the global config to authorize this Oracle's wallet.
     */
    async syncOracleAuthority(treasuryAta: PublicKey): Promise<string> {
        const configInfo = await this.connection.getAccountInfo(this.configPda);
        let method: any;

        if (!configInfo) {
            method = this.program.methods
                .initializeConfig(
                    this.wallet.publicKey,
                    treasuryAta,
                    100, // 1% max founder-capture aligned
                    new BN(15 * 60),
                    new BN(2 * anchor.web3.LAMPORTS_PER_SOL),
                    true
                )
                .accounts({
                    admin: this.wallet.publicKey,
                    config: this.configPda,
                    systemProgram: SystemProgram.programId,
                } as any);
        } else {
            method = this.program.methods
                .updateConfig(
                    this.wallet.publicKey,
                    treasuryAta,
                    100, // 1% max founder-capture aligned
                    new BN(15 * 60),
                    new BN(2 * anchor.web3.LAMPORTS_PER_SOL),
                    true
                )
                .accounts({
                    admin: this.wallet.publicKey,
                    config: this.configPda,
                } as any);
        }

        const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda]);
        console.log(`[Oracle] 🛡️ Synced Oracle Authority to: ${this.wallet.publicKey.toBase58()}. Tx: ${tx}`);
        return tx;
    }

    /**
     * Initializes a new fixture in the blockchain.
     */
    async initializeFixture(matchId: string, teamA: string, teamB: string, startTime: number): Promise<string> {
        console.log(`[Oracle] 🏟️ Initializing Fixture: ${teamA} vs ${teamB} (${matchId})`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);

        try {
            const method = this.program.methods
                .initializeFixture(matchId, teamA, teamB, new BN(startTime))
                .accounts({
                    oracleAuthority: this.wallet.publicKey,
                    config: this.configPda,
                    fixture: fixturePda,
                    systemProgram: SystemProgram.programId,
                } as any);
            
            const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda, fixturePda]);
            console.log(`[Oracle] ✅ Fixture ${matchId} initialized! Tx: ${tx}`);
            return tx;
        } catch (error) {
            console.error(`[Oracle] ❌ Failed to initialize fixture ${matchId}:`, error);
            throw error;
        }
    }

    /**
     * Updates the live state of an ongoing match (Minute, Score, Period)
     */
    async upsertLiveState(
        matchId: string, 
        minute: number, 
        scoreA: number, 
        scoreB: number, 
        isHt: boolean, 
        isFt: boolean
    ): Promise<string> {
        console.log(`[Oracle] ⚽ Live Update [${matchId}]: Min ${minute} | Score: ${scoreA}-${scoreB} | HT: ${isHt} FT: ${isFt}`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        const [liveStatePda] = PublicKey.findProgramAddressSync([Buffer.from("live_state"), fixturePda.toBuffer()], this.program.programId);

        try {
            const method = this.program.methods
                .oracleUpsertLiveState(minute, scoreA, scoreB, isHt, isFt)
                .accounts({
                    oracleAuthority: this.wallet.publicKey,
                    config: this.configPda,
                    fixture: fixturePda,
                    liveState: liveStatePda,
                    systemProgram: SystemProgram.programId,
                } as any);
            
            const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda, fixturePda, liveStatePda]);
            console.log(`[Oracle] ✅ Live state updated for ${matchId}. Tx: ${tx}`);
            return tx;
        } catch (error) {
            console.error(`[Oracle] ❌ Failed to update live state for ${matchId}:`, error);
            throw error;
        }
    }

    /**
     * Creates a new live betting market for the given fixture.
     */
    async createLiveMarket(
        matchId: string, 
        marketId: number, 
        marketType: any, // e.g. { nextGoal: {} } or { liveMatchResult: {} }
        delaySeconds: number, 
        closeMinute: number, 
        tokenMint: PublicKey
    ): Promise<string> {
        console.log(`[Oracle] 📈 Opening Live Market (ID: ${marketId}) for ${matchId}...`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        const [marketPda] = PublicKey.findProgramAddressSync([Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([marketId])], this.program.programId);

        try {
            const method = this.program.methods
                .oracleCreateMarket(
                    marketId,
                    marketType,
                    new BN(delaySeconds),
                    new BN(0), // cooldown
                    closeMinute,
                    1, // max_goal_diff default
                    true, // require_tied default
                    tokenMint
                )
                .accounts({
                    oracleAuthority: this.wallet.publicKey,
                    config: this.configPda,
                    fixture: fixturePda,
                    market: marketPda,
                    tokenMint: tokenMint,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                } as any);
            
            const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda, fixturePda, marketPda, tokenMint]);
            console.log(`[Oracle] ✅ Live Market ${marketId} opened successfully! Tx: ${tx}`);
            return tx;
        } catch (error) {
            console.error(`[Oracle] ❌ Failed to create market ${marketId} for ${matchId}:`, error);
            throw error;
        }
    }

    /**
     * Resolves a live market, declaring a winner and allowing users to claim payouts.
     */
    async resolveMarket(
        matchId: string, 
        marketId: number, 
        winner: any // e.g. { teamA: {} }, { teamB: {} }, { draw: {} }
    ): Promise<string> {
        console.log(`[Oracle] ⚖️ Resolving Live Market (ID: ${marketId}) for ${matchId}...`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        const [marketPda] = PublicKey.findProgramAddressSync([Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([marketId])], this.program.programId);

        try {
            const method = this.program.methods
                .oracleUpdateMarketStatus({ resolved: {} }, winner)
                .accounts({
                    oracleAuthority: this.wallet.publicKey,
                    config: this.configPda,
                    market: marketPda,
                } as any);
            
            const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda, marketPda]);
            console.log(`[Oracle] ✅ Live Market ${marketId} resolved! Tx: ${tx}`);
            return tx;
        } catch (error) {
            console.error(`[Oracle] ❌ Failed to resolve market ${marketId} for ${matchId}:`, error);
            throw error;
        }
    }

    /**
     * Concludes the match and resolves the pre-match parimutuel betting pools.
     */
    async completeFixture(matchId: string, winner: any): Promise<string> {
        console.log(`[Oracle] 🏁 Completing Fixture ${matchId}...`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);

        try {
            const method = this.program.methods
                .updateFixtureStatus({ completed: {} }, winner)
                .accounts({
                    oracleAuthority: this.wallet.publicKey,
                    config: this.configPda,
                    fixture: fixturePda,
                } as any);
            
            const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda, fixturePda]);
            console.log(`[Oracle] ✅ Fixture ${matchId} completed! Tx: ${tx}`);
            return tx;
        } catch (error) {
            console.error(`[Oracle] ❌ Failed to complete fixture ${matchId}:`, error);
            throw error;
        }
    }

    /**
     * Updates real-world stats for a specific Parody Player (Goals, Assists) to boost Yield/Stamina.
     */
    async updatePlayerStats(playerId: string, goalsAdded: number, assistsAdded: number): Promise<string> {
        console.log(`[Oracle] 👤 Updating Player Stats: ${playerId} (+${goalsAdded}G, +${assistsAdded}A)`);
        const [parodyPlayerPda] = PublicKey.findProgramAddressSync([Buffer.from("player"), Buffer.from(playerId)], this.program.programId);

        try {
            const method = this.program.methods
                .updatePlayerStats(goalsAdded, assistsAdded)
                .accounts({
                    oracleAuthority: this.wallet.publicKey,
                    config: this.configPda,
                    parodyPlayer: parodyPlayerPda,
                } as any);
            
            const tx = await this.sendWithPriorityFees(method, [this.wallet.publicKey, this.configPda, parodyPlayerPda]);
            console.log(`[Oracle] ✅ Player ${playerId} stats updated! Tx: ${tx}`);
            return tx;
        } catch (error) {
            console.error(`[Oracle] ❌ Failed to update player ${playerId}:`, error);
            throw error;
        }
    }
}
