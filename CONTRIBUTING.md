# Contributing to GoalChain

Thank you for your interest in contributing to GoalChain! 🏆⚽

## Ways to Contribute

- **Code contributions**: Bug fixes, features, improvements
- **Documentation**: Guides, translations, API docs
- **Design**: UI/UX, graphics, animations
- **Research**: Sports data, tokenomics, game mechanics
- **Community**: Discord moderation, content creation, onboarding

## Getting Started

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/your-feature-name`
3. **Make changes** following our guidelines below
4. **Test** your changes locally
5. **Submit a PR** with a clear description

## Development Setup

### Prerequisites
- Node.js 20+
- Rust 1.75+ (for Solana program)
- Anchor CLI 0.29+
- Solana CLI 1.17+
- pnpm or npm

### Frontend (goalchain_webapp)
```bash
cd goalchain_webapp
npm install
npm run dev  # http://localhost:5173
```

### Smart Contract (goalchain_program)
```bash
cd goalchain_program
anchor build
anchor test --validator legacy
```

### API (goalchain_api)
```bash
cd goalchain_api
npm install
npm run dev  # http://localhost:3001
```

## Code Style & Standards

### TypeScript/React
- Strict TypeScript, no `any`
- ESLint + Prettier (run `npm run lint`)
- Component-first architecture
- i18n-first: all user strings in `src/i18n/locales/*.json`

### Rust/Anchor
- `cargo fmt` + `cargo clippy`
- Anchor idioms, account validation
- Explicit error codes

### General
- Small, focused PRs (one feature/fix per PR)
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Tests for new functionality

## Pull Request Process

1. **Title**: Clear, descriptive (e.g., "feat: add penalty game streak persistence")
2. **Description**: What, why, how to test
3. **Screenshots/Videos** for UI changes
4. **CI must pass**: lint, typecheck, build
5. **Review**: At least 1 approval from CODEOWNERS
6. **Merge**: Squash merge by maintainer

## Issue Reporting

Use our issue templates:
- **Bug Report**: Steps to reproduce, expected vs actual, logs
- **Feature Request**: Problem statement, proposed solution, alternatives
- **Dev Proposal**: Larger initiatives, RFC-style

## Community Guidelines

- Be respectful and inclusive
- English in public channels (Discord, GitHub, forums)
- Spanish OK in private 1:1 with core team
- No spam, shilling, or off-topic promotion
- Help newcomers - we were all new once

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

By contributing, you agree your contributions will be licensed under the project's license (MIT for code, CC-BY-4.0 for docs).

---

**Questions?** Open a Discussion or ping @NicoPez / @LucasBello on Discord.

*GoalChain - Football has Evolved. Own the Pitch. Win on Solana.*