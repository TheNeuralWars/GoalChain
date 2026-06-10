"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showConfigCommand = showConfigCommand;
const utils_js_1 = require("../utils.js");
async function showConfigCommand(opts) {
    const formatter = (0, utils_js_1.createFormatter)(opts.json ?? false, opts.verbose ?? false);
    const dryRun = true; // config:show is always read-only
    try {
        const connection = (0, utils_js_1.createConnection)(opts);
        const programId = (0, utils_js_1.getProgramId)(opts);
        const provider = (0, utils_js_1.createProvider)(connection, null);
        const program = (0, utils_js_1.createProgram)(provider);
        formatter.log('Fetching on-chain config...');
        const config = await (0, utils_js_1.fetchOnchainConfig)(program);
        formatter.success('On-chain config retrieved');
        formatter.output({
            dryRun: true,
            config,
            network: opts.network || 'devnet',
            rpcUrl: connection.rpcEndpoint,
            timestamp: new Date().toISOString(),
        });
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
