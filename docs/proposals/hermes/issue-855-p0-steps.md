# Implementation Steps for P0 Issues

## 1. Deprecate migrate_config.ts

- **Objective**: Remove the migrateConfig instruction and update related documentation.
- **Steps**:
  1. Identify all references to migrateConfig in the codebase.
  2. Remove the migrateConfig instruction from the IDL and program.
  3. Update documentation to reflect the deprecation.
  4. Verify that no operations runbook references the migrateConfig instruction.

## 2. Block vault_crank fake execute

- **Objective**: Ensure vault_crank executes real transactions or fails appropriately.
- **Steps**:
  1. Identify the code section in vault_crank.ts that uses fakeTx when VAULT_CRANK_EXECUTE=1.
  2. Modify the code to either execute real transactions or fail with an appropriate error message.
  3. Update the API to reflect that the vault_crank is unavailable.

## 3. Fix EconomyConfigBanner

- **Objective**: Update the EconomyConfigBanner component to read the correct fields from the API.
- **Steps**:
  1. Identify the fields that the EconomyConfigBanner component expects from the API.
  2. Update the component to read the correct fields from the API response.
  3. Verify that the banner displays the correct information.
  4. Run the build command to ensure there are no errors.

## 4. Fix anchor test runner

- **Objective**: Resolve the issue with the anchor test runner and surfpool.
- **Steps**:
  1. Identify the issue with the anchor test runner and surfpool.
  2. Modify the test runner to handle surfpool correctly.
  3. Document the test path and ensure it is green for program PRs.

## 5. Deploy Play production

- **Objective**: Deploy the play.goalchain.fun with the correct API base URL.
- **Steps**:
  1. Ensure that Vercel credentials are available.
  2. Deploy the play.goalchain.fun with the correct API base URL.
  3. Verify that the API prod URL is live and that banners load correctly.

## 6. QA Mundial demo

- **Objective**: Complete the Mundial demo runbook on the production Play.
- **Steps**:
  1. Follow the Mundial demo runbook to ensure that bet→claim is completed in less than 5 minutes.
  2. Verify that all components of the demo runbook are working correctly.

## 7. Merge Mundial MVP to main

- **Objective**: Merge the Mundial MVP PR with the necessary components.
- **Steps**:
  1. Ensure that the PR includes all necessary components.
  2. Verify that the build and lint are green.
  3. Ensure that the PR is not blocked by PRs #32–34 (already merged).
  4. Merge the PR to main.

## Conclusion

These implementation steps outline the plan for addressing the P0 issues. Each step will be carried out in small, safe steps, following the guidelines and best practices outlined in the CLAUDE.md file.