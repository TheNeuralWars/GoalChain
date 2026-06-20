---
issue: 808
title: Reorganizar propuestas del repositorio en pestañas
owner: hermes
priority: P0
status: draft
---

# Proposal: Tab-based UI for Project Proposals

## Objective

This proposal outlines the plan to implement issue #808: "Reorganizar propuestas del repositorio en pestañas." The goal is to analyze and restructure all project proposals within the GoalChain repository and to design and implement a tab-based UI component on the dashboard/webapp to display these proposals clearly.

## Scope

- Scan and parse existing proposal markdown documents in the repository (e.g., in `docs/proposals/`).
- Design and implement a clean, interactive tabbed UI component within the `goalchain_webapp/` to catalog, view, and manage these proposals.
- Categorize proposals into "Fully Developed" and "Draft/Incomplete" for display in the UI.
- Provide a quick architectural analysis of the proposal structure and suggest a roadmap for which proposals should be developed next versus which ones to deprecate.

## Current State Analysis

Existing proposals are likely in markdown files within the `docs/proposals/` directory. There is no existing UI for managing or viewing these proposals dynamically.

## Proposed Architecture and Implementation Plan

### 1. Proposal Document Parsing

- **Strategy:** Identify all markdown files within `docs/proposals/`. For each file, extract relevant metadata (title, status, owner, etc.) from the YAML front matter and the content itself.
- **Technology:** Node.js script (part of the webapp build process or a dedicated utility script) using a markdown parser library (e.g., `gray-matter` for front matter and `markdown-it` for content).

### 2. Webapp UI Component

- **Location:** The tabbed UI component will reside within `goalchain_webapp/src/components/ProposalViewer/`. This will include React components for the main viewer, individual tabs, and proposal cards.
- **Design:**
    - A main `ProposalViewer` component.
    - Tabs for "Fully Developed Proposals" and "Draft/Incomplete Proposals".
    - Each tab will display a list of `ProposalCard` components, each showing the title, owner, and a brief description of the proposal.
    - Clicking on a `ProposalCard` will display the full markdown content of the proposal in a detailed view.
- **Technology:** React (TypeScript), Tailwind CSS (if adopted, otherwise existing CSS framework), `react-router-dom` for routing to individual proposal views.

### 3. Data Flow

- The parsed proposal data (metadata + content) will be served to the webapp. This could be done by:
    - **Option A (Static Generation):** During the build process, a script generates a JSON file containing all proposal data. The webapp then loads this JSON. (Preferred for simplicity and performance).
    - **Option B (API Endpoint):** A new API endpoint in `goalchain_api/` serves the parsed proposal data. This would involve the API dynamically reading and parsing the markdown files. (More complex, but allows for dynamic updates without rebuilding the frontend).

### 4. Proposal Roadmap and Deprecation Suggestion

- Based on the extracted metadata and manual review, categorise proposals into "active development," "future consideration," or "deprecate." This will be a manual step after initial parsing, documented within the proposal itself.
- The UI will reflect these categories.

## Proposed File List

- `docs/proposals/hermes/issue-808-proposal.md` (this file)
- `goalchain_webapp/src/components/ProposalViewer/index.tsx` (Main component)
- `goalchain_webapp/src/components/ProposalViewer/ProposalTabs.tsx`
- `goalchain_webapp/src/components/ProposalViewer/ProposalCard.tsx`
- `goalchain_webapp/src/components/ProposalViewer/ProposalDetail.tsx`
- `goalchain_webapp/src/utils/proposalParser.ts` (Script for parsing markdown files and extracting metadata - if Option A is chosen, this would be a build script)
- `goalchain_webapp/src/data/proposals.json` (Generated JSON data - if Option A is chosen)
- `goalchain_webapp/src/pages/Dashboard.tsx` (Integration point in the main dashboard)

## Risks and Regressions

- **UI/UX Consistency:** Ensure the new component aligns with existing GoalChain webapp design. Mitigation: Use existing CSS framework/Tailwind, adhere to `frontend-design` skill.
- **Parsing Errors:** Malformed markdown or front matter in proposals could cause the parsing script to fail. Mitigation: Robust error handling in `proposalParser.ts`, clear documentation for proposal authors.
- **Performance:** Loading and rendering many proposals might impact webapp performance. Mitigation: Pagination, lazy loading, and efficient data structures.
- **Build Process Complexity:** Adding a parsing step to the build process might increase build times. Mitigation: Optimise parsing script, cache parsed data.

## Rollback Plan

- If issues arise, revert the changes via `git revert <commit-hash>`. Since the changes are confined to the webapp and documentation, a revert should be straightforward.

## Exact Test Commands

1.  **Build the webapp:**
    ```bash
    cd goalchain_webapp
    npm install
    npm run build
    ```
2.  **Start the webapp locally:**
    ```bash
    cd goalchain_webapp
    npm start
    ```
    Then, manually navigate to the dashboard page in the browser and verify:
    - The tabbed UI for proposals is visible.
    - Proposals are correctly categorized into "Fully Developed" and "Draft/Incomplete."
    - Clicking on a proposal card displays its full content accurately.
    - The UI is responsive and aesthetically consistent with the rest of the webapp.
3.  **Unit/Integration Tests (to be added during implementation):**
    - Placeholder: `cd goalchain_webapp && npm test`
    - Specific tests will be written for `proposalParser.ts` and React components.

## Workflow Notes

- This issue is marked `cambio urgente`, so I will commit directly to `main`.
- I will prioritize Option A (Static Generation) for parsing and data flow due to its simplicity and performance benefits for initial implementation.
- I will start by implementing the parsing logic and then move to the UI components.
