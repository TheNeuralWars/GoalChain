import type { Program } from "@coral-xyz/anchor";
import pkg from "@coral-xyz/anchor";
const { BN } = pkg;
import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
// @ts-ignore
import { GoalchainProgram } from "../../goalchain_program/target/types/goalchain_program";
import { getConnection, getProgramId } from "@goalchain/sdk";
import { getPriorityFeeInstructions } from "./priorityFees.js";
import { MarketsService, createMarketsService } from "./markets/index.js";
import { PlayersService } from "./players/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class OracleService {
  public connection: Connection;
  public wallet: anchor.Wallet;
  public provider: anchor.AnchorProvider;
  public program: Program<GoalchainProgram>;

  // PDAs
  public configPda: PublicKey;

  // Services
  public markets: MarketsService;
  public players: PlayersService;

  constructor(
    rpcUrl: string | undefined | null,
    keypairPathOrWallet: string | anchor.Wallet,
    programIdStr?: string,
  ) {
    this.connection = rpcUrl ? new Connection(rpcUrl, "confirmed") : getConnection("confirmed");

    // Load oracle wallet (file path fallback or secure custom wallet injection)
    if (typeof keypairPathOrWallet === "string") {
      const resolvedPath = keypairPathOrWallet.startsWith("~")
        ? keypairPathOrWallet.replace("~", process.env.HOME || "")
        : keypairPathOrWallet;
      const secretKey = JSON.parse(
        fs.readFileSync(path.resolve(resolvedPath), "utf8"),
      );
      const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
      this.wallet = new anchor.Wallet(keypair);
    } else {
      this.wallet = keypairPathOrWallet;
    }

    this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {
      commitment: "confirmed",
    });

    const activeProgramId = programIdStr ? new PublicKey(programIdStr) : getProgramId();
    this.configPda = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      activeProgramId,
    )[0];
    anchor.setProvider(this.provider);

    // Load IDL and Program (requires the IDL JSON or TS type from the Rust build)
    const idl = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../../goalchain_program/target/idl/goalchain_program.json",
        ),
        "utf8",
      ),
    );
    const programId = activeProgramId;
    this.program = new anchor.Program(
      idl,
      this.provider,
    ) as unknown as Program<GoalchainProgram>;

    [this.configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      this.program.programId,
    );

    this.markets = createMarketsService({
      connection: this.connection,
      wallet: this.wallet,
      provider: this.provider,
      program: this.program,
      configPda: this.configPda,
      sendWithPriorityFees: this.sendWithPriorityFees.bind(this),
    });

    this.players = new PlayersService(this);
  }

  /**
   * Helper to wrap instruction execution with dynamic Helius priority fees and blockhash management.
   */
  public async sendWithPriorityFees(
    methodBuilder: any,
    keysForPriorityEstimate: PublicKey[],
    computeUnitsLimit: number = 200000,
  ): Promise<string> {
    const instruction = await methodBuilder.instruction();
    const accountKeys = keysForPriorityEstimate.map((k) => k.toBase58());
    const priorityFeeIxs = await getPriorityFeeInstructions(
      this.connection,
      accountKeys,
      computeUnitsLimit,
    );

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

    await this.connection.confirmTransaction(
      {
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "confirmed",
    );

    return txid;
  }

  /**
   * Synchronizes the global config to authorize this Oracle's wallet.
   */
  async syncOracleAuthority(
    treasuryAta: PublicKey,
    jackpotAta?: PublicKey,
  ): Promise<string> {
    const effectiveJackpotAta = jackpotAta ?? treasuryAta;
    const configInfo = await this.connection.getAccountInfo(this.configPda);
    let method: any;

    if (!configInfo) {
      method = this.program.methods
        .initializeConfig(
          this.wallet.publicKey,
          treasuryAta,
          effectiveJackpotAta,
          100, // 1% max founder-capture aligned
          new BN(15 * 60),
          new BN(2 * anchor.web3.LAMPORTS_PER_SOL),
          true,
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
          effectiveJackpotAta,
          100, // 1% max founder-capture aligned
          new BN(15 * 60),
          new BN(2 * anchor.web3.LAMPORTS_PER_SOL),
          true,
        )
        .accounts({
          admin: this.wallet.publicKey,
          config: this.configPda,
        } as any);
    }

    const tx = await this.sendWithPriorityFees(method, [
      this.wallet.publicKey,
      this.configPda,
    ]);
    console.log(
      `[Oracle] 🛡️ Synced Oracle Authority to: ${this.wallet.publicKey.toBase58()}. Tx: ${tx}`,
    );
    return tx;
  }

  /**
   * Initializes a new fixture in the blockchain.
   */
  async initializeFixture(
    matchId: string,
    teamA: string,
    teamB: string,
    startTime: number,
  ): Promise<string> {
    console.log(
      `[Oracle] 🏟️ Initializing Fixture: ${teamA} vs ${teamB} (${matchId})`,
    );
    const [fixturePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fixture"), Buffer.from(matchId)],
      this.program.programId,
    );

    try {
      const method = this.program.methods
        .initializeFixture(matchId, teamA, teamB, new BN(startTime))
        .accounts({
          oracleAuthority: this.wallet.publicKey,
          config: this.configPda,
          fixture: fixturePda,
          systemProgram: SystemProgram.programId,
        } as any);

      const tx = await this.sendWithPriorityFees(method, [
        this.wallet.publicKey,
        this.configPda,
        fixturePda,
      ]);
      console.log(`[Oracle] ✅ Fixture ${matchId} initialized! Tx: ${tx}`);
      return tx;
    } catch (error) {
      console.error(
        `[Oracle] ❌ Failed to initialize fixture ${matchId}:`,
        error,
      );
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
    isFt: boolean,
  ): Promise<string> {
    console.log(
      `[Oracle] ⚽ Live Update [${matchId}]: Min ${minute} | Score: ${scoreA}-${scoreB} | HT: ${isHt} FT: ${isFt}`,
    );
    const [fixturePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fixture"), Buffer.from(matchId)],
      this.program.programId,
    );
    const [liveStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("live_state"), fixturePda.toBuffer()],
      this.program.programId,
    );

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

      const tx = await this.sendWithPriorityFees(method, [
        this.wallet.publicKey,
        this.configPda,
        fixturePda,
        liveStatePda,
      ]);
      console.log(`[Oracle] ✅ Live state updated for ${matchId}. Tx: ${tx}`);
      return tx;
    } catch (error) {
      console.error(
        `[Oracle] ❌ Failed to update live state for ${matchId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Creates a new live betting market for the given fixture.
   * Delegates to MarketsService.
   */
  async createLiveMarket(
    matchId: string,
    marketId: number,
    marketType: any, // e.g. { nextGoal: {} } or { liveMatchResult: {} }
    delaySeconds: number,
    closeMinute: number,
    tokenMint: PublicKey,
  ): Promise<string> {
    // Convert legacy anchor marketType object to our MarketType enum
    let typedMarketType: any;
    if (marketType.nextGoal) typedMarketType = "NextGoal";
    else if (marketType.matchResultLive) typedMarketType = "MatchResultLive";
    else if (marketType.custom) typedMarketType = "Custom";
    else typedMarketType = "NextGoal"; // default

    return this.markets.createLiveMarket({
      matchId,
      marketId,
      marketType: typedMarketType,
      delaySeconds,
      closeMinute,
      tokenMint,
    });
  }

  /**
   * Resolves a live market, declaring a winner and allowing users to claim payouts.
   * Delegates to MarketsService.
   */
  async resolveMarket(
    matchId: string,
    marketId: number,
    winner: any, // e.g. { teamA: {} }, { teamB: {} }, { draw: {} }
  ): Promise<string> {
    // Convert legacy anchor winner object to our MatchResult enum
    let typedWinner: any;
    if (winner.teamA) typedWinner = "TeamA";
    else if (winner.teamB) typedWinner = "TeamB";
    else if (winner.draw) typedWinner = "Draw";
    else throw new Error("Invalid winner format");

    return this.markets.resolveMarket({
      matchId,
      marketId,
      winner: typedWinner,
    });
  }

  /**
   * Concludes the match and resolves the pre-match parimutuel betting pools.
   */
  async completeFixture(
    matchId: string,
    winner: any,
    opts?: { participantPlayerIds?: string[] },
  ): Promise<string> {
    console.log(`[Oracle] 🏁 Completing Fixture ${matchId}...`);
    const [fixturePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fixture"), Buffer.from(matchId)],
      this.program.programId,
    );

    try {
      const method = this.program.methods
        .updateFixtureStatus({ completed: {} }, winner)
        .accounts({
          oracleAuthority: this.wallet.publicKey,
          config: this.configPda,
          fixture: fixturePda,
        } as any);

      const tx = await this.sendWithPriorityFees(method, [
        this.wallet.publicKey,
        this.configPda,
        fixturePda,
      ]);
      console.log(`[Oracle] ✅ Fixture ${matchId} completed! Tx: ${tx}`);

      const recordOnComplete =
        process.env.ORACLE_RECORD_MATCH_ON_COMPLETE !== "false";
      const participants = opts?.participantPlayerIds ?? [];
      if (recordOnComplete && participants.length > 0) {
        for (const playerId of participants) {
          try {
            await this.recordPlayerMatch(matchId, playerId);
          } catch (recordErr) {
            console.warn(
              `[Oracle] recordPlayerMatch skipped for ${playerId} (${matchId}):`,
              recordErr,
            );
          }
        }
      }

      return tx;
    } catch (error) {
      console.error(
        `[Oracle] ❌ Failed to complete fixture ${matchId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Records that a player participated in a fixture.
   * Idempotent on-chain per (player, fixture): repeated calls do not double-drain stamina.
   * Delegates to PlayersService.recordMatch().
   */
  async recordPlayerMatch(matchId: string, playerId: string): Promise<string> {
    return this.players.recordMatch({ matchId, playerId });
  }

  /**
   * Updates real-world stats for a specific Parody Player (Goals, Assists) to boost Yield/Stamina.
   * Delegates to PlayersService.updateStats().
   */
  async updatePlayerStats(
    playerId: string,
    goalsAdded: number,
    assistsAdded: number,
  ): Promise<string> {
    return this.players.updateStats({ playerId, goalsAdded, assistsAdded });
  }
}
