# OA Proposal — Issue #837

## Title
[HERMES] [SECURITY] Fix Critical Vulnerabilities in Solana Program

## Source
GitHub issue #837

## Objective
## Objective
### Objective
Fix critical vulnerabilities in the GoalWorld Solana program to prevent:
- Token theft via unchecked accounts.
- Double claims via boolean flags.
- Timestamp grinding attacks.
- Unauthorized state updates.

### Files & Paths
**State Accounts**
- config.rsfixture.rsvault.rs/data/apps/GoalWorld/contracts/programs/goalworld_program/src/instructions/betting/
  -  (, , )
  -  (, )
  -  (, )
  -  (, )

### Constraints & Fixes
#### 1. **Timestamp Grinding**
**Issue**:  uses  seeds.
**Fix**: Replace  with a global nonce PDA ().
- Initialize in  or as a standalone PDA.
- Increment per wager: .

#### 2. **Unchecked Token Accounts**
**Issue**:  in , , etc.
**Fix**: Add constraints:


#### 3. **Double Claim Vulnerability**
**Issue**:  (boolean) → replace with enum.
**Fix**:

- Update handlers to check status transitions.

#### 4. **Missing Vault Constraints**
**Issue**:  in //.
**Fix**: Add PDA constraints:


#### 5. **Live Market Cooldown Bypass**

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert main commit linked to issue #837
