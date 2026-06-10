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
exports.versionCommand = versionCommand;
const utils_js_1 = require("../utils.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function versionCommand(opts) {
    const formatter = (0, utils_js_1.createFormatter)(opts.json ?? false, opts.verbose ?? false);
    try {
        const pkgPath = path.resolve(__dirname, '../../../package.json');
        let version = '1.0.0';
        let commitHash = 'unknown';
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            version = pkg.version || version;
        }
        // Try to get git commit hash
        try {
            const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            commitHash = execSync('git rev-parse --short HEAD', { cwd: path.resolve(__dirname, '../../..'), encoding: 'utf-8' }).trim();
        }
        catch {
            // Ignore if not a git repo
        }
        const info = {
            name: 'oracle',
            version,
            commit: commitHash,
            description: 'GoalChain Oracle CLI - Operations tooling for on-chain oracle operations',
        };
        formatter.success('Version info');
        formatter.output(info);
        formatter.exit(0);
    }
    catch (error) {
        (0, utils_js_1.handleError)(formatter, error);
    }
}
