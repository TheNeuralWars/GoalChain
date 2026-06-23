import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { idl, PROGRAM_ID, GoalchainProgram, retryRpcCall } from "@goalchain/sdk";
import fs from "fs";
import { exec } from "child_process";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const port = process.env.PORT || 3001;
const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";

app.use(cors());
app.use(express.json());

const connection = new Connection(rpcUrl, "confirmed");
// Provider placeholder (readonly)
const provider = new AnchorProvider(connection, {} as any, {
  commitment: "confirmed",
});
const program = new Program(idl as any, provider) as any;

interface EconomySnapshotRow {
  [key: string]: string;
}

function parseCsv(content: string): EconomySnapshotRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        const next = line[i + 1];
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current);
    return out;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    const row: EconomySnapshotRow = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? "").trim();
    });
    return row;
  });
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function envNum(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

interface EconomyMetricsPayload {
  timestamp_iso: string;
  kpis: {
    emit_burn_ratio_7d: number;
    onchain_sink_coverage: number;
    config_drift: number;
    vault_buyback_coverage: number;
  };
  flow_24h: {
    emissions_gch: number;
    burns_gch: number;
    net_emission_gch: number;
  };
  flow_7d: {
    emissions_gch: number;
    burns_gch: number;
  };
  breakdown: {
    potion_burn_gch: number;
    fee_burn_gch: number;
    vault_buyback_gch: number;
    treasury_fees_gch: number;
  };
  config_drift_reasons: string[];
  source: {
    canonical_config: string;
    burn_tracker: string;
    scenarios_csv: string;
    baseline_scenario_id: string | null;
  };
}

type EconomyHealthStatus = "healthy" | "warning" | "critical";

interface EconomyHealthCheck {
  key: string;
  value: number;
  min?: number;
  max?: number;
  pass: boolean;
}

interface EconomyHealthPayload {
  timestamp_iso: string;
  status: EconomyHealthStatus;
  failing_checks: string[];
  thresholds: {
    emit_burn_ratio_min: number;
    emit_burn_ratio_max: number;
    onchain_sink_coverage_min: number;
    config_drift_max: number;
    vault_buyback_coverage_min: number;
  };
  checks: EconomyHealthCheck[];
  kpis: EconomyMetricsPayload["kpis"];
  config_drift_reasons: string[];
}

const healthAlertState = {
  lastSentAt: 0,
  lastStatus: "healthy" as EconomyHealthStatus,
};

async function buildEconomyMetricsPayload(): Promise<EconomyMetricsPayload> {
  const canonicalPath = path.resolve(
    __dirname,
    "../../docs/ECONOMIC_CANONICAL_CONFIG.json",
  );
  const burnTrackerPath = path.resolve(__dirname, "../../docs/data/burn_tracker.json");
  const scenariosPath = path.resolve(
    __dirname,
    "../../docs/data/tokenomics_scenarios.csv",
  );

  const canonicalConfig = fs.existsSync(canonicalPath)
    ? JSON.parse(fs.readFileSync(canonicalPath, "utf-8"))
    : null;
  const burnTracker = fs.existsSync(burnTrackerPath)
    ? JSON.parse(fs.readFileSync(burnTrackerPath, "utf-8"))
    : null;

  const scenarioRows = fs.existsSync(scenariosPath)
    ? parseCsv(fs.readFileSync(scenariosPath, "utf-8"))
    : [];
  const baselineRow =
    scenarioRows.find((r) => r.scenario_id === "RP_balanced") ??
    scenarioRows.find((r) => r.scenario_id === "S0") ??
    scenarioRows[0] ??
    null;

  const emissions24h = num(baselineRow?.emission_gross_gch);
  const projectedBurn24h =
    num(baselineRow?.potion_burn_gch) +
    num(baselineRow?.fee_burn_gch) +
    num(baselineRow?.vault_buyback_gch);

  const burn7dFromTracker = num(burnTracker?.estimated_gch_burned);
  const burns7d =
    burn7dFromTracker > 0 ? burn7dFromTracker : projectedBurn24h > 0 ? projectedBurn24h * 7 : 0;
  const burns24h = burns7d / 7;
  const emissions7d = emissions24h * 7;
  const netEmission24h = emissions24h - burns24h;

  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID,
  );
  let onchainConfig: any = null;
  try {
    const configAccount = await retryRpcCall(() => program.account.globalConfig.fetch(configPda)) as any;
    onchainConfig = {
      feeBps: num(configAccount.feeBps),
      feeBurnBps: num(configAccount.feeBurnBps),
      feeJackpotBps: num(configAccount.feeJackpotBps),
      maxStartersPerManager: num(configAccount.maxStartersPerManager),
      treasuryTokenAccount: configAccount.treasuryTokenAccount?.toBase58?.(),
      jackpotTokenAccount: configAccount.jackpotTokenAccount?.toBase58?.(),
    };
  } catch (_err) {
    onchainConfig = null;
  }

  const sinkChecks = [
    canonicalConfig !== null,
    burnTracker !== null,
    baselineRow !== null,
    onchainConfig?.feeBurnBps > 0,
    onchainConfig?.feeJackpotBps > 0,
    onchainConfig?.maxStartersPerManager >= 11,
    Boolean(onchainConfig?.treasuryTokenAccount),
    Boolean(onchainConfig?.jackpotTokenAccount),
  ];
  const sinksImplemented = sinkChecks.filter(Boolean).length;
  const onchainSinkCoverage = Math.round((sinksImplemented / sinkChecks.length) * 10000) / 100;

  const driftReasons: string[] = [];
  const maxFeeBps = num(canonicalConfig?.core_parameters?.max_fee_bps);
  if (onchainConfig && maxFeeBps > 0 && onchainConfig.feeBps > maxFeeBps) {
    driftReasons.push("onchain fee_bps exceeds canonical max_fee_bps");
  }
  if (onchainConfig && onchainConfig.maxStartersPerManager !== 11) {
    driftReasons.push("onchain max_starters_per_manager differs from expected 11");
  }
  if (
    onchainConfig &&
    onchainConfig.feeBurnBps + onchainConfig.feeJackpotBps > 10000
  ) {
    driftReasons.push("fee split bps sum exceeds 10000");
  }

  const emitBurnRatio7d = emissions7d > 0 ? burns7d / emissions7d : 0;
  const vaultBuybackCoverage = emissions24h > 0 ? num(baselineRow?.vault_buyback_gch) / emissions24h : 0;

  return {
    timestamp_iso: new Date().toISOString(),
    kpis: {
      emit_burn_ratio_7d: emitBurnRatio7d,
      onchain_sink_coverage: onchainSinkCoverage,
      config_drift: driftReasons.length,
      vault_buyback_coverage: vaultBuybackCoverage,
    },
    flow_24h: {
      emissions_gch: emissions24h,
      burns_gch: burns24h,
      net_emission_gch: netEmission24h,
    },
    flow_7d: {
      emissions_gch: emissions7d,
      burns_gch: burns7d,
    },
    breakdown: {
      potion_burn_gch: num(baselineRow?.potion_burn_gch),
      fee_burn_gch: num(baselineRow?.fee_burn_gch),
      vault_buyback_gch: num(baselineRow?.vault_buyback_gch),
      treasury_fees_gch: num(baselineRow?.fee_treasury_gch),
    },
    config_drift_reasons: driftReasons,
    source: {
      canonical_config: canonicalPath,
      burn_tracker: burnTrackerPath,
      scenarios_csv: scenariosPath,
      baseline_scenario_id: baselineRow?.scenario_id ?? null,
    },
  };
}

async function buildEconomyHealthPayload(): Promise<EconomyHealthPayload> {
  const metrics = await buildEconomyMetricsPayload();
  const thresholds = {
    emit_burn_ratio_min: envNum("KPI_EMIT_BURN_RATIO_MIN", 0.85),
    emit_burn_ratio_max: envNum("KPI_EMIT_BURN_RATIO_MAX", 1.05),
    onchain_sink_coverage_min: envNum("KPI_ONCHAIN_SINK_COVERAGE_MIN", 90),
    config_drift_max: envNum("KPI_CONFIG_DRIFT_MAX", 0),
    vault_buyback_coverage_min: envNum("KPI_VAULT_BUYBACK_COVERAGE_MIN", 0.25),
  };

  const checks: EconomyHealthCheck[] = [
    {
      key: "emit_burn_ratio_7d",
      value: metrics.kpis.emit_burn_ratio_7d,
      min: thresholds.emit_burn_ratio_min,
      max: thresholds.emit_burn_ratio_max,
      pass:
        metrics.kpis.emit_burn_ratio_7d >= thresholds.emit_burn_ratio_min &&
        metrics.kpis.emit_burn_ratio_7d <= thresholds.emit_burn_ratio_max,
    },
    {
      key: "onchain_sink_coverage",
      value: metrics.kpis.onchain_sink_coverage,
      min: thresholds.onchain_sink_coverage_min,
      pass: metrics.kpis.onchain_sink_coverage >= thresholds.onchain_sink_coverage_min,
    },
    {
      key: "config_drift",
      value: metrics.kpis.config_drift,
      max: thresholds.config_drift_max,
      pass: metrics.kpis.config_drift <= thresholds.config_drift_max,
    },
    {
      key: "vault_buyback_coverage",
      value: metrics.kpis.vault_buyback_coverage,
      min: thresholds.vault_buyback_coverage_min,
      pass:
        metrics.kpis.vault_buyback_coverage >=
        thresholds.vault_buyback_coverage_min,
    },
  ];

  const failingChecks = checks.filter((c) => !c.pass);
  const status: EconomyHealthStatus =
    failingChecks.length === 0 ? "healthy" : "warning";

  return {
    timestamp_iso: metrics.timestamp_iso,
    status,
    failing_checks: failingChecks.map((c) => c.key),
    thresholds,
    checks,
    kpis: metrics.kpis,
    config_drift_reasons: metrics.config_drift_reasons,
  };
}

type MintGateAction = "mint_allow" | "mint_pause_48h" | "mint_review";

interface MintGateStatus {
  available: boolean;
  allow: boolean;
  action: MintGateAction;
  max_mint_gch: number;
  emit_7d_gch: number;
  burn_7d_gch: number;
  ratio_burn_over_emit: number;
  reason: string;
}

interface VaultCrankStatus {
  available: boolean;
  stale: boolean;
  timestamp_iso: string | null;
  mode: "dry-run" | "execute" | null;
  excess_sol: number;
  estimated_gch_burned: number;
  buyback_sol: number;
  notes: string[];
}

interface ContributorEpochStatus {
  available: boolean;
  builder_fund_pda: string | null;
  current_epoch: number;
  total_inflow: number;
  contributor_allocated: number;
  latest_epoch: {
    epoch_id: number;
    contributor_pool: number;
    contributor_count: number;
    finalized: boolean;
    finalized_at: number;
  } | null;
}

interface OpsStatusPayload {
  timestamp_iso: string;
  mint_gate: MintGateStatus;
  vault_crank: VaultCrankStatus;
  contributor_epoch: ContributorEpochStatus;
}

function computeMintGateFromRows(
  rows: EconomySnapshotRow[],
  days: number,
): MintGateStatus {
  const recent = rows.filter((row) => row["emission_gross_gch"]);
  const selected = recent.slice(-Math.max(days, 1));
  if (selected.length === 0) {
    return {
      available: false,
      allow: false,
      action: "mint_pause_48h",
      max_mint_gch: 0,
      emit_7d_gch: 0,
      burn_7d_gch: 0,
      ratio_burn_over_emit: 0,
      reason: "No scenario rows available for mint gate evaluation.",
    };
  }

  const emit = selected.reduce(
    (acc, row) => acc + num(row["emission_gross_gch"]),
    0,
  );
  const burn = selected.reduce(
    (acc, row) =>
      acc +
      num(row["potion_burn_gch"]) +
      num(row["fee_burn_gch"]) +
      num(row["vault_buyback_gch"]),
    0,
  );
  const ratio = emit > 0 ? burn / emit : 0;

  if (ratio < 0.85) {
    return {
      available: true,
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
    return {
      available: true,
      allow: true,
      action: "mint_review",
      max_mint_gch: Math.floor(emit * 0.05),
      emit_7d_gch: emit,
      burn_7d_gch: burn,
      ratio_burn_over_emit: ratio,
      reason:
        "Ratio above 1.20. Mint allowed with conservative buffer and treasury review.",
    };
  }

  return {
    available: true,
    allow: true,
    action: "mint_allow",
    max_mint_gch: Math.floor(emit * 0.1),
    emit_7d_gch: emit,
    burn_7d_gch: burn,
    ratio_burn_over_emit: ratio,
    reason: "Ratio in target band (0.85-1.05 / tolerant up to 1.20).",
  };
}

async function buildOpsStatusPayload(): Promise<OpsStatusPayload> {
  const scenariosPath = path.resolve(
    __dirname,
    "../../docs/data/tokenomics_scenarios.csv",
  );
  const burnTrackerPath = path.resolve(__dirname, "../../docs/data/burn_tracker.json");
  const windowDays = envNum("MINT_GATE_WINDOW_DAYS", 7);
  const staleHours = envNum("OPS_VAULT_CRANK_STALE_HOURS", 48);

  const scenarioRows = fs.existsSync(scenariosPath)
    ? parseCsv(fs.readFileSync(scenariosPath, "utf-8"))
    : [];
  const mintGate = computeMintGateFromRows(scenarioRows, windowDays);

  let vaultCrank: VaultCrankStatus = {
    available: false,
    stale: true,
    timestamp_iso: null,
    mode: null,
    excess_sol: 0,
    estimated_gch_burned: 0,
    buyback_sol: 0,
    notes: ["burn_tracker.json not found"],
  };

  if (fs.existsSync(burnTrackerPath)) {
    const tracker = JSON.parse(fs.readFileSync(burnTrackerPath, "utf-8"));
    const ts = typeof tracker.timestamp_iso === "string" ? tracker.timestamp_iso : null;
    const ageMs = ts ? Date.now() - new Date(ts).getTime() : Number.POSITIVE_INFINITY;
    vaultCrank = {
      available: true,
      stale: ageMs > staleHours * 60 * 60 * 1000,
      timestamp_iso: ts,
      mode: tracker.mode === "execute" ? "execute" : "dry-run",
      excess_sol: num(tracker.excess_sol),
      estimated_gch_burned: num(tracker.estimated_gch_burned),
      buyback_sol: num(tracker.buyback_sol),
      notes: Array.isArray(tracker.notes) ? tracker.notes.map(String) : [],
    };
  }

  let contributorEpoch: ContributorEpochStatus = {
    available: false,
    builder_fund_pda: null,
    current_epoch: 0,
    total_inflow: 0,
    contributor_allocated: 0,
    latest_epoch: null,
  };

  try {
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID,
    );
    const [builderFundPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("builder_fund"), configPda.toBuffer()],
      PROGRAM_ID,
    );
    const builderFund = await retryRpcCall(() => program.account.builderFund.fetch(builderFundPda)) as any;
    const currentEpoch = num(builderFund.currentEpoch);
    contributorEpoch = {
      available: true,
      builder_fund_pda: builderFundPda.toBase58(),
      current_epoch: currentEpoch,
      total_inflow: num(builderFund.totalInflow),
      contributor_allocated: num(builderFund.contributorAllocated),
      latest_epoch: null,
    };

    if (currentEpoch > 0) {
      const epochBuf = Buffer.alloc(8);
      epochBuf.writeBigUInt64LE(BigInt(currentEpoch));
      const [builderEpochPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("builder_epoch"), builderFundPda.toBuffer(), epochBuf],
        PROGRAM_ID,
      );
      try {
        const epoch = await retryRpcCall(() => program.account.builderContributorEpoch.fetch(
          builderEpochPda,
        )) as any;
        contributorEpoch.latest_epoch = {
          epoch_id: num(epoch.epochId),
          contributor_pool: num(epoch.contributorPool),
          contributor_count: num(epoch.contributorCount),
          finalized: Boolean(epoch.finalized),
          finalized_at: num(epoch.finalizedAt),
        };
      } catch (_epochErr) {
        contributorEpoch.latest_epoch = null;
      }
    }
  } catch (_builderErr) {
    contributorEpoch = {
      available: false,
      builder_fund_pda: null,
      current_epoch: 0,
      total_inflow: 0,
      contributor_allocated: 0,
      latest_epoch: null,
    };
  }

  return {
    timestamp_iso: new Date().toISOString(),
    mint_gate: mintGate,
    vault_crank: vaultCrank,
    contributor_epoch: contributorEpoch,
  };
}

async function sendEconomyHealthAlert(
  health: EconomyHealthPayload,
): Promise<{ sent: boolean; reason: string }> {
  const webhookUrl = process.env.ECON_HEALTH_ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return { sent: false, reason: "webhook_not_configured" };
  }

  const cooldownMinutes = envNum("ECON_HEALTH_ALERT_COOLDOWN_MINUTES", 60);
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const now = Date.now();
  if (
    now - healthAlertState.lastSentAt < cooldownMs &&
    healthAlertState.lastStatus === health.status
  ) {
    return { sent: false, reason: "cooldown_active" };
  }

  const checkSummary = health.checks
    .map((check) => {
      const limits = [
        check.min !== undefined ? `min=${check.min}` : "",
        check.max !== undefined ? `max=${check.max}` : "",
      ]
        .filter(Boolean)
        .join(" ");
      return `${check.pass ? "PASS" : "FAIL"} ${check.key}=${check.value}${limits ? ` (${limits})` : ""}`;
    })
    .join("\n");

  const body = {
    text:
      `[GoalChain] Economy health is ${health.status.toUpperCase()}\n` +
      `Failing checks: ${health.failing_checks.join(", ") || "none"}\n` +
      `Timestamp: ${health.timestamp_iso}`,
    status: health.status,
    failing_checks: health.failing_checks,
    checks: health.checks,
    config_drift_reasons: health.config_drift_reasons,
    check_summary: checkSummary,
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`alert webhook failed with status ${response.status}`);
  }

  healthAlertState.lastSentAt = now;
  healthAlertState.lastStatus = health.status;
  return { sent: true, reason: "sent" };
}

// --- IN-MEMORY SESSION STORE FOR GEMINI CONTEXT CACHING ---
interface CacheSession {
  cachedContentId: string | null;
  expireTime: Date | null;
}

const cacheSession: CacheSession = {
  cachedContentId: null,
  expireTime: null,
};

/**
 * Gets the active Gemini Context Cache ID or uploads a new one if expired/missing.
 * Caches the 528 players database and GoalChain tactical guidelines.
 */
async function getOrUpdateContextCache(apiKey: string): Promise<string> {
  const now = new Date();

  // Cache Hit
  if (
    cacheSession.cachedContentId &&
    cacheSession.expireTime &&
    cacheSession.expireTime > now
  ) {
    console.log(
      `ℹ️ [AI Orchestrator] Context Cache HIT: Usando cache existente -> ${cacheSession.cachedContentId}`,
    );
    return cacheSession.cachedContentId;
  }

  console.log(
    "⚠️ [AI Orchestrator] Context Cache MISS: Generando nuevo cache de contexto en Google Gemini...",
  );

  // Load player database
  let playersJson = "";
  try {
    const playersPath = path.resolve(
      __dirname,
      "../../docs/assets/data/players.json",
    );
    if (fs.existsSync(playersPath)) {
      playersJson = fs.readFileSync(playersPath, "utf-8");
      console.log(
        `📊 [AI Orchestrator] Base de datos de jugadores cargada correctamente (${Math.round(playersJson.length / 1024)} KB)`,
      );
    } else {
      console.warn(
        "⚠️ [AI Orchestrator] No se encontró players.json en docs/assets/data/players.json",
      );
    }
  } catch (err) {
    console.error("❌ [AI Orchestrator] Error al leer players.json:", err);
  }

  // Compile massive reference context
  const masterContext = `Eres Eliza, la Coach Táctica de Inteligencia Artificial de GoalChain. Analizas la alineación y das consejos para maximizar yield de $GCH y estadísticas de juego.
  
=== GOALCHAIN DATABASE (528 JUGADORES REALES REBALANCEADOS Y LORE DE ÉLITE) ===
${playersJson}

=== DIRECTRICES TÁCTICAS Y REGLAS DE RENDIMIENTO DE GOALCHAIN ===
1. **Regla de Estamina y Cansancio (Fatiga):**
   - Estamina inicial: 100%. Disminuye al jugar.
   - Si la estamina cae por debajo de 80%, se aplica una penalización directa al Yield diario de $GCH igual a \`1 - (stamina / 100)\`. Por ejemplo, con 75% de estamina, el mánager tiene una penalización del 25% en ganancias diarias.
   - Solución: Comprar una poción de estamina en el vestuario por 10 $GCH.
2. **Sinergias de Plantilla (Starting XI Chemistry):**
   - **Sinergia de País:** 11 jugadores de la misma nacionalidad en el Starting XI otorgan +25% de bonus en todas las estadísticas de tu cromo Genesis.
   - **Sinergia de Club:** 11 jugadores del mismo club en el Starting XI otorgan +15% de bonus de Yield de sueldo diario de $GCH.
3. **Camisetas Equipadas (Jerseys):**
   - En la Copa del Mundo ('world_cup'), equipar la Camiseta de Selección ('jersey_arg') da +3% de Yield y +5 Max Stamina.
   - En la MLS ('mls'), equipar la Camiseta de Club ('jersey_club' o Inter Miami Pink) activa un multiplicador del +5% de Yield.
4. **Estadios (Stadium Theme / Home Advantage):**
   - Si el tema del estadio coincide con el visualbg preferido de tu jugador Genesis, se activa el "Home Advantage" (Ventaja de Local), potenciando estadísticas en simulación.
5. **Estrategia Económica (Contrato Profesional):**
   - Los mánagers ganan sueldos diarios en $GCH según desempeño, sinergias y estamina.
   - Los ingresos por ventas/minting de NFTs se depositan en Liquid Staking (JitoSOL/mSOL) en Solana para la recompra mecánica de $GCH y quema, lo que aumenta la APR de liquidez.

=== REGLAS CRÍTICAS DE SEGURIDAD Y COMPORTAMIENTO ===
1. Responde en español de forma extremadamente concisa (1-3 oraciones), motivadora y con emojis.
2. Si la consulta del usuario NO TIENE NADA QUE VER con fútbol, GoalChain, estamina, tácticas o $GCH, debes rechazar responder diciendo textualmente: "⚠️ Solo puedo resolver dudas tácticas sobre GoalChain y tu plantilla."
`;

  // Standard API Endpoint for Caching (v1beta is required)
  const url = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-2.5-flash", // Flash Model optimized for Context Caching
      displayName: "goalchain_players_tactics",
      ttl: "86400s", // 24 Hours duration
      contents: [
        {
          role: "user",
          parts: [{ text: masterContext }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemini Context Cache API returned status ${response.status}: ${errText}`,
    );
  }

  const data: any = await response.json();
  if (data.name) {
    cacheSession.cachedContentId = data.name;
    // Set expiration time from API response or fallback to 24 hours
    cacheSession.expireTime = data.expireTime
      ? new Date(data.expireTime)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log(
      `✅ [AI Orchestrator] Nuevo Context Cache registrado: ${data.name} (Expira: ${cacheSession.expireTime.toISOString()})`,
    );
    return data.name;
  } else {
    throw new Error("Invalid response format from Gemini Context Caching API.");
  }
}

// --- ROUTES ---

// Healthcheck
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "GoalChain API is running",
    programId: PROGRAM_ID.toBase58(),
  });
});

// Economy config endpoint (canonical docs config + live on-chain protocol config if available)
app.get("/api/economy/config", async (req, res) => {
  try {
    const canonicalPath = path.resolve(
      __dirname,
      "../../docs/ECONOMIC_CANONICAL_CONFIG.json",
    );
    let canonicalConfig: any = null;
    if (fs.existsSync(canonicalPath)) {
      canonicalConfig = JSON.parse(fs.readFileSync(canonicalPath, "utf-8"));
    }

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID,
    );
    let onchainConfig: any = null;
    try {
      const configAccount = await retryRpcCall(() => program.account.globalConfig.fetch(configPda)) as any;
      onchainConfig = {
        pda: configPda.toBase58(),
        admin: configAccount.admin.toBase58(),
        oracleAuthority: configAccount.oracleAuthority.toBase58(),
        treasuryTokenAccount: configAccount.treasuryTokenAccount.toBase58(),
        jackpotTokenAccount:
          configAccount.jackpotTokenAccount?.toBase58?.() ?? null,
        feeBps: configAccount.feeBps,
        feeBurnBps: configAccount.feeBurnBps ?? null,
        feeJackpotBps: configAccount.feeJackpotBps ?? null,
        maxStartersPerManager: configAccount.maxStartersPerManager ?? null,
        cutoffBufferSeconds: Number(configAccount.cutoffBufferSeconds ?? 0),
        maxSolPerUser: Number(configAccount.maxSolPerUser ?? 0),
        presaleActive: Boolean(configAccount.presaleActive),
      };
    } catch (onchainErr) {
      // Keep endpoint resilient when local/devnet account is missing.
      onchainConfig = null;
    }

    res.json({
      source: {
        canonicalPath: canonicalPath,
        rpcUrl,
      },
      canonicalConfig,
      onchainConfig,
    });
  } catch (err: any) {
    console.error("Economy config endpoint error:", err);
    res
      .status(500)
      .json({ error: `Failed to load economy config: ${err.message}` });
  }
});

// Economy sustainability metrics endpoint used by docs dashboards and ops checks.
app.get("/api/economy/metrics", async (req, res) => {
  try {
    res.json(await buildEconomyMetricsPayload());
  } catch (err: any) {
    console.error("Economy metrics endpoint error:", err);
    res
      .status(500)
      .json({ error: `Failed to load economy metrics: ${err.message}` });
  }
});

app.get("/api/economy/health", async (req, res) => {
  try {
    res.json(await buildEconomyHealthPayload());
  } catch (err: any) {
    console.error("Economy health endpoint error:", err);
    res.status(500).json({
      status: "critical",
      error: `Failed to compute economy health: ${err.message}`,
    });
  }
});

app.get("/api/ops/status", async (req, res) => {
  try {
    res.json(await buildOpsStatusPayload());
  } catch (err: any) {
    console.error("Ops status endpoint error:", err);
    res.status(500).json({ error: `Failed to load ops status: ${err.message}` });
  }
});

// Triggerable alert endpoint for cron/monitors.
app.post("/api/economy/health/alert", async (req, res) => {
  try {
    const health = await buildEconomyHealthPayload();
    if (health.status === "healthy") {
      return res.json({
        status: health.status,
        sent: false,
        reason: "healthy_no_alert",
        failing_checks: health.failing_checks,
      });
    }

    const result = await sendEconomyHealthAlert(health);
    return res.json({
      status: health.status,
      sent: result.sent,
      reason: result.reason,
      failing_checks: health.failing_checks,
      cooldown_minutes: envNum("ECON_HEALTH_ALERT_COOLDOWN_MINUTES", 60),
    });
  } catch (err: any) {
    console.error("Economy health alert endpoint error:", err);
    return res.status(500).json({
      status: "critical",
      sent: false,
      error: `Failed to send economy health alert: ${err.message}`,
    });
  }
});

// Whitelist: Save wallet and email
app.post("/api/whitelist", (req, res) => {
  const { wallet, email } = req.body;
  if (!wallet) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  const dataPath = path.join(__dirname, "../data/whitelist.json");
  const dataDir = path.dirname(dataPath);

  try {
    // Asegurar que la carpeta data existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let whitelist = [];
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, "utf-8");
      whitelist = JSON.parse(fileContent);
    }

    // Evitar duplicados
    const exists = whitelist.find((entry: any) => entry.wallet === wallet);
    if (!exists) {
      whitelist.push({
        wallet,
        email: email || "",
        timestamp: new Date().toISOString(),
      });
      fs.writeFileSync(dataPath, JSON.stringify(whitelist, null, 2));
      console.log(`✅ Whitelist: Nueva wallet registrada -> ${wallet}`);
      res.json({ success: true, message: "Registrado con éxito" });
    } else {
      res.json({ success: true, message: "Wallet ya estaba registrada" });
    }
  } catch (err) {
    console.error("Whitelist Error:", err);
    res.status(500).json({ error: "Failed to save to whitelist" });
  }
});

// Chat Proxy Route for Eliza AI Coach & Advisor (securely hides developer's GEMINI_API_KEY with strict guardrails)
app.post("/api/coach/chat", async (req, res) => {
  const { userText, context } = req.body;
  if (!userText) {
    return res.status(400).json({ error: "userText is required" });
  }

  // Guardrail 1: Limitar la longitud de la consulta del usuario (máximo 200 caracteres)
  if (userText.length > 200) {
    return res.json({
      reply:
        "⚠️ La consulta es demasiado larga. Para optimizar costos, por favor escribe una pregunta breve de menos de 200 caracteres.",
    });
  }

  // Guardrail 2: Filtro proactivo de palabras clave sospechosas (evita programar, tareas escolares, etc.)
  const forbiddenKeywords = [
    "python",
    "javascript",
    "html",
    "css",
    "java",
    "c++",
    "programar",
    "código",
    "code",
    "script",
    "algoritmo",
    "ecuación",
    "matemática",
    "álgebra",
    "física",
    "tarea",
    "crear app",
    "desarrollar",
    "hackear",
    "grok",
    "openai",
    "gpt",
    "essay",
    "escribir un",
    "resumir",
    "historia de",
    "traducir",
  ];
  const queryLower = userText.toLowerCase();
  const isSuspicious = forbiddenKeywords.some((keyword) =>
    queryLower.includes(keyword),
  );
  if (isSuspicious) {
    return res.json({
      reply:
        "⚠️ Como Coach Táctica de GoalChain, solo puedo asistirte con consultas relacionadas con el juego, fútbol y la optimización de tu plantilla. No puedo resolver tareas académicas ni programar aplicaciones.",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not configured in .env server file.");
    return res
      .status(500)
      .json({ error: "Gemini API Key is not configured on the server." });
  }

  // Fallback System Prompt in case Cache creation fails
  const ctx = context || {};
  const serverSystemPrompt = `Eres Eliza, la Coach Táctica de Inteligencia Artificial de GoalChain. Analizas la alineación y das consejos para maximizar yield de $GCH y estadísticas de juego.
Datos del manager:
- Jugador actual: ${ctx.pName || "Lionel Satoshi"} (${ctx.pStats || "ATK:95 DEF:48 SPD:92 HYP:99"})
- Stamina: ${ctx.stamina ?? 100}%
- Liga activa: ${ctx.activeLeague || "world_cup"}
- Camiseta: ${ctx.jersey || "Ninguna"}
- Sinergia País: ${ctx.sameCountry ?? 1}/11, Sinergia Club: ${ctx.sameClub ?? 1}/11
- Tema Estadio: ${ctx.stadium || "desert"}
- Balance: ${ctx.balance ?? 1240} $GCH

REGLAS CRÍTICAS DE SEGURIDAD Y COMPORTAMIENTO:
1. Responde en español de forma extremadamente concisa (1-3 oraciones), motivadora y con emojis.
2. Si la consulta del usuario NO TIENE NADA QUE VER con fútbol, GoalChain, estamina, tácticas o $GCH, debes rechazar responder diciendo textualmente: "⚠️ Solo puedo resolver dudas tácticas sobre GoalChain y tu plantilla."
`;

  // Step 1: Try to retrieve or create Context Cache
  let cachedContentId: string | null = null;
  try {
    cachedContentId = await getOrUpdateContextCache(apiKey);
  } catch (err: any) {
    console.warn(
      `⚠️ [AI Orchestrator] No se pudo crear o recuperar el Context Cache (Fallback a modo Legacy):`,
      err.message,
    );
  }

  // Step 2: Build the prompt query
  const queryText = `Datos actuales del manager:
- Jugador actual: ${ctx.pName || "Lionel Satoshi"} (${ctx.pStats || "ATK:95 DEF:48 SPD:92 HYP:99"})
- Stamina: ${ctx.stamina ?? 100}%
- Liga activa: ${ctx.activeLeague || "world_cup"}
- Camiseta: ${ctx.jersey || "Ninguna"}
- Sinergia País: ${ctx.sameCountry ?? 1}/11, Sinergia Club: ${ctx.sameClub ?? 1}/11
- Tema Estadio: ${ctx.stadium || "desert"}
- Balance: ${ctx.balance ?? 1240} $GCH

Pregunta del manager: "${userText}"`;

  try {
    const requestBody: any = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: cachedContentId
                ? queryText
                : serverSystemPrompt + `\nPregunta del manager: "${userText}"`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800,
      },
    };

    // If cache hit, link cachedContent handle
    if (cachedContentId) {
      requestBody.cachedContent = cachedContentId;
      console.log(
        `🚀 [AI Orchestrator] Enviando consulta con Cache Hit [${cachedContentId}]`,
      );
    } else {
      console.log(
        `🚀 [AI Orchestrator] Enviando consulta en Modo Legacy (Sin Caché)`,
      );
    }

    // Call the Flash Model generateContent API (v1beta required for context caching)
    const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const fetchResponse = await fetch(modelEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.text();
      throw new Error(
        `Gemini API returned status ${fetchResponse.status}: ${errorData}`,
      );
    }

    const data: any = await fetchResponse.json();
    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    if (part && part.text) {
      const reply = part.text.trim();
      res.json({ reply });
    } else {
      console.error(
        "Gemini API structure error:",
        JSON.stringify(data, null, 2),
      );
      res
        .status(500)
        .json({
          error:
            "Invalid response structure from Gemini API: " +
            JSON.stringify(data),
        });
    }
  } catch (error: any) {
    console.error("Error connecting to Gemini API:", error);
    res
      .status(500)
      .json({
        error: "Failed to communicate with Gemini API: " + error.message,
      });
  }
});

// ============================================
// Jupiter Quote Endpoint (Solana DEX)
// ============================================

import { fetchWithTimeout, retryWithBackoff } from "@goalchain/sdk";

interface JupiterQuoteRequest {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

app.post("/api/solana/jupiter/quote", async (req, res) => {
  try {
    const { inputMint, outputMint, amount, slippageBps = 50 }: JupiterQuoteRequest = req.body;

    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: "Missing required fields: inputMint, outputMint, amount",
      });
    }

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
    });

    const url = `https://quote-api.jup.ag/v6/quote?${params.toString()}`;

    // Fetch with retry and timeout
    const response = await retryWithBackoff(
      () => fetchWithTimeout(url, { timeoutMs: 10000 }),
      {
        maxRetries: 3,
        baseDelayMs: 500,
        maxDelayMs: 5000,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      }
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        error: data.error || "Failed to fetch Jupiter quote",
      });
    }

    res.json({
      success: true,
      quote: {
        inputMint: data.inputMint,
        outputMint: data.outputMint,
        inAmount: data.inAmount,
        outAmount: data.outAmount,
        priceImpactPct: data.priceImpactPct,
        routePlan: data.routePlan?.map((r: any) => r.swapInfo?.label).filter(Boolean),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get Jupiter quote: " + error.message,
    });
  }
});

// ============================================
// Hermes Video Marketing Pipeline Endpoints
// ============================================

const runsPath = path.resolve(__dirname, "../../data/marketing_pipeline/runs.json");
const logsDir = path.resolve(__dirname, "../../data/marketing_pipeline/logs");
const triggerPath = path.resolve(__dirname, "../../data/marketing_pipeline/trigger.json");
const daemonStatusPath = path.resolve(__dirname, "../../data/marketing_pipeline/daemon_status.json");

const runsBackupPath = path.resolve(__dirname, "../../data/marketing_pipeline/runs.json.bak");
const runsHistoryPath = path.resolve(__dirname, "../../data/marketing_pipeline/runs_history.jsonl");

// Helper to ensure directories exist
function ensurePipelineDirs() {
  const dir = path.dirname(runsPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

/**
 * Safe write: saves runs.json + keeps a .bak backup + appends IDs to history log.
 * This ensures runs are never lost due to container restarts or repo resets.
 */
function safeWriteRuns(runs: any[]) {
  ensurePipelineDirs();
  const json = JSON.stringify(runs, null, 2);
  // 1. Backup existing file before overwriting
  if (fs.existsSync(runsPath)) {
    try { fs.copyFileSync(runsPath, runsBackupPath); } catch (_) {}
  }
  // 2. Write new content
  fs.writeFileSync(runsPath, json, "utf-8");
  // 3. Append any new run IDs to the immutable history log
  try {
    const existingIds = new Set<string>();
    if (fs.existsSync(runsHistoryPath)) {
      const lines = fs.readFileSync(runsHistoryPath, "utf-8").trim().split("\n").filter(Boolean);
      for (const line of lines) {
        try { existingIds.add(JSON.parse(line).id); } catch (_) {}
      }
    }
    const newEntries = runs
      .filter((r: any) => r.id && !existingIds.has(r.id))
      .map((r: any) => JSON.stringify({ id: r.id, timestamp: r.timestamp, account_name: r.account_name, topic: r.topic, status: r.status, video_url: r.video_url, image_url: r.image_url }));
    if (newEntries.length > 0) {
      fs.appendFileSync(runsHistoryPath, newEntries.join("\n") + "\n", "utf-8");
    }
  } catch (_) {}
}

// 1. Get all runs
app.get("/api/marketing/runs", (req, res) => {
  try {
    ensurePipelineDirs();
    if (!fs.existsSync(runsPath)) {
      return res.json([]);
    }
    const content = fs.readFileSync(runsPath, "utf-8");
    const runs = JSON.parse(content);
    res.json(runs);
  } catch (err: any) {
    console.error("Error reading marketing runs:", err);
    res.status(500).json({ error: `Failed to load runs: ${err.message}` });
  }
});

// 2. Add comment to a run (feedback loop)
app.post("/api/marketing/runs/:id/comment", (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    ensurePipelineDirs();
    let runs = [];
    if (fs.existsSync(runsPath)) {
      const content = fs.readFileSync(runsPath, "utf-8");
      runs = JSON.parse(content);
    }

    const run = runs.find((r: any) => r.id === id);
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (!run.comments) {
      run.comments = [];
    }

    run.comments.push({
      timestamp: new Date().toISOString(),
      text: text.trim()
    });

    safeWriteRuns(runs);
    res.json({ success: true, run });
  } catch (err: any) {
    console.error("Error adding comment to run:", err);
    res.status(500).json({ error: `Failed to add comment: ${err.message}` });
  }
});


// 3. Trigger Hermes manually (Wake Hermes)
app.post("/api/marketing/trigger", (req, res) => {
  try {
    const { account_name, topic } = req.body;
    const payload = {
      action: "generate",
      account_name: account_name || "both",
      topic: topic || null,
      timestamp: new Date().toISOString()
    };

    ensurePipelineDirs();
    fs.writeFileSync(triggerPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[API] Hermes marketing trigger written for account: ${payload.account_name}`);
    res.json({ success: true, message: "Hermes pipeline trigger registered successfully" });
  } catch (err: any) {
    console.error("Error writing trigger:", err);
    res.status(500).json({ error: `Failed to write trigger file: ${err.message}` });
  }
});

// 3a. Trigger trend research
app.post("/api/marketing/research", (req, res) => {
  try {
    const payload = {
      action: "research",
      timestamp: new Date().toISOString()
    };

    ensurePipelineDirs();
    fs.writeFileSync(triggerPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log("[API] Hermes trend research trigger written");
    res.json({ success: true, message: "Hermes trend research trigger written successfully" });
  } catch (err: any) {
    console.error("Error writing research trigger:", err);
    res.status(500).json({ error: `Failed to write research trigger: ${err.message}` });
  }
});

// 3b. Edit planned run details
app.put("/api/marketing/runs/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { topic, post_text, image_prompt, video_prompt } = req.body;

    ensurePipelineDirs();
    if (!fs.existsSync(runsPath)) {
      return res.status(404).json({ error: "Runs database not found" });
    }

    const content = fs.readFileSync(runsPath, "utf-8");
    const runs = JSON.parse(content);
    const run = runs.find((r: any) => r.id === id);
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (topic !== undefined) run.topic = topic;
    if (post_text !== undefined) run.post_text = post_text;
    if (image_prompt !== undefined) run.image_prompt = image_prompt;
    if (video_prompt !== undefined) run.video_prompt = video_prompt;

    safeWriteRuns(runs);
    res.json({ success: true, run });
  } catch (err: any) {
    console.error("Error updating planned run:", err);
    res.status(500).json({ error: `Failed to update run: ${err.message}` });
  }
});

// 3c. Delete planned run
app.delete("/api/marketing/runs/:id", (req, res) => {
  try {
    const { id } = req.params;

    ensurePipelineDirs();
    if (!fs.existsSync(runsPath)) {
      return res.status(404).json({ error: "Runs database not found" });
    }

    const content = fs.readFileSync(runsPath, "utf-8");
    const runs = JSON.parse(content);
    const newRuns = runs.filter((r: any) => r.id !== id);

    safeWriteRuns(newRuns);
    res.json({ success: true, message: "Run deleted successfully" });
  } catch (err: any) {
    console.error("Error deleting run:", err);
    res.status(500).json({ error: `Failed to delete run: ${err.message}` });
  }
});

// 3d. Trigger generation of a specific planned run
app.post("/api/marketing/runs/:id/trigger", (req, res) => {
  try {
    const { id } = req.params;

    ensurePipelineDirs();
    const payload = {
      action: "generate_planned",
      run_id: id,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(triggerPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`[API] Hermes trigger written for planned run: ${id}`);
    res.json({ success: true, message: `Trigger for planned run ${id} written successfully` });
  } catch (err: any) {
    console.error("Error writing planned run trigger:", err);
    res.status(500).json({ error: `Failed to write planned run trigger: ${err.message}` });
  }
});


// 4. Stream log file
app.get("/api/marketing/runs/:id/log", (req, res) => {
  try {
    const { id } = req.params;
    const logPath = path.join(logsDir, `${id}.log`);
    
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ error: "Log file not found for this run" });
    }
    
    const content = fs.readFileSync(logPath, "utf-8");
    res.type("text/plain").send(content);
  } catch (err: any) {
    console.error("Error reading run log:", err);
    res.status(500).json({ error: `Failed to read log: ${err.message}` });
  }
});

// 5. Get daemon status
app.get("/api/marketing/daemon-status", (req, res) => {
  try {
    if (!fs.existsSync(daemonStatusPath)) {
      return res.json({ status: "offline", message: "Daemon is not running or status not initialized" });
    }
    const content = fs.readFileSync(daemonStatusPath, "utf-8");
    const status = JSON.parse(content);
    
    const lastCheck = new Date(status.last_check).getTime();
    const now = Date.now();
    const isOnline = (now - lastCheck) < 300000; // 5 min heartbeat window (video gen takes time)
    
    res.json({
      ...status,
      is_online: isOnline,
      status: isOnline ? status.status : "offline"
    });
  } catch (err: any) {
    console.error("Error reading daemon status:", err);
    res.status(500).json({ error: `Failed to read status: ${err.message}` });
  }
});

// 6. Get schedule preview
app.get("/api/marketing/schedule-preview", (req: any, res: any) => {
  const scriptPath = path.resolve(__dirname, "../../scripts/video_automation/schedule_optimizer.py");
  const cmd = process.platform === "win32" ? `python "${scriptPath}" --preview` : `python3 "${scriptPath}" --preview`;
  
  exec(cmd, (error: any, stdout: string, stderr: string) => {
    if (error) {
      console.error(`[API] Error running schedule_optimizer:`, error, stderr);
      return res.status(500).json({ error: `Failed to fetch schedule preview: ${error.message}` });
    }
    try {
      const jsonStart = stdout.indexOf("{");
      if (jsonStart === -1) {
        throw new Error("No JSON object found in stdout");
      }
      const jsonStr = stdout.substring(jsonStart);
      const data = JSON.parse(jsonStr);
      res.json(data);
    } catch (parseErr: any) {
      console.error(`[API] Failed to parse schedule_optimizer output:`, parseErr, stdout);
      res.status(500).json({ error: `Failed to parse schedule preview: ${parseErr.message}` });
    }
  });
});

app.listen(port, () => {
  console.log(`GoalChain API listening at http://localhost:${port}`);
});
