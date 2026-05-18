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
} from "@solana/spl-token";

describe("goalchain_program", () => {
  console.log("⚽ [GoalChain Tests] Booting integration test suite...");

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

  // Keypairs for various actors
  const oracleAuthority = Keypair.generate();
  const owner = Keypair.generate();
  const borrower = Keypair.generate();
  const treasuryOwner = Keypair.generate();
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();
  const playerA = Keypair.generate();
  const playerB = Keypair.generate();

  // Test states
  const playerId = `ARG_10_${Date.now().toString(36)}`;
  const matchId = `MATCH_${Date.now().toString(36)}`;
  const dummyNftMint = Keypair.generate();

  // PDAs
  let configPda: PublicKey;
  let parodyPlayerPda: PublicKey;
  let rentalListingPda: PublicKey;
  let fixturePda: PublicKey;
  let fixtureVault: PublicKey;
  let liveStatePda: PublicKey;
  let marketPda: PublicKey;
  let marketVaultPda: PublicKey;
  let userStakePda: PublicKey;

  // SPL token addresses
  let betMint: PublicKey;
  let treasuryAta: PublicKey;
  let user1Ata: PublicKey;
  let user2Ata: PublicKey;
  let playerAAta: PublicKey;
  let playerBAta: PublicKey;
  let vaultStakeAta: PublicKey;

  // Utility to request airdrop and await confirmation
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

  before(async () => {
    console.log("⚙️ [GoalChain Tests] Preparing environment & minting test tokens...");

    // Fund the local provider and our generated keys
    await airdropConfirmed(provider.wallet.publicKey, 5);
    const actors = [
      { name: "oracleAuthority", pk: oracleAuthority.publicKey },
      { name: "owner", pk: owner.publicKey },
      { name: "borrower", pk: borrower.publicKey },
      { name: "treasuryOwner", pk: treasuryOwner.publicKey },
      { name: "user1", pk: user1.publicKey },
      { name: "user2", pk: user2.publicKey },
      { name: "playerA", pk: playerA.publicKey },
      { name: "playerB", pk: playerB.publicKey },
    ];

    for (const a of actors) {
      await airdropConfirmed(a.pk, 5);
    }

    // Derive Core PDAs
    [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId);
    [parodyPlayerPda] = PublicKey.findProgramAddressSync([Buffer.from("player"), Buffer.from(playerId)], program.programId);
    [rentalListingPda] = PublicKey.findProgramAddressSync([Buffer.from("rental"), dummyNftMint.publicKey.toBuffer()], program.programId);
    [fixturePda] = PublicKey.findProgramAddressSync([Buffer.from("fixture"), Buffer.from(matchId)], program.programId);
    [fixtureVault] = PublicKey.findProgramAddressSync([Buffer.from("fixture_vault"), fixturePda.toBuffer()], program.programId);
    [liveStatePda] = PublicKey.findProgramAddressSync([Buffer.from("live_state"), fixturePda.toBuffer()], program.programId);
    [marketPda] = PublicKey.findProgramAddressSync([Buffer.from("market"), fixturePda.toBuffer(), Buffer.from([1])], program.programId);
    [marketVaultPda] = PublicKey.findProgramAddressSync([Buffer.from("market_vault"), marketPda.toBuffer()], program.programId);
    [userStakePda] = PublicKey.findProgramAddressSync([Buffer.from("stake"), user1.publicKey.toBuffer()], program.programId);

    // Deploy spl token mint
    betMint = await createMint(provider.connection, payer, provider.wallet.publicKey, null, 6);

    // Generate ATAs
    treasuryAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, treasuryOwner.publicKey)).address;
    user1Ata = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, user1.publicKey)).address;
    user2Ata = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, user2.publicKey)).address;
    playerAAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, playerA.publicKey)).address;
    playerBAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, playerB.publicKey)).address;
    vaultStakeAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, configPda, true)).address;

    // Mint supply to users
    await mintTo(provider.connection, payer, betMint, user1Ata, payer, 10_000_000_000);
    await mintTo(provider.connection, payer, betMint, user2Ata, payer, 10_000_000_000);
    await mintTo(provider.connection, payer, betMint, playerAAta, payer, 10_000_000_000);
    await mintTo(provider.connection, payer, betMint, playerBAta, payer, 10_000_000_000);

    console.log("✅ [GoalChain Tests] Environment initialized!");
  });

  describe("🏛️ 1. GLOBAL CONFIG & ADMIN OPERATIONS", () => {
    it("Inicializa o actualiza la configuración global del protocolo de forma segura", async () => {
      const cfgInfo = await provider.connection.getAccountInfo(configPda, "confirmed");
      if (!cfgInfo) {
        await program.methods
          .initializeConfig(oracleAuthority.publicKey, treasuryAta, 1000, new anchor.BN(15 * 60))
          .accounts({
            admin: payer.publicKey,
            config: configPda,
            systemProgram: SystemProgram.programId,
          } as any)
          .signers([payer])
          .rpc();
      } else {
        await program.methods
          .updateConfig(oracleAuthority.publicKey, treasuryAta, 1000, new anchor.BN(15 * 60))
          .accounts({
            admin: payer.publicKey,
            config: configPda,
          } as any)
          .signers([payer])
          .rpc();
      }

      const config = await program.account.globalConfig.fetch(configPda);
      assert.equal(config.admin.toBase58(), payer.publicKey.toBase58());
      assert.equal(config.oracleAuthority.toBase58(), oracleAuthority.publicKey.toBase58());
      assert.equal(config.treasuryTokenAccount.toBase58(), treasuryAta.toBase58());
      assert.equal(config.feeBps, 1000);
    });

    it("Falla al inicializar con un fee por encima del límite duro (20%)", async () => {
      const wrongConfigPda = Keypair.generate();
      let failed = false;
      try {
        await program.methods
          .initializeConfig(oracleAuthority.publicKey, treasuryAta, 2500, new anchor.BN(15 * 60))
          .accounts({
            admin: payer.publicKey,
            config: wrongConfigPda.publicKey,
            systemProgram: SystemProgram.programId,
          } as any)
          .signers([payer, wrongConfigPda])
          .rpc();
      } catch (e) {
        failed = true;
      }
      assert.isTrue(failed, "Debería haber fallado debido al fee excesivo");
    });
  });

  describe("🔒 2. STAKING & UNSTAKING ECONOMY ($GCH VAULT)", () => {
    it("Permite a un usuario stakear tokens $GCH", async () => {
      const stakeAmount = new anchor.BN(500_000_000); // 500 tokens
      await program.methods
        .stake(stakeAmount)
        .accounts({
          user: user1.publicKey,
          userStake: userStakePda,
          userTokenAccount: user1Ata,
          vaultTokenAccount: vaultStakeAta,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([user1])
        .rpc();

      const userStake = await program.account.userStake.fetch(userStakePda);
      assert.equal(userStake.amount.toString(), stakeAmount.toString());
      assert.equal(userStake.owner.toBase58(), user1.publicKey.toBase58());

      const vaultBalance = (await getAccount(provider.connection, vaultStakeAta)).amount;
      assert.equal(vaultBalance.toString(), stakeAmount.toString());
    });

    it("Permite al usuario retirar (unstake) una parte de sus tokens stakeados", async () => {
      const unstakeAmount = new anchor.BN(200_000_000); // 200 tokens
      await program.methods
        .unstake(unstakeAmount)
        .accounts({
          user: user1.publicKey,
          userStake: userStakePda,
        } as any)
        .signers([user1])
        .rpc();

      const userStake = await program.account.userStake.fetch(userStakePda);
      assert.equal(userStake.amount.toString(), "300000000"); // 500 - 200 = 300
    });

    it("Falla si el usuario intenta retirar más tokens de los que tiene stakeados (Hostile flow)", async () => {
      const invalidUnstakeAmount = new anchor.BN(10_000_000_000); // 10,000 tokens
      let failed = false;
      try {
        await program.methods
          .unstake(invalidUnstakeAmount)
          .accounts({
            user: user1.publicKey,
            userStake: userStakePda,
          } as any)
          .signers([user1])
          .rpc();
      } catch (e) {
        failed = true;
      }
      assert.isTrue(failed, "Debería haber rechazado el retiro por fondos insuficientes");
    });
  });

  describe("⚽ 3. PARODY PLAYER REGISTRY & ORACLE STATS UPDATES", () => {
    it("Inicializa un Parody Player (Lamine Ya-Hype)", async () => {
      await program.methods
        .initParodyPlayer(playerId, "Lamine Ya-Hype", 92, 88)
        .accounts({
          admin: payer.publicKey,
          parodyPlayer: parodyPlayerPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([payer])
        .rpc();

      const player = await program.account.parodyPlayer.fetch(parodyPlayerPda);
      assert.equal(player.name, "Lamine Ya-Hype");
      assert.equal(player.playerId, playerId);
      assert.equal(player.speed, 92);
      assert.equal(player.shotPower, 88);
      assert.equal(player.realWorldGoals, 0);
    });

    it("Permite al Oráculo oficial actualizar las métricas y fisonomía de fuerza", async () => {
      await program.methods
        .updatePlayerStats(1, 2) // +1 gol, +2 asistencias
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          parodyPlayer: parodyPlayerPda,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const player = await program.account.parodyPlayer.fetch(parodyPlayerPda);
      assert.equal(player.realWorldGoals, 1);
      assert.equal(player.realWorldAssists, 2);
      assert.equal(player.shotPower, 89); // 88 + 1 gol = 89
    });

    it("Rechaza actualizaciones de estadísticas de entidades no autorizadas (Hostile flow)", async () => {
      const evilHacker = Keypair.generate();
      let failed = false;
      try {
        await program.methods
          .updatePlayerStats(5, 5)
          .accounts({
            oracleAuthority: evilHacker.publicKey,
            config: configPda,
            parodyPlayer: parodyPlayerPda,
          } as any)
          .signers([evilHacker])
          .rpc();
      } catch (e) {
        failed = true;
      }
      assert.isTrue(failed, "Debería bloquear la transacción de un oráculo no autorizado");
    });
  });

  describe("🛒 4. PARODY PLAYER NFT RENTAL MARKETPLACE", () => {
    let borrowerTokenAta: PublicKey;
    let ownerTokenAta: PublicKey;

    before(async () => {
      borrowerTokenAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, borrower.publicKey)).address;
      ownerTokenAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, owner.publicKey)).address;
      await mintTo(provider.connection, payer, betMint, borrowerTokenAta, payer, 1_000_000_000);
    });

    it("Permite a un poseedor listar su NFT en alquiler para partidos", async () => {
      const pricePerMatch = new anchor.BN(100_000_000); // 100 tokens

      await program.methods
        .listForRent(pricePerMatch)
        .accounts({
          owner: owner.publicKey,
          rentalListing: rentalListingPda,
          parodyPlayerMint: dummyNftMint.publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([owner])
        .rpc();

      const listing = await program.account.rentalListing.fetch(rentalListingPda);
      assert.equal(listing.owner.toBase58(), owner.publicKey.toBase58());
      assert.equal(listing.pricePerMatch.toString(), pricePerMatch.toString());
      assert.isTrue(listing.isActive);
      assert.isNull(listing.currentBorrower);
    });

    it("Permite a otro usuario rentar el NFT listado mediante pago SPL", async () => {
      const ownerBefore = (await getAccount(provider.connection, ownerTokenAta)).amount;
      const borrowerBefore = (await getAccount(provider.connection, borrowerTokenAta)).amount;

      await program.methods
        .rentNft()
        .accounts({
          borrower: borrower.publicKey,
          rentalListing: rentalListingPda,
          borrowerTokenAccount: borrowerTokenAta,
          ownerTokenAccount: ownerTokenAta,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([borrower])
        .rpc();

      const listing = await program.account.rentalListing.fetch(rentalListingPda);
      assert.equal(listing.currentBorrower!.toBase58(), borrower.publicKey.toBase58());

      const ownerAfter = (await getAccount(provider.connection, ownerTokenAta)).amount;
      const borrowerAfter = (await getAccount(provider.connection, borrowerTokenAta)).amount;

      assert.equal(Number(ownerAfter) - Number(ownerBefore), 100_000_000);
      assert.equal(Number(borrowerBefore) - Number(borrowerAfter), 100_000_000);
    });

    it("Impide rentar un NFT que ya está alquilado por otra persona (Hostile flow)", async () => {
      const anotherBorrower = Keypair.generate();
      const anotherAta = (await getOrCreateAssociatedTokenAccount(provider.connection, payer, betMint, anotherBorrower.publicKey)).address;
      await mintTo(provider.connection, payer, betMint, anotherAta, payer, 200_000_000);

      let failed = false;
      try {
        await program.methods
          .rentNft()
          .accounts({
            borrower: anotherBorrower.publicKey,
            rentalListing: rentalListingPda,
            borrowerTokenAccount: anotherAta,
            ownerTokenAccount: ownerTokenAta,
            tokenMint: betMint,
            tokenProgram: TOKEN_PROGRAM_ID,
          } as any)
          .signers([anotherBorrower])
          .rpc();
      } catch (e) {
        failed = true;
      }
      assert.isTrue(failed, "Debería haber fallado porque el NFT ya está rentado");
    });
  });

  describe("🎯 5. PvP ARENA WAGERS (DESAFÍOS ENTRE JUGADORES)", () => {
    const wagerTs = new anchor.BN(Math.floor(Date.now() / 1000));
    let wagerPda: PublicKey;
    let wagerVaultPda: PublicKey;
    const wagerAmount = new anchor.BN(300_000_000); // 300 tokens

    before(() => {
      [wagerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("wager"), playerA.publicKey.toBuffer(), wagerTs.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      [wagerVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("wager_vault"), wagerPda.toBuffer()],
        program.programId
      );
    });

    it("Permite a PlayerA crear un desafío PvP depositando su apuesta", async () => {
      await program.methods
        .createWager(wagerTs, wagerAmount)
        .accounts({
          playerA: playerA.publicKey,
          wager: wagerPda,
          playerAToken: playerAAta,
          wagerVault: wagerVaultPda,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([playerA])
        .rpc();

      const wager = await program.account.wager.fetch(wagerPda);
      assert.equal(wager.playerA.toBase58(), playerA.publicKey.toBase58());
      assert.equal(wager.amount.toString(), wagerAmount.toString());
      assert.deepEqual(wager.state, { created: {} });

      const vaultBalance = (await getAccount(provider.connection, wagerVaultPda)).amount;
      assert.equal(vaultBalance.toString(), wagerAmount.toString());
    });

    it("Permite a PlayerB aceptar el desafío igualando la apuesta", async () => {
      await program.methods
        .acceptWager()
        .accounts({
          playerB: playerB.publicKey,
          wager: wagerPda,
          playerBToken: playerBAta,
          wagerVault: wagerVaultPda,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([playerB])
        .rpc();

      const wager = await program.account.wager.fetch(wagerPda);
      assert.equal(wager.playerB!.toBase58(), playerB.publicKey.toBase58());
      assert.deepEqual(wager.state, { accepted: {} });

      const vaultBalance = (await getAccount(provider.connection, wagerVaultPda)).amount;
      assert.equal(vaultBalance.toString(), (wagerAmount.muln(2)).toString()); // 600 tokens pooled
    });

    it("Permite al Oráculo oficial resolver la apuesta PvP a favor del ganador", async () => {
      const winnerBefore = (await getAccount(provider.connection, playerAAta)).amount;

      await program.methods
        .resolveWager(true) // Player A gana
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          wager: wagerPda,
          wagerVault: wagerVaultPda,
          winnerToken: playerAAta,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const wager = await program.account.wager.fetch(wagerPda);
      assert.deepEqual(wager.state, { resolved: {} });

      const winnerAfter = (await getAccount(provider.connection, playerAAta)).amount;
      assert.equal(Number(winnerAfter) - Number(winnerBefore), 600_000_000); // 300 + 300 = 600 tokens
    });
  });

  describe("🏆 6. PRE-MATCH SPORT BETTING POOLS (PARIMUTUEL ENGINE)", () => {
    it("Inicializa un partido para apuestas deportivas oficiales del Oráculo", async () => {
      const now = Math.floor(Date.now() / 1000);
      const startTime = new anchor.BN(now + 2 * 3600); // +2 horas

      await program.methods
        .initializeFixture(matchId, "Argentina", "Francia", startTime)
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          fixture: fixturePda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const fixture = await program.account.fixture.fetch(fixturePda);
      assert.equal(fixture.matchId, matchId);
      assert.equal(fixture.teamA, "Argentina");
      assert.equal(fixture.teamB, "Francia");
      assert.deepEqual(fixture.status, { upcoming: {} });
    });

    it("Permite a los usuarios colocar apuestas pre-match", async () => {
      const bet1 = new anchor.BN(400_000_000); // 400 a Argentina
      const bet2 = new anchor.BN(600_000_000); // 600 a Francia

      const [b1Pda] = PublicKey.findProgramAddressSync([Buffer.from("bet"), user1.publicKey.toBuffer(), fixturePda.toBuffer()], program.programId);
      const [b2Pda] = PublicKey.findProgramAddressSync([Buffer.from("bet"), user2.publicKey.toBuffer(), fixturePda.toBuffer()], program.programId);

      await program.methods
        .placeBet({ teamA: {} }, bet1)
        .accounts({
          user: user1.publicKey,
          config: configPda,
          fixture: fixturePda,
          userBet: b1Pda,
          userTokenAccount: user1Ata,
          fixtureVault: fixtureVault,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([user1])
        .rpc();

      await program.methods
        .placeBet({ teamB: {} }, bet2)
        .accounts({
          user: user2.publicKey,
          config: configPda,
          fixture: fixturePda,
          userBet: b2Pda,
          userTokenAccount: user2Ata,
          fixtureVault: fixtureVault,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([user2])
        .rpc();

      const fixture = await program.account.fixture.fetch(fixturePda);
      assert.equal(fixture.poolA.toString(), bet1.toString());
      assert.equal(fixture.poolB.toString(), bet2.toString());
    });

    it("El oráculo actualiza el partido como Completed declarando un ganador", async () => {
      await program.methods
        .updateFixtureStatus({ completed: {} }, { teamA: {} }) // Gana Argentina (user1)
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          fixture: fixturePda,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const fixture = await program.account.fixture.fetch(fixturePda);
      assert.deepEqual(fixture.status, { completed: {} });
      assert.deepEqual(fixture.winner, { teamA: {} });
    });

    it("Permite reclamar recompensas de pozo parimutuel aplicando el fee", async () => {
      const u1Before = (await getAccount(provider.connection, user1Ata)).amount;
      const treasuryBefore = (await getAccount(provider.connection, treasuryAta)).amount;

      const [b1Pda] = PublicKey.findProgramAddressSync([Buffer.from("bet"), user1.publicKey.toBuffer(), fixturePda.toBuffer()], program.programId);

      await program.methods
        .claimBetPayout()
        .accounts({
          user: user1.publicKey,
          config: configPda,
          fixture: fixturePda,
          userBet: b1Pda,
          userTokenAccount: user1Ata,
          fixtureVault: fixtureVault,
          treasuryTokenAccount: treasuryAta,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([user1])
        .rpc();

      const u1After = (await getAccount(provider.connection, user1Ata)).amount;
      const treasuryAfter = (await getAccount(provider.connection, treasuryAta)).amount;

      // Pozo total = 400 + 600 = 1000 tokens
      // User1 aportó el 100% de la cuota ganadora (400 de 400).
      // Ganancia bruta = 1000 tokens.
      // Fee = 1000 * 10% = 100 tokens.
      // Pago neto = 1000 - 100 = 900 tokens.
      assert.equal(Number(u1After) - Number(u1Before), 900_000_000);
      assert.equal(Number(treasuryAfter) - Number(treasuryBefore), 100_000_000);
    });

    it("Rechaza reclamos redundantes o dobles reclamos del ganador (Hostile flow)", async () => {
      const [b1Pda] = PublicKey.findProgramAddressSync([Buffer.from("bet"), user1.publicKey.toBuffer(), fixturePda.toBuffer()], program.programId);
      let failed = false;
      try {
        await program.methods
          .claimBetPayout()
          .accounts({
            user: user1.publicKey,
            config: configPda,
            fixture: fixturePda,
            userBet: b1Pda,
            userTokenAccount: user1Ata,
            fixtureVault: fixtureVault,
            treasuryTokenAccount: treasuryAta,
            tokenMint: betMint,
            tokenProgram: TOKEN_PROGRAM_ID,
          } as any)
          .signers([user1])
          .rpc();
      } catch (e) {
        failed = true;
      }
      assert.isTrue(failed, "Debería haber fallado al intentar reclamar el pozo ya vaciado");
    });
  });

  describe("⚡ 7. LIVE IN-PLAY SPORTS MARKETS", () => {
    it("El oráculo actualiza la transmisión del partido en tiempo real", async () => {
      await program.methods
        .oracleUpsertLiveState(45, 2, 2, true, false) // Minuto 45, marcador 2-2, Medio Tiempo (HT)
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          fixture: fixturePda,
          liveState: liveStatePda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const live = await program.account.liveMatchState.fetch(liveStatePda);
      assert.equal(live.minute, 45);
      assert.equal(live.scoreA, 2);
      assert.equal(live.scoreB, 2);
      assert.isTrue(live.isHt);
    });

    it("El oráculo crea un mercado de apuestas en vivo para el siguiente gol", async () => {
      await program.methods
        .oracleCreateMarket(
          1, // market_id
          { nextGoal: {} },
          new anchor.BN(2), // Delay de desbloqueo de 2 segundos
          new anchor.BN(0), // Sin cooldown
          90, // Cierra en el minuto 90
          1,  // Diferencia máxima de 1 gol
          true, // Requiere empate
          betMint
        )
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          fixture: fixturePda,
          market: marketPda,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const market = await program.account.market.fetch(marketPda);
      assert.deepEqual(market.status, { open: {} });
      assert.deepEqual(market.marketType, { nextGoal: {} });
    });

    it("Permite a un usuario apostar en vivo sobre un mercado abierto", async () => {
      const ticketId = new anchor.BN(Date.now());
      const betAmount = new anchor.BN(150_000_000); // 150 tokens al empate (Draw)

      const [posPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("position"), user1.publicKey.toBuffer(), marketPda.toBuffer(), ticketId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .placeMarketBet(ticketId, { draw: {} }, betAmount)
        .accounts({
          user: user1.publicKey,
          config: configPda,
          fixture: fixturePda,
          market: marketPda,
          liveState: liveStatePda,
          position: posPda,
          userTokenAccount: user1Ata,
          marketVault: marketVaultPda,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([user1])
        .rpc();

      const position = await program.account.marketPosition.fetch(posPda);
      assert.equal(position.amount.toString(), betAmount.toString());
      assert.deepEqual(position.prediction, { draw: {} });
    });

    it("El oráculo resuelve el mercado en vivo declarando un ganador", async () => {
      await program.methods
        .oracleUpdateMarketStatus({ resolved: {} }, { draw: {} }) // Draw gana
        .accounts({
          oracleAuthority: oracleAuthority.publicKey,
          config: configPda,
          market: marketPda,
        } as any)
        .signers([oracleAuthority])
        .rpc();

      const market = await program.account.market.fetch(marketPda);
      assert.deepEqual(market.status, { resolved: {} });
      assert.deepEqual(market.winner, { draw: {} });
    });

    it("Permite al usuario reclamar ganancias del mercado en vivo aplicando el fee", async () => {
      const u1Before = (await getAccount(provider.connection, user1Ata)).amount;
      const treasuryBefore = (await getAccount(provider.connection, treasuryAta)).amount;

      // Esperar 3 segundos para satisfacer el delay del mercado
      await new Promise((r) => setTimeout(r, 3000));

      const ticketId = new anchor.BN(Date.now()); // No se usa en claim, pero necesitamos position PDA
      // Buscaremos la posición que creamos en el test anterior. Para eso, recuperamos los IDs de la cuenta
      // de la posición actual del usuario filtrando por el owner en Anchor.
      const positions = await program.account.marketPosition.all([
        {
          memcmp: {
            offset: 8, // saltar discriminator
            bytes: user1.publicKey.toBase58(),
          },
        },
      ]);
      assert.equal(positions.length, 1);
      const posPda = positions[0].publicKey;

      await program.methods
        .claimMarketPayout()
        .accounts({
          user: user1.publicKey,
          config: configPda,
          market: marketPda,
          position: posPda,
          userTokenAccount: user1Ata,
          marketVault: marketVaultPda,
          treasuryTokenAccount: treasuryAta,
          tokenMint: betMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .signers([user1])
        .rpc();

      const u1After = (await getAccount(provider.connection, user1Ata)).amount;
      const treasuryAfter = (await getAccount(provider.connection, treasuryAta)).amount;

      // Apostado: 150 tokens.
      // Ganancia neta = 150 - (150 * 10% fee) = 135 tokens devueltos.
      assert.equal(Number(u1After) - Number(u1Before), 135_000_000);
      assert.equal(Number(treasuryAfter) - Number(treasuryBefore), 15_000_000);
    });
  });

  describe("📈 8. JITOSOL PRESALE VAULT ($GCH LAUNCHPAD)", () => {
    let jitoSolMint: PublicKey;
    let treasuryJitoAta: PublicKey;
    let presaleAllocationPda: PublicKey;

    const presaleUser = Keypair.generate();
    const stakePool = Keypair.generate();
    const withdrawAuthority = Keypair.generate();
    const reserveStake = Keypair.generate();
    const managerFeeAccount = Keypair.generate();
    const referralFeeAccount = Keypair.generate();

    before(async () => {
      // Airdrop SOL to presaleUser
      await airdropConfirmed(presaleUser.publicKey, 5);
      
      // Airdrop to reserve stake to make it exist as a system owned account (since transfer CPI target requires it)
      await airdropConfirmed(reserveStake.publicKey, 1);

      // Create JitoSOL Mock Mint
      jitoSolMint = await createMint(
        provider.connection,
        payer,
        provider.wallet.publicKey,
        null,
        9
      );

      // Create Treasury JitoSOL ATA
      const ataAccount = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        jitoSolMint,
        treasuryOwner.publicKey
      );
      treasuryJitoAta = ataAccount.address;

      // Derive Presale Allocation PDA
      [presaleAllocationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("presale"), presaleUser.publicKey.toBuffer()],
        program.programId
      );
    });

    it("Permite a un usuario contribuir a la preventa depositando SOL (JitoSOL Staking Vault)", async () => {
      const depositAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
      const reserveBalanceBefore = await provider.connection.getBalance(reserveStake.publicKey);

      await program.methods
        .contributePresale(depositAmount)
        .accounts({
          user: presaleUser.publicKey,
          presaleAllocation: presaleAllocationPda,
          treasuryJitoAta: treasuryJitoAta,
          stakePool: stakePool.publicKey,
          withdrawAuthority: withdrawAuthority.publicKey,
          reserveStake: reserveStake.publicKey,
          managerFeeAccount: managerFeeAccount.publicKey,
          referralFeeAccount: referralFeeAccount.publicKey,
          poolMint: jitoSolMint,
          stakePoolProgram: SystemProgram.programId, // Bypasses to transfer SOL directly
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([presaleUser])
        .rpc();

      // Verify Presale Allocation state
      const presale = await program.account.presaleAllocation.fetch(presaleAllocationPda);
      assert.equal(presale.solDeposited.toString(), depositAmount.toString());
      assert.equal(presale.owner.toBase58(), presaleUser.publicKey.toBase58());

      // Verify SOL was transferred from user to reserveStake account
      const reserveBalanceAfter = await provider.connection.getBalance(reserveStake.publicKey);
      assert.equal(reserveBalanceAfter - reserveBalanceBefore, depositAmount.toNumber());
    });
  });
});
