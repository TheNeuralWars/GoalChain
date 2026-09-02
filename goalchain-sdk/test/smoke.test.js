import test from 'node:test';
import assert from 'node:assert/strict';
import { PROGRAM_ID, SEEDS, idl } from '../dist/index.js';

test('GoalChain SDK - Program ID Invariant', () => {
  assert.equal(
    PROGRAM_ID.toBase58(),
    'FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg',
    'Program ID must strictly match canonical Anchor program ID'
  );
});

test('GoalChain SDK - Seeds Dictionary Coverage', () => {
  const requiredSeeds = [
    'CONFIG',
    'STAKE',
    'PLAYER',
    'RENTAL',
    'WAGER',
    'WAGER_VAULT',
    'FIXTURE',
    'FIXTURE_VAULT',
    'LIVE_STATE',
    'MARKET',
    'MARKET_VAULT',
    'POSITION',
  ];
  for (const seed of requiredSeeds) {
    assert.ok(SEEDS[seed], `Missing expected seed: ${seed}`);
  }
});

test('GoalChain SDK - Anchor IDL Structure', () => {
  assert.ok(idl, 'IDL must be exported');
  assert.equal(idl.address, 'FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg');
  assert.equal(idl.metadata?.name, 'goalchain_program');
  assert.ok(Array.isArray(idl.instructions), 'IDL must declare instructions array');
});
