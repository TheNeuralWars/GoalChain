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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEEDS = exports.idl = exports.PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
const goalchain_program_json_1 = __importDefault(require("./goalchain_program.json"));
exports.idl = goalchain_program_json_1.default;
exports.PROGRAM_ID = new web3_js_1.PublicKey("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");
exports.SEEDS = {
    CONFIG: "config",
    STAKE: "stake",
    PLAYER: "player",
    RENTAL: "rental",
    WAGER: "wager",
    WAGER_VAULT: "wager_vault",
    FIXTURE: "fixture",
    FIXTURE_VAULT: "fixture_vault",
    LIVE_STATE: "live_state",
    MARKET: "market",
    MARKET_VAULT: "market_vault",
    POSITION: "position",
};
__exportStar(require("./client"), exports);
