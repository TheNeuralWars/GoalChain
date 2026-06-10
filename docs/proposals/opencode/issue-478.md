# Issue #478: [OPENCODE] [IMPL] #331 IDL generation + sync script

## Source
Local queue (autonomous FIFO mode)

## Objective
## Objective
## Task: Implement IDL generation + sync script (Issue #331)

**Priority:** P0
**Branch:** exp/opencode-issue-331
**PR Target:** #403 (already approved)

### Context
Approved in PR #403 with global vision: "Single source of truth → goalchain-sdk (IDL types) alimenta todo: program, api, webapp, oracle"

### Implementation Required

**1. Create `packages/program/scripts/sync-idl.ts`:**
```typescript
#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROGRAM_DIR = path.resolve(__dirname, '..');
const SDK_DIR = path.resolve(PROGRAM_DIR, '../goalchain-sdk');
const IDL_SRC = path.join(PROGRAM_DIR, 'target/idl/goalchain_program.json');
const TYPES_SRC = path.join(PROGRAM_DIR, 'target/types/goalchain_program.ts');
const IDL_DST = path.join(SDK_DIR, 'src/goalchain_program.json');
const TYPES_DST = path.join(SDK_DIR, 'src/goalchain_program.ts');

function run(cmd: string, cwd: string = PROGRAM_DIR) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

console.log('🔄 Building program (anchor build)...');
run('anchor build');

console.log('📦 Copying IDL...');
fs.copyFileSync(IDL_SRC, IDL_DST);

console.log('📦 Copying types...');
fs.copyFileSync(TYPES_SRC, TYPES_DST);

## Priority
P0

## Labels
status:ready,source:manager,agent:opencode,priority:P0,

## OA Plan (aggressive / yolo mode)
- **FULL AUTONOMY**: Make decisions, implement, test, push. No approval needed.
- Implement the complete solution in one pass - no minimal/progressive approach.
- Run all checks: build, lint, typecheck, tests. Fix all errors.
- Push directly to branch and open PR. Auto-merge if CI passes.
- If blocked by missing deps/config: document, create follow-up issue, continue.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-478`.
