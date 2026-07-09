# Verified Build Guide

## Solana Explorer Verified Builds

1. **Verified Programs**:
   - All programs must be verified on the Solana Explorer
   - Use the `solana program show` command to verify program IDs

2. **Codama IDL**:
   - Generate IDL files using Codama
   - Store IDL files in the `idl` directory

3. **Feature Gates**:
   - All new features must be gated behind feature flags
   - Feature flags should be documented in this guide

4. **Security Audit**:
   - All builds must pass the security audit (section 6)
   - Audit results should be documented in this guide

5. **Build Process**:
   - Use `anchor build` for Solana programs
   - Use `npm run build` for webapp

6. **Testing**:
   - Run `anchor test` for Solana programs
   - Run `npm test` for webapp

7. **Deployment**:
   - Deploy to devnet first
   - Monitor for issues before mainnet deployment
