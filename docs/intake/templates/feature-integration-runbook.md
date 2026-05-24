# Feature integration runbook (template)

Copy to `docs/intake/YYYY-MM-DD-<feature-slug>.md` before implementation.

---

- **Status:** draft
- **Priority:** P1
- **Owner:** cursor
- **Backend surface:** goalchain_program | goalchain_api | goalchain_oracle
- **Frontend surface:** goalchain_webapp | docs (read-only)

## Objective

One sentence: what user-visible behavior ships.

## Backend capability (already exists / to build)

- [ ] On-chain instruction / API route / oracle job:
- [ ] Data shape returned:

## Frontend behavior

- [ ] Component / route:
- [ ] Empty / error / loading states:
- [ ] Env vars (`VITE_*`):

## Acceptance criteria

- [ ] `npm run build` (webapp) green
- [ ] Manual test steps documented
- [ ] No transactional logic added to `docs/`

## Test commands

```bash
# fill exact commands
```

## Rollback

Revert PR #___ ; feature flag OFF if applicable.
