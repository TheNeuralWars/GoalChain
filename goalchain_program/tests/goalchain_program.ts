import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
// @ts-ignore - IDL is generated after build
import { GoalchainProgram } from "../target/types/goalchain_program";
import { assert } from "chai";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

describe("goalchain_program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.GoalchainProgram as Program<GoalchainProgram>;
  const provider = anchor.getProvider();
  
  // Test accounts
  const admin = Keypair.generate();
  const oracleAuthority = Keypair.generate();
  const owner = Keypair.generate();
  const borrower = Keypair.generate();

  const playerId = "ARG_10";
  
  // PDAs
  let parodyPlayerPda: PublicKey;
  let rentalListingPda: PublicKey;
  
  // Dummy mint for the NFT
  const dummyNftMint = Keypair.generate();

  before(async () => {
    // Airdrop SOL to test accounts
    for (const user of [admin, oracleAuthority, owner, borrower]) {
      const sig = await provider.connection.requestAirdrop(user.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    }

    [parodyPlayerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("player"), Buffer.from(playerId)],
      program.programId
    );

    [rentalListingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("rental"), dummyNftMint.publicKey.toBuffer()],
      program.programId
    );
  });

  it("1. Inicializa un Parody Player (Lionel Bitcoin)", async () => {
    await program.methods
      .initParodyPlayer(playerId, "Lionel Bitcoin", 85, 90)
      .accounts({
        admin: admin.publicKey,
        parodyPlayer: parodyPlayerPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const playerAccount = await program.account.parodyPlayer.fetch(parodyPlayerPda);
    assert.equal(playerAccount.name, "Lionel Bitcoin");
    assert.equal(playerAccount.playerId, playerId);
    assert.equal(playerAccount.speed, 85);
    assert.equal(playerAccount.shotPower, 90);
    assert.equal(playerAccount.realWorldGoals, 0);
  });

  it("2. El Oráculo actualiza las stats (Gol en la vida real)", async () => {
    // Simular que Messi metió 2 goles y 1 asistencia
    await program.methods
      .updatePlayerStats(2, 1)
      .accounts({
        oracleAuthority: oracleAuthority.publicKey,
        parodyPlayer: parodyPlayerPda,
      })
      .signers([oracleAuthority])
      .rpc();

    const playerAccount = await program.account.parodyPlayer.fetch(parodyPlayerPda);
    
    // Stats de vida real se suman
    assert.equal(playerAccount.realWorldGoals, 2);
    assert.equal(playerAccount.realWorldAssists, 1);
    
    // El shot_power debe haber incrementado de 90 a 92
    assert.equal(playerAccount.shotPower, 92);
  });

});
