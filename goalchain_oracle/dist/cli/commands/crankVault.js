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
exports.crankVaultCommand = crankVaultCommand;
const utils_js_1 = require("../utils.js");
const fs = __importStar(require("fs/promises"));
async function crankVaultCommand(opts) {
    const formatter = (0, utils_js_1.createFormatter)(opts.json ?? false, opts.verbose ?? false);
    const dryRun = !opts.execute;
    try {
        const connection = (0, utils_js_1.createConnection)(opts);
        const wallet = (0, utils_js_1.getWallet)(opts);
        const programId = (0, utils_js_1.getProgramId)(opts);
        if (!dryRun && !wallet) {
            throw new utils_js_1.CliError(1, 'Keypair required for --execute. Use --keypair or ANCHOR_WALLET env.');
        }
        const provider = (0, utils_js_1.createProvider)(connection, wallet);
        const program = (0, utils_js_1.createProgram)(provider);
        formatter.log('Starting vault crank...', { dryRun, batchSize: opts.batchSize });
        const config = await program.account.globalConfig.fetchNullable((0, utils_js_1.getConfigPda)(programId));
        if (!config) {
            throw new utils_js_1.CliError(1, 'GlobalConfig account not found');
        }
        const burnTrackerPath = '/data/apps/GoalChain/docs/data/burn_tracker.json';
        let excessSol = 0;
        let estimatedGchBurned = 0;
        let buybackSol = 0;
        if (dryRun) {
            formatter.log('DRY RUN: Reading burn_tracker.json for simulation');
            try {
                const tracker = JSON.parse(await fs.readFile(burnTrackerPath, 'utf-8'));
                excessSol = tracker.excess_sol || 0;
                estimatedGchBurned = tracker.estimated_gch_burned || 0;
                buybackSol = tracker.buyback_sol || 0;
            }
            catch {
                formatter.warn('burn_tracker.json not found, using zeros for simulation');
            }
            formatter.success('Vault crank simulation complete');
            formatter.output({
                dryRun: true,
                mode: 'simulation',
                excessSol,
                estimatedGchBurned,
                buybackSol,
                batchSize: parseInt(opts.batchSize || '10'),
                timestamp: new Date().toISOString(),
            });
        }
        else {
            formatter.log('EXECUTE MODE: Would call vault crank instruction');
            formatter.warn('Real vault crank instruction not yet implemented in program');
            throw new utils_js_1.CliError(2, 'vault_crank instruction not available in current program version');
        }
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
