import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: string;
}

interface ChatResponse {
  response: string;
}

const SYSTEM_PROMPT = `You are Collabs Agent, the AI co-pilot for GoalChain contributors. You live in the Collabs Portal (goalchain.fun/colabs.html) and help developers, designers, researchers, and builders contribute to GoalChain.

## Identity & Mission
- **Name**: Collabs Agent
- **Role**: Onboarding accelerator, context engine, vibecode partner
- **Mission**: Reduce "time to first PR" from days → minutes
- **Personality**: Cyberpunk hacker spirit, direct, encouraging, technically deep but accessible

## Core Knowledge (always accessible)
- Full codebase structure: goalchain_webapp/, goalchain_program/, goalchain_sdk/, goalchain_api/
- Current issues (good first issue, help wanted, P0-P3)
- Architecture decisions (ai_context/)
- Design system tokens (src/styles/tokens/, frontend-design skill)
- i18n keys (en.json/es.json sync)
- Deploy pipelines (Vercel + GitHub Pages)
- CONTRIBUTING.md, GOVERNANCE.md, SECURITY.md

## Response Style
- Default: English (public forum)
- Tone: "Hacker mentor" — direct, no fluff, celebrates shipping
- Format: Markdown with code blocks, bullet points, bold for emphasis
- Commands: /onboard, /issue, /tour, /spec, /deploy
- Emojis: 🚀 🔥 ⚡ 🏗️ 🎯 💻 (strategic, not spam)

## Quick Commands
- /onboard → Full onboarding flow (stack → local dev → first issue → PR flow)
- /issue good first issue → Live GitHub issue fetch + typical starter tasks
- /tour → Repo architecture walkthrough with file tree
- /spec → Generate FCC implementation spec (files, component, i18n, tests)
- /deploy → Auto-deploy pipeline explanation (Vercel + GitHub Pages)

## Boundaries
- Don't write full production code (delegate to FCC via issue)
- Don't share secrets, private keys, internal ops
- Do give exact file paths, commands, patterns, gotchas
- Do link to relevant issues, docs, code examples
- Say "I don't know, but here's how to find out" when unsure`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [], context } = req.body as ChatRequest;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation for the model
    const conversations = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    // Use Grok via xAI API (configured in Vercel env vars)
    const xaiApiKey = process.env.XAI_API_KEY;
    
    if (!xaiApiKey) {
      // Fallback response when no API key configured
      return res.status(200).json({ 
        response: getFallbackResponse(message)
      });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${xaiApiKey}`
      },
      body: JSON.stringify({
        model: 'grok-4.3',
        messages: conversations,
        temperature: 0.3,
        max_tokens: 2048,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('xAI API error:', response.status, error);
      return res.status(200).json({ response: getFallbackResponse(message) });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || getFallbackResponse(message);

    return res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Collabs Agent error:', error);
    return res.status(200).json({ response: getFallbackResponse(String(error)) });
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('/onboard') || lower.includes('onboard')) {
    return `🚀 **Welcome to GoalChain Contributor Onboarding!**

**Step 1: Pick Your Stack**
- 🌐 **Frontend** (React + TypeScript + Vite) → \`goalchain_webapp/\`
- ⚓ **Smart Contracts** (Rust + Anchor) → \`goalchain_program/\`
- 📦 **SDK/Types** → \`goalchain_sdk/\`
- 🔧 **API** (Express + TypeScript) → \`goalchain_api/\`
- 🎨 **Design** → \`assets/\`, \`frontend-design\` skill

**Step 2: Local Dev**
\`\`\`bash
git clone https://github.com/TheNeuralWars/GoalChain.git
cd GoalChain/goalchain_webapp
cp .env.example .env
npm install
npm run dev  # http://localhost:5173
\`\`\`

**Step 3: Find Your First Issue**
\`/issue good first issue\` — I'll fetch tagged starter tasks.

**Step 4: PR Flow**
Branch → Code → \`npm run build && npm run lint\` → PR → CODEOWNERS review → Merge → **Auto-deploy to Vercel + GitHub Pages**

What's your background? (React, Rust, Design, Research?) I'll match you to 3 perfect starter issues.`;
  }

  if (lower.includes('/issue') || lower.includes('good first issue')) {
    return `🎯 **Good First Issues (Live from GitHub)**

\`\`\`
gh issue list --repo TheNeuralWars/GoalChain --label "good first issue" --state open --json title,number,url
\`\`\`

**Typical starter tasks:**
- 🎨 Add missing i18n keys to \`es.json\` (sync with \`en.json\`)
- 🧪 Write unit test for \`zealyClient.ts\` 
- 📝 Document a component in \`CONTRIBUTING.md\`
- 🎯 Fix mobile layout in \`PenaltyGame.tsx\`
- 🔍 Add \`data-i18n\` attributes to marketing HTML

**Pro tip:** Filter by your stack:
- \`label:"frontend"\` → React/TS work
- \`label:"rust"\` → Anchor program
- \`label:"design"\` → UI/UX, assets
- \`label:"docs"\` → Documentation

Want me to generate a \`/spec\` for any of these?`;
  }

  if (lower.includes('/tour') || lower.includes('repo') || lower.includes('architecture')) {
    return `🗺️ **GoalChain Repo Architecture Tour**

\`\`\`
GoalChain/
├── .github/              # CI/CD, issue templates, CODEOWNERS
├── docs/                 # Marketing site → goalchain.fun (GitHub Pages)
├── goalchain_webapp/     # Play app → play.goalchain.fun (Vercel)
│   ├── src/
│   │   ├── ui/           # React components (DashboardGrid, EstadioPortal, ClubPortal...)
│   │   ├── i18n/         # EN/ES translation keys (en.json, es.json)
│   │   ├── lib/          # Clients (goalchainClient, zealyClient...)
│   │   └── styles/tokens/# Design system (colors, spacing, motion)
├── goalchain_sdk/        # Shared TypeScript SDK (types, clients)
├── goalchain_api/        # REST API (Express + TS) → api.goalchain.fun
├── goalchain_program/    # Solana smart contracts (Rust/Anchor)
│   ├── programs/goalchain/
│   │   ├── src/
│   │   │   ├── instructions/  # 7 instructions (mint, bet, claim, crank...)
│   │   │   ├── state/         # Accounts (Fixture, Vault, Player...)
│   │   │   └── errors.rs
├── scripts/              # Build, sync, deploy utilities
├── assets/               # Public images, fonts, design tokens
└── CONTRIBUTING.md       # Contribution guidelines
\`\`\`

**Key Patterns:**
- **i18n-first:** Every user string → \`en.json\` + \`es.json\` → \`scripts/sync-marketing-i18n.js\`
- **Design system:** Use \`src/styles/tokens/\` (colors, spacing, motion, borders)
- **Components:** One feature = one component in \`src/ui/\`
- **State:** localStorage (demo) → on-chain (prod) → wallet-adapter
- **API keys:** \`VITE_*\` env vars (Zealy, Helius, etc.)

**Deploy:** Push to \`main\` → Vercel (webapp) + GitHub Pages (docs) → auto`;
  }

  if (lower.includes('/spec') || lower.includes('spec') || lower.includes('implement')) {
    return `📝 **Implementation Spec Generator**

Describe the feature in one sentence, I'll generate:

1. **File list** (new/modified)
2. **Component skeleton** with proper TypeScript types
3. **i18n keys** needed (EN + ES)
4. **Design tokens** to use
5. **Test commands** to verify
6. **PR checklist**

**Example prompt:** "Add a new tokenomics card for 'Staking Rewards' showing APR and TVL"

**Output:**
\`\`\`
Files to create/modify:
- goalchain_webapp/src/ui/TokenomicsCard.tsx (reuse existing)
- goalchain_webapp/src/i18n/locales/en.json (+3 keys)
- goalchain_webapp/src/i18n/locales/es.json (+3 keys)

Component skeleton:
export function StakingRewardsCard() {
  const { t } = useTranslation();
  return (
    <TokenomicsCard
      icon="📊"
      title={t('econ_staking_title')}
      description={t('econ_staking_desc')}
      metric={{ label: 'APR', value: '8.2%' }}
      metric2={{ label: 'TVL', value: '$2.4M' }}
    />
  );
}

i18n keys:
- econ_staking_title: "Staking Rewards" / "Recompensas de Staking"
- econ_staking_desc: "Earn yield by staking $GCH in the Infinity Vault..."
- econ_staking_apr: "Current APR"

Test: npm run build && npm run lint
\`\`\`

**Describe your feature and I'll generate the full spec.**`;
  }

  if (lower.includes('/deploy') || lower.includes('deploy') || lower.includes('pipeline')) {
    return `🚀 **Auto-Deploy Pipeline**

**Marketing Site (goalchain.fun)**
- Trigger: Push to \`main\` with changes in \`docs/**\`
- Platform: GitHub Pages (→ moving to Vercel)
- Workflow: \`.github/workflows/goalchain-ci-cd.yml\`
- Sync: \`scripts/sync-marketing-i18n.js\` (hourly cron)

**Play App (play.goalchain.fun)**
- Trigger: Push to \`main\` (any change in \`goalchain_webapp/**\`)
- Platform: Vercel (auto-detects \`vercel.json\`)
- Build: \`npm run build\` (includes \`goalchain-sdk\` build)
- Output: \`dist/\`

**Sync Flow:**
\`\`\`
FCC PR → Merge → main
       │
       ├─► Vercel: builds goalchain_webapp → play.goalchain.fun
       └─► GitHub Actions: validates NFTs → deploys docs/ → goalchain.fun
\`\`\`

**Manual Trigger:**
\`\`\`bash
# Marketing site
gh workflow run goalchain-ci-cd.yml --repo TheNeuralWars/GoalChain

# Vercel (auto on git push)
git push origin main
\`\`\`

**Current Status:** GitHub Actions billing issue → marketing site temporarily on GitHub Pages. Moving to Vercel soon for unified deploy.`;
  }

  return `🤖 **Collabs Agent** — I'm your AI co-pilot for GoalChain contributions.

**Quick Commands:**
- \`/onboard\` — Start contributor onboarding
- \`/issue good first issue\` — Find starter tasks
- \`/tour\` — Repo architecture walkthrough
- \`/spec\` — Generate FCC implementation spec
- \`/deploy\` — Explain auto-deploy pipeline

**Or ask me directly:**
- "How do I add a new tokenomics card?"
- "Where's the penalty game logic?"
- "How do I test locally?"
- "What design tokens should I use?"
- "How does i18n sync work?"

**Resources:**
- [CONTRIBUTING.md](https://github.com/TheNeuralWars/GoalChain/blob/main/CONTRIBUTING.md)
- [GOVERNANCE.md](https://github.com/TheNeuralWars/GoalChain/blob/main/GOVERNANCE.md)
- [Good First Issues](https://github.com/TheNeuralWars/GoalChain/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

What are you building today? 🚀`;
}