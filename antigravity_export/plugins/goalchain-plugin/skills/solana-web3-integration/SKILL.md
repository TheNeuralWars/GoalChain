---
name: solana-web3-integration
description: |
  Solana Web3 & PDA Integration. MANDATORY: Trigger when working with Solana programs, on-chain transactions, Phantom/Solflare wallet connections, program-derived addresses (PDAs), state compression (cNFTs/Bubblegum), or Anchor IDLs.
  
  Trigger on:
  - Solana, `@solana/web3.js`, Anchor, wallet_connect.js, solana_integration.js, Metaplex, Bubblegum, PDA, fixturePda, livePda, Helius webhooks.
---

# Solana Web3 & PDA Integration Skill

Ensure all client-side smart contract calls, PDA derivations, and transaction signings are 100% robust, type-safe, and feature seamless wallet fallbacks on Solana Devnet.

## 🔍 PDA Derivation Rules
1. **Seed Order Validation**: Always verify client-side seed arrays against the Anchor/Rust program seeds (e.g., `["fixture", matchId, programId]`).
2. **Buffer Conversions**: Ensure strings are converted to `Uint8Array` using `new TextEncoder().encode()` rather than direct string slicing.
3. **PublicKey Parsing**: Always wrap raw address strings in `new solanaWeb3.PublicKey(address)` before derivation.
4. **Bump Storage**: Always retrieve and cache the derived bump to avoid re-derivation overhead.

## 💼 Wallet Connection & Signature Fallbacks
- If `localStorage.getItem('goalchain_wallet')` starts with `"DevGoaL"`, automatically bypass Solana Wallet extension prompts and execute a clean Mock Transaction UI flow.
- If a real wallet is detected, construct, serialize, and request signature through `window.solana.signAndSendTransaction`.
- Always implement an explicit retry buffer for `confirmTransaction` with a visual processing spinner.

## 📝 Integration Code Pattern
```javascript
async function getFixturePda(matchId, programId) {
    const [pda, bump] = await solanaWeb3.PublicKey.findProgramAddress(
        [
            new TextEncoder().encode("fixture"),
            new solanaWeb3.Buffer(matchId.toString())
        ],
        new solanaWeb3.PublicKey(programId)
    );
    return { pda, bump };
}
```

---
*Status: Active. Goal: Flawless on-chain execution with zero UX lag.* 🏟️✨🔗
