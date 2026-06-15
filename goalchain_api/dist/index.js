"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const sdk_1 = require("@goalchain/sdk");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const connection = new web3_js_1.Connection(rpcUrl, "confirmed");
// Provider placeholder (readonly)
const provider = new anchor_1.AnchorProvider(connection, {}, {
    commitment: "confirmed",
});
const program = new anchor_1.Program(sdk_1.idl, provider);
function parseCsv(content) {
    const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    if (lines.length < 2)
        return [];
    const parseLine = (line) => {
        const out = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i += 1) {
            const ch = line[i];
            if (ch === '"') {
                const next = line[i + 1];
                if (inQuotes && next === '"') {
                    current += '"';
                    i += 1;
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (ch === "," && !inQuotes) {
                out.push(current);
                current = "";
            }
            else {
                current += ch;
            }
        }
        out.push(current);
        return out;
    };
    const headers = parseLine(lines[0]).map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const values = parseLine(line);
        const row = {};
        headers.forEach((header, idx) => {
            row[header] = (values[idx] ?? "").trim();
        });
        return row;
    });
}
function num(value, fallback = 0) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed))
            return parsed;
    }
    return fallback;
}
function envNum(name, fallback) {
    const value = process.env[name];
    if (!value)
        return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}
const healthAlertState = {
    lastSentAt: 0,
    lastStatus: "healthy",
};
async function buildEconomyMetricsPayload() {
    const canonicalPath = path_1.default.resolve(__dirname, "../../docs/ECONOMIC_CANONICAL_CONFIG.json");
    const burnTrackerPath = path_1.default.resolve(__dirname, "../../docs/data/burn_tracker.json");
    const scenariosPath = path_1.default.resolve(__dirname, "../../docs/data/tokenomics_scenarios.csv");
    const canonicalConfig = fs_1.default.existsSync(canonicalPath)
        ? JSON.parse(fs_1.default.readFileSync(canonicalPath, "utf-8"))
        : null;
    const burnTracker = fs_1.default.existsSync(burnTrackerPath)
        ? JSON.parse(fs_1.default.readFileSync(burnTrackerPath, "utf-8"))
        : null;
    const scenarioRows = fs_1.default.existsSync(scenariosPath)
        ? parseCsv(fs_1.default.readFileSync(scenariosPath, "utf-8"))
        : [];
    const baselineRow = scenarioRows.find((r) => r.scenario_id === "RP_balanced") ??
        scenarioRows.find((r) => r.scenario_id === "S0") ??
        scenarioRows[0] ??
        null;
    const emissions24h = num(baselineRow?.emission_gross_gch);
    const projectedBurn24h = num(baselineRow?.potion_burn_gch) +
        num(baselineRow?.fee_burn_gch) +
        num(baselineRow?.vault_buyback_gch);
    const burn7dFromTracker = num(burnTracker?.estimated_gch_burned);
    const burns7d = burn7dFromTracker > 0 ? burn7dFromTracker : projectedBurn24h > 0 ? projectedBurn24h * 7 : 0;
    const burns24h = burns7d / 7;
    const emissions7d = emissions24h * 7;
    const netEmission24h = emissions24h - burns24h;
    const [configPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("config")], sdk_1.PROGRAM_ID);
    let onchainConfig = null;
    try {
        const configAccount = await (0, sdk_1.retryRpcCall)(() => program.account.globalConfig.fetch(configPda));
        onchainConfig = {
            feeBps: num(configAccount.feeBps),
            feeBurnBps: num(configAccount.feeBurnBps),
            feeJackpotBps: num(configAccount.feeJackpotBps),
            maxStartersPerManager: num(configAccount.maxStartersPerManager),
            treasuryTokenAccount: configAccount.treasuryTokenAccount?.toBase58?.(),
            jackpotTokenAccount: configAccount.jackpotTokenAccount?.toBase58?.(),
        };
    }
    catch (_err) {
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
    const driftReasons = [];
    const maxFeeBps = num(canonicalConfig?.core_parameters?.max_fee_bps);
    if (onchainConfig && maxFeeBps > 0 && onchainConfig.feeBps > maxFeeBps) {
        driftReasons.push("onchain fee_bps exceeds canonical max_fee_bps");
    }
    if (onchainConfig && onchainConfig.maxStartersPerManager !== 11) {
        driftReasons.push("onchain max_starters_per_manager differs from expected 11");
    }
    if (onchainConfig &&
        onchainConfig.feeBurnBps + onchainConfig.feeJackpotBps > 10000) {
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
async function buildEconomyHealthPayload() {
    const metrics = await buildEconomyMetricsPayload();
    const thresholds = {
        emit_burn_ratio_min: envNum("KPI_EMIT_BURN_RATIO_MIN", 0.85),
        emit_burn_ratio_max: envNum("KPI_EMIT_BURN_RATIO_MAX", 1.05),
        onchain_sink_coverage_min: envNum("KPI_ONCHAIN_SINK_COVERAGE_MIN", 90),
        config_drift_max: envNum("KPI_CONFIG_DRIFT_MAX", 0),
        vault_buyback_coverage_min: envNum("KPI_VAULT_BUYBACK_COVERAGE_MIN", 0.25),
    };
    const checks = [
        {
            key: "emit_burn_ratio_7d",
            value: metrics.kpis.emit_burn_ratio_7d,
            min: thresholds.emit_burn_ratio_min,
            max: thresholds.emit_burn_ratio_max,
            pass: metrics.kpis.emit_burn_ratio_7d >= thresholds.emit_burn_ratio_min &&
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
            pass: metrics.kpis.vault_buyback_coverage >=
                thresholds.vault_buyback_coverage_min,
        },
    ];
    const failingChecks = checks.filter((c) => !c.pass);
    const status = failingChecks.length === 0 ? "healthy" : "warning";
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
function computeMintGateFromRows(rows, days) {
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
    const emit = selected.reduce((acc, row) => acc + num(row["emission_gross_gch"]), 0);
    const burn = selected.reduce((acc, row) => acc +
        num(row["potion_burn_gch"]) +
        num(row["fee_burn_gch"]) +
        num(row["vault_buyback_gch"]), 0);
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
            reason: "Burn/emit ratio below 0.85. Pause mint for 48h and increase sink pressure.",
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
            reason: "Ratio above 1.20. Mint allowed with conservative buffer and treasury review.",
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
async function buildOpsStatusPayload() {
    const scenariosPath = path_1.default.resolve(__dirname, "../../docs/data/tokenomics_scenarios.csv");
    const burnTrackerPath = path_1.default.resolve(__dirname, "../../docs/data/burn_tracker.json");
    const windowDays = envNum("MINT_GATE_WINDOW_DAYS", 7);
    const staleHours = envNum("OPS_VAULT_CRANK_STALE_HOURS", 48);
    const scenarioRows = fs_1.default.existsSync(scenariosPath)
        ? parseCsv(fs_1.default.readFileSync(scenariosPath, "utf-8"))
        : [];
    const mintGate = computeMintGateFromRows(scenarioRows, windowDays);
    let vaultCrank = {
        available: false,
        stale: true,
        timestamp_iso: null,
        mode: null,
        excess_sol: 0,
        estimated_gch_burned: 0,
        buyback_sol: 0,
        notes: ["burn_tracker.json not found"],
    };
    if (fs_1.default.existsSync(burnTrackerPath)) {
        const tracker = JSON.parse(fs_1.default.readFileSync(burnTrackerPath, "utf-8"));
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
    let contributorEpoch = {
        available: false,
        builder_fund_pda: null,
        current_epoch: 0,
        total_inflow: 0,
        contributor_allocated: 0,
        latest_epoch: null,
    };
    try {
        const [configPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("config")], sdk_1.PROGRAM_ID);
        const [builderFundPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("builder_fund"), configPda.toBuffer()], sdk_1.PROGRAM_ID);
        const builderFund = await (0, sdk_1.retryRpcCall)(() => program.account.builderFund.fetch(builderFundPda));
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
            const [builderEpochPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("builder_epoch"), builderFundPda.toBuffer(), epochBuf], sdk_1.PROGRAM_ID);
            try {
                const epoch = await (0, sdk_1.retryRpcCall)(() => program.account.builderContributorEpoch.fetch(builderEpochPda));
                contributorEpoch.latest_epoch = {
                    epoch_id: num(epoch.epochId),
                    contributor_pool: num(epoch.contributorPool),
                    contributor_count: num(epoch.contributorCount),
                    finalized: Boolean(epoch.finalized),
                    finalized_at: num(epoch.finalizedAt),
                };
            }
            catch (_epochErr) {
                contributorEpoch.latest_epoch = null;
            }
        }
    }
    catch (_builderErr) {
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
async function sendEconomyHealthAlert(health) {
    const webhookUrl = process.env.ECON_HEALTH_ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
        return { sent: false, reason: "webhook_not_configured" };
    }
    const cooldownMinutes = envNum("ECON_HEALTH_ALERT_COOLDOWN_MINUTES", 60);
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const now = Date.now();
    if (now - healthAlertState.lastSentAt < cooldownMs &&
        healthAlertState.lastStatus === health.status) {
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
        text: `[GoalChain] Economy health is ${health.status.toUpperCase()}\n` +
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
const cacheSession = {
    cachedContentId: null,
    expireTime: null,
};
/**
 * Gets the active Gemini Context Cache ID or uploads a new one if expired/missing.
 * Caches the 528 players database and GoalChain tactical guidelines.
 */
async function getOrUpdateContextCache(apiKey) {
    const now = new Date();
    // Cache Hit
    if (cacheSession.cachedContentId &&
        cacheSession.expireTime &&
        cacheSession.expireTime > now) {
        console.log(`ℹ️ [AI Orchestrator] Context Cache HIT: Usando cache existente -> ${cacheSession.cachedContentId}`);
        return cacheSession.cachedContentId;
    }
    console.log("⚠️ [AI Orchestrator] Context Cache MISS: Generando nuevo cache de contexto en Google Gemini...");
    // Load player database
    let playersJson = "";
    try {
        const playersPath = path_1.default.resolve(__dirname, "../../docs/assets/data/players.json");
        if (fs_1.default.existsSync(playersPath)) {
            playersJson = fs_1.default.readFileSync(playersPath, "utf-8");
            console.log(`📊 [AI Orchestrator] Base de datos de jugadores cargada correctamente (${Math.round(playersJson.length / 1024)} KB)`);
        }
        else {
            console.warn("⚠️ [AI Orchestrator] No se encontró players.json en docs/assets/data/players.json");
        }
    }
    catch (err) {
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
        throw new Error(`Gemini Context Cache API returned status ${response.status}: ${errText}`);
    }
    const data = await response.json();
    if (data.name) {
        cacheSession.cachedContentId = data.name;
        // Set expiration time from API response or fallback to 24 hours
        cacheSession.expireTime = data.expireTime
            ? new Date(data.expireTime)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(`✅ [AI Orchestrator] Nuevo Context Cache registrado: ${data.name} (Expira: ${cacheSession.expireTime.toISOString()})`);
        return data.name;
    }
    else {
        throw new Error("Invalid response format from Gemini Context Caching API.");
    }
}
// --- ROUTES ---
// Healthcheck
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "GoalChain API is running",
        programId: sdk_1.PROGRAM_ID.toBase58(),
    });
});
// Economy config endpoint (canonical docs config + live on-chain protocol config if available)
app.get("/api/economy/config", async (req, res) => {
    try {
        const canonicalPath = path_1.default.resolve(__dirname, "../../docs/ECONOMIC_CANONICAL_CONFIG.json");
        let canonicalConfig = null;
        if (fs_1.default.existsSync(canonicalPath)) {
            canonicalConfig = JSON.parse(fs_1.default.readFileSync(canonicalPath, "utf-8"));
        }
        const [configPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("config")], sdk_1.PROGRAM_ID);
        let onchainConfig = null;
        try {
            const configAccount = await (0, sdk_1.retryRpcCall)(() => program.account.globalConfig.fetch(configPda));
            onchainConfig = {
                pda: configPda.toBase58(),
                admin: configAccount.admin.toBase58(),
                oracleAuthority: configAccount.oracleAuthority.toBase58(),
                treasuryTokenAccount: configAccount.treasuryTokenAccount.toBase58(),
                jackpotTokenAccount: configAccount.jackpotTokenAccount?.toBase58?.() ?? null,
                feeBps: configAccount.feeBps,
                feeBurnBps: configAccount.feeBurnBps ?? null,
                feeJackpotBps: configAccount.feeJackpotBps ?? null,
                maxStartersPerManager: configAccount.maxStartersPerManager ?? null,
                cutoffBufferSeconds: Number(configAccount.cutoffBufferSeconds ?? 0),
                maxSolPerUser: Number(configAccount.maxSolPerUser ?? 0),
                presaleActive: Boolean(configAccount.presaleActive),
            };
        }
        catch (onchainErr) {
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
    }
    catch (err) {
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
    }
    catch (err) {
        console.error("Economy metrics endpoint error:", err);
        res
            .status(500)
            .json({ error: `Failed to load economy metrics: ${err.message}` });
    }
});
app.get("/api/economy/health", async (req, res) => {
    try {
        res.json(await buildEconomyHealthPayload());
    }
    catch (err) {
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
    }
    catch (err) {
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
    }
    catch (err) {
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
    const dataPath = path_1.default.join(__dirname, "../data/whitelist.json");
    const dataDir = path_1.default.dirname(dataPath);
    try {
        // Asegurar que la carpeta data existe
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        let whitelist = [];
        if (fs_1.default.existsSync(dataPath)) {
            const fileContent = fs_1.default.readFileSync(dataPath, "utf-8");
            whitelist = JSON.parse(fileContent);
        }
        // Evitar duplicados
        const exists = whitelist.find((entry) => entry.wallet === wallet);
        if (!exists) {
            whitelist.push({
                wallet,
                email: email || "",
                timestamp: new Date().toISOString(),
            });
            fs_1.default.writeFileSync(dataPath, JSON.stringify(whitelist, null, 2));
            console.log(`✅ Whitelist: Nueva wallet registrada -> ${wallet}`);
            res.json({ success: true, message: "Registrado con éxito" });
        }
        else {
            res.json({ success: true, message: "Wallet ya estaba registrada" });
        }
    }
    catch (err) {
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
            reply: "⚠️ La consulta es demasiado larga. Para optimizar costos, por favor escribe una pregunta breve de menos de 200 caracteres.",
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
    const isSuspicious = forbiddenKeywords.some((keyword) => queryLower.includes(keyword));
    if (isSuspicious) {
        return res.json({
            reply: "⚠️ Como Coach Táctica de GoalChain, solo puedo asistirte con consultas relacionadas con el juego, fútbol y la optimización de tu plantilla. No puedo resolver tareas académicas ni programar aplicaciones.",
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
    let cachedContentId = null;
    try {
        cachedContentId = await getOrUpdateContextCache(apiKey);
    }
    catch (err) {
        console.warn(`⚠️ [AI Orchestrator] No se pudo crear o recuperar el Context Cache (Fallback a modo Legacy):`, err.message);
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
        const requestBody = {
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
            console.log(`🚀 [AI Orchestrator] Enviando consulta con Cache Hit [${cachedContentId}]`);
        }
        else {
            console.log(`🚀 [AI Orchestrator] Enviando consulta en Modo Legacy (Sin Caché)`);
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
            throw new Error(`Gemini API returned status ${fetchResponse.status}: ${errorData}`);
        }
        const data = await fetchResponse.json();
        const candidate = data.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        if (part && part.text) {
            const reply = part.text.trim();
            res.json({ reply });
        }
        else {
            console.error("Gemini API structure error:", JSON.stringify(data, null, 2));
            res
                .status(500)
                .json({
                error: "Invalid response structure from Gemini API: " +
                    JSON.stringify(data),
            });
        }
    }
    catch (error) {
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
const sdk_2 = require("@goalchain/sdk");
app.post("/api/solana/jupiter/quote", async (req, res) => {
    try {
        const { inputMint, outputMint, amount, slippageBps = 50 } = req.body;
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
        const response = await (0, sdk_2.retryWithBackoff)(() => (0, sdk_2.fetchWithTimeout)(url, { timeoutMs: 10000 }), {
            maxRetries: 3,
            baseDelayMs: 500,
            maxDelayMs: 5000,
            retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        });
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
                routePlan: data.routePlan?.map((r) => r.swapInfo?.label).filter(Boolean),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to get Jupiter quote: " + error.message,
        });
    }
});
app.listen(port, () => {
    console.log(`GoalChain API listening at http://localhost:${port}`);
});
