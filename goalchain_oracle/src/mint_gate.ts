import fs from "fs";
import path from "path";

type GateAction = "mint_allow" | "mint_pause_48h" | "mint_review";

interface MintGateDecision {
  allow: boolean;
  action: GateAction;
  max_mint_gch: number;
  emit_7d_gch: number;
  burn_7d_gch: number;
  ratio_burn_over_emit: number;
  reason: string;
}

const DEFAULT_CSV = path.resolve(
  process.cwd(),
  "../docs/data/tokenomics_scenarios.csv",
);

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic parser compatible with current repo CSV structure.
    const cols = lines[i].split(",");
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function computeDecision(
  rows: Array<Record<string, string>>,
  days: number,
): MintGateDecision {
  const recent = rows.filter((row) => row["emission_gross_gch"]);
  const selected = recent.slice(-Math.max(days, 1));

  const emit = selected.reduce(
    (acc, row) => acc + toNumber(row["emission_gross_gch"]),
    0,
  );
  const burn = selected.reduce(
    (acc, row) =>
      acc +
      toNumber(row["potion_burn_gch"]) +
      toNumber(row["fee_burn_gch"]) +
      toNumber(row["vault_buyback_gch"]),
    0,
  );

  const ratio = emit > 0 ? burn / emit : 0;

  if (ratio < 0.85) {
    return {
      allow: false,
      action: "mint_pause_48h",
      max_mint_gch: 0,
      emit_7d_gch: emit,
      burn_7d_gch: burn,
      ratio_burn_over_emit: ratio,
      reason:
        "Burn/emit ratio below 0.85. Pause mint for 48h and increase sink pressure.",
    };
  }

  if (ratio > 1.2) {
    const bufferMint = Math.floor(emit * 0.05); // onboarding buffer
    return {
      allow: true,
      action: "mint_review",
      max_mint_gch: bufferMint,
      emit_7d_gch: emit,
      burn_7d_gch: burn,
      ratio_burn_over_emit: ratio,
      reason:
        "Ratio above 1.20. Mint is allowed with conservative buffer and treasury review.",
    };
  }

  return {
    allow: true,
    action: "mint_allow",
    max_mint_gch: Math.floor(emit * 0.1),
    emit_7d_gch: emit,
    burn_7d_gch: burn,
    ratio_burn_over_emit: ratio,
    reason: "Ratio in target band (0.85-1.05 / tolerant up to 1.20).",
  };
}

async function main() {
  const csvPath = process.env.MINT_GATE_CSV_PATH || DEFAULT_CSV;
  const days = Number(process.env.MINT_GATE_WINDOW_DAYS || "7");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(content);
  if (rows.length === 0) {
    throw new Error(`No rows parsed from CSV: ${csvPath}`);
  }

  const decision = computeDecision(rows, days);
  console.log(JSON.stringify(decision, null, 2));
}

main().catch((err) => {
  console.error("[mint_gate] error:", err.message);
  process.exit(1);
});
