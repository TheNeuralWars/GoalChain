# OA Proposal — Issue #330

## Title
[OPENCODE] Program: Rewrite lib.rs as module declarations (~50 lines)

## Source
GitHub issue #330 (processed via autonomous local queue)

## Objective
Rewrite programs/goalchain_program/src/lib.rs as pure module declarations:

## Scope
Replace the 4,090-line monolith with ~50 lines:

```rust
// programs/goalchain_program/src/lib.rs
use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod math;
pub mod state;
pub mod instructions;
pub mod events;
pub mod validators;
pub mod utils;

pub use constants::*;
pub use errors::*;
pub use math::*;
pub use state::*;
pub use instructions::*;
pub use events::*;
pub use validators::*;
pub use utils::*;

declare_id!("FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg");

#[program]
pub mod goalchain_program {
    use super::*;

    // Config
    pub use instructions::config::*;
    // Builder Fund
    pub use instructions::builder_fund::*;
    // Fixture
    pub use instructions::fixture::*;
    // Betting
    pub use instructions::betting::*;
    // Live Market
    pub use instructions::live_market::*;
    // Player
    pub use instructions::player::*;
    // Vault
    pub use instructions::vault::*;
    // Governance
    pub use instructions::governance::*;
    // Contributor
    pub use instructions::contributor::*;
}
```

## Priority
P0

## Labels
status:ready, source:manager, agent:opencode, status:done, priority:P0

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft for review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-330` and close draft PR.