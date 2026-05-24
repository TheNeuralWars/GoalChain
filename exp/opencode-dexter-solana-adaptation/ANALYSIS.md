# Dexter → Solana Adaptation Analysis

**Date:** 2026-05-24
**Branch:** exp/opencode-dexter-solana-adaptation

## What is Dexter?

Dexter is an open-source framework by virattt for building autonomous AI trading agents. Key characteristics:

- LLM-driven decision making
- Modular strategy system
- DEX interaction layer (currently EVM-focused)
- Support for multiple chains (primarily Ethereum ecosystem)
- Designed for autonomous execution with safety guardrails

## Core Components (to adapt)

1. **Agent Core** — LLM orchestration and decision loop
2. **DEX Adapter** — Currently supports Uniswap, Sushi, etc.
3. **Wallet / Signing Layer**
4. **Strategy Plugins**
5. **Risk Management / Guardrails**
6. **Memory / State Management**

## Major Differences: EVM vs Solana

| Component            | EVM (Current)              | Solana (Target)                    | Difficulty |
|----------------------|----------------------------|------------------------------------|------------|
| Transaction model    | Account-based              | Account + Program model            | Medium     |
| DEX integration      | Uniswap V2/V3              | Jupiter, Raydium, Orca             | High       |
| Wallet signing       | ethers.js / viem           | @solana/web3.js + wallet-adapter   | Medium     |
| Token standards      | ERC-20                     | SPL Token                          | Low        |
| Program interaction  | Contract calls             | Program invocations + PDAs         | High       |
| Speed / Finality     | ~12s blocks                | ~400ms slots                       | Advantage  |

## Proposed Adaptation Architecture

**Option A — Thin Adapter Layer**
- Keep most of Dexter's core
- Replace only the DEX adapter with Solana equivalents (Jupiter API + Raydium SDK)
- Lower effort, but less native

**Option B — Full Solana Port**
- Port the agent loop and strategy system to Solana primitives
- Build native Solana trading agent from the ground up
- Higher effort, better long-term fit

**Recommended:** Start with **Option A** (thin adapter) as a 2-week spike to validate feasibility, then decide on full port.

## Integration Opportunities with GoalChain

1. **Vault Yield Agent**
   - Use adapted Dexter to manage portions of Infinity Engine yield via Solana DEXes

2. **Genesis Agent (tokenizable)**
   - Turn the Solana version into a tradable agent on Virtuals.io

3. **Devnet Oracle Enhancement**
   - Combine with existing Devnet Oracle for simulation + execution

4. **Manager Agent for Squads**
   - Allow Genesis Squad holders to deploy personal trading agents

## Risks

- Jupiter API rate limits and reliability
- Slippage and MEV on Solana DEXes
- Security of autonomous agents holding funds
- Maintenance burden if we fork instead of contributing upstream

## Estimated Effort

- Thin adapter prototype: 10-14 days
- Full Solana-native version: 4-6 weeks
- Production-ready agent with guardrails: 2-3 months

## Recommendation

Proceed with a **thin adapter spike** focused on Jupiter integration. Validate whether the Dexter architecture is flexible enough before committing to a deeper fork.

Next concrete step: Clone Dexter and attempt to swap the DEX layer with a Jupiter-based adapter.
