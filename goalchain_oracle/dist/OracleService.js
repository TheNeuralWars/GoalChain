import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class OracleService {
    connection;
    wallet;
    provider;
    program;
    // PDAs
    configPda;
    constructor(rpcUrl, keypairPath, programIdStr = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg") {
        this.connection = new Connection(rpcUrl, "confirmed");
        // Load oracle wallet
        const resolvedPath = keypairPath.startsWith("~")
            ? keypairPath.replace("~", process.env.HOME || "")
            : keypairPath;
        const secretKey = JSON.parse(fs.readFileSync(path.resolve(resolvedPath), "utf8"));
        const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
        this.wallet = new anchor.Wallet(keypair);
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {
            commitment: "confirmed",
        });
        anchor.setProvider(this.provider);
        // Load IDL and Program (requires the IDL JSON or TS type from the Rust build)
        const idl = JSON.parse(fs.readFileSync(path.join(__dirname, "../../goalchain_program/target/idl/goalchain_program.json"), "utf8"));
        const programId = new PublicKey(programIdStr);
        this.program = new anchor.Program(idl, this.provider);
        [this.configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], this.program.programId);
    }
    /**
     * Synchronizes the global config to authorize this Oracle's wallet.
     */
    async syncOracleAuthority(treasuryAta) {
        const configInfo = await this.connection.getAccountInfo(this.configPda);
        if (!configInfo) {
            await this.program.methods
                .initializeConfig(this.wallet.publicKey, treasuryAta, 1000, new BN(15 * 60))
                .accounts({
                admin: this.wallet.publicKey,
                config: this.configPda,
                systemProgram: SystemProgram.programId,
            })
                .rpc();
        }
        else {
            await this.program.methods
                .updateConfig(this.wallet.publicKey, treasuryAta, 1000, new BN(15 * 60))
                .accounts({
                admin: this.wallet.publicKey,
                config: this.configPda,
            })
                .rpc();
        }
        console.log(`[Oracle] 🛡️ Synced Oracle Authority to: ${this.wallet.publicKey.toBase58()}`);
    }
    /**
     * Initializes a new fixture in the blockchain.
     */
    async initializeFixture(matchId, teamA, teamB, startTime) {
        console.log(`[Oracle] 🏟️ Initializing Fixture: ${teamA} vs ${teamB} (${matchId})`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        try {
            const tx = await this.program.methods
                .initializeFixture(matchId, teamA, teamB, new BN(startTime))
                .accounts({
                oracleAuthority: this.wallet.publicKey,
                config: this.configPda,
                fixture: fixturePda,
                systemProgram: SystemProgram.programId,
            })
                .rpc();
            console.log(`[Oracle] ✅ Fixture ${matchId} initialized! Tx: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error(`[Oracle] ❌ Failed to initialize fixture ${matchId}:`, error);
            throw error;
        }
    }
    /**
     * Updates the live state of an ongoing match (Minute, Score, Period)
     */
    async upsertLiveState(matchId, minute, scoreA, scoreB, isHt, isFt) {
        console.log(`[Oracle] ⚽ Live Update [${matchId}]: Min ${minute} | Score: ${scoreA}-${scoreB} | HT: ${isHt} FT: ${isFt}`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        const [liveStatePda] = PublicKey.findProgramAddressSync([Buffer.from("live_state"), fixturePda.toBuffer()], this.program.programId);
        try {
            const tx = await this.program.methods
                .oracleUpsertLiveState(minute, scoreA, scoreB, isHt, isFt)
                .accounts({
                oracleAuthority: this.wallet.publicKey,
                config: this.configPda,
                fixture: fixturePda,
                liveState: liveStatePda,
                systemProgram: SystemProgram.programId,
            })
                .rpc();
            console.log(`[Oracle] ✅ Live state updated for ${matchId}. Tx: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error(`[Oracle] ❌ Failed to update live state for ${matchId}:`, error);
            throw error;
        }
    }
    /**
     * Creates a new live betting market for the given fixture.
     */
    async createLiveMarket(matchId, marketId, marketType, // e.g. { nextGoal: {} } or { liveMatchResult: {} }
    delaySeconds, closeMinute, tokenMint) {
        console.log(`[Oracle] 📈 Opening Live Market (ID: ${marketId}) for ${matchId}...`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        const [marketPda] = PublicKey.findProgramAddressSync([Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([marketId])], this.program.programId);
        try {
            const tx = await this.program.methods
                .oracleCreateMarket(marketId, marketType, new BN(delaySeconds), new BN(0), // cooldown
            closeMinute, 1, // max_goal_diff default
            true, // require_tied default
            tokenMint)
                .accounts({
                oracleAuthority: this.wallet.publicKey,
                config: this.configPda,
                fixture: fixturePda,
                market: marketPda,
                tokenMint: tokenMint,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
                .rpc();
            console.log(`[Oracle] ✅ Live Market ${marketId} opened successfully! Tx: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error(`[Oracle] ❌ Failed to create market ${marketId} for ${matchId}:`, error);
            throw error;
        }
    }
    /**
     * Resolves a live market, declaring a winner and allowing users to claim payouts.
     */
    async resolveMarket(matchId, marketId, winner // e.g. { teamA: {} }, { teamB: {} }, { draw: {} }
    ) {
        console.log(`[Oracle] ⚖️ Resolving Live Market (ID: ${marketId}) for ${matchId}...`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        const [marketPda] = PublicKey.findProgramAddressSync([Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([marketId])], this.program.programId);
        try {
            const tx = await this.program.methods
                .oracleUpdateMarketStatus({ resolved: {} }, winner)
                .accounts({
                oracleAuthority: this.wallet.publicKey,
                config: this.configPda,
                market: marketPda,
            })
                .rpc();
            console.log(`[Oracle] ✅ Live Market ${marketId} resolved! Tx: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error(`[Oracle] ❌ Failed to resolve market ${marketId} for ${matchId}:`, error);
            throw error;
        }
    }
    /**
     * Concludes the match and resolves the pre-match parimutuel betting pools.
     */
    async completeFixture(matchId, winner) {
        console.log(`[Oracle] 🏁 Completing Fixture ${matchId}...`);
        const [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], this.program.programId);
        try {
            const tx = await this.program.methods
                .updateFixtureStatus({ completed: {} }, winner)
                .accounts({
                oracleAuthority: this.wallet.publicKey,
                config: this.configPda,
                fixture: fixturePda,
            })
                .rpc();
            console.log(`[Oracle] ✅ Fixture ${matchId} completed! Tx: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error(`[Oracle] ❌ Failed to complete fixture ${matchId}:`, error);
            throw error;
        }
    }
    /**
     * Updates real-world stats for a specific Parody Player (Goals, Assists) to boost Yield/Stamina.
     */
    async updatePlayerStats(playerId, goalsAdded, assistsAdded) {
        console.log(`[Oracle] 👤 Updating Player Stats: ${playerId} (+${goalsAdded}G, +${assistsAdded}A)`);
        const [parodyPlayerPda] = PublicKey.findProgramAddressSync([Buffer.from("player"), Buffer.from(playerId)], this.program.programId);
        try {
            const tx = await this.program.methods
                .updatePlayerStats(goalsAdded, assistsAdded)
                .accounts({
                oracleAuthority: this.wallet.publicKey,
                config: this.configPda,
                parodyPlayer: parodyPlayerPda,
            })
                .rpc();
            console.log(`[Oracle] ✅ Player ${playerId} stats updated! Tx: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error(`[Oracle] ❌ Failed to update player ${playerId}:`, error);
            throw error;
        }
    }
}
