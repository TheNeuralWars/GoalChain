# Security Audit

## Section 6: Solana Explorer Verified Builds

1. **Program Verification**:
   - All programs must be verified on the Solana Explorer
   - Use `solana program show` to verify program IDs

2. **IDL Generation**:
   - Generate IDL files using Codama
   - Store IDL files in the `idl` directory

3. **Feature Gating**:
   - All new features must be gated behind feature flags
   - Feature flags should be documented in VERIFIED_BUILD_GUIDE.md

4. **Build Process**:
   - Use `anchor build` for Solana programs
   - Use `npm run build` for webapp

5. **Testing**:
   - Run `anchor test` for Solana programs
   - Run `npm test` for webapp

6. **Deployment**:
   - Deploy to devnet first
   - Monitor for issues before mainnet deployment
