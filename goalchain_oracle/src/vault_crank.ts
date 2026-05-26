import fs from "fs";
import path from "path";

interface VaultCrankReport {
  timestamp_iso: string;
  mode: "dry-run" | "execute";
  principal_sol: number;
  current_sol: number;
  excess_sol: number;
  buyback_share: number;
  jackpot_share: number;
  reinvest_share: number;
  buyback_sol: number;
  jackpot_sol: number;
  reinvest_sol: number;
  gch_price_usd: number;
  estimated_gch_burned: number;
  tx_hashes: string[];
  notes: string[];
}

const BUYBACK_SHARE = Number(process.env.BUYBACK_SHARE_OF_YIELD || "0.60");
const JACKPOT_SHARE = Number(process.env.JACKPOT_SHARE_OF_YIELD || "0.10");
const REINVEST_SHARE = Number(process.env.REINVEST_SHARE_OF_YIELD || "0.30");

function clampShare(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function fakeTx(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 18);
  return `${prefix}_${rand}`;
}

async function main() {
  const mode = process.env.VAULT_CRANK_EXECUTE === "1" ? "execute" : "dry-run";
  const principalSol = Number(process.env.VAULT_PRINCIPAL_SOL || "5000");
  const currentSol = Number(process.env.VAULT_CURRENT_SOL || "5032.7");
  const minExcessSol = Number(process.env.VAULT_MIN_EXCESS_SOL || "0.1");
  const gchPriceUsd = Number(process.env.GCH_PRICE_USD || "0.01");
  const solPriceUsd = Number(process.env.SOL_PRICE_USD || "180");

  const buybackShare = clampShare(BUYBACK_SHARE);
  const jackpotShare = clampShare(JACKPOT_SHARE);
  const reinvestShare = clampShare(REINVEST_SHARE);
  const shareSum = buybackShare + jackpotShare + reinvestShare;
  if (Math.abs(shareSum - 1) > 0.0001) {
    throw new Error(
      `Invalid share split: buyback+jackpot+reinvest must equal 1 (got ${shareSum})`,
    );
  }

  const excessSol = Math.max(0, currentSol - principalSol);
  let buybackSol = 0;
  let jackpotSol = 0;
  let reinvestSol = 0;
  let estimatedGchBurned = 0;
  const notes: string[] = [];
  const txHashes: string[] = [];

  if (excessSol < minExcessSol) {
    notes.push(
      `Excess SOL (${excessSol.toFixed(6)}) is below threshold (${minExcessSol}). No-op crank.`,
    );
  } else {
    buybackSol = excessSol * buybackShare;
    jackpotSol = excessSol * jackpotShare;
    reinvestSol = excessSol * reinvestShare;

    const buybackUsd = buybackSol * solPriceUsd;
    estimatedGchBurned = gchPriceUsd > 0 ? buybackUsd / gchPriceUsd : 0;

    if (mode === "execute") {
      throw new Error(
        "Execute mode is disabled: Real Jupiter swap and GCH burn integration is not implemented yet. " +
        "Please use dry-run mode (VAULT_CRANK_EXECUTE=0) to preview calculations safely."
      );
    } else {
      txHashes.push(fakeTx("dryrun_harvest"));
      txHashes.push(fakeTx("dryrun_swap"));
      txHashes.push(fakeTx("dryrun_burn"));
      notes.push("Dry-run mode only: no on-chain state modified.");
    }
  }

  const report: VaultCrankReport = {
    timestamp_iso: new Date().toISOString(),
    mode,
    principal_sol: principalSol,
    current_sol: currentSol,
    excess_sol: excessSol,
    buyback_share: buybackShare,
    jackpot_share: jackpotShare,
    reinvest_share: reinvestShare,
    buyback_sol: buybackSol,
    jackpot_sol: jackpotSol,
    reinvest_sol: reinvestSol,
    gch_price_usd: gchPriceUsd,
    estimated_gch_burned: estimatedGchBurned,
    tx_hashes: txHashes,
    notes,
  };

  const outputPath = path.resolve(
    process.cwd(),
    "../docs/data/burn_tracker.json",
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`[vault_crank] report written: ${outputPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("[vault_crank] error:", err.message);
  process.exit(1);
});
