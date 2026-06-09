# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Main branch (latest) | ✅ Yes |
| Previous releases | ❌ No |

## Reporting a Vulnerability

**DO NOT** open a public issue for security vulnerabilities.

Instead, please report via:

1. **Email**: security@goalchain.fun (PGP key available on request)
2. **GitHub Security Advisory**: [Private vulnerability report](https://github.com/TheNeuralWars/GoalChain/security/advisories/new)
3. **Direct DM**: @NicoPez on Discord/Telegram (verified core team only)

### What to include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact info for follow-up

## Response Timeline

- **Acknowledgment**: Within 24 hours
- **Initial assessment**: Within 72 hours
- **Fix timeline**: Depends on severity (critical: < 7 days, high: < 14 days, medium: < 30 days)
- **Disclosure**: Coordinated with reporter after fix deployed

## Scope

### In Scope
- Smart contracts (`goalchain_program/`)
- API endpoints (`goalchain_api/`)
- Frontend authentication/wallet flows (`goalchain_webapp/`)
- Oracle data feeds
- Tokenomics/economic parameters

### Out of Scope
- Third-party services (Zealy, Helius, Drift, etc.)
- User-owned wallets/private keys
- Social engineering/phishing
- DoS on public RPC endpoints

## Bug Bounty

We run a **discretionary bug bounty** for critical findings:

| Severity | Reward (USD in $GCH/SOL) |
|----------|--------------------------|
| Critical (drain, mint, governance bypass) | $5,000 - $25,000 |
| High (logic error, data manipulation) | $1,000 - $5,000 |
| Medium (info leak, minor logic) | $250 - $1,000 |
| Low (UI, cosmetic) | Swag / $GCH airdrop |

*Rewards at maintainer discretion. No guarantee of payment. Must follow responsible disclosure.*

## Security Best Practices for Contributors

- Never commit private keys, mnemonics, or `.env` secrets
- Use `.env.example` for template variables
- Validate all on-chain inputs (accounts, instructions, data)
- Use Anchor's built-in checks (`has_one`, `constraint`, `seeds`)
- Test on devnet/localnet before mainnet
- Run `cargo audit` periodically

## Audit History

| Date | Auditor | Scope | Report |
|------|---------|-------|--------|
| TBD | TBD | Program v1.0 | Pending |

---

**Contact**: security@goalchain.fun | Discord: @NicoPez (verified)