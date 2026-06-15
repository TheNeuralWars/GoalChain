<!-- GoalChain Pull Request Template -->
<!-- This template is loaded automatically when creating a new PR -->

## Description
<!-- Brief summary of changes and motivation -->

## Changes Made
<!-- List key changes -->
- 
- 
- 

## Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactor / code quality
- [ ] Performance improvement
- [ ] CI/CD / build / ops

## Testing
<!-- Describe how changes were tested -->
- [ ] Unit tests pass (`npm test` / `anchor test`)
- [ ] Integration tests pass
- [ ] Manual verification completed
- [ ] Lint passes (`npm run lint` in affected packages)
- [ ] Build passes (`npm run build` in affected packages)

### Test Commands Run
```bash
# Example:
# cd goalchain_webapp && npm run build
# cd goalchain_api && npm test
```

## GBrain Import Ritual (REQUIRED for Cursor/Antigravity Handoff)
<!-- 
  ⚠️ CRITICAL: After this PR is merged to `main`, 
  each host (Cursor, Antigravity on Mac) MUST run the gbrain import ritual
  to sync the knowledge graph with latest intake docs and ai_context.
  
  The VPS (Hermes) runs this independently on its own gbrain instance.
-->

### Post-Merge Action Required
After merge to `main`, run on **each local host** (Cursor Mac, Antigravity Mac):

```bash
gbrain import ai_context docs/intake
```

**Why:** No live Mac↔VPS sync exists. Each host maintains its own gbrain PGLite instance. This command indexes updated `ai_context/` and `docs/intake/` files into the local knowledge graph so agents have current context.

**When:** Immediately after `git pull origin main` on each machine.

**Verification:** Run `gbrain query "recent changes"` to confirm new content is indexed.

---

## Checklist
- [ ] Code follows project style conventions
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if applicable)
- [ ] No secrets or credentials committed
- [ ] **GBrain import ritual documented above** (for merges to main)
- [ ] Branch naming follows convention (`exp/opencode-issue-<n>`, `feat/*`, `fix/*`)

## Related Issues / Intake
<!-- Link related GitHub issues or intake briefs -->
- Closes #

## Screenshots / Visual Changes (if applicable)
<!-- Drag and drop images here -->

## Rollback Plan
<!-- Describe how to revert if issues arise -->

---

<!-- 
  GoalChain Agent Orchestration Notes:
  - Antigravity = Integration Owner (merges to main)
  - Hermes CEO = Autonomous implementation (draft PRs only)
  - Cursor = Assistive drafts / spikes
  - Grok = Review packets only
  
  See ai_context/AGENT_ORCHESTRATION.md for full policy
-->