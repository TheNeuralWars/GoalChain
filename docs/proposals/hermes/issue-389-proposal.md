# OA Proposal — Issue #389

## Title
[OPENCODE] [DRAFT] Oracle: Integrate turbovec vector index (IdMapIndex) for players/fixtures/markets RAG

## Source
GitHub issue #389

## Objective
## Objective
Integrate turbovec as the vector store in goalchain_oracle for semantic search over players, fixtures, and markets. Replace any in-memory/FAISS usage with TurboQuantIndex/IdMapIndex for 8x memory compression and online ingest.

## Scope
Create/modify files in goalchain_oracle/src/vector/:

### New Files:
1. **src/vector/turbovec_store.py** — Wrapper around turbovec.IdMapIndex
   - Class TurboVecStore with methods: add_with_ids(embeddings, ids), search(query, k, allowlist), remove(id), persist(path), load(path)
   - Config: dim=1536 (text-embedding-3-small), bit_width=4 (4-bit TurboQuant)
   - Persistence to .tvim files in data/vector/

2. **src/vector/player_index.py** — Player-specific index
   - Load player embeddings from docs/assets/data/players.json (or generated embeddings)
   - Build/fresh index on startup or load persisted
   - Search with league/team/position filters via allowlist

3. **src/vector/fixture_index.py** — Fixture/market embeddings index
   - Index fixture embeddings (fixture_id, home/away, league, timestamp)
   - Search for similar fixtures, market outcomes

4. **src/vector/__init__.py** — Barrel exports

### Modify:
- **src/__init__.py** — Export vector module
- **requirements.txt** / pyproject.toml — Add turbovec dependency

## Acceptance Criteria
- pip install turbovec works in oracle environment
- Index builds from 528 players in <2s, uses <50MB RAM (vs 400MB+ float32)
- Search with allowlist filter returns correct filtered results
- Persistence/load roundtrip works
- Integration test: search "premier league striker" returns relevant player IDs
- No breaking changes to existing oracle CLI/services

## Skill Hint
Follow gstack plan-eng-review before coding. This is infra, not feature.

## Owner
opencode

## OA Plan (draft)
- Analyze repository constraints and META alignment.
- Implement minimal safe changes first.
- Run local checks where feasible.
- Prepare draft PR for Cursor review.

## Risk / rollback
- Risk: scope drift or unstable dependencies.
- Rollback: revert branch `exp/opencode-issue-389` and close draft PR.
