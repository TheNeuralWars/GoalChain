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
exports.updatePlayerStatsCommand = updatePlayerStatsCommand;
const utils_js_1 = require("../utils.js");
async function updatePlayerStatsCommand(opts) {
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
        const playerPubkey = new (await Promise.resolve().then(() => __importStar(require('@solana/web3.js')))).PublicKey(opts.player);
        formatter.log('Updating player stats...', {
            player: opts.player,
            goals: opts.goals,
            assists: opts.assists,
            matches: opts.matches,
            dryRun,
        });
        if (dryRun) {
            formatter.log('DRY RUN: Would call update_player_stats');
            formatter.success('Player stats update simulation complete');
            formatter.output({
                dryRun: true,
                mode: 'simulation',
                player: opts.player,
                goals: opts.goals,
                assists: opts.assists,
                matches: opts.matches,
                timestamp: new Date().toISOString(),
            });
        }
        else {
            formatter.log('EXECUTE MODE: Would call update_player_stats');
            formatter.warn('Real update_player_stats not yet implemented');
            throw new utils_js_1.CliError(2, 'update_player_stats instruction not implemented in CLI');
        }
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
