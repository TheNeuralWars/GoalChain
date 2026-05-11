import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
// @ts-ignore - IDL is generated after build
import { GoalchainProgram } from "../target/types/goalchain_program";
import { assert } from "chai";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("goalchain_program", () => {
  console.log("[tests] booting...");

  const connection = new anchor.web3.Connection("http://127.0.0.1:8899", {
    commitment: "confirmed",
  });
  const testWallet = new anchor.Wallet(Keypair.generate());
  const provider = new anchor.AnchorProvider(connection, testWallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const payer = (provider.wallet as any).payer as Keypair;

  const program = anchor.workspace.GoalchainProgram as Program<GoalchainProgram>;

  const admin = Keypair.generate();
  const oracleAuthority = Keypair.generate();
  const owner = Keypair.generate();
  const borrower = Keypair.generate();

  // IMPORTANTE: usar un playerId único por corrida para evitar que el PDA ya exista.
  const playerId = `ARG_10_${Date.now().toString(36)}`;

  let parodyPlayerPda: PublicKey;
  let rentalListingPda: PublicKey;

  const dummyNftMint = Keypair.generate();

  // Config PDA
  let configPda: PublicKey;

  const airdropConfirmed = async (pubkey: PublicKey, sol: number) => {
    const lamports = sol * anchor.web3.LAMPORTS_PER_SOL;
    const sig = await provider.connection.requestAirdrop(pubkey, lamports);
    const latest = await provider.connection.getLatestBlockhash("confirmed");
    await provider.connection.confirmTransaction(
      {
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      },
      "confirmed"
    );
  };

  // ===== Fixtures MVP test state =====
  let betMint: PublicKey;
  let treasuryAta: PublicKey;
  let fixtureVault: PublicKey;
  let treasuryOwner = Keypair.generate();
  let user1 = Keypair.generate();
  let user2 = Keypair.generate();
  let user1Ata: PublicKey;
  let user2Ata: PublicKey;

  // Fixture PDA(s)
  const matchId = `MATCH_${Date.now().toString(36)}`;
  let fixturePda: PublicKey;

  before(async () => {
    console.log("[tests] before(): start");

    const slot = await provider.connection.getSlot("confirmed");
    console.log(`[tests] rpc slot=${slot}`);

    console.log("[tests] airdrop provider wallet...");
    await airdropConfirmed(provider.wallet.publicKey, 2);

    console.log("[tests] airdrop test users...");
    const users: Array<{ name: string; pk: PublicKey }> = [
      { name: "admin", pk: admin.publicKey },
      { name: "oracleAuthority", pk: oracleAuthority.publicKey },
      { name: "owner", pk: owner.publicKey },
      { name: "borrower", pk: borrower.publicKey },
      { name: "treasuryOwner", pk: treasuryOwner.publicKey },
      { name: "user1", pk: user1.publicKey },
      { name: "user2", pk: user2.publicKey },
    ];

    for (const u of users) {
      console.log(`[tests] airdrop ${u.name} ${u.pk.toBase58()} ...`);
      await airdropConfirmed(u.pk, 2);
    }

    [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);

    [parodyPlayerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), Buffer.from(playerId)],
      program.programId
    );

    [rentalListingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("rental"), dummyNftMint.publicKey.toBuffer()],
      program.programId
    );

    // ===== SPL mint + ATAs for fixtures tests =====
    console.log("[tests] create SPL mint for fixtures (test token)...");
    betMint = await createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      6
    );

    const treasury = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      betMint,
      treasuryOwner.publicKey
    );
    treasuryAta = treasury.address;

    const u1 = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      betMint,
      user1.publicKey
    );
    user1Ata = u1.address;

    const u2 = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payer,
      betMint,
      user2.publicKey
    );
    user2Ata = u2.address;

    // Fund users with test tokens
    console.log("[tests] mint test tokens to user ATAs...");
    await mintTo(provider.connection, payer, betMint, user1Ata, payer, 1_000_000_000);
    await mintTo(provider.connection, payer, betMint, user2Ata, payer, 1_000_000_000);

    // ===== init GlobalConfig with real treasury ATA =====
    console.log("[tests] init GlobalConfig...");
    await program.methods
      .initializeConfig(
        oracleAuthority.publicKey,
        treasuryAta,
        1_000, // 10%
        new anchor.BN(15 * 60)
      )
      .accounts({
        admin: admin.publicKey,
        config: configPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([admin])
      .rpc();

    ;[fixturePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fixture"), Buffer.from(matchId)],
      program.programId
    );

    console.log("[tests] before(): done");
  });

  it("1. Inicializa un Parody Player (Lionel Bitcoin)", async () => {
    console.log("[tests] test 1 start");

    await program.methods
      .initParodyPlayer(playerId, "Lionel Bitcoin", 85, 90)
      .accounts({
        admin: admin.publicKey,
        parodyPlayer: parodyPlayerPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([admin])
      .rpc();

    const playerAccount = await program.account.parodyPlayer.fetch(parodyPlayerPda);
    assert.equal(playerAccount.name, "Lionel Bitcoin");
    assert.equal(playerAccount.playerId, playerId);
    assert.equal(playerAccount.speed, 85);
    assert.equal(playerAccount.shotPower, 90);
    assert.equal(playerAccount.realWorldGoals, 0);

    console.log("[tests] test 1 done");
  });

  it("2. El Oráculo actualiza las stats (Gol en la vida real)", async () => {
    console.log("[tests] test 2 start");

    await program.methods
      .updatePlayerStats(2, 1)
      .accounts({
        oracleAuthority: oracleAuthority.publicKey,
        config: configPda,
        parodyPlayer: parodyPlayerPda,
      } as any)
      .signers([oracleAuthority])
      .rpc();

    const playerAccount = await program.account.parodyPlayer.fetch(parodyPlayerPda);
    assert.equal(playerAccount.realWorldGoals, 2);
    assert.equal(playerAccount.realWorldAssists, 1);
    assert.equal(playerAccount.shotPower, 92);

    console.log("[tests] test 2 done");
  });

  it("3. MVP Fixtures: inicializa fixture, acepta apuestas, resuelve y paga payouts + fee", async () => {
    console.log("[tests] fixtures e2e start");

    // Start time sufficiently in future to satisfy cutoff
    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now + 60 * 60); // +1h

    // 3.1 Initialize fixture (oracle-only)
    await program.methods
      .initializeFixture(
        matchId,
        "TEAM_A",
        "TEAM_B",
        startTime
      )
      .accounts({
        oracleAuthority: oracleAuthority.publicKey,
        config: configPda,
        fixture: fixturePda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([oracleAuthority])
      .rpc();

    // Fixture vault is a PDA token account: seeds ["fixture_vault", fixture]
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("fixture_vault"), fixturePda.toBuffer()],
      program.programId
    );
    fixtureVault = vaultPda;

    // Ensure vault token account exists and has correct mint
    const vaultAcc = await getAccount(provider.connection, fixtureVault);
    assert.equal(vaultAcc.mint.toBase58(), betMint.toBase58());

    // 3.2 Place bets: user1 on TeamA, user2 on TeamB
    const bet1Amount = new anchor.BN(200_000_000); // 200
    const bet2Amount = new anchor.BN(300_000_000); // 300

    const [bet1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), user1.publicKey.toBuffer(), fixturePda.toBuffer()],
      program.programId
    );
    const [bet2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), user2.publicKey.toBuffer(), fixturePda.toBuffer()],
      program.programId
    );

    await program.methods
      .placeBet({ teamA: {} }, bet1Amount)
      .accounts({
        user: user1.publicKey,
        config: configPda,
        fixture: fixturePda,
        userBet: bet1Pda,
        userTokenAccount: user1Ata,
        fixtureVault: fixtureVault,
        tokenMint: betMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([user1])
      .rpc();

    await program.methods
      .placeBet({ teamB: {} }, bet2Amount)
      .accounts({
        user: user2.publicKey,
        config: configPda,
        fixture: fixturePda,
        userBet: bet2Pda,
        userTokenAccount: user2Ata,
        fixtureVault: fixtureVault,
        tokenMint: betMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([user2])
      .rpc();

    // 3.3 Resolve fixture: Completed, winner TeamB
    await program.methods
      .updateFixtureStatus({ completed: {} }, { teamB: {} })
      .accounts({
        oracleAuthority: oracleAuthority.publicKey,
        config: configPda,
        fixture: fixturePda,
      } as any)
      .signers([oracleAuthority])
      .rpc();

    // Track balances before claim
    const u1Before = Number((await getAccount(provider.connection, user1Ata)).amount);
    const u2Before = Number((await getAccount(provider.connection, user2Ata)).amount);
    const treasuryBefore = Number((await getAccount(provider.connection, treasuryAta)).amount);

    // 3.4 Claim payouts
    // user1 (loser) should fail (NotAWinner)
    let loserFailed = false;
    try {
      await program.methods
        .claimBetPayout()
        .accounts({
          user: user1.publicKey,
          config: configPda,
          fixture: fixturePda,
          userBet: bet1Pda,
          userTokenAccount: user1Ata,
          fixtureVault: fixtureVault,
          treasuryTokenAccount: treasuryAta,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([user1])
        .rpc();
    } catch (e) {
      loserFailed = true;
    }
    assert.isTrue(loserFailed);

    // user2 (winner)
    await program.methods
      .claimBetPayout()
      .accounts({
        user: user2.publicKey,
        config: configPda,
        fixture: fixturePda,
        userBet: bet2Pda,
        userTokenAccount: user2Ata,
        fixtureVault: fixtureVault,
        treasuryTokenAccount: treasuryAta,
        tokenMint: betMint,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([user2])
      .rpc();

    const u1After = Number((await getAccount(provider.connection, user1Ata)).amount);
    const u2After = Number((await getAccount(provider.connection, user2Ata)).amount);
    const treasuryAfter = Number((await getAccount(provider.connection, treasuryAta)).amount);

    // u1 unchanged
    assert.equal(u1After, u1Before);

    // treasury fee = (200+300)*10% = 50
    const expectedFee = 50_000_000;
    assert.equal(treasuryAfter - treasuryBefore, expectedFee);

    // u2 payout = pool(500) - fee(50) = 450 (y u2 ya pagó 300 al apostar, así que neto: +150)
    const expectedPayout = 450_000_000;
    assert.equal(u2After - u2Before, expectedPayout);

    console.log("[tests] fixtures e2e done");
  });
});
