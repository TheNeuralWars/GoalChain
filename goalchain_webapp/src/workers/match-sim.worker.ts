/** Web Worker entry point for match simulation */

import type { 
  WorkerIncomingMessage, WorkerOutgoingMessage, 
  SimConfig, Team, MatchState, MatchEvent, CommentaryLine 
} from './types';
import { SimEngine } from './sim-engine';
import { commentaryGenerator } from './commentary-generator';

let engine: SimEngine | null = null;
let animationFrameId: number | null = null;
let isRunning = false;
let speedMultiplier = 1;
let pendingInit: { config: SimConfig; homeTeam: Team; awayTeam: Team } | null = null;

// WASM loading
let wasmLoaded = false;
const wasmUrl = '/wasm/commentary_parser.wasm';

async function loadWasm(): Promise<void> {
  try {
    const response = await fetch(wasmUrl);
    if (response.ok) {
      const bytes = await response.arrayBuffer();
      await commentaryGenerator.initWasm(new Uint8Array(bytes));
      wasmLoaded = true;
      console.log('[Worker] WASM commentary parser loaded');
    } else {
      console.warn('[Worker] WASM file not found, using JS fallback');
    }
  } catch (e) {
    console.warn('[Worker] WASM load failed:', e);
  }
}

function send(type: WorkerOutgoingMessage['type'], payload: unknown): void {
  (self as unknown as Worker).postMessage({ type, payload } as WorkerOutgoingMessage);
}

function handleMessage(event: MessageEvent<WorkerIncomingMessage>): void {
  const msg = event.data;
  
  switch (msg.type) {
    case 'INIT':
      pendingInit = msg.payload;
      if (!wasmLoaded) loadWasm();
      send('READY', undefined);
      break;
      
    case 'START':
      if (pendingInit && !engine) {
        engine = new SimEngine(pendingInit.config, pendingInit.homeTeam, pendingInit.awayTeam);
        pendingInit = null;
      }
      if (engine && !isRunning) {
        isRunning = true;
        runLoop();
      }
      break;
      
    case 'PAUSE':
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      break;
      
    case 'RESUME':
      if (engine && !isRunning) {
        isRunning = true;
        runLoop();
      }
      break;
      
    case 'STOP':
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (engine) {
        engine.reset();
      }
      break;
      
    case 'SET_SPEED':
      speedMultiplier = Math.max(0.1, Math.min(10, msg.payload.multiplier));
      break;
      
    case 'GET_STATE':
      if (engine) {
        send('STATE', engine.getState());
      }
      break;

    case 'SET_TACTIC':
      if (engine) {
        const comm = engine.setTactic(msg.payload.tactic);
        send('COMMENTARY', comm);
        send('STATE', engine.getState());
      }
      break;

    case 'ENERGY_BOOST':
      if (engine) {
        const comm = engine.applyEnergyBoost(msg.payload.playerId);
        if (comm) {
          send('COMMENTARY', comm);
          send('STATE', engine.getState());
        }
      }
      break;

    case 'SUBSTITUTE':
      if (engine) {
        const comm = engine.substitutePlayer(msg.payload.playerOutId, msg.payload.playerIn);
        if (comm) {
          send('COMMENTARY', comm);
          send('STATE', engine.getState());
        }
      }
      break;
  }
}

let lastTick = 0;
const TICK_INTERVAL = 100; // Base ms between ticks

function runLoop(): void {
  if (!isRunning || !engine) return;
  
  const now = performance.now();
  const adjustedInterval = TICK_INTERVAL / speedMultiplier;
  
  if (now - lastTick >= adjustedInterval) {
    lastTick = now;
    
    const result = engine.step();
    
    if (result.event) {
      send('EVENT', result.event);
    }
    if (result.commentary) {
      send('COMMENTARY', result.commentary);
    }
    // Send full state periodically
    if (Math.random() < 0.05) { // ~5% of ticks
      send('STATE', result.state);
    }
  }
  
  if (isRunning) {
    animationFrameId = requestAnimationFrame(runLoop);
  }
}

// Handle messages from main thread
self.addEventListener('message', handleMessage);

// Export for testing
export { SimEngine } from './sim-engine';
export { commentaryGenerator } from './commentary-generator';