"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settleMarketsCommand = settleMarketsCommand;
const utils_js_1 = require("../utils.js");
async function settleMarketsCommand(opts) {
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
        formatter.log('Fetching markets to settle...', { dryRun });
        const markets = await (0, utils_js_1.fetchAllMarkets)(program);
        const resolvedMarkets = markets.filter(m => m.status === 'Resolved' || m.status === 'Cancelled');
        let targetMarkets = resolvedMarkets;
        if (opts.marketIds) {
            const ids = opts.marketIds.split(',').map(s => s.trim());
            targetMarkets = resolvedMarkets.filter(m => ids.includes(String(m.marketId)));
        }
        if (targetMarkets.length === 0) {
            formatter.success('No markets to settle');
            formatter.output({ settled: 0, markets: [], dryRun });
            formatter.exit(0);
        }
        if (dryRun) {
            formatter.log('DRY RUN: Would settle markets via Jito bundle');
            formatter.success('Settlement simulation complete');
            formatter.output({
                dryRun: true,
                mode: 'simulation',
                marketsToSettle: targetMarkets.map(m => ({
                    pubkey: m.pubkey,
                    marketId: m.marketId,
                    status: m.status,
                    poolA: m.poolA,
                    poolB: m.poolB,
                    poolDraw: m.poolDraw,
                })),
                count: targetMarkets.length,
                timestamp: new Date().toISOString(),
            });
        }
        else {
            formatter.log('EXECUTE MODE: Would call oracle_update_market_status for each');
            formatter.warn('Real settlement via Jito bundle not yet implemented');
            throw new utils_js_1.CliError(2, 'Market settlement via Jito bundle not implemented');
        }
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
