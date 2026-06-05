import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { OracleService } from "../../OracleService.js";
import { loadWalletOrDummy } from "../utils.js";

export const syncAuthorityCommand = new Command("sync-authority")
  .description("Sync oracle authority to config PDA")
  .requiredOption("--treasury-ata <address>", "Treasury token account address")
  .option("--jackpot-ata <address>", "Jackpot token account address (defaults to treasury)")
  .option("--rpc-url <url>", "Solana RPC URL", "http://127.0.0.1:8899")
  .option("--keypair <path>", "Path to keypair file", "~/.config/solana/id.json")
  .option("--program-id <id>", "Program ID", "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg")
  .option("--dry-run", "Print transaction details without sending", false)
  .action(async (opts) => {
    try {
      const treasuryAta = new PublicKey(opts.treasuryAta);
      const jackpotAta = opts.jackpotAta ? new PublicKey(opts.jackpotAta) : treasuryAta;

      if (opts.dryRun) {
        const wallet = loadWalletOrDummy(opts.keypair, true);
        console.log(`[CLI] Syncing oracle authority (dry-run)...`);
        console.log(`  Treasury ATA: ${treasuryAta.toBase58()}`);
        console.log(`  Jackpot ATA: ${jackpotAta.toBase58()}`);
        console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`[DRY RUN] Would call syncOracleAuthority with:`);
        console.log(`  treasuryAta: ${treasuryAta.toBase58()}`);
        console.log(`  jackpotAta: ${jackpotAta.toBase58()}`);
        return;
      }

      const wallet = loadWalletOrDummy(opts.keypair, false);
      const oracle = new OracleService(opts.rpcUrl, wallet, opts.programId);

      console.log(`[CLI] Syncing oracle authority...`);
      console.log(`  Treasury ATA: ${treasuryAta.toBase58()}`);
      console.log(`  Jackpot ATA: ${jackpotAta.toBase58()}`);
      console.log(`  Wallet: ${oracle.wallet.publicKey.toBase58()}`);

      const tx = await oracle.syncOracleAuthority(treasuryAta, jackpotAta);
      console.log(`[CLI] ✅ Oracle authority synced. Tx: ${tx}`);
      process.exit(0);
    } catch (error) {
      console.error(`[CLI] ❌ Failed to sync oracle authority:`, error);
      process.exit(1);
    }
  });