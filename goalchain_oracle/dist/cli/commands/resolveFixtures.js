"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFixturesCommand = resolveFixturesCommand;
const utils_js_1 = require("../utils.js");
async function resolveFixturesCommand(opts) {
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
        formatter.log('Fetching fixtures to resolve...', { dryRun });
        const fixtures = await (0, utils_js_1.fetchAllFixtures)(program);
        const completedFixtures = fixtures.filter(f => f.status === 'Completed');
        let targetFixtures = completedFixtures;
        if (opts.fixtureIds) {
            const ids = opts.fixtureIds.split(',').map(s => s.trim());
            targetFixtures = completedFixtures.filter(f => ids.includes(f.matchId));
        }
        if (targetFixtures.length === 0) {
            formatter.success('No fixtures to resolve');
            formatter.output({ resolved: 0, fixtures: [], dryRun });
            formatter.exit(0);
        }
        if (dryRun) {
            formatter.log('DRY RUN: Would call update_fixture_status + trigger settlement');
            formatter.success('Fixture resolution simulation complete');
            formatter.output({
                dryRun: true,
                mode: 'simulation',
                fixturesToResolve: targetFixtures.map(f => ({
                    pubkey: f.pubkey,
                    matchId: f.matchId,
                    teamA: f.teamA,
                    teamB: f.teamB,
                    status: f.status,
                    winner: f.winner,
                    poolA: f.poolA,
                    poolB: f.poolB,
                    poolDraw: f.poolDraw,
                })),
                count: targetFixtures.length,
                timestamp: new Date().toISOString(),
            });
        }
        else {
            formatter.log('EXECUTE MODE: Would call update_fixture_status for each');
            formatter.warn('Real fixture resolution not yet implemented');
            throw new utils_js_1.CliError(2, 'Fixture resolution not implemented');
        }
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
