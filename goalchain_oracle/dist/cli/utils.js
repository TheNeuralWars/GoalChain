"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliError = void 0;
exports.loadConfig = loadConfig;
exports.getRpcUrl = getRpcUrl;
exports.getProgramId = getProgramId;
exports.createConnection = createConnection;
exports.loadKeypair = loadKeypair;
exports.getWallet = getWallet;
exports.createProvider = createProvider;
exports.createProgram = createProgram;
exports.getConfigPda = getConfigPda;
exports.getFixturePda = getFixturePda;
exports.getFixtureVaultPda = getFixtureVaultPda;
exports.getMarketPda = getMarketPda;
exports.getWagerPda = getWagerPda;
exports.getWagerVaultPda = getWagerVaultPda;
exports.createFormatter = createFormatter;
exports.fetchOnchainConfig = fetchOnchainConfig;
exports.fetchAllFixtures = fetchAllFixtures;
exports.fetchAllMarkets = fetchAllMarkets;
exports.formatError = formatError;
exports.handleError = handleError;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const sdk_1 = require("@goalchain/sdk");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let cachedConfig = null;
function loadConfig(configPath) {
    if (cachedConfig)
        return cachedConfig;
    const defaultPath = path.resolve(__dirname, '../../config/default.json');
    const targetPath = configPath || defaultPath;
    if (!fs.existsSync(targetPath)) {
        throw new Error(`Config file not found: ${targetPath}`);
    }
    const config = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    cachedConfig = config;
    return config;
}
function getRpcUrl(options) {
    if (options.rpcUrl)
        return options.rpcUrl;
    const config = loadConfig();
    if (options.network === 'mainnet-beta' || options.network === 'mainnet') {
        return process.env.MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';
    }
    return config.rpcUrl;
}
function getProgramId(options) {
    const config = loadConfig();
    return new web3_js_1.PublicKey(config.programId);
}
function createConnection(options) {
    const rpcUrl = getRpcUrl(options);
    const config = loadConfig();
    return new web3_js_1.Connection(rpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: config.healthCheck.rpcTimeoutMs,
    });
}
function loadKeypair(keypairPath) {
    if (!fs.existsSync(keypairPath)) {
        throw new Error(`Keypair file not found: ${keypairPath}`);
    }
    const secret = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    return web3_js_1.Keypair.fromSecretKey(new Uint8Array(secret));
}
function getWallet(options) {
    const keypairPath = options.keypair || process.env.ANCHOR_WALLET;
    if (!keypairPath)
        return null;
    return loadKeypair(keypairPath);
}
function createProvider(connection, wallet) {
    return new anchor_1.AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });
}
function createProgram(provider) {
    return new anchor_1.Program(sdk_1.idl, provider);
}
function getConfigPda(programId) {
    const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(sdk_1.SEEDS.CONFIG)], programId);
    return pda;
}
function getFixturePda(programId, matchId) {
    const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(sdk_1.SEEDS.FIXTURE), Buffer.from(matchId)], programId);
    return pda;
}
function getFixtureVaultPda(programId, fixture) {
    const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(sdk_1.SEEDS.FIXTURE_VAULT), fixture.toBuffer()], programId);
    return pda;
}
function getMarketPda(programId, fixture, marketId) {
    const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(sdk_1.SEEDS.MARKET), fixture.toBuffer(), Buffer.from([marketId])], programId);
    return pda;
}
function getWagerPda(programId, playerA, fixture) {
    const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(sdk_1.SEEDS.WAGER), playerA.toBuffer(), fixture.toBuffer()], programId);
    return pda;
}
function getWagerVaultPda(programId, wager) {
    const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(sdk_1.SEEDS.WAGER_VAULT), wager.toBuffer()], programId);
    return pda;
}
function createFormatter(json, verbose) {
    return {
        json,
        verbose,
        log: (msg, ...args) => {
            if (!json && verbose)
                console.error(`[LOG] ${msg}`, ...args);
        },
        error: (msg, ...args) => {
            if (json) {
                console.error(JSON.stringify({ error: msg, args }));
            }
            else {
                console.error(`[ERROR] ${msg}`, ...args);
            }
        },
        success: (msg, ...args) => {
            if (!json)
                console.error(`[OK] ${msg}`, ...args);
        },
        warn: (msg, ...args) => {
            if (!json)
                console.error(`[WARN] ${msg}`, ...args);
        },
        output: (data) => {
            if (json) {
                console.log(JSON.stringify(data, null, 2));
            }
            else if (data !== undefined && data !== null) {
                console.log(data);
            }
        },
        exit: (code) => process.exit(code),
    };
}
async function fetchOnchainConfig(program) {
    const configPda = getConfigPda(program.programId);
    const config = await program.account.globalConfig.fetch(configPda);
    return {
        admin: config.admin.toBase58(),
        oracleAuthority: config.oracleAuthority.toBase58(),
        treasuryTokenAccount: config.treasuryTokenAccount.toBase58(),
        jackpotTokenAccount: config.jackpotTokenAccount.toBase58(),
        feeBps: config.feeBps,
        feeBurnBps: config.feeBurnBps,
        feeJackpotBps: config.feeJackpotBps,
        maxStartersPerManager: config.maxStartersPerManager,
        cutoffBufferSeconds: config.cutoffBufferSeconds.toString(),
        maxSolPerUser: config.maxSolPerUser.toString(),
        presaleActive: config.presaleActive,
        bump: config.bump,
    };
}
async function fetchAllFixtures(program) {
    const fixtures = await program.account.fixture.all();
    return fixtures.map(({ publicKey, account }) => ({
        pubkey: publicKey.toBase58(),
        matchId: account.matchId,
        teamA: account.teamA,
        teamB: account.teamB,
        startTimestamp: account.startTimestamp.toString(),
        poolA: account.poolA.toString(),
        poolB: account.poolB.toString(),
        poolDraw: account.poolDraw.toString(),
        status: account.status,
        winner: account.winner,
        bump: account.bump,
    }));
}
async function fetchAllMarkets(program) {
    const markets = await program.account.market.all();
    return markets.map(({ publicKey, account }) => ({
        pubkey: publicKey.toBase58(),
        fixture: account.fixture.toBase58(),
        marketId: account.marketId,
        marketType: account.marketType,
        status: account.status,
        tokenMint: account.tokenMint.toBase58(),
        delaySeconds: account.delaySeconds.toString(),
        cooldownSeconds: account.cooldownSeconds.toString(),
        closeMinute: account.closeMinute,
        maxGoalDiff: account.maxGoalDiff,
        requireTied: account.requireTied,
        poolA: account.poolA.toString(),
        poolB: account.poolB.toString(),
        poolDraw: account.poolDraw.toString(),
        winner: account.winner,
        lastBetTs: account.lastBetTs.toString(),
        resolvedTs: account.resolvedTs?.toString(),
        bump: account.bump,
    }));
}
function formatError(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
class CliError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'CliError';
    }
}
exports.CliError = CliError;
function handleError(formatter, error) {
    const message = formatError(error);
    if (error instanceof CliError) {
        formatter.error(message);
        formatter.exit(error.code);
    }
    formatter.error(`Unexpected error: ${message}`);
    formatter.exit(2);
}
