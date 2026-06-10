"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateAllCommand = simulateAllCommand;
const utils_js_1 = require("../utils.js");
async function simulateAllCommand(opts) {
    const formatter = (0, utils_js_1.createFormatter)(opts.json ?? false, opts.verbose ?? false);
    const dryRun = opts.dryRun ?? true;
    try {
        const connection = (0, utils_js_1.createConnection)(opts);
        const wallet = (0, utils_js_1.getWallet)(opts);
        const programId = (0, utils_js_1.getProgramId)(opts);
        if (!dryRun && !wallet) {
            throw new utils_js_1.CliError(1, 'Keypair required for execute mode. Use --keypair or ANCHOR_WALLET env.');
        }
        const provider = (0, utils_js_1.createProvider)(connection, wallet);
        const program = (0, utils_js_1.createProgram)(provider);
        formatter.log('Running full simulation: crank + settle + resolve...', { dryRun });
        const [fixtures, markets, config] = await Promise.all([
            (0, utils_js_1.fetchAllFixtures)(program),
            (0, utils_js_1.fetchAllMarkets)(program),
            (0, utils_js_1.fetchOnchainConfig)(program),
        ]);
        const completedFixtures = fixtures.filter(f => f.status === 'Completed');
        const resolvedMarkets = markets.filter(m => m.status === 'Resolved');
        const cfg = (0, utils_js_1.loadConfig)();
        const crankBatchSize = cfg.vault.crankBatchSize;
        const simulation = {
            dryRun: true,
            timestamp: new Date().toISOString(),
            network: opts.network || 'devnet',
            config: {
                programId: config.admin,
                oracleAuthority: config.oracleAuthority,
            },
            crank: {
                batchSize: crankBatchSize,
                dryRunDefault: cfg.vault.dryRunDefault,
            },
            settle: {
                marketsToSettle: resolvedMarkets.map(m => ({
                    pubkey: m.pubkey,
                    marketId: m.marketId,
                    status: m.status,
                })),
                count: resolvedMarkets.length,
            },
            resolve: {
                fixturesToResolve: completedFixtures.map(f => ({
                    pubkey: f.pubkey,
                    matchId: f.matchId,
                    status: f.status,
                    winner: f.winner,
                })),
                count: completedFixtures.length,
            },
            summary: {
                totalFixtures: fixtures.length,
                completedFixtures: completedFixtures.length,
                totalMarkets: markets.length,
                resolvedMarkets: resolvedMarkets.length,
                wouldSettle: resolvedMarkets.length,
                wouldResolve: completedFixtures.length,
            },
        };
        formatter.success('Full simulation complete');
        formatter.output(simulation);
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
